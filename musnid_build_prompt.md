# المهمة: بناء منصة "مُسنِد" — SaaS بوتات WhatsApp ذكية للسعودية

أنت مهندس برمجيات أول. ستبني منصة SaaS احترافية كاملة تسمى **مُسنِد**. اقرأ هذا المستند بالكامل قبل البدء. لا تطرح أسئلة قبل البدء — كل التفاصيل هنا. ابدأ بالمرحلة 1 وأكمل بالترتيب.

---

## 1. هوية المشروع

**الاسم:** مُسنِد
**الوصف:** منصة SaaS تقدم بوتات ذكاء اصطناعي على WhatsApp للأنشطة التجارية في السعودية (مطاعم، عيادات، صالونات، متاجر، عقارات، خدمات).

**السوق المستهدف:** أصحاب الأعمال الصغيرة والمتوسطة في السعودية.

**الميزة التنافسية:**
- بوت يتكلم باللهجة السعودية
- يفهم سياق كل نشاط تجاري
- يدير الحجوزات والاستفسارات والطلبات
- لوحة تحكم بسيطة لصاحب النشاط
- تكامل مع ZATCA للفواتير الإلكترونية
- منتج موازٍ "عروض عرعر" لتوزيع العروض التسويقية

---

## 2. حزمة التقنيات (إجبارية - لا تستبدل)

### Frontend & Backend
- **Next.js 14+** (App Router)
- **TypeScript** (strict mode)
- **Tailwind CSS** + **shadcn/ui**
- **React Hook Form** + **Zod** للنماذج والتحقق
- **TanStack Query** للبيانات
- **Zustand** لإدارة الـ State العام
- **date-fns** للتواريخ مع locale عربي

### قاعدة البيانات والمصادقة
- **Supabase**:
  - PostgreSQL للبيانات
  - Supabase Auth للمصادقة (Email + Google OAuth)
  - Supabase Storage للصور (منيو، أطباء، عقارات)
  - Supabase Realtime للمحادثات المباشرة
  - Row Level Security (RLS) للعزل بين المتاجر

### الخدمات الخارجية
- **Anthropic Claude API** (`claude-sonnet-4-20250514`) للبوت
- **Twilio WhatsApp Sandbox** للاختبار، ثم Twilio Production لاحقاً
- **Moyasar أو Tap Payments** لاستقبال المدفوعات السعودية

### النشر
- **Vercel** للاستضافة
- **Cloudflare** للـ DNS
- **Resend** لإرسال الإيميلات الترانزاكشنية

---

## 3. الهيكل المعماري

```
المستخدم (صاحب المتجر) → Vercel (Next.js) → Supabase (DB + Auth + Storage)
                                ↓
                         Anthropic Claude (AI)
                                ↓
                         Twilio (WhatsApp)
                                ↓
                         العميل النهائي (WhatsApp)
```

### Multi-Tenant Architecture
- كل متجر = صف في جدول `businesses`
- كل البيانات الفرعية تربط بـ `business_id`
- Row Level Security يضمن إن المتجر A لا يرى بيانات المتجر B
- نظام Subscription tiers يحدد الحدود

---

## 4. مخطط قاعدة البيانات الكامل (SQL Migrations)

شغّل هذي الـ migrations بالترتيب في Supabase SQL Editor:

### Migration 1: Users & Businesses

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom enum types
CREATE TYPE business_type AS ENUM (
  'restaurant', 'cafe', 'clinic', 'salon', 
  'retail', 'real_estate', 'services', 'other'
);

CREATE TYPE subscription_tier AS ENUM ('starter', 'growth', 'business');
CREATE TYPE subscription_status AS ENUM ('trial', 'active', 'suspended', 'cancelled');

