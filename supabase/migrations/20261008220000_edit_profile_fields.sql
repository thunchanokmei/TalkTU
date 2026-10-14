-- Add gender identity options used by Edit Profile and Onboarding.
ALTER TYPE public.gender_identity_type
    ADD VALUE IF NOT EXISTS 'lesbian';

ALTER TYPE public.gender_identity_type
    ADD VALUE IF NOT EXISTS 'gay';

ALTER TYPE public.gender_identity_type
    ADD VALUE IF NOT EXISTS 'bisexual';

ALTER TYPE public.gender_identity_type
    ADD VALUE IF NOT EXISTS 'transgender';

ALTER TYPE public.gender_identity_type
    ADD VALUE IF NOT EXISTS 'queer';

ALTER TYPE public.gender_identity_type
    ADD VALUE IF NOT EXISTS 'intersex';

ALTER TYPE public.gender_identity_type
    ADD VALUE IF NOT EXISTS 'asexual';

-- Rename the existing dormitory location, preserving its ID.
UPDATE public.campus_locations
SET name = 'หอใน'
WHERE id = 8
  AND name = 'หอใน มธ. 100 ปี';

-- Add the new locations if they do not already exist.
INSERT INTO public.campus_locations (name, is_active)
SELECT new_location.name, true
FROM (
    VALUES
        ('สวนป๋วย 100 ปี'),
        ('ศกร.')
) AS new_location(name)
WHERE NOT EXISTS (
    SELECT 1
    FROM public.campus_locations AS existing
    WHERE existing.name = new_location.name
);

-- Hide the old location without deleting existing user selections.
UPDATE public.campus_locations
SET is_active = false
WHERE id = 12
  AND name = 'ประตูเชียงราก';