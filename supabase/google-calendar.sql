-- DomiVault Google Calendar integration
-- Run this in the Supabase SQL Editor before using Calendar sync.

alter table public.maintenance_tasks add column if not exists google_calendar_event_id text;
alter table public.maintenance_tasks add column if not exists google_calendar_html_link text;
alter table public.maintenance_tasks add column if not exists google_calendar_synced_at timestamptz;

create table if not exists public.google_calendar_tokens (
  user_id uuid primary key references auth.users(id) on delete cascade,
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  scope text,
  token_type text,
  google_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists google_calendar_tokens_set_updated_at on public.google_calendar_tokens;
create trigger google_calendar_tokens_set_updated_at
before update on public.google_calendar_tokens
for each row execute function public.set_updated_at();

create index if not exists maintenance_google_calendar_event_idx on public.maintenance_tasks(user_id, google_calendar_event_id);
create index if not exists google_calendar_tokens_updated_idx on public.google_calendar_tokens(updated_at desc);

alter table public.google_calendar_tokens enable row level security;

-- No user-facing RLS policy is intentionally created for google_calendar_tokens.
-- Tokens are read/written only by server API routes with SUPABASE_SERVICE_ROLE_KEY.
