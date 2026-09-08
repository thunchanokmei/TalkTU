SET local check_function_bodies = off;

CREATE TABLE "public"."blocks" (
  "blocker_id" uuid                     NOT NULL,
  "blocked_id" uuid                     NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "blocks_pkey" PRIMARY KEY (blocker_id, blocked_id),
  CONSTRAINT "cannot_block_self" CHECK ((blocker_id <> blocked_id))
);

ALTER TABLE "public"."blocks"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."campus_locations" (
  "id"        bigint  GENERATED ALWAYS AS IDENTITY NOT NULL,
  "name"      text    NOT NULL,
  "is_active" boolean NOT NULL DEFAULT true,
  CONSTRAINT "campus_locations_name_key" UNIQUE (name),
  CONSTRAINT "campus_locations_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."campus_locations"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."comments" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "post_id"    uuid                     NOT NULL,
  "author_id"  uuid                     NOT NULL,
  "content"    text                     NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  "deleted_at" timestamp with time zone,
  CONSTRAINT "comment_max_length" CHECK ((char_length(content) <= 1000)),
  CONSTRAINT "comment_not_empty" CHECK ((char_length(TRIM(BOTH FROM content)) > 0)),
  CONSTRAINT "comments_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."comments"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."dating_preferences" (
  "user_id"    uuid                     NOT NULL,
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "dating_preferences_pkey" PRIMARY KEY (user_id)
);

ALTER TABLE "public"."dating_preferences"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."device_tokens" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"    uuid                     NOT NULL,
  "token"      text                     NOT NULL,
  "platform"   text                     NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "device_tokens_pkey" PRIMARY KEY (id),
  CONSTRAINT "device_tokens_platform_check" CHECK ((platform = ANY (ARRAY['android'::text, 'ios'::text]))),
  CONSTRAINT "device_tokens_token_key" UNIQUE (token)
);

ALTER TABLE "public"."device_tokens"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."interests" (
  "id"        bigint  GENERATED ALWAYS AS IDENTITY NOT NULL,
  "name"      text    NOT NULL,
  "is_active" boolean NOT NULL DEFAULT true,
  CONSTRAINT "interests_name_key" UNIQUE (name),
  CONSTRAINT "interests_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."interests"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."matches" (
  "id"           uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_1"       uuid                     NOT NULL,
  "user_2"       uuid                     NOT NULL,
  "matched_at"   timestamp with time zone NOT NULL DEFAULT now(),
  "unmatched_at" timestamp with time zone,
  "unmatched_by" uuid,
  CONSTRAINT "cannot_match_self" CHECK ((user_1 <> user_2)),
  CONSTRAINT "matches_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."matches"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."messages" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "match_id"   uuid                     NOT NULL,
  "sender_id"  uuid                     NOT NULL,
  "content"    text                     NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "read_at"    timestamp with time zone,
  "deleted_at" timestamp with time zone,
  CONSTRAINT "message_max_length" CHECK ((char_length(content) <= 5000)),
  CONSTRAINT "message_not_empty" CHECK ((char_length(TRIM(BOTH FROM content)) > 0)),
  CONSTRAINT "messages_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."messages"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."post_images" (
  "id"           uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "post_id"      uuid                     NOT NULL,
  "storage_path" text                     NOT NULL,
  "position"     smallint                 NOT NULL DEFAULT 1,
  "created_at"   timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "post_images_pkey" PRIMARY KEY (id),
  CONSTRAINT "post_images_post_id_position_key" UNIQUE (post_id, "position")
);

ALTER TABLE "public"."post_images"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."post_likes" (
  "post_id"    uuid                     NOT NULL,
  "user_id"    uuid                     NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "post_likes_pkey" PRIMARY KEY (post_id, user_id)
);

ALTER TABLE "public"."post_likes"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."posts" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "author_id"  uuid                     NOT NULL,
  "content"    text                     NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  "deleted_at" timestamp with time zone,
  CONSTRAINT "post_max_length" CHECK ((char_length(content) <= 3000)),
  CONSTRAINT "post_not_empty" CHECK ((char_length(TRIM(BOTH FROM content)) > 0)),
  CONSTRAINT "posts_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."posts"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."profile_photos" (
  "id"           uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"      uuid                     NOT NULL,
  "storage_path" text                     NOT NULL,
  "position"     smallint                 NOT NULL,
  "created_at"   timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "profile_photos_pkey" PRIMARY KEY (id),
  CONSTRAINT "profile_photos_position_check" CHECK ((("position" >= 1) AND ("position" <= 9))),
  CONSTRAINT "profile_photos_user_id_position_key" UNIQUE (user_id, "position")
);

