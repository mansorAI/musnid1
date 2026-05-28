-- =====================================================
-- مُسنِد — Full Schema Migration
-- File: 20260528001_musnid_schema.sql
-- Replaces old incorrect schema (organizations, knowledge_articles, automations, etc.)
-- =====================================================


-- =====================================================
-- Step 0: Drop old incorrect tables & types
-- Order: leaf tables first, then parent tables
-- =====================================================

DROP TABLE IF EXISTS public.automations           CASCADE;
DROP TABLE IF EXISTS public.knowledge_articles    CASCADE;
DROP TABLE IF EXISTS public.messages              CASCADE;
DROP TABLE IF EXISTS public.conversations         CASCADE;
DROP TABLE IF EXISTS public.customers             CASCADE;
DROP TABLE IF EXISTS public.organizations         CASCADE;

-- Drop old functions/triggers that will be recreated
DROP FUNCTION IF EXISTS public.user_owns_business(UUID)  CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at()       CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user()         CASCADE;

-- Drop old enum types (will be recreated with correct values)
DROP TYPE IF EXISTS public.business_type        CASCADE;
DROP TYPE IF EXISTS public.subscription_tier    CASCADE;
DROP TYPE IF EXISTS public.subscription_status  CASCADE;
DROP TYPE IF EXISTS public.conversation_status  CASCADE;
DROP TYPE IF EXISTS public.channel              CASCADE;


-- =====================================================
-- Migration 1: Extensions, Enums, Profiles, Businesses
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types
CREATE TYPE public.business_type AS ENUM (
  'restaurant', 'cafe', 'clinic', 'salon',
  'retail', 'real_estate', 'services', 'other'
);

CREATE TYPE public.subscription_tier   AS ENUM ('starter', 'growth', 'business');
CREATE TYPE public.subscription_status AS ENUM ('trial', 'active', 'suspended', 'cancelled');

