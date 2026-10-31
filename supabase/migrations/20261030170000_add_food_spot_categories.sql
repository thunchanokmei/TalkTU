-- Add categories to favorite food spots and insert 9 new spots.

-- 1. Add the category column without a default value.
ALTER TABLE public.favorite_food_spots
  ADD COLUMN IF NOT EXISTS category text;


-- 2. Assign categories to the existing 20 food spots.

-- Cafeterias: 4 spots.
UPDATE public.favorite_food_spots
SET category = 'cafeteria'
WHERE name IN (
  'โรงกรีน',
  'โรงทิวสน',
  'โรง SC/JC',
  'โรงวิศวะ'
);

-- Savory: 11 existing spots.
UPDATE public.favorite_food_spots
SET category = 'savory'
WHERE name IN (
  'เทปัน',
  'ยกซด',
  'กะเพรานายจ๊อด',
  'สุกี้สุกี้',
  'จางเลี่ยงหมาล่า',
  'ถังฟู่หมาล่า',
  'องศาหมูกระทะ',
  'ยำยูป้า',
  'ข้าวมันไก่ใต้ก้ำ',
  'Tomorrow Expires',
  'โต๊กกะเจี๋ยว'
);

-- Dessert and drinks: 5 existing spots.
UPDATE public.favorite_food_spots
SET category = 'dessert_drink'
WHERE name IN (
  'นมสดพระนคร',
  'นมหวาน',
  'บัวลอยธรรมศาสตร์',
  'อ๊บอ๊บ',
  'น้ำเต้าหู้เจริญรัตน์'
);


-- 3. Insert 9 new food spots.
-- If a spot already exists, update its category.

INSERT INTO public.favorite_food_spots (name, category)
VALUES
  ('หอมข้าว', 'savory'),
  ('เจริญขาหมูหม้อทอง', 'savory'),
  ('รัตนา เตี๋ยวไก่ตุ๋น', 'savory'),
  ('พันเนื้อ', 'savory'),
  ('Poompoom steak', 'savory'),
  ('Poonpoon cafe', 'savory'),
  ('Sister', 'savory'),
  ('Password Bake', 'dessert_drink'),
  ('So Cool', 'dessert_drink')
ON CONFLICT (name)
DO UPDATE SET category = EXCLUDED.category;


-- 4. Require every food spot to have a category.
ALTER TABLE public.favorite_food_spots
  ALTER COLUMN category SET NOT NULL;


-- 5. Restrict category values to the 3 supported categories.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'favorite_food_spots_category_check'
      AND conrelid = 'public.favorite_food_spots'::regclass
  ) THEN
    ALTER TABLE public.favorite_food_spots
      ADD CONSTRAINT favorite_food_spots_category_check
      CHECK (category IN ('cafeteria', 'savory', 'dessert_drink'));
  END IF;
END
$$;