ALTER TABLE "public"."profile_photos"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."profiles" (
  "id"                   uuid                     NOT NULL,
  "display_name"         text,
  "tu_generation"        smallint,
  "bio"                  text,
  "height_cm"            smallint,
  "onboarding_completed" boolean                  NOT NULL DEFAULT false,
  "created_at"           timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"           timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "profiles_bio_check" CHECK ((char_length(bio) <= 500)),
  CONSTRAINT "profiles_height_cm_check" CHECK (((height_cm >= 100) AND (height_cm <= 250))),
  CONSTRAINT "profiles_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."profiles"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."reports" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "reporter_id" uuid                     NOT NULL,
  "target_id"   uuid                     NOT NULL,
  "reason"      text                     NOT NULL,
  "details"     text,
  "created_at"  timestamp with time zone NOT NULL DEFAULT now(),
  "reviewed_at" timestamp with time zone,
  CONSTRAINT "reports_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."reports"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."student_accounts" (
  "user_id"            uuid                     NOT NULL,
  "tu_username"        text                     NOT NULL,
  "tu_email"           text                     NOT NULL,
  "display_name_th"    text,
  "display_name_en"    text,
  "faculty"            text                     NOT NULL,
  "department"         text,
  "tu_status"          text,
  "status_id"          text,
  "account_type"       text                     NOT NULL,
  "is_current_student" boolean                  NOT NULL DEFAULT false,
  "last_verified_at"   timestamp with time zone NOT NULL DEFAULT now(),
  "created_at"         timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"         timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "student_accounts_pkey" PRIMARY KEY (user_id),
  CONSTRAINT "student_accounts_tu_email_key" UNIQUE (tu_email),
  CONSTRAINT "student_accounts_tu_username_key" UNIQUE (tu_username)
);

ALTER TABLE "public"."student_accounts"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."swipes" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "swiper_id"  uuid                     NOT NULL,
  "target_id"  uuid                     NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "cannot_swipe_self" CHECK ((swiper_id <> target_id)),
  CONSTRAINT "swipes_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."swipes"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."tu_generations" (
  "code"       smallint                 NOT NULL,
  "is_active"  boolean                  NOT NULL DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "tu_generations_pkey" PRIMARY KEY (code)
);

ALTER TABLE "public"."tu_generations"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."user_interests" (
  "user_id"     uuid   NOT NULL,
  "interest_id" bigint NOT NULL,
  CONSTRAINT "user_interests_pkey" PRIMARY KEY (user_id, interest_id)
);

ALTER TABLE "public"."user_interests"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."user_locations" (
  "user_id"     uuid   NOT NULL,
  "location_id" bigint NOT NULL,
  CONSTRAINT "user_locations_pkey" PRIMARY KEY (user_id, location_id)
);

ALTER TABLE "public"."user_locations"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."user_private" (
  "user_id"         uuid                     NOT NULL,
  "birth_date"      date                     NOT NULL,
  "age_verified_at" timestamp with time zone,
  "created_at"      timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"      timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "user_private_pkey" PRIMARY KEY (user_id)
);

ALTER TABLE "public"."user_private"
  ENABLE ROW LEVEL SECURITY;

CREATE TYPE "public"."age_verification_method_type" AS ENUM (
  'self_declared',
  'apple_age_range',
  'google_age_signal',
  'tu_api',
  'manual'
);

ALTER TABLE "public"."user_private"
  ADD COLUMN "age_verification_method" public.age_verification_method_type NOT NULL DEFAULT 'self_declared'::public.age_verification_method_type;

CREATE TYPE "public"."app_mode" AS ENUM (
  'date',
  'friends'
);

ALTER TABLE "public"."matches"
  ADD COLUMN "mode" public.app_mode NOT NULL;

ALTER TABLE "public"."profiles"
  ADD COLUMN "mode" public.app_mode NOT NULL DEFAULT 'date'::public.app_mode;

ALTER TABLE "public"."swipes"
  ADD COLUMN "mode" public.app_mode NOT NULL;

CREATE TYPE "public"."interest_type" AS ENUM (
  'men',
  'women',
  'beyond_binary'
);

ALTER TABLE "public"."dating_preferences"
  ADD COLUMN "interested_in" public.interest_type[] NOT NULL;

