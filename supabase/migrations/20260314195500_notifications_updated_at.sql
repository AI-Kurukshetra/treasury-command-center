alter table public.notifications
add column if not exists updated_at timestamptz not null default timezone('utc', now());
