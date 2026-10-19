alter table public.reports
add column if not exists target_snapshot jsonb;

alter table public.reports
add column if not exists email_sent_at timestamptz;

alter table public.reports
add column if not exists email_error text;