CREATE TYPE "public"."report_status_type" AS ENUM (
  'pending',
  'reviewing',
  'resolved',
  'dismissed'
);

ALTER TABLE "public"."reports"
  ADD COLUMN "status" public.report_status_type NOT NULL DEFAULT 'pending'::public.report_status_type;

CREATE TYPE "public"."report_target_type" AS ENUM (
  'profile',
  'post',
  'comment',
  'message'
);

ALTER TABLE "public"."reports"
  ADD COLUMN "target_type" public.report_target_type NOT NULL;

CREATE TYPE "public"."sex_at_birth_type" AS ENUM (
  'male',
  'female'
);

ALTER TABLE "public"."profiles"
  ADD COLUMN "sex_at_birth" public.sex_at_birth_type;

CREATE TYPE "public"."swipe_action_type" AS ENUM (
  'like',
  'pass'
);

ALTER TABLE "public"."swipes"
  ADD COLUMN "action" public.swipe_action_type NOT NULL;

CREATE OR REPLACE FUNCTION public.are_date_preferences_compatible (
  user_a uuid,
  user_b uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$

  select exists (

    select 1

    from public.profiles a

    join public.dating_preferences preference_a
      on preference_a.user_id = a.id

    cross join public.profiles b

    join public.dating_preferences preference_b
      on preference_b.user_id = b.id

    where

      a.id = user_a
      and b.id = user_b

      and a.mode = 'date'
      and b.mode = 'date'

      and a.onboarding_completed = true
      and b.onboarding_completed = true

      and (

        -- ==================================================
        -- BEYOND BINARY
        --
        -- ถ้าทั้งสองคนเลือก Beyond Binary
        -- ไม่สน sex_at_birth
        -- ==================================================

        (
          'beyond_binary'::public.interest_type
            = any(preference_a.interested_in)

          and

          'beyond_binary'::public.interest_type
            = any(preference_b.interested_in)
        )

        or

        -- ==================================================
        -- NORMAL MEN / WOMEN MUTUAL MATCHING
        -- ==================================================

        (

          (
            case b.sex_at_birth

              when 'male'
                then 'men'::public.interest_type

              when 'female'
                then 'women'::public.interest_type

            end

          ) = any(preference_a.interested_in)


          and


          (
            case a.sex_at_birth

              when 'male'
                then 'men'::public.interest_type

              when 'female'
                then 'women'::public.interest_type

            end

          ) = any(preference_b.interested_in)

        )

      )

  );

$function$;

CREATE OR REPLACE FUNCTION public.enforce_minimum_age()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
begin

  if new.birth_date >
     (
       timezone('Asia/Bangkok', now())::date
       - interval '18 years'
     )::date
  then

    raise exception
      'User must be at least 18 years old';

  end if;

  return new;

end;
$function$;

CREATE OR REPLACE FUNCTION public.lock_tu_generation()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
begin

  if old.tu_generation is not null
     and new.tu_generation
         is distinct from old.tu_generation
  then

    raise exception
      'TU generation cannot be changed';

  end if;

  return new;

end;
$function$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

ALTER TABLE "public"."blocks"
  ADD CONSTRAINT "blocks_blocked_id_fkey" FOREIGN KEY (blocked_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."blocks"
  ADD CONSTRAINT "blocks_blocker_id_fkey" FOREIGN KEY (blocker_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."comments"
  ADD CONSTRAINT "comments_author_id_fkey" FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."dating_preferences"
  ADD CONSTRAINT "dating_preferences_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."dating_preferences"
  ADD CONSTRAINT "preference_not_empty" CHECK ((cardinality(interested_in) > 0));

ALTER TABLE "public"."device_tokens"
  ADD CONSTRAINT "device_tokens_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."matches"
  ADD CONSTRAINT "matches_unmatched_by_fkey" FOREIGN KEY (unmatched_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE "public"."matches"
  ADD CONSTRAINT "matches_user_1_fkey" FOREIGN KEY (user_1) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."matches"
  ADD CONSTRAINT "matches_user_2_fkey" FOREIGN KEY (user_2) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."messages"
  ADD CONSTRAINT "messages_match_id_fkey" FOREIGN KEY (match_id) REFERENCES public.matches(id) ON DELETE CASCADE;

ALTER TABLE "public"."messages"
  ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."post_likes"
  ADD CONSTRAINT "post_likes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."posts"
  ADD CONSTRAINT "posts_author_id_fkey" FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."comments"
  ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;

ALTER TABLE "public"."post_images"
  ADD CONSTRAINT "post_images_post_id_fkey" FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;

ALTER TABLE "public"."post_likes"
  ADD CONSTRAINT "post_likes_post_id_fkey" FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;

ALTER TABLE "public"."profile_photos"
  ADD CONSTRAINT "profile_photos_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."profiles"
  ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."reports"
  ADD CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY (reporter_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."student_accounts"
  ADD CONSTRAINT "student_accounts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."swipes"
  ADD CONSTRAINT "swipes_swiper_id_fkey" FOREIGN KEY (swiper_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."swipes"
  ADD CONSTRAINT "swipes_swiper_id_target_id_mode_key" UNIQUE (swiper_id, target_id, mode);

ALTER TABLE "public"."swipes"
  ADD CONSTRAINT "swipes_target_id_fkey" FOREIGN KEY (target_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."profiles"
  ADD CONSTRAINT "profiles_tu_generation_fkey" FOREIGN KEY (tu_generation) REFERENCES public.tu_generations(code);

ALTER TABLE "public"."user_interests"
  ADD CONSTRAINT "user_interests_interest_id_fkey" FOREIGN KEY (interest_id) REFERENCES public.interests(id) ON DELETE CASCADE;

ALTER TABLE "public"."user_interests"
  ADD CONSTRAINT "user_interests_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."user_locations"
  ADD CONSTRAINT "user_locations_location_id_fkey" FOREIGN KEY (location_id) REFERENCES public.campus_locations(id) ON DELETE CASCADE;

ALTER TABLE "public"."user_locations"
  ADD CONSTRAINT "user_locations_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."user_private"
  ADD CONSTRAINT "user_private_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX blocks_blocked_index ON public.blocks USING btree (blocked_id);

CREATE INDEX comments_post_index ON public.comments USING btree (post_id, created_at);

CREATE UNIQUE INDEX matches_unique_active ON public.matches USING btree (LEAST(user_1, user_2), GREATEST(user_1, user_2), mode)
  WHERE (unmatched_at IS NULL);

CREATE INDEX matches_user_1_index ON public.matches USING btree (user_1);

CREATE INDEX matches_user_2_index ON public.matches USING btree (user_2);

CREATE INDEX messages_match_created_index ON public.messages USING btree (match_id, created_at DESC);

CREATE INDEX posts_created_at_index ON public.posts USING btree (created_at DESC);

CREATE INDEX reports_status_index ON public.reports USING btree (status, created_at);

CREATE INDEX swipes_incoming_like_index ON public.swipes USING btree (target_id, mode, action);

CREATE TRIGGER comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER dating_preferences_updated_at
  BEFORE UPDATE ON public.dating_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER device_tokens_updated_at
  BEFORE UPDATE ON public.device_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER profiles_lock_tu_generation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.lock_tu_generation();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER student_accounts_updated_at
  BEFORE UPDATE ON public.student_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER swipes_updated_at
  BEFORE UPDATE ON public.swipes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER user_private_minimum_age
  BEFORE INSERT OR UPDATE ON public.user_private
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_minimum_age();

CREATE TRIGGER user_private_updated_at
  BEFORE UPDATE ON public.user_private
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "users create blocks" ON "public"."blocks"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((blocker_id = auth.uid()) AND (blocked_id <> auth.uid())));

CREATE POLICY "users read own blocks" ON "public"."blocks"
  FOR SELECT
  TO "authenticated"
  USING ((blocker_id = auth.uid()));

CREATE POLICY "users remove own blocks" ON "public"."blocks"
  FOR DELETE
  TO "authenticated"
  USING ((blocker_id = auth.uid()));

CREATE POLICY "authenticated read campus locations" ON "public"."campus_locations"
  FOR SELECT
  TO "authenticated"
  USING ((is_active = true));

CREATE POLICY "users create comments" ON "public"."comments"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((author_id = auth.uid()));

CREATE POLICY "users delete own comments" ON "public"."comments"
  FOR DELETE
  TO "authenticated"
  USING ((author_id = auth.uid()));

CREATE POLICY "users read own comments" ON "public"."comments"
  FOR SELECT
  TO "authenticated"
  USING ((author_id = auth.uid()));

CREATE POLICY "users update own comments" ON "public"."comments"
  FOR UPDATE
  TO "authenticated"
  USING ((author_id = auth.uid()))
  WITH CHECK ((author_id = auth.uid()));

CREATE POLICY "users create own dating preference" ON "public"."dating_preferences"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((user_id = auth.uid()));

CREATE POLICY "users read own dating preference" ON "public"."dating_preferences"
  FOR SELECT
  TO "authenticated"
  USING ((user_id = auth.uid()));

CREATE POLICY "users update own dating preference" ON "public"."dating_preferences"
  FOR UPDATE
  TO "authenticated"
  USING ((user_id = auth.uid()))
  WITH CHECK ((user_id = auth.uid()));

CREATE POLICY "users create own device token" ON "public"."device_tokens"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((user_id = auth.uid()));

CREATE POLICY "users delete own device token" ON "public"."device_tokens"
  FOR DELETE
  TO "authenticated"
  USING ((user_id = auth.uid()));

CREATE POLICY "users read own device tokens" ON "public"."device_tokens"
  FOR SELECT
  TO "authenticated"
  USING ((user_id = auth.uid()));

CREATE POLICY "users update own device token" ON "public"."device_tokens"
  FOR UPDATE
  TO "authenticated"
  USING ((user_id = auth.uid()))
  WITH CHECK ((user_id = auth.uid()));

CREATE POLICY "authenticated read interests" ON "public"."interests"
  FOR SELECT
  TO "authenticated"
  USING ((is_active = true));

CREATE POLICY "users read own active matches" ON "public"."matches"
  FOR SELECT
  TO "authenticated"
  USING (((unmatched_at IS NULL) AND ((user_1 = auth.uid()) OR (user_2 = auth.uid()))));

CREATE POLICY "match members read messages" ON "public"."messages"
  FOR SELECT
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM public.matches m
  WHERE ((m.id = messages.match_id) AND (m.unmatched_at IS NULL) AND ((m.user_1 = auth.uid()) OR (m.user_2 = auth.uid()))))));

CREATE POLICY "match members send messages" ON "public"."messages"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((sender_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.matches m
  WHERE ((m.id = messages.match_id) AND (m.unmatched_at IS NULL) AND ((m.user_1 = auth.uid()) OR (m.user_2 = auth.uid())))))));

CREATE POLICY "users add images to own posts" ON "public"."post_images"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((EXISTS ( SELECT 1
   FROM public.posts p
  WHERE ((p.id = post_images.post_id) AND (p.author_id = auth.uid())))));

CREATE POLICY "users delete images from own posts" ON "public"."post_images"
  FOR DELETE
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM public.posts p
  WHERE ((p.id = post_images.post_id) AND (p.author_id = auth.uid())))));