-- profiles: linked to auth.users
CREATE TABLE public.profiles (
  id                 UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email              TEXT        UNIQUE NOT NULL,
  full_name          TEXT,
  phone              TEXT,
  avatar_url         TEXT,
  preferred_language TEXT        DEFAULT 'ar',
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- businesses: one per merchant account
CREATE TABLE public.businesses (
  id                       UUID                       PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id                 UUID                       NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Basic info
  name                     TEXT                       NOT NULL,
  slug                     TEXT                       UNIQUE NOT NULL,
  type                     public.business_type       NOT NULL,
  description              TEXT,

  -- Location
  city                     TEXT,
  address                  TEXT,
  latitude                 DECIMAL(10, 8),
  longitude                DECIMAL(11, 8),

  -- Contact
  contact_phone            TEXT,
  contact_email            TEXT,

  -- Working hours JSONB — {"saturday": {"open": "09:00", "close": "23:00", "closed": false}, ...}
  working_hours            JSONB DEFAULT '{}',

  -- Bot settings JSONB — {"personality": "friendly", "dialect": "saudi", "greeting": "..."}
  bot_settings             JSONB DEFAULT '{"personality": "friendly", "dialect": "saudi"}',

  -- WhatsApp integration
  whatsapp_number          TEXT,
  twilio_sender_id         TEXT,
  twilio_subaccount_sid    TEXT,
  whatsapp_status          TEXT DEFAULT 'disconnected', -- disconnected | pending | connected

  -- Subscription
  subscription_tier        public.subscription_tier   DEFAULT 'starter',
  subscription_status      public.subscription_status DEFAULT 'trial',
  trial_ends_at            TIMESTAMPTZ                DEFAULT (NOW() + INTERVAL '14 days'),
  subscription_started_at  TIMESTAMPTZ,
  subscription_ends_at     TIMESTAMPTZ,

  -- Usage tracking (current billing period)
  current_period_messages  INT         DEFAULT 0,
  current_period_start     TIMESTAMPTZ DEFAULT NOW(),

  created_at               TIMESTAMPTZ DEFAULT NOW(),
  updated_at               TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_businesses_owner    ON public.businesses(owner_id);
CREATE INDEX idx_businesses_slug     ON public.businesses(slug);
CREATE INDEX idx_businesses_type     ON public.businesses(type);
CREATE INDEX idx_businesses_whatsapp ON public.businesses(whatsapp_number);


-- =====================================================
-- Migration 2: Restaurant — Menu Categories & Items
-- =====================================================

CREATE TABLE public.menu_categories (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id  UUID        NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  display_order INT        DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.menu_items (
  id                      UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id             UUID        NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  category_id             UUID        REFERENCES public.menu_categories(id) ON DELETE SET NULL,

  name                    TEXT        NOT NULL,
  description             TEXT,
  price                   DECIMAL(10, 2) NOT NULL,
  image_url               TEXT,

  is_available            BOOLEAN     DEFAULT TRUE,
  display_order           INT         DEFAULT 0,

  preparation_time_minutes INT,
  calories                INT,
  is_spicy                BOOLEAN     DEFAULT FALSE,
  is_vegetarian           BOOLEAN     DEFAULT FALSE,

  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_menu_items_business  ON public.menu_items(business_id);
CREATE INDEX idx_menu_items_available ON public.menu_items(business_id, is_available);


-- =====================================================
-- Migration 3: Clinic / Salon — Staff & Services
-- =====================================================

CREATE TABLE public.staff_members (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id   UUID        NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,

  name          TEXT        NOT NULL,
  title         TEXT,
  specialty     TEXT,
  bio           TEXT,
  photo_url     TEXT,

  working_hours JSONB,
  is_active     BOOLEAN     DEFAULT TRUE,
  display_order INT         DEFAULT 0,

  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.services (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id       UUID        NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  staff_id          UUID        REFERENCES public.staff_members(id) ON DELETE SET NULL,

  name              TEXT        NOT NULL,
  description       TEXT,
  price             DECIMAL(10, 2),
  price_max         DECIMAL(10, 2),

  duration_minutes  INT         NOT NULL DEFAULT 30,
  is_active         BOOLEAN     DEFAULT TRUE,
  display_order     INT         DEFAULT 0,

  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Migration 5 (Customers — moved before Appointments
--              to satisfy FK dependency in Migration 4)
-- =====================================================

CREATE TABLE public.customers (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id     UUID        NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,

  phone           TEXT        NOT NULL,
  name            TEXT,

  first_seen_at   TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ,
  total_messages  INT         DEFAULT 0,

  preferences     JSONB       DEFAULT '{}',
  tags            TEXT[]      DEFAULT '{}',

  UNIQUE(business_id, phone)
);

CREATE INDEX idx_customers_business_phone ON public.customers(business_id, phone);


-- =====================================================
-- Migration 4: Calendar Overrides & Appointments
-- =====================================================

CREATE TABLE public.calendar_overrides (
  id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID    NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,

  date        DATE    NOT NULL,
  is_closed   BOOLEAN DEFAULT FALSE,
  open_time   TIME,
  close_time  TIME,
  notes       TEXT,

  created_at  TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(business_id, date)
);

CREATE TABLE public.appointments (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id      UUID        NOT NULL REFERENCES public.businesses(id)    ON DELETE CASCADE,
  customer_id      UUID        REFERENCES public.customers(id)              ON DELETE SET NULL,
  service_id       UUID        REFERENCES public.services(id)               ON DELETE SET NULL,
  staff_id         UUID        REFERENCES public.staff_members(id)          ON DELETE SET NULL,

  scheduled_at     TIMESTAMPTZ NOT NULL,
  duration_minutes INT         NOT NULL DEFAULT 30,

  status           TEXT        NOT NULL DEFAULT 'pending', -- pending | confirmed | completed | cancelled | no_show
  notes            TEXT,

  -- Snapshot of customer data at booking time
  customer_name    TEXT,
  customer_phone   TEXT,

  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appointments_business  ON public.appointments(business_id);
CREATE INDEX idx_appointments_scheduled ON public.appointments(scheduled_at);
CREATE INDEX idx_appointments_staff     ON public.appointments(staff_id);


-- =====================================================
-- Migration 5 (continued): Conversations & Messages
-- =====================================================

CREATE TABLE public.conversations (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id      UUID        NOT NULL REFERENCES public.businesses(id)  ON DELETE CASCADE,
  customer_id      UUID        NOT NULL REFERENCES public.customers(id)   ON DELETE CASCADE,

  status           TEXT        NOT NULL DEFAULT 'active', -- active | escalated | closed

  -- WhatsApp 24-hour session window
  window_expires_at TIMESTAMPTZ,

  started_at       TIMESTAMPTZ DEFAULT NOW(),
  last_message_at  TIMESTAMPTZ DEFAULT NOW(),
  closed_at        TIMESTAMPTZ,

  -- AI-generated summary, refreshed automatically
  summary          TEXT,

  metadata         JSONB       DEFAULT '{}'
);

CREATE INDEX idx_conversations_business ON public.conversations(business_id);
CREATE INDEX idx_conversations_customer ON public.conversations(customer_id);
CREATE INDEX idx_conversations_status   ON public.conversations(business_id, status);

CREATE TABLE public.messages (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id   UUID        NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,

  direction         TEXT        NOT NULL, -- inbound | outbound
  content_type      TEXT        NOT NULL DEFAULT 'text', -- text | image | audio | video | document | interactive
  content           JSONB       NOT NULL,

  twilio_message_sid TEXT       UNIQUE,

  -- AI metadata for outbound bot messages
  ai_metadata       JSONB,

  status            TEXT        DEFAULT 'sent', -- queued | sent | delivered | read | failed

  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at);
CREATE INDEX idx_messages_twilio_sid   ON public.messages(twilio_message_sid);


-- =====================================================
-- Migration 6: Consents (PDPL Compliance)
-- =====================================================

CREATE TYPE public.consent_type AS ENUM (
  'reminders',
  'marketing',
  'arar_offers'
);

CREATE TYPE public.consent_status AS ENUM ('opted_in', 'opted_out', 'pending');

CREATE TABLE public.consents (
  id                UUID                  PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id       UUID                  NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,

  customer_phone    TEXT                  NOT NULL,
  consent_type      public.consent_type   NOT NULL,
  status            public.consent_status NOT NULL DEFAULT 'pending',

  consent_text      TEXT,
  consent_method    TEXT, -- whatsapp_button | whatsapp_text | web_form

  source_message_id UUID                  REFERENCES public.messages(id) ON DELETE SET NULL,

  opted_in_at       TIMESTAMPTZ,
  opted_out_at      TIMESTAMPTZ,

  created_at        TIMESTAMPTZ           DEFAULT NOW(),

  UNIQUE(business_id, customer_phone, consent_type)
);

CREATE INDEX idx_consents_lookup ON public.consents(business_id, customer_phone, consent_type);


-- =====================================================
-- Migration 7: Message Templates
-- =====================================================

CREATE TYPE public.template_category AS ENUM ('utility', 'marketing', 'authentication');
CREATE TYPE public.template_status   AS ENUM ('draft', 'pending', 'approved', 'rejected', 'paused');

CREATE TABLE public.message_templates (
  id                  UUID                       PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id         UUID                       NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,

  name                TEXT                       NOT NULL,
  display_name        TEXT,

  category            public.template_category   NOT NULL,
  language            TEXT                       DEFAULT 'ar',

  content             TEXT                       NOT NULL,
  variables           JSONB                      DEFAULT '[]',

  status              public.template_status     DEFAULT 'draft',
  twilio_template_sid TEXT,
  rejection_reason    TEXT,

  created_at          TIMESTAMPTZ                DEFAULT NOW(),
  updated_at          TIMESTAMPTZ                DEFAULT NOW()
);


-- =====================================================
-- Migration 8: Row Level Security
-- =====================================================

ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_members     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consents          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

-- Profile: user sees/edits only their own row
CREATE POLICY "users_own_profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Businesses: owner sees/edits only their businesses
CREATE POLICY "owner_own_businesses" ON public.businesses
  FOR ALL USING (owner_id = auth.uid());

-- Helper: check caller owns the given business
CREATE OR REPLACE FUNCTION public.user_owns_business(business_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.businesses
    WHERE id = business_uuid AND owner_id = auth.uid()
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Child tables: all scoped to owner via helper
CREATE POLICY "owner_own_menu_categories"  ON public.menu_categories   FOR ALL USING (user_owns_business(business_id));
CREATE POLICY "owner_own_menu_items"       ON public.menu_items        FOR ALL USING (user_owns_business(business_id));
CREATE POLICY "owner_own_staff"            ON public.staff_members     FOR ALL USING (user_owns_business(business_id));
CREATE POLICY "owner_own_services"         ON public.services          FOR ALL USING (user_owns_business(business_id));
CREATE POLICY "owner_own_calendar"         ON public.calendar_overrides FOR ALL USING (user_owns_business(business_id));
CREATE POLICY "owner_own_appointments"     ON public.appointments      FOR ALL USING (user_owns_business(business_id));
CREATE POLICY "owner_own_customers"        ON public.customers         FOR ALL USING (user_owns_business(business_id));
CREATE POLICY "owner_own_conversations"    ON public.conversations     FOR ALL USING (user_owns_business(business_id));
CREATE POLICY "owner_own_consents"         ON public.consents          FOR ALL USING (user_owns_business(business_id));
CREATE POLICY "owner_own_templates"        ON public.message_templates FOR ALL USING (user_owns_business(business_id));

-- Messages: scoped through parent conversation
CREATE POLICY "owner_own_messages" ON public.messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND user_owns_business(c.business_id)
    )
  );


-- =====================================================
-- Migration 9: Triggers & Functions
-- =====================================================

-- Auto-update updated_at on every UPDATE
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at       BEFORE UPDATE ON public.profiles          FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_businesses_updated_at     BEFORE UPDATE ON public.businesses        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_menu_items_updated_at     BEFORE UPDATE ON public.menu_items        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_staff_members_updated_at  BEFORE UPDATE ON public.staff_members     FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_services_updated_at       BEFORE UPDATE ON public.services          FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_appointments_updated_at   BEFORE UPDATE ON public.appointments      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_templates_updated_at      BEFORE UPDATE ON public.message_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Auto-create profile row when a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
