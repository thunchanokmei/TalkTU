create or replace function public.get_discovery_candidates(
  p_mode public.app_mode,
  p_limit integer default 20,
  p_offset integer default 0
)
returns table (
  user_id uuid,
  display_name text,
  age integer,
  tu_generation smallint,
  bio text,
  height_cm smallint,
  faculty text,
  department text,
  photos jsonb,
  interests jsonb
)
language plpgsql
security definer
set search_path = public
as $$

begin
  -- ต้อง login ก่อนจึงจะเรียก Discovery ได้
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  -- จำกัดค่าการแบ่งหน้าเพื่อป้องกัน request ที่ผิดปกติ
  if p_limit < 1 or p_limit > 50 then
    raise exception 'Invalid limit';
  end if;

  if p_offset < 0 then
    raise exception 'Invalid offset';
  end if;

  return query
  select
    p.id as user_id,
    p.display_name,
    extract(
      year from age(current_date, up.birth_date)
    )::integer as age,
    p.tu_generation,
    p.bio,
    p.height_cm,
    sa.faculty,
    sa.department,

    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', pp.id,
            'storage_path', pp.storage_path,
            'position', pp.position
          )
          order by pp.position
        )
        from public.profile_photos pp
        where pp.user_id = p.id
      ),
      '[]'::jsonb
    ) as photos,

    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', i.id,
            'name', i.name
          )
          order by i.name
        )
        from public.user_interests ui
        join public.interests i
          on i.id = ui.interest_id
        where ui.user_id = p.id
          and i.is_active = true
      ),
      '[]'::jsonb
    ) as interests

  from public.profiles p

  join public.student_accounts sa
    on sa.user_id = p.id
    and sa.is_current_student = true

  join public.user_private up
    on up.user_id = p.id

  where
    -- 1. ไม่เอาตัวเอง
    p.id <> auth.uid()

    -- 2. ต้อง onboarding เสร็จ
    and p.onboarding_completed = true

    -- 3. ต้องอยู่ mode เดียวกับ Discovery ที่กำลังเปิด
    and p.mode = p_mode

    -- 4. ต้องไม่เคย swipe คนนี้ใน mode เดียวกัน
    and not exists (
      select 1
      from public.swipes s
      where s.swiper_id = auth.uid()
        and s.target_id = p.id
        and s.mode = p_mode
    )

    -- 5. ต้องไม่มีการ block กันทั้งสองฝ่าย
    and not exists (
      select 1
      from public.blocks b
      where
        (b.blocker_id = auth.uid() and b.blocked_id = p.id)
        or
        (b.blocker_id = p.id and b.blocked_id = auth.uid())
    )

    -- 6. Date ต้องผ่าน dating preference
    and (
      p_mode = 'friends'
      or public.are_date_preferences_compatible(
        auth.uid(),
        p.id
      )
    )

  order by p.created_at, p.id

  limit p_limit
  offset p_offset;
end;
$$;


-- อนุญาตให้เฉพาะผู้ใช้ที่ login แล้วเรียก Discovery RPC ได้
revoke execute
on function public.get_discovery_candidates(
  public.app_mode,
  integer,
  integer
)
from public, anon;

grant execute
on function public.get_discovery_candidates(
  public.app_mode,
  integer,
  integer
)
to authenticated;