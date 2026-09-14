create or replace function public.get_my_chat_list()
returns table (
  match_id uuid,
  other_user_id uuid,
  other_display_name text,
  profile_photo_path text,
  last_message text,
  last_message_at timestamptz
)
language sql
security invoker
set search_path = public
as $$
  select
    m.id as match_id,

    case
      when m.user_1 = auth.uid() then m.user_2
      else m.user_1
    end as other_user_id,

    p.display_name as other_display_name,

    case
      when p.id is not null
        then p.id::text || '/1.jpg'
      else null
    end as profile_photo_path,

    msg.content as last_message,
    msg.created_at as last_message_at

  from public.matches m

  left join public.profiles p
    on p.id = case
      when m.user_1 = auth.uid() then m.user_2
      else m.user_1
    end

  left join lateral (
    select
      ms.content,
      ms.created_at
    from public.messages ms
    where ms.match_id = m.id
      and ms.deleted_at is null
    order by ms.created_at desc
    limit 1
  ) msg on true

  where m.unmatched_at is null
    and (
      m.user_1 = auth.uid()
      or m.user_2 = auth.uid()
    )

  order by
    msg.created_at desc nulls last,
    m.matched_at desc;
$$;

revoke all on function public.get_my_chat_list()
from public, anon;

grant execute on function public.get_my_chat_list()
to authenticated;


alter publication supabase_realtime
add table public.matches;