CREATE POLICY "users read own post images" ON "public"."post_images"
  FOR SELECT
  TO "authenticated"
  USING ((EXISTS ( SELECT 1
   FROM public.posts p
  WHERE ((p.id = post_images.post_id) AND (p.author_id = auth.uid())))));

CREATE POLICY "users like posts" ON "public"."post_likes"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((user_id = auth.uid()));

CREATE POLICY "users read own post likes" ON "public"."post_likes"
  FOR SELECT
  TO "authenticated"
  USING ((user_id = auth.uid()));

CREATE POLICY "users remove own post likes" ON "public"."post_likes"
  FOR DELETE
  TO "authenticated"
  USING ((user_id = auth.uid()));

CREATE POLICY "users create own posts" ON "public"."posts"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((author_id = auth.uid()));

CREATE POLICY "users delete own posts" ON "public"."posts"
  FOR DELETE
  TO "authenticated"
  USING ((author_id = auth.uid()));

CREATE POLICY "users read own posts" ON "public"."posts"
  FOR SELECT
  TO "authenticated"
  USING ((author_id = auth.uid()));

CREATE POLICY "users update own posts" ON "public"."posts"
  FOR UPDATE
  TO "authenticated"
  USING ((author_id = auth.uid()))
  WITH CHECK ((author_id = auth.uid()));

