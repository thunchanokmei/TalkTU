-- Report a user profile through a validated database function.
-- Apply to local Supabase only.

create or replace function public.report_profile(
  p_target_id uuid,
  p_reason text,
  p_details text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_reporter_id uuid;
  v_report_id uuid;
  v_reason text;
begin
  v_reporter_id := auth.uid();

  if v_reporter_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_target_id is null then
    raise exception 'Target profile is required';
  end if;

  if p_target_id = v_reporter_id then
    raise exception 'Cannot report yourself';
  end if;

  v_reason := lower(trim(coalesce(p_reason, '')));

  if v_reason not in (
    'harassment',
    'sexual_content',
    'hate_speech',
    'spam',
    'scam_fraud',
    'fake_profile',
    'other'
  ) then
    raise exception 'Invalid report reason';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = p_target_id
  ) then
    raise exception 'Target profile not found';
  end if;

  if p_details is not null and length(p_details) > 2000 then
    raise exception 'Report details must be 2000 characters or fewer';
  end if;

  insert into public.reports (
    reporter_id,
    target_id,
    target_type,
    reason,
    details
  )
  values (
    v_reporter_id,
    p_target_id,
    'profile',
    v_reason,
    nullif(trim(p_details), '')
  )
  returning id into v_report_id;

  return v_report_id;
end;
$$;

revoke all on function public.report_profile(uuid, text, text)
from public, anon;

grant execute on function public.report_profile(uuid, text, text)
to authenticated;