-- Users table (يربط بـ auth.users من Supabase)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'ar',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Businesses table
CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Basic info
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type business_type NOT NULL,
  description TEXT,
  
  -- Location
  city TEXT,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Contact
  contact_phone TEXT,
  contact_email TEXT,
  
  -- Working hours (JSONB)
  -- Format: {"saturday": {"open": "09:00", "close": "23:00", "closed": false}, ...}
  working_hours JSONB DEFAULT '{}',
  
  -- Bot settings (JSONB)
  -- Format: {"personality": "friendly", "dialect": "saudi", "greeting": "..."}
  bot_settings JSONB DEFAULT '{"personality": "friendly", "dialect": "saudi"}',
  
  -- WhatsApp integration
  whatsapp_number TEXT,
  twilio_sender_id TEXT,
  twilio_subaccount_sid TEXT,
  whatsapp_status TEXT DEFAULT 'disconnected', -- disconnected, pending, connected
  
  -- Subscription
  subscription_tier subscription_tier DEFAULT 'starter',
  subscription_status subscription_status DEFAULT 'trial',
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  subscription_started_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,
  
  -- Usage tracking (الشهر الحالي)
  current_period_messages INT DEFAULT 0,
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_businesses_owner ON public.businesses(owner_id);
CREATE INDEX idx_businesses_slug ON public.businesses(slug);
CREATE INDEX idx_businesses_type ON public.businesses(type);
CREATE INDEX idx_businesses_whatsapp ON public.businesses(whatsapp_number);
```

### Migration 2: Restaurant Specific Tables

```sql
CREATE TABLE public.menu_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.menu_categories(id) ON DELETE SET NULL,
  
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  
  is_available BOOLEAN DEFAULT TRUE, -- المفتاح لزر "نفذ"
  display_order INT DEFAULT 0,
  
  -- Optional fields
  preparation_time_minutes INT,
  calories INT,
  is_spicy BOOLEAN DEFAULT FALSE,
  is_vegetarian BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_menu_items_business ON public.menu_items(business_id);
CREATE INDEX idx_menu_items_available ON public.menu_items(business_id, is_available);
```

### Migration 3: Clinic Specific Tables

```sql
CREATE TABLE public.staff_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  title TEXT, -- مثل: د.، أ.د.
  specialty TEXT,
  bio TEXT,
  photo_url TEXT,
  
  -- ساعات عمل خاصة (إذا اختلفت عن النشاط العام)
  working_hours JSONB,
  
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES public.staff_members(id) ON DELETE SET NULL,
  
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  price_max DECIMAL(10, 2), -- لو السعر نطاق (مثل: حشو 250-400)
  
  duration_minutes INT NOT NULL DEFAULT 30,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Migration 4: Calendar & Appointments

```sql
-- جدول استثناءات التقويم (لو يوم مختلف عن الساعات الافتراضية)
CREATE TABLE public.calendar_overrides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  
  date DATE NOT NULL,
  is_closed BOOLEAN DEFAULT FALSE,
  open_time TIME,
  close_time TIME,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, date)
);

CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  staff_id UUID REFERENCES public.staff_members(id) ON DELETE SET NULL,
  
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 30,
  
  status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, completed, cancelled, no_show
  notes TEXT,
  
  -- معلومات العميل (نسخة مأخوذة وقت الحجز)
  customer_name TEXT,
  customer_phone TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appointments_business ON public.appointments(business_id);
CREATE INDEX idx_appointments_scheduled ON public.appointments(scheduled_at);
CREATE INDEX idx_appointments_staff ON public.appointments(staff_id);
```

### Migration 5: Customers & Conversations

```sql
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  
  phone TEXT NOT NULL,
  name TEXT,
  
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ,
  total_messages INT DEFAULT 0,
  
  -- Metadata يتعلمه البوت
  preferences JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  
  UNIQUE(business_id, phone)
);

CREATE INDEX idx_customers_business_phone ON public.customers(business_id, phone);

CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  
  status TEXT NOT NULL DEFAULT 'active', -- active, escalated, closed
  
  -- نافذة 24 ساعة في واتساب
  window_expires_at TIMESTAMPTZ,
  
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  
  -- ملخص يبنيه AI تلقائياً
  summary TEXT,
  
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_conversations_business ON public.conversations(business_id);
CREATE INDEX idx_conversations_customer ON public.conversations(customer_id);
CREATE INDEX idx_conversations_status ON public.conversations(business_id, status);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  
  direction TEXT NOT NULL, -- inbound (من العميل), outbound (من البوت)
  
  content_type TEXT NOT NULL DEFAULT 'text', -- text, image, audio, video, document, interactive
  content JSONB NOT NULL, -- النص + ميتاداتا
  
  -- Twilio
  twilio_message_sid TEXT UNIQUE,
  
  -- إذا outbound من بوت
  ai_metadata JSONB, -- input tokens, output tokens, tools_used, latency
  
  -- حالة التسليم
  status TEXT DEFAULT 'sent', -- queued, sent, delivered, read, failed
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at);
CREATE INDEX idx_messages_twilio_sid ON public.messages(twilio_message_sid);
```

