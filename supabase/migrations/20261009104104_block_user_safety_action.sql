-- Serialize block and swipe/match operations for the same user pair.

create or replace function public.block_user(
  p_blocked_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_pair_lock bigint;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_blocked_id is null then
    raise exception 'Target user is required';
  end if;

  if p_blocked_id = v_user_id then
    raise exception 'Cannot block yourself';
  end if;

  -- Both functions must calculate the same lock for this pair.
  v_pair_lock := hashtextextended(
    least(v_user_id, p_blocked_id)::text
      || ':' ||
    greatest(v_user_id, p_blocked_id)::text,
    0
  );

  perform pg_advisory_xact_lock(v_pair_lock);

  insert into public.blocks (blocker_id, blocked_id)
  values (v_user_id, p_blocked_id)
  on conflict (blocker_id, blocked_id) do nothing;

  update public.matches
  set
    unmatched_at = now(),
    unmatched_by = v_user_id
  where unmatched_at is null
    and (
      (user_1 = v_user_id and user_2 = p_blocked_id)
      or
      (user_1 = p_blocked_id and user_2 = v_user_id)
    );
end;
$$;

revoke all on function public.block_user(uuid)
from public, anon;

grant execute on function public.block_user(uuid)
to authenticated;


-- Keep existing swipe behavior, but serialize each user pair before
-- checking blocks, recording the swipe, or creating a match.

create or replace function public.submit_swipe(
  p_target_id uuid,
  p_mode public.app_mode,
  p_action public.swipe_action_type
)
returns table (
  swipe_id uuid,
  matched boolean,
  match_id uuid
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_swipe_id uuid;
  v_match_id uuid;
  v_existing_match_id uuid;
  v_opposite_like_exists boolean;
  v_pair_lock bigint;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_target_id is null or p_target_id = v_user_id then
    raise exception 'Cannot swipe yourself';
  end if;

  v_pair_lock := hashtextextended(
    least(v_user_id, p_target_id)::text
      || ':' ||
    greatest(v_user_id, p_target_id)::text,
    0
  );

  perform pg_advisory_xact_lock(v_pair_lock);

  if not exists (
    select 1
    from public.profiles p
    where p.id = p_target_id
      and p.onboarding_completed = true
      and p.mode = p_mode
  ) then
    raise exception 'Target profile is not available';
  end if;

  if exists (
    select 1
    from public.blocks b
    where
      (b.blocker_id = v_user_id and b.blocked_id = p_target_id)
      or
      (b.blocker_id = p_target_id and b.blocked_id = v_user_id)
  ) then
    raise exception 'Cannot swipe blocked user';
  end if;

  if p_mode = 'date' then
    if not public.are_date_preferences_compatible(
      v_user_id,
      p_target_id
    ) then
      raise exception 'Users are not compatible for date mode';
    end if;
  end if;

  insert into public.swipes (
    swiper_id,
    target_id,
    mode,
    action
  )
  values (
    v_user_id,
    p_target_id,
    p_mode,
    p_action
  )
  on conflict (swiper_id, target_id, mode)
  do update
    set
      action = excluded.action,
      updated_at = now()
  returning id
  into v_swipe_id;

  if p_action = 'pass' then
    return query
    select v_swipe_id, false, null::uuid;
    return;
  end if;

  select exists (
    select 1
    from public.swipes s
    where s.swiper_id = p_target_id
      and s.target_id = v_user_id
      and s.mode = p_mode
      and s.action = 'like'
  )
  into v_opposite_like_exists;

  if not v_opposite_like_exists then
    return query
    select v_swipe_id, false, null::uuid;
    return;
  end if;

  select m.id
  into v_existing_match_id
  from public.matches m
  where
    least(m.user_1, m.user_2) = least(v_user_id, p_target_id)
    and
    greatest(m.user_1, m.user_2) = greatest(v_user_id, p_target_id)
    and
    m.mode = p_mode
    and
    m.unmatched_at is null
  limit 1;

  if v_existing_match_id is not null then
    return query
    select v_swipe_id, true, v_existing_match_id;
    return;
  end if;

  insert into public.matches (
    user_1,
    user_2,
    mode
  )
  values (
    least(v_user_id, p_target_id),
    greatest(v_user_id, p_target_id),
    p_mode
  )
  returning id
  into v_match_id;

  return query
  select v_swipe_id, true, v_match_id;
end;
$$;

revoke execute
on function public.submit_swipe(
  uuid,
  public.app_mode,
  public.swipe_action_type
)
from public, anon;

grant execute
on function public.submit_swipe(
  uuid,
  public.app_mode,
  public.swipe_action_type
)
to authenticated;


-- Prevent clients from writing match rows directly.
revoke all privileges
on table public.matches
from anon, authenticated;

grant select
on table public.matches
to authenticated;
