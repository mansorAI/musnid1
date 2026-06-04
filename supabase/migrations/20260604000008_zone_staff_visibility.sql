-- Let business owners decide whether staff members appear in Zone.

alter table public.business_category_mapping
  add column if not exists show_staff boolean not null default false;

create or replace function public.get_marketplace_businesses()
returns table (
  business_id uuid,
  business_name text,
  business_type public.business_type,
  description text,
  city text,
  address text,
  contact_phone text,
  working_hours jsonb,
  bot_settings jsonb,
  category_id uuid,
  category_name text,
  category_icon text,
  action_type text,
  show_staff boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    b.id as business_id,
    b.name as business_name,
    b.type as business_type,
    b.description,
    b.city,
    b.address,
    b.contact_phone,
    b.working_hours,
    b.bot_settings,
    sc.id as category_id,
    sc.name as category_name,
    sc.icon as category_icon,
    sc.action_type,
    bcm.show_staff
  from public.business_category_mapping bcm
  join public.businesses b on b.id = bcm.business_id
  join public.store_categories sc on sc.id = bcm.category_id
  where bcm.is_public = true
    and sc.is_active = true
  order by sc.sort_order asc, b.name asc;
$$;

drop policy if exists "staff_marketplace_public_read" on public.staff_members;

create policy "staff_marketplace_public_read" on public.staff_members
  for select using (
    is_active = true
    and exists (
      select 1
      from public.business_category_mapping bcm
      where bcm.business_id = staff_members.business_id
        and bcm.is_public = true
        and bcm.show_staff = true
    )
  );

grant execute on function public.get_marketplace_businesses() to authenticated;

notify pgrst, 'reload schema';
