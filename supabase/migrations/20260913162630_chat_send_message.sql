create or replace function public.send_message(
  p_match_id uuid,
  p_content text
)
returns public.messages
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_message public.messages;
begin

  -- ==================================================
  -- 1. ต้อง login ก่อน
  -- ==================================================

  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;


  -- ==================================================
  -- 2. ต้องเป็นสมาชิกของ match และ match ต้อง active
  -- ==================================================

  if not exists (
    select 1
    from public.matches m
    where m.id = p_match_id
      and m.unmatched_at is null
      and (
        m.user_1 = v_user_id
        or m.user_2 = v_user_id
      )
  ) then
    raise exception 'Match is not available';
  end if;


  -- ==================================================
  -- 3. ตรวจข้อความ
  -- ==================================================

  if p_content is null
     or char_length(trim(p_content)) = 0 then
    raise exception 'Message cannot be empty';
  end if;

  if char_length(p_content) > 5000 then
    raise exception 'Message is too long';
  end if;


  -- ==================================================
  -- 4. บันทึกข้อความ
  --
  -- sender_id มาจาก auth.uid()
  -- ไม่รับ sender_id จาก client
  -- ==================================================

  insert into public.messages (
    match_id,
    sender_id,
    content
  )
  values (
    p_match_id,
    v_user_id,
    p_content
  )
  returning *
  into v_message;


  -- ==================================================
  -- 5. ส่งข้อความที่สร้างกลับไป
  -- ==================================================

  return v_message;

end;
$$;


-- ==================================================
-- Permissions
-- ==================================================

revoke all on function public.send_message(uuid, text)
from public, anon;

grant execute on function public.send_message(uuid, text)
to authenticated;