### Migration 6: Consents (PDPL Compliance)

```sql
CREATE TYPE consent_type AS ENUM (
  'reminders',      -- تذكيرات المواعيد
  'marketing',      -- عروض المتجر نفسه
  'arar_offers'     -- عروض عرعر (خدمة مستقلة)
);

CREATE TYPE consent_status AS ENUM ('opted_in', 'opted_out', 'pending');

CREATE TABLE public.consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  customer_phone TEXT NOT NULL,
  
  consent_type consent_type NOT NULL,
  status consent_status NOT NULL DEFAULT 'pending',
  
  -- النص الفعلي اللي شافه العميل وقت الموافقة (للحماية القانونية)
  consent_text TEXT,
  consent_method TEXT, -- whatsapp_button, whatsapp_text, web_form
  
  -- معرف الرسالة اللي تمت فيها الموافقة
  source_message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  
  opted_in_at TIMESTAMPTZ,
  opted_out_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(business_id, customer_phone, consent_type)
);

CREATE INDEX idx_consents_lookup ON public.consents(business_id, customer_phone, consent_type);
```

### Migration 7: Templates

```sql
CREATE TYPE template_category AS ENUM ('utility', 'marketing', 'authentication');
CREATE TYPE template_status AS ENUM ('draft', 'pending', 'approved', 'rejected', 'paused');

CREATE TABLE public.message_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL, -- machine name (e.g., appointment_reminder_24h)
  display_name TEXT, -- اسم العرض في الواجهة
  
  category template_category NOT NULL,
  language TEXT DEFAULT 'ar',
  
  content TEXT NOT NULL, -- النص مع {{1}}, {{2}} للمتغيرات
  variables JSONB DEFAULT '[]', -- وصف كل متغير
  
  status template_status DEFAULT 'draft',
  twilio_template_sid TEXT,
  
  rejection_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Migration 8: Row Level Security

```sql
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

-- Profiles: المستخدم يشوف ويعدل بروفايله فقط
CREATE POLICY "users_own_profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Businesses: صاحب المتجر يشوف متاجره فقط
CREATE POLICY "owner_own_businesses" ON public.businesses
  FOR ALL USING (owner_id = auth.uid());

-- باقي الجداول: تتبع ملكية المتجر
-- Generic policy for child tables
CREATE OR REPLACE FUNCTION user_owns_business(business_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = business_uuid AND owner_id = auth.uid()
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Apply to all child tables
CREATE POLICY "owner_own_menu_items" ON public.menu_items
  FOR ALL USING (user_owns_business(business_id));

CREATE POLICY "owner_own_menu_categories" ON public.menu_categories
  FOR ALL USING (user_owns_business(business_id));

CREATE POLICY "owner_own_staff" ON public.staff_members
  FOR ALL USING (user_owns_business(business_id));

CREATE POLICY "owner_own_services" ON public.services
  FOR ALL USING (user_owns_business(business_id));

CREATE POLICY "owner_own_calendar" ON public.calendar_overrides
  FOR ALL USING (user_owns_business(business_id));

CREATE POLICY "owner_own_appointments" ON public.appointments
  FOR ALL USING (user_owns_business(business_id));

CREATE POLICY "owner_own_customers" ON public.customers
  FOR ALL USING (user_owns_business(business_id));

CREATE POLICY "owner_own_conversations" ON public.conversations
  FOR ALL USING (user_owns_business(business_id));

CREATE POLICY "owner_own_messages" ON public.messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id 
      AND user_owns_business(c.business_id)
    )
  );

CREATE POLICY "owner_own_consents" ON public.consents
  FOR ALL USING (user_owns_business(business_id));

CREATE POLICY "owner_own_templates" ON public.message_templates
  FOR ALL USING (user_owns_business(business_id));

-- Service role bypass (للـ backend webhook)
-- يستخدم service_role key بدل anon key لتجاوز RLS
```

### Migration 9: Triggers & Functions

```sql
-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON public.businesses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_staff_members_updated_at BEFORE UPDATE ON public.staff_members FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.message_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## 5. هيكل المجلدات

