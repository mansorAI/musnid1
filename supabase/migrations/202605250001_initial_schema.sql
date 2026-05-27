create extension if not exists "pgcrypto";

create type public.business_type as enum (
  'restaurant',
  'cafe',
  'clinic',
  'salon',
  'retail',
  'real_estate',
  'services',
  'other'
);

create type public.subscription_tier as enum ('starter', 'growth', 'business');
create type public.subscription_status as enum ('trial', 'active', 'suspended', 'cancelled');
create type public.conversation_status as enum ('open', 'pending', 'resolved');
create type public.channel as enum ('whatsapp', 'web');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  business_type public.business_type not null default 'other',
  whatsapp_number text,
  city text,
  subscription_tier public.subscription_tier not null default 'starter',
  subscription_status public.subscription_status not null default 'trial',
  trial_ends_at timestamptz default (now() + interval '14 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  phone text not null,
  tags text[] not null default '{}',
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  unique (organization_id, phone)
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  channel public.channel not null default 'whatsapp',
  status public.conversation_status not null default 'open',
  summary text,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  direction text not null check (direction in ('inbound', 'outbound')),
  body text not null,
  ai_generated boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.knowledge_articles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  content text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.automations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  trigger text not null,
  response text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organizations_set_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

create trigger knowledge_articles_set_updated_at
before update on public.knowledge_articles
for each row execute function public.set_updated_at();

alter table public.organizations enable row level security;
alter table public.customers enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.knowledge_articles enable row level security;
alter table public.automations enable row level security;

create policy "owners can manage organizations"
on public.organizations
for all
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "owners can manage customers"
on public.customers
for all
using (
  exists (
    select 1 from public.organizations
    where organizations.id = customers.organization_id
    and organizations.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.organizations
    where organizations.id = customers.organization_id
    and organizations.owner_id = auth.uid()
  )
);

create policy "owners can manage conversations"
on public.conversations
for all
using (
  exists (
    select 1 from public.organizations
    where organizations.id = conversations.organization_id
    and organizations.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.organizations
    where organizations.id = conversations.organization_id
    and organizations.owner_id = auth.uid()
  )
);

create policy "owners can manage messages"
on public.messages
for all
using (
  exists (
    select 1
    from public.conversations
    join public.organizations on organizations.id = conversations.organization_id
    where conversations.id = messages.conversation_id
    and organizations.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.conversations
    join public.organizations on organizations.id = conversations.organization_id
    where conversations.id = messages.conversation_id
    and organizations.owner_id = auth.uid()
  )
);

create policy "owners can manage knowledge"
on public.knowledge_articles
for all
using (
  exists (
    select 1 from public.organizations
    where organizations.id = knowledge_articles.organization_id
    and organizations.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.organizations
    where organizations.id = knowledge_articles.organization_id
    and organizations.owner_id = auth.uid()
  )
);

create policy "owners can manage automations"
on public.automations
for all
using (
  exists (
    select 1 from public.organizations
    where organizations.id = automations.organization_id
    and organizations.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.organizations
    where organizations.id = automations.organization_id
    and organizations.owner_id = auth.uid()
  )
);
