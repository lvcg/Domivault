-- Fix Supabase RLS performance warnings for DomiVault app tables.
-- Supabase recommends wrapping auth helper calls in select so they are evaluated once per query.

drop policy if exists "Users manage own expenses" on public.expenses;
drop policy if exists "Users manage own bills" on public.bills;
drop policy if exists "Users manage own vendors" on public.vendors;
drop policy if exists "Users read own appliances" on public.appliances;
drop policy if exists "Users delete own appliances" on public.appliances;
drop policy if exists "Users create basic appliance records" on public.appliances;
drop policy if exists "Users update basic appliance records" on public.appliances;
drop policy if exists "Users manage own maintenance tasks" on public.maintenance_tasks;
drop policy if exists "Plus users manage own service events" on public.service_events;
drop policy if exists "Plus users manage own reminders" on public.reminders;
drop policy if exists "Users read own vault documents" on public.vault_documents;
drop policy if exists "Plus users create own vault documents" on public.vault_documents;
drop policy if exists "Plus users update own vault documents" on public.vault_documents;
drop policy if exists "Users delete own vault documents" on public.vault_documents;
drop policy if exists "Plus users manage own vehicles" on public.vehicles;
drop policy if exists "Plus users manage own vehicle service events" on public.vehicle_service_events;

create policy "Users manage own expenses"
on public.expenses for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users manage own bills"
on public.bills for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users manage own vendors"
on public.vendors for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users read own appliances"
on public.appliances for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users delete own appliances"
on public.appliances for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users create basic appliance records"
on public.appliances for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and (
    (warranty_expires is null and document_url is null)
    or exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.plan_tier = 'vault_plus'
    )
  )
);

create policy "Users update basic appliance records"
on public.appliances for update
to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and (
    (warranty_expires is null and document_url is null)
    or exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.plan_tier = 'vault_plus'
    )
  )
);

create policy "Users manage own maintenance tasks"
on public.maintenance_tasks for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Plus users manage own service events"
on public.service_events for all
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.plan_tier = 'vault_plus'
  )
)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.plan_tier = 'vault_plus'
  )
);

create policy "Plus users manage own reminders"
on public.reminders for all
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.plan_tier = 'vault_plus'
  )
)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.plan_tier = 'vault_plus'
  )
);

create policy "Users read own vault documents"
on public.vault_documents for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Plus users create own vault documents"
on public.vault_documents for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.plan_tier = 'vault_plus'
  )
);

create policy "Plus users update own vault documents"
on public.vault_documents for update
to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.plan_tier = 'vault_plus'
  )
);

create policy "Users delete own vault documents"
on public.vault_documents for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "Plus users manage own vehicles"
on public.vehicles for all
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.plan_tier = 'vault_plus'
  )
)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.plan_tier = 'vault_plus'
  )
);

create policy "Plus users manage own vehicle service events"
on public.vehicle_service_events for all
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.plan_tier = 'vault_plus'
  )
)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.plan_tier = 'vault_plus'
  )
);