CREATE POLICY "users create own profile photos" ON "public"."profile_photos"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((user_id = auth.uid()));

CREATE POLICY "users delete own profile photos" ON "public"."profile_photos"
  FOR DELETE
  TO "authenticated"
  USING ((user_id = auth.uid()));

CREATE POLICY "users read own profile photos" ON "public"."profile_photos"
  FOR SELECT
  TO "authenticated"
  USING ((user_id = auth.uid()));

CREATE POLICY "users update own profile photos" ON "public"."profile_photos"
  FOR UPDATE
  TO "authenticated"
  USING ((user_id = auth.uid()))
  WITH CHECK ((user_id = auth.uid()));

CREATE POLICY "users create own profile" ON "public"."profiles"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((id = auth.uid()));

CREATE POLICY "users read own profile" ON "public"."profiles"
  FOR SELECT
  TO "authenticated"
  USING ((id = auth.uid()));

CREATE POLICY "users update own profile" ON "public"."profiles"
  FOR UPDATE
  TO "authenticated"
  USING ((id = auth.uid()))
  WITH CHECK ((id = auth.uid()));

CREATE POLICY "users create reports" ON "public"."reports"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((reporter_id = auth.uid()));

CREATE POLICY "users read own reports" ON "public"."reports"
  FOR SELECT
  TO "authenticated"
  USING ((reporter_id = auth.uid()));

