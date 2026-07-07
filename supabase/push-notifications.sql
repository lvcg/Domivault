-- DomiVault web push notification profile fields.
-- Run this in Supabase SQL Editor if push setup says columns are missing.

alter table public.profiles add column if not exists push_enabled boolean not null default false;
alter table public.profiles add column if not exists push_subscription jsonb;
alter table public.profiles add column if not exists push_subscription_saved_at timestamptz;

create index if not exists profiles_push_enabled_idx
on public.profiles(id, push_enabled)
where push_enabled = true;

-- Optional: force PostgREST/Supabase API schema cache refresh.
notify pgrst, 'reload schema';

