-- Permission for cashier Zone order review.

alter table public.employee_permissions
  add column if not exists can_manage_orders boolean not null default false;

create or replace function public.employee_can_manage_orders(p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.business_employees be
    join public.employee_permissions ep on ep.employee_id = be.id
    where be.business_id = p_business_id
      and be.profile_id = auth.uid()
      and be.status = 'active'
      and ep.cashier_access = true
      and ep.can_manage_orders = true
  );
$$;

drop policy if exists "customer_interactions_cashier_select" on public.customer_interactions;
drop policy if exists "customer_interactions_cashier_update" on public.customer_interactions;
drop policy if exists "interaction_items_cashier_select" on public.interaction_items;

create policy "customer_interactions_cashier_select"
  on public.customer_interactions for select
  using (public.employee_can_manage_orders(business_id));

create policy "customer_interactions_cashier_update"
  on public.customer_interactions for update
  using (public.employee_can_manage_orders(business_id))
  with check (public.employee_can_manage_orders(business_id));

create policy "interaction_items_cashier_select"
  on public.interaction_items for select
  using (public.employee_can_manage_orders(business_id));

notify pgrst, 'reload schema';