```
musnid/
├── src/
│   ├── app/
│   │   ├── (marketing)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                    # الصفحة الرئيسية
│   │   │   ├── pricing/page.tsx            # الأسعار
│   │   │   ├── features/page.tsx           # المميزات
│   │   │   └── contact/page.tsx            # تواصل
│   │   │
│   │   ├── (auth)/
│   │   │   ├── layout.tsx
│   │   │   ├── sign-in/page.tsx
│   │   │   ├── sign-up/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── callback/route.ts           # OAuth callback
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx                  # Sidebar + Top bar
│   │   │   ├── page.tsx                    # Overview
│   │   │   │
│   │   │   ├── onboarding/                 # خطوات التسجيل الأولي
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── step-1/page.tsx         # نوع النشاط
│   │   │   │   ├── step-2/page.tsx         # المعلومات الأساسية
│   │   │   │   ├── step-3/page.tsx         # ساعات العمل
│   │   │   │   ├── step-4/page.tsx         # شخصية البوت
│   │   │   │   └── complete/page.tsx
│   │   │   │
│   │   │   ├── conversations/
│   │   │   │   ├── page.tsx                # قائمة المحادثات
│   │   │   │   └── [id]/page.tsx           # تفاصيل محادثة
│   │   │   │
│   │   │   ├── calendar/
│   │   │   │   └── page.tsx                # التقويم الذكي
│   │   │   │
│   │   │   ├── appointments/
│   │   │   │   └── page.tsx                # المواعيد
│   │   │   │
│   │   │   ├── customers/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   │
│   │   │   ├── consents/
│   │   │   │   └── page.tsx                # إدارة الموافقات
│   │   │   │
│   │   │   ├── menu/                       # خاص بالمطاعم
│   │   │   │   ├── page.tsx
│   │   │   │   └── components/
│   │   │   │       ├── MenuItemCard.tsx    # مع زر "نفذ"
│   │   │   │       └── AddItemDialog.tsx
│   │   │   │
│   │   │   ├── staff/                      # خاص بالعيادات/الصالونات
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── services/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx                # الإعدادات العامة
│   │   │   │   ├── bot/page.tsx            # شخصية البوت
│   │   │   │   ├── whatsapp/page.tsx       # ربط واتساب
│   │   │   │   ├── billing/page.tsx        # الفواتير
│   │   │   │   └── team/page.tsx
│   │   │   │
│   │   │   └── reports/
│   │   │       └── page.tsx
│   │   │
│   │   ├── api/
│   │   │   ├── webhooks/
│   │   │   │   ├── twilio/route.ts         # استقبال رسائل واتساب
│   │   │   │   └── stripe/route.ts         # webhook الدفع
│   │   │   │
│   │   │   ├── bot/
│   │   │   │   └── respond/route.ts        # نقطة الردود
│   │   │   │
│   │   │   ├── whatsapp/
│   │   │   │   ├── connect/route.ts        # ربط رقم
│   │   │   │   └── verify/route.ts         # تحقق
│   │   │   │
│   │   │   └── trpc/                       # اختياري - tRPC للـ API
│   │   │
│   │   ├── layout.tsx                      # Root layout مع RTL
│   │   ├── globals.css
│   │   └── not-found.tsx
│   │
│   ├── components/
│   │   ├── ui/                             # shadcn components
│   │   ├── marketing/
│   │   │   ├── Hero.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── Pricing.tsx
│   │   │   ├── FAQ.tsx
│   │   │   └── Footer.tsx
│   │   ├── dashboard/
│   │   │   ├── Sidebar.tsx                 # مع تنقل ديناميكي حسب نوع النشاط
│   │   │   ├── TopBar.tsx
│   │   │   ├── StatsCards.tsx
│   │   │   └── ConversationList.tsx
│   │   ├── menu/
│   │   │   ├── MenuItemCard.tsx
│   │   │   └── CategoryTabs.tsx
│   │   ├── calendar/
│   │   │   ├── WeeklyView.tsx
│   │   │   └── DayEditor.tsx
│   │   └── shared/
│   │       ├── EmptyState.tsx
│   │       ├── LoadingState.tsx
│   │       └── ErrorState.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                   # browser client
│   │   │   ├── server.ts                   # server client
│   │   │   ├── middleware.ts               # session handling
│   │   │   └── admin.ts                    # service role
│   │   ├── claude/
│   │   │   ├── client.ts
│   │   │   ├── system-prompts.ts           # build system prompt per business
│   │   │   ├── tools.ts                    # tool definitions
│   │   │   └── handlers.ts                 # tool handlers
│   │   ├── twilio/
│   │   │   ├── client.ts
│   │   │   ├── sender.ts                   # إدارة WhatsApp senders
│   │   │   ├── messages.ts                 # إرسال/استقبال
│   │   │   └── templates.ts
│   │   ├── utils/
│   │   │   ├── cn.ts
│   │   │   ├── format-date.ts              # arabic date formatting
│   │   │   └── format-phone.ts
│   │   └── constants.ts
│   │
│   ├── hooks/
│   │   ├── use-business.ts
│   │   ├── use-conversations.ts
│   │   └── use-realtime.ts
│   │
│   ├── types/
│   │   ├── database.ts                     # generated from Supabase
│   │   └── index.ts
│   │
│   └── middleware.ts                       # Next.js middleware
│
├── public/
│   ├── logo.svg
│   ├── fonts/
│   └── images/
│
├── .env.local.example
├── .env.local
├── components.json                          # shadcn config
├── tailwind.config.ts
├── next.config.js
├── package.json
├── tsconfig.json
└── README.md
```

