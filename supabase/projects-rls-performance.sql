-- Fix Supabase RLS performance warning for public.projects.
-- Supabase recommends wrapping auth helper calls in select so they are evaluated once per query.

drop policy if exists "Users manage own projects" on public.projects;

create policy "Users manage own projects"
on public.projects for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
