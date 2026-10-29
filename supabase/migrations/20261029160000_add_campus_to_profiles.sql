ALTER TABLE public.profiles
ADD COLUMN campus text;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_campus_check
CHECK (
  campus IS NULL
  OR campus IN ('รังสิต', 'ท่าพระจันทร์', 'พัทยา', 'ลำปาง')
);