---

## 6. تصميم الـ UI/UX

### نظام الألوان

```css
/* tailwind.config.ts */
colors: {
  primary: {
    50:  '#f0f7ff',
    100: '#e0eefe',
    500: '#2a6db5',
    600: '#0a4d8c',  // اللون الأساسي
    700: '#073d70',
    900: '#042a4d',
  },
  success: '#2e7d32',
  warning: '#f9a825',
  danger:  '#c62828',
  // ...
}
```

### الخطوط

```css
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap');

body {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  direction: rtl;
}
```

### مبادئ التصميم
- **Linear-inspired**: نظيف، Whitespace كافي، تباين عالي
- **RTL طبيعي**: الأيقونات والأسهم تتكيف
- **Dark Mode**: مدعوم من البداية
- **Mobile-first**: كل صفحة تشتغل على الجوال
- **Loading states**: Skeleton في كل صفحة
- **Empty states**: تصميم مدروس لما البيانات فارغة
- **Optimistic UI**: تحديث فوري للواجهة قبل تأكيد السيرفر

---

## 7. المراحل التنفيذية (نفذها بالترتيب)

### المرحلة 1: تأسيس المشروع (3-4 ساعات)
1. `npx create-next-app@latest musnid` مع TypeScript + Tailwind + App Router + src/
2. تثبيت كل المكتبات المذكورة في حزمة التقنيات
3. إعداد shadcn/ui: `npx shadcn-ui@latest init`
4. تثبيت components: button, input, label, card, dialog, dropdown-menu, form, select, switch, table, tabs, toast
5. إعداد Tailwind للـ RTL والخطوط العربية
6. إنشاء `lib/supabase/client.ts` و `server.ts`
7. إنشاء `.env.local.example`
8. إعداد middleware للحماية والـ Auth

### المرحلة 2: قاعدة البيانات (1 ساعة)
1. إنشاء مشروع Supabase
2. تشغيل كل الـ migrations أعلاه بالترتيب
3. توليد TypeScript types: `npx supabase gen types typescript --project-id YOUR_ID > src/types/database.ts`
4. اختبار الـ RLS بحساب تجريبي

### المرحلة 3: Landing Page والـ Auth (4-6 ساعات)
1. Landing Page احترافية مع Hero, Features, Pricing, FAQ
2. صفحات Auth (sign-in, sign-up, forgot-password)
3. ربط Supabase Auth
4. OAuth بـ Google
5. Middleware لحماية الـ dashboard routes

### المرحلة 4: Onboarding Flow (3-4 ساعات)
1. 4 خطوات لإعداد النشاط
2. حفظ تدريجي في `businesses` table
3. واجهة جذابة مع progress indicator

