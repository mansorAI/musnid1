# مُسنِد

مُسنِد منصة SaaS عربية لإدارة محادثات WhatsApp للأعمال الصغيرة والمتوسطة: ردود ذكية، قاعدة معرفة، متابعة حجوزات وطلبات، ولوحة تشغيلية لأداء خدمة العملاء.

## المنجز الحالي

- مشروع Next.js 16 مع App Router وTypeScript وTailwind وshadcn/ui.
- دعم RTL واللغة العربية وخط IBM Plex Sans Arabic.
- عملاء Supabase للمتصفح والسيرفر والـ service role.
- Proxy لحماية `/dashboard` عند توفر إعدادات Supabase، مع وضع عرض محلي عند غيابها.
- صفحة رئيسية عربية بدل قالب Next الافتراضي.
- صفحة تسجيل دخول مرتبطة بـ Supabase Auth.
- لوحة تحكم أولية ببيانات تجريبية للمحادثات، المؤشرات، والأتمتة.
- صفحات إدارة داخلية: العملاء، قاعدة المعرفة، الأتمتة، وإعداد النشاط.
- Server actions لإنشاء النشاط، مقالات المعرفة، وقواعد الأتمتة عند توفر Supabase.
- Migration أولي لقاعدة البيانات مع RLS للجداول الأساسية.

## التشغيل المحلي

```bash
npm install
npm run dev
```

ثم افتح:

```text
http://localhost:3000
```

مسارات جاهزة للتجربة:

- `/`
- `/sign-in`
- `/dashboard`
- `/dashboard/customers`
- `/dashboard/knowledge`
- `/dashboard/automations`
- `/dashboard/settings`

## متغيرات البيئة

انسخ `.env.local.example` إلى `.env.local` واملأ القيم الحقيقية:

```bash
cp .env.local.example .env.local
```

أهم القيم المطلوبة للتكامل الحقيقي:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_NUMBER`

## قاعدة البيانات

يوجد migration أولي في:

```text
supabase/migrations/202605250001_initial_schema.sql
```

يشمل الجداول:

- `organizations`
- `customers`
- `conversations`
- `messages`
- `knowledge_articles`
- `automations`

بعد إنشاء مشروع Supabase فعلي، شغّل migration ثم ولّد types الرسمية واستبدل `src/types/database.ts` إذا لزم.

## أوامر مفيدة

```bash
npm run lint
npm run build
```
