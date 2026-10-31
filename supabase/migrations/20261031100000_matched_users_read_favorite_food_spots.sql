-- Allow matched users to read each other's favorite food spot selections.
CREATE POLICY "matched users read each other favorite food spots"
ON public.user_favorite_food_spots
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.matches m
    WHERE m.unmatched_at IS NULL
      AND (
        (m.user_1 = auth.uid()
          AND m.user_2 = user_favorite_food_spots.user_id)
        OR
        (m.user_2 = auth.uid()
          AND m.user_1 = user_favorite_food_spots.user_id)
      )
  )
);