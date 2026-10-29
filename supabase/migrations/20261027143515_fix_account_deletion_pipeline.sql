-- =========================================================
-- TalkTU account deletion hardening
-- =========================================================

-- ---------------------------------------------------------
-- 1. Prevent normal app users from calling deletion-worker
--    RPCs directly.
-- ---------------------------------------------------------

revoke all
on function public.enqueue_account_deletion(uuid)
from public, anon, authenticated;

grant execute
on function public.enqueue_account_deletion(uuid)
to service_role;


revoke all
on function public.claim_account_deletion_jobs(integer)
from public, anon, authenticated;

grant execute
on function public.claim_account_deletion_jobs(integer)
to service_role;


revoke all
on function public.mark_account_deletion_step(uuid, uuid, text)
from public, anon, authenticated;

grant execute
on function public.mark_account_deletion_step(uuid, uuid, text)
to service_role;


revoke all
on function public.complete_account_deletion_job(uuid, uuid)
from public, anon, authenticated;

grant execute
on function public.complete_account_deletion_job(uuid, uuid)
to service_role;


revoke all
on function public.fail_account_deletion_job(uuid, uuid, text)
from public, anon, authenticated;

grant execute
on function public.fail_account_deletion_job(uuid, uuid, text)
to service_role;


revoke all
on table public.account_deletion_jobs
from public, anon, authenticated;


-- ---------------------------------------------------------
-- 2. Let the server-side worker discover every Storage
--    object currently owned by the deleting Auth user.
-- ---------------------------------------------------------

create or replace function public.get_account_owned_storage_objects(
  p_user_id uuid
)
returns table (
  bucket_id text,
  object_name text
)
language sql
security invoker
set search_path = ''
as $$
  select
    o.bucket_id,
    o.name
  from storage.objects as o
  where o.owner_id = p_user_id::text;
$$;

revoke all
on function public.get_account_owned_storage_objects(uuid)
from public, anon, authenticated;

grant execute
on function public.get_account_owned_storage_objects(uuid)
to service_role;


-- ---------------------------------------------------------
-- 3. Delete all application data associated with one user.
--
--    This is intentionally server-only.
-- ---------------------------------------------------------

create or replace function public.purge_account_application_data(
  p_user_id uuid
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if p_user_id is null then
    raise exception 'User ID is required';
  end if;

  -- -------------------------------------------------------
  -- Reports
  --
  -- Remove reports created by this user and reports whose
  -- target is content/account belonging to this user.
  --
  -- Do this BEFORE deleting posts/comments/matches so we
  -- can still identify the target IDs.
  -- -------------------------------------------------------

  delete from public.reports
  where reporter_id = p_user_id

     or (
       target_type = 'profile'
       and target_id = p_user_id
     )

     or (
       target_type = 'post'
       and target_id in (
         select p.id
         from public.posts as p
         where p.author_id = p_user_id
       )
     )

     or (
       target_type = 'comment'
       and target_id in (
         select c.id
         from public.comments as c
         where c.author_id = p_user_id
       )
     )

     or (
       target_type = 'message'
       and target_id in (
         select m.id
         from public.messages as m
         where m.sender_id = p_user_id
       )
     )

     or (
       target_type = 'chat'
       and target_id in (
         select m.id
         from public.matches as m
         where m.user_1 = p_user_id
            or m.user_2 = p_user_id
       )
     );


  -- -------------------------------------------------------
  -- Feed activity
  -- -------------------------------------------------------

  delete from public.post_likes
  where user_id = p_user_id;

  delete from public.comments
  where author_id = p_user_id;

  -- Deleting a post also cascades to:
  --   comments.post_id
  --   post_images.post_id
  --   post_likes.post_id
  delete from public.posts
  where author_id = p_user_id;


  -- -------------------------------------------------------
  -- Matching / chat
  -- -------------------------------------------------------

  delete from public.swipes
  where swiper_id = p_user_id
     or swiped_id = p_user_id;

  -- messages.match_id has ON DELETE CASCADE,
  -- therefore removing the match removes its chat history.
  delete from public.matches
  where user_1 = p_user_id
     or user_2 = p_user_id;


  -- -------------------------------------------------------
  -- Blocking
  -- -------------------------------------------------------

  delete from public.blocks
  where blocker_id = p_user_id
     or blocked_id = p_user_id;


  -- -------------------------------------------------------
  -- Profile-related data
  -- -------------------------------------------------------

  delete from public.user_interests
  where user_id = p_user_id;

  delete from public.user_locations
  where user_id = p_user_id;

  delete from public.profile_photos
  where user_id = p_user_id;

  delete from public.dating_preferences
  where user_id = p_user_id;

  delete from public.user_private
  where user_id = p_user_id;

  delete from public.student_accounts
  where user_id = p_user_id;


  -- Profile comes last because most TalkTU features use its
  -- UUID as the user identity.
  delete from public.profiles
  where id = p_user_id;

  return true;
end;
$$;

revoke all
on function public.purge_account_application_data(uuid)
from public, anon, authenticated;

grant execute
on function public.purge_account_application_data(uuid)
to service_role;


-- ---------------------------------------------------------
-- 4. Do not retain the completed deletion-job UUID forever.
--
--    A job is kept while pending / failed / processing so it
--    can retry. Once all steps succeed, remove the job row.
-- ---------------------------------------------------------

create or replace function public.complete_account_deletion_job(
  p_user_id uuid,
  p_claim_token uuid
)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  v_deleted_count integer;
begin
  delete from public.account_deletion_jobs
  where user_id = p_user_id
    and claim_token = p_claim_token
    and status = 'processing'
    and auth_deleted_at is not null
    and storage_deleted_at is not null;

  get diagnostics v_deleted_count = row_count;

  return v_deleted_count = 1;
end;
$$;

revoke all
on function public.complete_account_deletion_job(uuid, uuid)
from public, anon, authenticated;

grant execute
on function public.complete_account_deletion_job(uuid, uuid)
to service_role;