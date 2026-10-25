-- =========================================================
-- TalkTU Anonymous Feed
-- =========================================================
--
-- Existing tables:
--   posts
--   post_images
--   post_likes
--   comments
--   blocks
--   reports
--
-- This migration adds:
--   post image storage bucket
--   storage policies
--   anonymous feed RPCs
--
-- IMPORTANT:
-- Feed RPCs never return author_id.
-- =========================================================


-- =========================================================
-- POST IMAGE STORAGE
-- =========================================================

insert into storage.buckets (
  id,
  name,
  public
)
values (
  'post-images',
  'post-images',
  true
)
on conflict (id)
do update
set public = true;


-- =========================================================
-- STORAGE POLICIES
--
-- image path:
--
--   <post-id>/<random-file-name>.jpg
--
-- We intentionally DO NOT put user_id in the path
-- because posts are anonymous.
-- =========================================================

drop policy if exists
"feed upload images to own post"
on storage.objects;

drop policy if exists
"feed update images on own post"
on storage.objects;

drop policy if exists
"feed delete images from own post"
on storage.objects;


create policy
"feed upload images to own post"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'post-images'

  and exists (
    select 1
    from public.posts p
    where
      p.id::text =
        (storage.foldername(name))[1]

      and p.author_id = auth.uid()

      and p.deleted_at is null
  )
);


create policy
"feed update images on own post"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'post-images'

  and exists (
    select 1
    from public.posts p
    where
      p.id::text =
        (storage.foldername(name))[1]

      and p.author_id = auth.uid()
  )
)
with check (
  bucket_id = 'post-images'

  and exists (
    select 1
    from public.posts p
    where
      p.id::text =
        (storage.foldername(name))[1]

      and p.author_id = auth.uid()
  )
);


create policy
"feed delete images from own post"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'post-images'

  and exists (
    select 1
    from public.posts p
    where
      p.id::text =
        (storage.foldername(name))[1]

      and p.author_id = auth.uid()
  )
);


-- =========================================================
-- CREATE POST
-- =========================================================

create or replace function
public.create_anonymous_post(
  p_content text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_post_id uuid;
  v_content text;
begin

  if auth.uid() is null then
    raise exception
      'Not authenticated';
  end if;

  v_content :=
    btrim(
      coalesce(
        p_content,
        ''
      )
    );

  if char_length(v_content) = 0 then
    raise exception
      'Post content is required';
  end if;

  if char_length(v_content) > 3000 then
    raise exception
      'Post is too long';
  end if;

  insert into public.posts (
    author_id,
    content
  )
  values (
    auth.uid(),
    v_content
  )
  returning id
  into v_post_id;

  return v_post_id;

end;
$$;


-- =========================================================
-- GET FEED
--
-- author_id NEVER leaves this function.
-- =========================================================

create or replace function
public.get_feed_posts(
  p_limit integer default 20,
  p_offset integer default 0
)
returns table (
  post_id uuid,
  content text,
  created_at timestamptz,
  images jsonb,
  like_count bigint,
  comment_count bigint,
  liked_by_me boolean,
  is_mine boolean
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin

  if auth.uid() is null then
    raise exception
      'Not authenticated';
  end if;

  if p_limit < 1
     or p_limit > 50 then
    raise exception
      'Invalid limit';
  end if;

  if p_offset < 0 then
    raise exception
      'Invalid offset';
  end if;

  return query

  select
    p.id as post_id,

    p.content,

    p.created_at,

    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id',
              pi.id,

            'storage_path',
              pi.storage_path,

            'position',
              pi.position
          )
          order by pi.position
        )

        from public.post_images pi

        where
          pi.post_id = p.id
      ),
      '[]'::jsonb
    ) as images,

    (
      select count(*)
      from public.post_likes pl
      where
        pl.post_id = p.id
    ) as like_count,

    (
      select count(*)
      from public.comments c
      where
        c.post_id = p.id
        and c.deleted_at is null
    ) as comment_count,

    exists (
      select 1
      from public.post_likes my_like
      where
        my_like.post_id = p.id
        and
        my_like.user_id =
          auth.uid()
    ) as liked_by_me,

    (
      p.author_id =
      auth.uid()
    ) as is_mine

  from public.posts p

  where
    p.deleted_at is null

    -- Do not show posts when either user
    -- has blocked the other.
    and not exists (
      select 1
      from public.blocks b
      where
        (
          b.blocker_id =
            auth.uid()

          and b.blocked_id =
            p.author_id
        )

        or

        (
          b.blocker_id =
            p.author_id

          and b.blocked_id =
            auth.uid()
        )
    )

  order by
    p.created_at desc,
    p.id desc

  limit p_limit
  offset p_offset;

end;
$$;


-- =========================================================
-- TOGGLE LIKE
-- =========================================================