### المرحلة 5: لوحة التحكم الأساسية (6-8 ساعات)
1. Sidebar ديناميكي حسب نوع النشاط
2. صفحة Overview مع إحصائيات
3. صفحة Conversations مع Realtime
4. صفحة Settings العامة
5. صفحة Calendar مع التقويم الذكي

### المرحلة 6: اللوحات الخاصة (8-10 ساعات)
1. **للمطاعم**: لوحة Menu مع زر "نفذ" instant
2. **للعيادات/الصالونات**: لوحة Staff و Services
3. **للمتاجر**: لوحة Products
4. **للعقارات**: لوحة Listings
5. **للخدمات**: لوحة Services

### المرحلة 7: ربط Twilio والبوت (6-8 ساعات)
1. صفحة ربط WhatsApp في Settings
2. Webhook endpoint لاستقبال رسائل Twilio
3. Bot Engine يستدعي Claude مع System Prompt الديناميكي
4. Tools لـ Claude (book_appointment, check_availability, check_menu_item, إلخ)
5. إرسال الرد عبر Twilio
6. حفظ كل شي في `conversations` و `messages`

### المرحلة 8: إدارة الموافقات (3-4 ساعات)
1. صفحة Consents في Dashboard
2. منطق جمع الموافقات في المحادثة
3. Templates approved للرسائل التسويقية
4. منطق Opt-out

### المرحلة 9: الفوترة والاشتراكات (4-6 ساعات)
1. تكامل Moyasar أو Tap Payments
2. حدود الاستخدام حسب الباقة
3. ترقية تلقائية عند تجاوز الحد
4. فواتير ZATCA-compliant

### المرحلة 10: التحسينات النهائية (4-6 ساعات)
1. اختبار شامل
2. Error tracking (Sentry)
3. Analytics (Plausible أو Vercel Analytics)
4. SEO optimization
5. Performance optimization
6. النشر على Vercel

**المجموع المتوقع**: 40-60 ساعة عمل (يقدر ينقسم على 4-6 أسابيع لمطور واحد)

---

## 8. الـ Bot Engine — تفاصيل تقنية حرجة

### بناء System Prompt الديناميكي

```typescript
// src/lib/claude/system-prompts.ts

export function buildSystemPrompt(business: Business): string {
  const basePrompt = `أنت موظف استقبال ذكي في "${business.name}".

## معلومات المنشأة:
- النوع: ${getTypeArabic(business.type)}
- الموقع: ${business.address || business.city}
- ساعات العمل: ${formatWorkingHours(business.working_hours)}

## شخصيتك:
${getPersonalityInstructions(business.bot_settings.personality)}

## اللهجة:
${getDialectInstructions(business.bot_settings.dialect)}

## التعليمات العامة:
- ترد بإيجاز وذكاء
- لا تخترع معلومات غير موجودة
- إذا ما تعرف الجواب، صعّد لصاحب المتجر
- استخدم الأدوات (tools) لما تحتاج معلومات لحظية
- احترم وقت العميل، لا تستخدم رسائل طويلة بدون داعي
`;

  let typeSpecific = '';
  
  switch(business.type) {
    case 'restaurant':
    case 'cafe':
      typeSpecific = await buildRestaurantContext(business.id);
      break;
    case 'clinic':
      typeSpecific = await buildClinicContext(business.id);
      break;
    case 'salon':
      typeSpecific = await buildSalonContext(business.id);
      break;
    // ...
  }
  
  return basePrompt + '\n' + typeSpecific;
}

async function buildRestaurantContext(businessId: string): string {
  const menu = await getMenuItems(businessId);
  const offers = await getActiveOffers(businessId);
  
  return `
## المنيو الحالي:
${menu.map(item => `
- ${item.name}: ${item.price} ر.س ${item.is_available ? '✅ متوفر' : '❌ نفذ'}
  ${item.description || ''}
`).join('\n')}

## العروض الفعّالة:
${offers.length ? offers.map(o => `- ${o.title}: ${o.description}`).join('\n') : 'لا يوجد عروض حالياً'}

## التعليمات الخاصة:
- إذا العميل طلب صنف نفذ، اعتذر واقترح بديل مناسب
- إذا سأل عن السعر، أعطه السعر الفعلي من المنيو
- لتأكيد الطلبات أو الحجوزات، استخدم Tool المناسب
`;
}
```

### تعريف Tools

