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
set search_path = public
as $$

declare
  v_user_id uuid;
  v_swipe_id uuid;
  v_match_id uuid;
  v_existing_match_id uuid;
  v_opposite_like_exists boolean;
begin

  -- ==================================================
  -- 1. ต้อง login ก่อน
  -- ==================================================

  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;


  -- ==================================================
  -- 2. ห้าม swipe ตัวเอง
  -- ==================================================

  if p_target_id = v_user_id then
    raise exception 'Cannot swipe yourself';
  end if;


  -- ==================================================
  -- 3. ตรวจว่า target มีอยู่จริงและพร้อมใช้งาน
  -- ==================================================

  if not exists (
    select 1
    from public.profiles p
    where p.id = p_target_id
      and p.onboarding_completed = true
      and p.mode = p_mode
  ) then
    raise exception 'Target profile is not available';
  end if;


  -- ==================================================
  -- 4. ห้าม swipe ถ้า block กัน
  -- ==================================================

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


  -- ==================================================
  -- 5. Date ต้องผ่าน preference compatibility
  -- ==================================================

  if p_mode = 'date' then

    if not public.are_date_preferences_compatible(
      v_user_id,
      p_target_id
    ) then
      raise exception 'Users are not compatible for date mode';
    end if;

  end if;


  -- ==================================================
  -- 6. บันทึก Swipe
  --
  -- UNIQUE(swiper_id, target_id, mode)
  -- ทำให้คนเดิมใน mode เดิมมีได้แค่ 1 swipe
  -- ==================================================

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


  -- ==================================================
  -- 7. ถ้าเป็น PASS → จบตรงนี้
  -- ==================================================

  if p_action = 'pass' then

    return query
    select
      v_swipe_id,
      false,
      null::uuid;

    return;

  end if;


  -- ==================================================
  -- 8. ถ้าเป็น LIKE
  -- เช็กว่าอีกฝ่ายเคย LIKE เราใน mode เดียวกันไหม
  -- ==================================================

  select exists (
    select 1
    from public.swipes s
    where s.swiper_id = p_target_id
      and s.target_id = v_user_id
      and s.mode = p_mode
      and s.action = 'like'
  )
  into v_opposite_like_exists;


  -- ==================================================
  -- 9. ถ้าอีกฝ่ายยังไม่ได้ Like เรา → ยังไม่ Match
  -- ==================================================

  if not v_opposite_like_exists then

    return query
    select
      v_swipe_id,
      false,
      null::uuid;

    return;

  end if;


  -- ==================================================
  -- 10. อีกฝ่าย Like เราแล้ว
  -- เช็กว่ามี Active Match อยู่แล้วหรือยัง
  -- ==================================================

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


  -- ==================================================
  -- 11. ถ้ามี Active Match อยู่แล้ว → ใช้อันเดิม
  -- ==================================================

  if v_existing_match_id is not null then

    return query
    select
      v_swipe_id,
      true,
      v_existing_match_id;

    return;

  end if;


  -- ==================================================
  -- 12. สร้าง Match ใหม่
  -- ==================================================

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


  -- ==================================================
  -- 13. ส่งผลกลับไปให้ Frontend
  -- ==================================================

  return query
  select
    v_swipe_id,
    true,
    v_match_id;

end;
$$;


-- ==================================================
-- Security
-- ==================================================

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