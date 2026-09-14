create policy "matched users read each other profiles"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or exists (
    select 1
    from public.matches m
    where m.unmatched_at is null
      and (
        (m.user_1 = auth.uid() and m.user_2 = profiles.id)
        or
        (m.user_2 = auth.uid() and m.user_1 = profiles.id)
      )
  )
);