```typescript
// src/lib/claude/tools.ts

export const RESTAURANT_TOOLS = [
  {
    name: 'check_menu_item_availability',
    description: 'يتحقق من توفر صنف في المنيو',
    input_schema: {
      type: 'object',
      properties: {
        item_name: { type: 'string', description: 'اسم الصنف' }
      },
      required: ['item_name']
    }
  },
  {
    name: 'create_order',
    description: 'يسجل طلب جديد',
    input_schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              quantity: { type: 'number' },
              notes: { type: 'string' }
            }
          }
        },
        delivery_address: { type: 'string' },
        customer_name: { type: 'string' }
      },
      required: ['items', 'customer_name']
    }
  }
];

export const CLINIC_TOOLS = [
  {
    name: 'check_doctor_availability',
    description: 'يجيب المواعيد المتاحة لطبيب معين',
    input_schema: {
      type: 'object',
      properties: {
        doctor_name: { type: 'string' },
        date_range: { 
          type: 'string', 
          description: 'مثل: "اليوم", "بكرة", "هذا الأسبوع"' 
        }
      },
      required: ['doctor_name']
    }
  },
  {
    name: 'book_appointment',
    description: 'يحجز موعد جديد',
    input_schema: {
      type: 'object',
      properties: {
        doctor_name: { type: 'string' },
        datetime: { type: 'string', description: 'ISO datetime' },
        customer_name: { type: 'string' },
        customer_phone: { type: 'string' },
        service: { type: 'string' }
      },
      required: ['doctor_name', 'datetime', 'customer_name', 'customer_phone']
    }
  }
];
```

### معالج الـ Webhook

```typescript
// src/app/api/webhooks/twilio/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateBotResponse } from '@/lib/claude/handlers';
import { sendWhatsAppMessage } from '@/lib/twilio/messages';

export async function POST(req: NextRequest) {
  try {
    const body = await req.formData();
    const from = body.get('From') as string; // whatsapp:+966...
    const to = body.get('To') as string;
    const messageBody = body.get('Body') as string;
    const messageSid = body.get('MessageSid') as string;
    
    const supabase = createAdminClient();
    
    // 1. حدد المتجر من الرقم
    const phoneNumber = to.replace('whatsapp:', '');
    const { data: business } = await supabase
      .from('businesses')
      .select('*')
      .eq('whatsapp_number', phoneNumber)
      .single();
    
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }
    
    // 2. تحقق من حدود الاشتراك
    if (await isOverLimit(business)) {
      return NextResponse.json({ error: 'Limit exceeded' }, { status: 429 });
    }
    
    // 3. أنشئ/جيب العميل
    const customerPhone = from.replace('whatsapp:', '');
    const customer = await getOrCreateCustomer(business.id, customerPhone);
    
    // 4. أنشئ/جيب المحادثة (نافذة 24 ساعة)
    const conversation = await getOrCreateConversation(business.id, customer.id);
    
    // 5. احفظ الرسالة الواردة
    const inboundMessage = await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        direction: 'inbound',
        content_type: 'text',
        content: { text: messageBody },
        twilio_message_sid: messageSid
      })
      .select()
      .single();
    
    // 6. ولّد الرد عن طريق Claude
    const response = await generateBotResponse({
      business,
      conversation,
      customer,
      incomingMessage: messageBody
    });
    
    // 7. أرسل الرد عبر Twilio
    const sentMessage = await sendWhatsAppMessage({
      from: to,
      to: from,
      body: response.text
    });
    
    // 8. احفظ الرسالة الصادرة
    await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        direction: 'outbound',
        content_type: 'text',
        content: { text: response.text },
        twilio_message_sid: sentMessage.sid,
        ai_metadata: {
          input_tokens: response.usage.input_tokens,
          output_tokens: response.usage.output_tokens,
          tools_used: response.tools_used,
          latency_ms: response.latency_ms
        }
      });
    
    // 9. حدّث counter الاستخدام
    await incrementUsage(business.id);
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    // لا ترجع خطأ لـ Twilio لمنع إعادة المحاولة المتكررة
    return NextResponse.json({ received: true });
  }
}
```

---

## 9. متطلبات الأمان والأداء

