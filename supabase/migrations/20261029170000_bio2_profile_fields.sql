-- Bio2 profile fields and favorite food spot selections.

-- 1. Add optional Bio2 fields to profiles.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS after_class text,
  ADD COLUMN IF NOT EXISTS favorite_spot text;


-- 2. Create the favorite food spots catalog.
CREATE TABLE IF NOT EXISTS public.favorite_food_spots (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true
);


-- 3. Insert the 29 predefined food spots.
-- ON CONFLICT prevents duplicate names when this migration is rerun.
INSERT INTO public.favorite_food_spots (name)
VALUES
  ('โรงกรีน'),
  ('โรงทิวสน'),
  ('โรง SC/JC'),
  ('โรงวิศวะ'),
  ('เทปัน'),
  ('ยกซด'),
  ('กะเพรานายจ๊อด'),
  ('สุกี้สุกี้'),
  ('จางเลี่ยงหมาล่า'),
  ('ถังฟู่หมาล่า'),
  ('องศาหมูกระทะ'),
  ('ยำยูป้า'),
  ('ข้าวมันไก่ใต้ก้ำ'),
  ('Tomorrow Expires'),
  ('โต๊กกะเจี๋ยว'),
  ('นมสดพระนคร'),
  ('นมหวาน'),
  ('บัวลอยธรรมศาสตร์'),
  ('อ๊บอ๊บ'),
  ('น้ำเต้าหู้เจริญรัตน์'),
  ('หอมข้าว'),
  ('เจริญขาหมูหม้อทอง'),
  ('รัตนา เตี๋ยวไก่ตุ๋น'),
  ('พันเนื้อ'),
  ('Poompoom steak'),
  ('Poonpoon cafe'),
  ('Sister'),
  ('Password Bake'),
  ('So Cool')
ON CONFLICT (name) DO NOTHING;


-- 4. Create the user-to-food-spot relationship table.
CREATE TABLE IF NOT EXISTS public.user_favorite_food_spots (
  user_id uuid NOT NULL
    REFERENCES auth.users(id) ON DELETE CASCADE,
  food_spot_id bigint NOT NULL
    REFERENCES public.favorite_food_spots(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, food_spot_id)
);


-- 5. Enable Row Level Security.
ALTER TABLE public.favorite_food_spots
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.user_favorite_food_spots
  ENABLE ROW LEVEL SECURITY;


-- 6. Create policies only when they do not already exist.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'favorite_food_spots'
      AND policyname = 'authenticated read active food spots'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "authenticated read active food spots"
      ON public.favorite_food_spots
      FOR SELECT
      TO authenticated
      USING (is_active = true)
    $policy$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_favorite_food_spots'
      AND policyname = 'users read own favorite food spots'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "users read own favorite food spots"
      ON public.user_favorite_food_spots
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid())
    $policy$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_favorite_food_spots'
      AND policyname = 'users add own favorite food spots'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "users add own favorite food spots"
      ON public.user_favorite_food_spots
      FOR INSERT
      TO authenticated
      WITH CHECK (user_id = auth.uid())
    $policy$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_favorite_food_spots'
      AND policyname = 'users remove own favorite food spots'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "users remove own favorite food spots"
      ON public.user_favorite_food_spots
      FOR DELETE
      TO authenticated
      USING (user_id = auth.uid())
    $policy$;
  END IF;
END
$$;
-- 7. Restrict table privileges.

-- Remove access from unauthenticated users.
REVOKE ALL ON TABLE public.favorite_food_spots FROM anon;
REVOKE ALL ON TABLE public.user_favorite_food_spots FROM anon;

-- Allow authenticated users to read active food spots.
REVOKE ALL ON TABLE public.favorite_food_spots FROM authenticated;
GRANT SELECT ON TABLE public.favorite_food_spots TO authenticated;

-- Allow authenticated users to manage their own food spot selections.
REVOKE ALL ON TABLE public.user_favorite_food_spots FROM authenticated;
GRANT SELECT, INSERT, DELETE
ON TABLE public.user_favorite_food_spots
TO authenticated;