-- Musnid sales and ZATCA-ready invoicing foundation.
-- Run in Supabase SQL editor before using the mobile sales module.

create extension if not exists "uuid-ossp";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'invoice_vat_mode' and typnamespace = 'public'::regnamespace) then
    create type public.invoice_vat_mode as enum ('none', 'inclusive', 'exclusive');
  end if;

  if not exists (select 1 from pg_type where typname = 'invoice_kind' and typnamespace = 'public'::regnamespace) then
    create type public.invoice_kind as enum ('simplified_tax_invoice', 'tax_invoice', 'credit_note', 'debit_note');
  end if;

  if not exists (select 1 from pg_type where typname = 'invoice_status' and typnamespace = 'public'::regnamespace) then
    create type public.invoice_status as enum ('draft', 'issued', 'reported', 'cleared', 'rejected', 'cancelled');
  end if;

  if not exists (select 1 from pg_type where typname = 'invoice_payment_method' and typnamespace = 'public'::regnamespace) then
    create type public.invoice_payment_method as enum ('cash', 'card', 'bank_transfer', 'other');
  end if;

  if not exists (select 1 from pg_type where typname = 'zatca_environment' and typnamespace = 'public'::regnamespace) then
    create type public.zatca_environment as enum ('sandbox', 'simulation', 'production');
  end if;
end $$;

create table if not exists public.invoice_settings (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  seller_name text not null default '',
  vat_number text,
  seller_address text,
  vat_registered boolean not null default false,
  vat_mode public.invoice_vat_mode not null default 'none',
  vat_rate numeric(5,4) not null default 0.15,
  invoice_prefix text not null default 'INV',
  next_invoice_number bigint not null default 1,
  zatca_environment public.zatca_environment not null default 'sandbox',
  phase2_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invoice_settings_vat_number_len check (vat_number is null or vat_number ~ '^[0-9]{15}$')
);

create table if not exists public.sales_products (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  price numeric(12,2) not null check (price >= 0),
  vat_inclusive boolean not null default true,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  invoice_number text not null,
  invoice_kind public.invoice_kind not null default 'simplified_tax_invoice',
  status public.invoice_status not null default 'issued',
  payment_method public.invoice_payment_method not null default 'card',
  seller_name text not null,
  seller_vat_number text,
  seller_address text,
  buyer_name text,
  buyer_vat_number text,
  buyer_phone text,
  currency text not null default 'SAR',
  vat_mode public.invoice_vat_mode not null default 'none',
  vat_rate numeric(5,4) not null default 0.15,
  subtotal_amount numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  taxable_amount numeric(12,2) not null default 0,
  vat_amount numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  qr_tlv text,
  xml_hash text,
  xml_uuid text,
  icv bigint,
  previous_invoice_hash text,
  zatca_payload jsonb not null default '{}',
  zatca_response jsonb not null default '{}',
  issued_at timestamptz not null default now(),
  reported_at timestamptz,
  cleared_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, invoice_number),
  constraint invoices_seller_vat_number_len check (seller_vat_number is null or seller_vat_number ~ '^[0-9]{15}$'),
  constraint invoices_buyer_vat_number_len check (buyer_vat_number is null or buyer_vat_number ~ '^[0-9]{15}$')
);

create table if not exists public.invoice_items (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  description text,
  qty numeric(10,3) not null default 1,
  unit_price numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  taxable_amount numeric(12,2) not null default 0,
  vat_amount numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  vat_category text not null default 'S',
  created_at timestamptz not null default now()
);

create table if not exists public.zatca_devices (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  device_name text not null,
  environment public.zatca_environment not null default 'sandbox',
  compliance_csid text,
  production_csid text,
  private_key_ref text,
  certificate_info jsonb not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.zatca_submissions (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  environment public.zatca_environment not null default 'sandbox',
  request_payload jsonb not null default '{}',
  response_payload jsonb not null default '{}',
  status text not null default 'pending',
  error_message text,
  submitted_at timestamptz not null default now()
);

alter table public.invoice_settings enable row level security;
alter table public.sales_products enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.zatca_devices enable row level security;
alter table public.zatca_submissions enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'invoice_settings' and policyname = 'invoice_settings_select') then
    create policy "invoice_settings_select" on public.invoice_settings for select
      using (public.user_owns_business(business_id));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'invoice_settings' and policyname = 'invoice_settings_write') then
    create policy "invoice_settings_write" on public.invoice_settings for all
      using (public.user_owns_business(business_id))
      with check (public.user_owns_business(business_id));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'sales_products' and policyname = 'sales_products_select') then
    create policy "sales_products_select" on public.sales_products for select
      using (public.user_owns_business(business_id));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'sales_products' and policyname = 'sales_products_write') then
    create policy "sales_products_write" on public.sales_products for all
      using (public.user_owns_business(business_id))
      with check (public.user_owns_business(business_id));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'invoices' and policyname = 'invoices_select') then
    create policy "invoices_select" on public.invoices for select
      using (public.user_owns_business(business_id));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'invoices' and policyname = 'invoices_insert') then
    create policy "invoices_insert" on public.invoices for insert
      with check (public.user_owns_business(business_id));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'invoices' and policyname = 'invoices_update') then
    create policy "invoices_update" on public.invoices for update
      using (public.user_owns_business(business_id))
      with check (public.user_owns_business(business_id));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'invoice_items' and policyname = 'invoice_items_select') then
    create policy "invoice_items_select" on public.invoice_items for select
      using (public.user_owns_business(business_id));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'invoice_items' and policyname = 'invoice_items_insert') then
    create policy "invoice_items_insert" on public.invoice_items for insert
      with check (public.user_owns_business(business_id));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'zatca_devices' and policyname = 'zatca_devices_select') then
    create policy "zatca_devices_select" on public.zatca_devices for select
      using (public.user_owns_business(business_id));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'zatca_devices' and policyname = 'zatca_devices_write') then
    create policy "zatca_devices_write" on public.zatca_devices for all
      using (public.user_owns_business(business_id))
      with check (public.user_owns_business(business_id));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'zatca_submissions' and policyname = 'zatca_submissions_select') then
    create policy "zatca_submissions_select" on public.zatca_submissions for select
      using (public.user_owns_business(business_id));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'zatca_submissions' and policyname = 'zatca_submissions_insert') then
    create policy "zatca_submissions_insert" on public.zatca_submissions for insert
      with check (public.user_owns_business(business_id));
  end if;
end $$;

notify pgrst, 'reload schema';

-- Phase 2 note:
-- XML/UBL generation, signing, cryptographic stamp, CSID handling, and Fatoora API calls
-- must run in a trusted backend/Edge Function. Do not store private keys in the mobile app.
