-- DomiVault security hardening patches
-- Run this in the Supabase SQL Editor to resolve function search_path warnings.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