CREATE POLICY "users read own student account" ON "public"."student_accounts"
  FOR SELECT
  TO "authenticated"
  USING ((user_id = auth.uid()));

CREATE POLICY "users create own swipes" ON "public"."swipes"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((swiper_id = auth.uid()) AND (target_id <> auth.uid())));

CREATE POLICY "users read own swipes" ON "public"."swipes"
  FOR SELECT
  TO "authenticated"
  USING ((swiper_id = auth.uid()));

CREATE POLICY "users update own swipes" ON "public"."swipes"
  FOR UPDATE
  TO "authenticated"
  USING ((swiper_id = auth.uid()))
  WITH CHECK (((swiper_id = auth.uid()) AND (target_id <> auth.uid())));

CREATE POLICY "anon can read tu generations" ON "public"."tu_generations"
  FOR SELECT
  TO "anon"
  USING ((is_active = true));

CREATE POLICY "authenticated read tu generations" ON "public"."tu_generations"
  FOR SELECT
  TO "authenticated"
  USING ((is_active = true));

CREATE POLICY "users add own interests" ON "public"."user_interests"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((user_id = auth.uid()));

CREATE POLICY "users read own interests" ON "public"."user_interests"
  FOR SELECT
  TO "authenticated"
  USING ((user_id = auth.uid()));

CREATE POLICY "users remove own interests" ON "public"."user_interests"
  FOR DELETE
  TO "authenticated"
  USING ((user_id = auth.uid()));

CREATE POLICY "users add own locations" ON "public"."user_locations"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((user_id = auth.uid()));

CREATE POLICY "users read own locations" ON "public"."user_locations"
  FOR SELECT
  TO "authenticated"
  USING ((user_id = auth.uid()));

CREATE POLICY "users remove own locations" ON "public"."user_locations"
  FOR DELETE
  TO "authenticated"
  USING ((user_id = auth.uid()));

CREATE POLICY "users create own private data" ON "public"."user_private"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((user_id = auth.uid()));

CREATE POLICY "users read own private data" ON "public"."user_private"
  FOR SELECT
  TO "authenticated"
  USING ((user_id = auth.uid()));

CREATE POLICY "users update own private data" ON "public"."user_private"
  FOR UPDATE
  TO "authenticated"
  USING ((user_id = auth.uid()))
  WITH CHECK ((user_id = auth.uid()));

GRANT EXECUTE ON FUNCTION "public"."are_date_preferences_compatible"(uuid, uuid) TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

GRANT EXECUTE ON FUNCTION "public"."enforce_minimum_age"() TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

GRANT EXECUTE ON FUNCTION "public"."lock_tu_generation"() TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

GRANT EXECUTE ON FUNCTION "public"."set_updated_at"() TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."blocks" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."campus_locations" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."comments" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."dating_preferences" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."device_tokens" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."interests" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."matches" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."messages" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."post_images" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."post_likes" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."posts" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profile_photos" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profiles" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."reports" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."student_accounts" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."swipes" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."tu_generations" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."user_interests" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."user_locations" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."user_private" TO "anon", "authenticated", "postgres", "service_role";

GRANT USAGE ON TYPE "public"."age_verification_method_type" TO "postgres";

GRANT USAGE ON TYPE "public"."app_mode" TO "postgres";

GRANT USAGE ON TYPE "public"."interest_type" TO "postgres";

GRANT USAGE ON TYPE "public"."report_status_type" TO "postgres";

GRANT USAGE ON TYPE "public"."report_target_type" TO "postgres";

GRANT USAGE ON TYPE "public"."sex_at_birth_type" TO "postgres";

GRANT USAGE ON TYPE "public"."swipe_action_type" TO "postgres";

