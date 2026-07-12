-- Fix Supabase RLS performance warning for public.profiles.
-- Supabase recommends wrapping auth helper calls in select so they are evaluated once per query.

drop policy if exists "Users manage own profile" on public.profiles;

create policy "Users manage own profile"
on public.profiles for all
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);
