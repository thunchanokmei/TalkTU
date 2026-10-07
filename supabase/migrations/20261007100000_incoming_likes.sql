create or replace function public.get_incoming_likes(
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
  gender_identity public.gender_identity_type,
  faculty text,
  department text,
  photos jsonb,
  interests jsonb,
  locations jsonb
)
language plpgsql
security definer
set search_path = public
as $$
begin

  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

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
      year from age(
        (
          now()
          at time zone 'Asia/Bangkok'
        )::date,
        up.birth_date
      )
    )::integer as age,

    p.tu_generation,

    p.bio,

    p.height_cm,

    p.gender_identity,

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
    ) as interests,

    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', cl.id,
            'name', cl.name
          )
          order by cl.name
        )
        from public.user_locations ul
        join public.campus_locations cl
          on cl.id = ul.location_id
        where ul.user_id = p.id
          and cl.is_active = true
      ),
      '[]'::jsonb
    ) as locations

  from public.swipes incoming

  join public.profiles p
    on p.id = incoming.swiper_id

  join public.student_accounts sa
    on sa.user_id = p.id
    and sa.is_current_student = true

  join public.user_private up
    on up.user_id = p.id

  where
    incoming.target_id = auth.uid()

    and incoming.mode = p_mode

    and incoming.action = 'like'

    and p.onboarding_completed = true

    and p.mode = p_mode

    -- Only show likes that the current user has not answered yet.
    and not exists (
      select 1
      from public.swipes response
      where response.swiper_id = auth.uid()
        and response.target_id = p.id
        and response.mode = p_mode
    )

    -- Do not expose blocked users.
    and not exists (
      select 1
      from public.blocks b
      where
        (
          b.blocker_id = auth.uid()
          and b.blocked_id = p.id
        )
        or
        (
          b.blocker_id = p.id
          and b.blocked_id = auth.uid()
        )
    )

    -- Date mode follows the same compatibility rules as Discovery.
    and (
      p_mode = 'friends'
      or public.are_date_preferences_compatible(
        auth.uid(),
        p.id
      )
    )

  order by incoming.updated_at desc, incoming.id desc

  limit p_limit
  offset p_offset;

end;
$$;


revoke execute
on function public.get_incoming_likes(
  public.app_mode,
  integer,
  integer
)
from public, anon;

grant execute
on function public.get_incoming_likes(
  public.app_mode,
  integer,
  integer
)
to authenticated;