### الأمان
- ✅ Row Level Security على كل الجداول
- ✅ Service Role Key يُستخدم فقط في API routes
- ✅ تحقق من Twilio signature في webhook
- ✅ Rate limiting على كل endpoints عامة
- ✅ تشفير API keys في environment variables
- ✅ HTTPS إجباري (Vercel يوفره)
- ✅ Content Security Policy
- ✅ Input validation بـ Zod في كل endpoint

### الأداء
- ✅ Server Components للصفحات الثابتة
- ✅ Client Components للتفاعل فقط
- ✅ Suspense boundaries مع loading states
- ✅ Image optimization عبر next/image
- ✅ Edge Runtime للـ webhooks
- ✅ Streaming responses لما يناسب
- ✅ Database indexes على الحقول المهمة
- ✅ TanStack Query للـ caching الذكي

### الجودة
- ✅ TypeScript strict mode
- ✅ ESLint + Prettier
- ✅ Error boundaries في كل صفحة
- ✅ Sentry للتقاط الأخطاء (production)
- ✅ Loading states في كل صفحة
- ✅ Empty states مدروسة
- ✅ Toast notifications للأفعال

---

## 10. متغيرات البيئة (.env.local.example)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx

# Anthropic
ANTHROPIC_API_KEY=sk-ant-xxx

# Twilio
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_WHATSAPP_NUMBER=+14155238886  # Sandbox أو رقم production

# Payment
MOYASAR_PUBLIC_KEY=pk_xxx
MOYASAR_SECRET_KEY=sk_xxx

# Email
RESEND_API_KEY=re_xxx

# App
NEXT_PUBLIC_APP_URL=https://musnid.sa
NODE_ENV=development
```

---

## 11. ما يجب تسليمه في النهاية

عند انتهاء التنفيذ، قدّم:

1. **مشروع كامل شغّال** على Vercel + Supabase
2. **README.md** شامل يحتوي:
   - شرح المشروع
   - متطلبات التشغيل
   - خطوات الإعداد
   - شرح الـ environment variables
   - أوامر التطوير والنشر
3. **SETUP.md** يشرح:
   - كيف تسجل في Supabase وتربط
   - كيف تسجل في Twilio وتربط Sandbox
   - كيف تسجل في Anthropic وتأخذ API key
   - كيف تنشر على Vercel
4. **TESTING.md** يوضح كيف تختبر البوت محلياً
5. **حساب تجريبي** للدخول للمشروع المنشور
6. **متجر تجريبي** بكامل البيانات (لتجربة الأنواع)

---

## 12. قواعد ذهبية أثناء التنفيذ

1. **لا تستخدم `any`** في TypeScript — استخدم types صحيحة دائماً
2. **اكتب JSDoc** لأي function في `lib/`
3. **اختبر كل ميزة** بعد بنائها مباشرة
4. **commit متكرر** بـ messages واضحة
5. **اتبع Conventional Commits** (feat:, fix:, chore:)
6. **استخدم Server Components كافتراضي** — Client فقط لما يلزم
7. **لا تكرر الكود** — استخرج الـ logic المتكررة إلى hooks أو utils
8. **اختصر** — كل function أقل من 50 سطر إن أمكن
9. **علّق على الكود الذكي**، لكن لا تشرح الكود الواضح
10. **اتبع التصميم الموجود** — لا تخترع أنماط جديدة

---

## 13. ما لا تفعله

- ❌ لا تطلب موافقات قبل البدء
- ❌ لا تستخدم MongoDB أو أي DB غير PostgreSQL
- ❌ لا تستخدم Redux أو MobX (استخدم Zustand فقط لو احتجت)
- ❌ لا تستخدم Material UI أو Chakra (شغّل shadcn فقط)
- ❌ لا تكتب CSS منفصل (Tailwind فقط)
- ❌ لا تستخدم Pages Router (App Router إجباري)
- ❌ لا تستخدم JavaScript (TypeScript إجباري)
- ❌ لا تتجاوز RLS بكتابة منطق "كاشف بنفسك"

---

## ابدأ الآن

نفذ المرحلة 1 فقط في البداية، ثم انتظر تأكيدي للانتقال للمرحلة 2. أرجع لي تقرير عن:
- ما أنجزته في المرحلة 1
- أي اختيارات تقنية قمت بها
- الخطوات التالية المقترحة
- أي ملاحظات أو تحذيرات

ابدأ.
