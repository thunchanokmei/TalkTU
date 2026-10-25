create or replace function public.unmatch_match(
  p_match_id uuid
)
returns public.matches
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_match public.matches;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  update public.matches
  set
    unmatched_at = now(),
    unmatched_by = v_user_id
  where id = p_match_id
    and unmatched_at is null
    and (user_1 = v_user_id or user_2 = v_user_id)
  returning *
  into v_match;

  if v_match.id is null then
    raise exception 'Match is not available';
  end if;

  return v_match;
end;
$$;

revoke all on function public.unmatch_match(uuid)
from public, anon;

grant execute on function public.unmatch_match(uuid)
to authenticated;