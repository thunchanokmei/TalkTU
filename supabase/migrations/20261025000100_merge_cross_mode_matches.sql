
begin;

-- 1. Build a mapping from duplicate active rooms to the oldest room.
create temporary table _match_merge_map on commit drop as
select
  id as duplicate_id,
  keeper_id
from (
  select
    id,
    first_value(id) over (
      partition by least(user_1, user_2), greatest(user_1, user_2)
      order by matched_at asc, id asc
    ) as keeper_id,
    row_number() over (
      partition by least(user_1, user_2), greatest(user_1, user_2)
      order by matched_at asc, id asc
    ) as room_number
  from public.matches
  where unmatched_at is null
) ranked
where room_number > 1;

-- 2. Move messages without changing their IDs, senders, or timestamps.
update public.messages msg
set match_id = merge_map.keeper_id
from _match_merge_map merge_map
where msg.match_id = merge_map.duplicate_id;

-- 3. Close duplicate rooms; keep their rows for reference.
update public.matches m
set unmatched_at = now()
from _match_merge_map merge_map
where m.id = merge_map.duplicate_id
  and m.unmatched_at is null;

-- 4. Enforce one active room per pair, regardless of mode.
drop index if exists public.matches_unique_active;

create unique index matches_unique_active
on public.matches (
  (least(user_1, user_2)),
  (greatest(user_1, user_2))
)
where unmatched_at is null;

-- 5. Preserve the existing swipe behavior and safety checks.
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

  -- Reuse an active match across modes.
  select m.id
  into v_existing_match_id
  from public.matches m
  where
    least(m.user_1, m.user_2) = least(v_user_id, p_target_id)
    and greatest(m.user_1, m.user_2) = greatest(v_user_id, p_target_id)
    and m.unmatched_at is null
  order by m.matched_at asc, m.id asc
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

commit;