create or replace function
public.toggle_post_like(
  p_post_id uuid
)
returns table (
  liked boolean,
  like_count bigint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_liked boolean;
begin

  if auth.uid() is null then
    raise exception
      'Not authenticated';
  end if;

  if not exists (
    select 1
    from public.posts p

    where
      p.id = p_post_id

      and p.deleted_at
        is null

      and not exists (
        select 1
        from public.blocks b

        where
          (
            b.blocker_id =
              auth.uid()

            and b.blocked_id =
              p.author_id
          )

          or

          (
            b.blocker_id =
              p.author_id

            and b.blocked_id =
              auth.uid()
          )
      )
  ) then
    raise exception
      'Post unavailable';
  end if;


  if exists (
    select 1
    from public.post_likes pl

    where
      pl.post_id =
        p_post_id

      and pl.user_id =
        auth.uid()
  ) then

    delete from public.post_likes
    where
      post_id =
        p_post_id

      and user_id =
        auth.uid();

    v_liked := false;

  else

    insert into public.post_likes (
      post_id,
      user_id
    )
    values (
      p_post_id,
      auth.uid()
    );

    v_liked := true;

  end if;


  return query

  select
    v_liked,

    count(*)::bigint

  from public.post_likes pl

  where
    pl.post_id =
      p_post_id;

end;
$$;


-- =========================================================
-- GET COMMENTS
--
-- Comments are anonymous as well.
-- No author_id is returned.
-- =========================================================

create or replace function
public.get_post_comments(
  p_post_id uuid,
  p_limit integer default 50,
  p_offset integer default 0
)
returns table (
  comment_id uuid,
  content text,
  created_at timestamptz,
  is_mine boolean
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin

  if auth.uid() is null then
    raise exception
      'Not authenticated';
  end if;


  if not exists (
    select 1
    from public.posts p

    where
      p.id = p_post_id

      and p.deleted_at
        is null

      and not exists (
        select 1
        from public.blocks b

        where
          (
            b.blocker_id =
              auth.uid()

            and b.blocked_id =
              p.author_id
          )

          or

          (
            b.blocker_id =
              p.author_id

            and b.blocked_id =
              auth.uid()
          )
      )
  ) then
    raise exception
      'Post unavailable';
  end if;


  return query

  select
    c.id as comment_id,

    c.content,

    c.created_at,

    (
      c.author_id =
      auth.uid()
    ) as is_mine

  from public.comments c

  where
    c.post_id =
      p_post_id

    and c.deleted_at
      is null

    -- Hide comments from blocked users.
    and not exists (
      select 1
      from public.blocks b

      where
        (
          b.blocker_id =
            auth.uid()

          and b.blocked_id =
            c.author_id
        )

        or

        (
          b.blocker_id =
            c.author_id

          and b.blocked_id =
            auth.uid()
        )
    )

  order by
    c.created_at asc

  limit p_limit
  offset p_offset;

end;
$$;


-- =========================================================
-- CREATE COMMENT
-- =========================================================

create or replace function
public.create_anonymous_comment(
  p_post_id uuid,
  p_content text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_comment_id uuid;
  v_content text;
begin

  if auth.uid() is null then
    raise exception
      'Not authenticated';
  end if;

  v_content :=
    btrim(
      coalesce(
        p_content,
        ''
      )
    );

  if char_length(v_content) = 0 then
    raise exception
      'Comment is required';
  end if;

  if char_length(v_content) > 1000 then
    raise exception
      'Comment is too long';
  end if;


  if not exists (
    select 1
    from public.posts p

    where
      p.id =
        p_post_id

      and p.deleted_at
        is null

      and not exists (
        select 1
        from public.blocks b

        where
          (
            b.blocker_id =
              auth.uid()

            and b.blocked_id =
              p.author_id
          )

          or

          (
            b.blocker_id =
              p.author_id

            and b.blocked_id =
              auth.uid()
          )
      )
  ) then
    raise exception
      'Post unavailable';
  end if;


  insert into public.comments (
    post_id,
    author_id,
    content
  )
  values (
    p_post_id,
    auth.uid(),
    v_content
  )
  returning id
  into v_comment_id;

  return v_comment_id;

end;
$$;


-- =========================================================
-- PERMISSIONS
-- =========================================================

revoke all
on function
public.create_anonymous_post(text)
from public, anon;

revoke all
on function
public.get_feed_posts(integer, integer)
from public, anon;

revoke all
on function
public.toggle_post_like(uuid)
from public, anon;

revoke all
on function
public.get_post_comments(uuid, integer, integer)
from public, anon;

revoke all
on function
public.create_anonymous_comment(uuid, text)
from public, anon;


grant execute
on function
public.create_anonymous_post(text)
to authenticated;

grant execute
on function
public.get_feed_posts(integer, integer)
to authenticated;

grant execute
on function
public.toggle_post_like(uuid)
to authenticated;

grant execute
on function
public.get_post_comments(uuid, integer, integer)
to authenticated;

grant execute
on function
public.create_anonymous_comment(uuid, text)
to authenticated;