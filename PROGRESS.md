# PROGRESS

## 2026-05-25

### المنجز

- اكتملت المرحلة 1: تأسيس مشروع مُسنِد.
- أُنشئ مشروع Next.js باسم `musnid` مع TypeScript وTailwind وApp Router و`src/`.
- ثُبتت مكتبات المرحلة الأولى: Supabase، React Hook Form، Zod، TanStack Query، Zustand، date-fns، shadcn/ui، وملحقات الواجهة.
- هُيئت shadcn/ui مع دعم RTL وأضيفت المكونات الأساسية المطلوبة، مع استخدام `sonner`.
- أضيف مكون `form` يدويًا بنفس نمط shadcn.
- ضُبط التخطيط العام للغة العربية واتجاه RTL وخط IBM Plex Sans Arabic.
- عُدل تحميل الخط ليكون عبر CSS مع fallback بدلًا من `next/font/google`.
- أضيف مزودا Theme وTanStack Query وToaster.
- أضيف عملاء Supabase للمتصفح، السيرفر، والـ service role.
- أضيف Proxy متوافق مع Next 16 لتحديث جلسة Supabase وحماية `/dashboard`.
- أضيفت `.env.local.example` بمتغيرات البيئة المطلوبة.
- استبدلت صفحة Next الافتراضية بصفحة رئيسية عربية لمُسنِد.
- أضيفت صفحة `/sign-in` مع server action لتسجيل الدخول عبر Supabase Auth.
- أضيفت صفحة `/dashboard` كبداية للوحة التشغيلية ببيانات تجريبية.
- أضيف layout داخلي للوحة التحكم مع تنقل بين الأقسام.
- أضيفت صفحات `/dashboard/customers` و`/dashboard/knowledge` و`/dashboard/automations` و`/dashboard/settings`.
- أضيفت server actions لإنشاء النشاط، مقالات المعرفة، وقواعد الأتمتة عند توفر Supabase Auth.
- أضيفت طبقة `dashboard-data` لاستخدام Supabase عند توفره والرجوع لبيانات تجريبية محليًا.
- أضيف migration أولي في `supabase/migrations/202605250001_initial_schema.sql` يشمل الجداول الأساسية وRLS.
- حُدثت `src/types/database.ts` لتعكس المخطط الأولي.
- حُدث README لشرح التشغيل، البيئة، وقاعدة البيانات.
- شُغل `npm.cmd run lint` بنجاح.
- شُغل `npm.cmd run build` بنجاح.
- شُغل خادم التطوير على `http://127.0.0.1:3000` وتم التحقق من `/` و`/sign-in` و`/dashboard` برمز HTTP 200.
- أُعيد تشغيل `npm.cmd run lint` و`npm.cmd run build` بعد إضافة صفحات الإدارة ونجحا.

### المرحلة الحالية

- المرحلة 2 بدأت محليًا: نموذج قاعدة البيانات والواجهات الأساسية جاهزة.

### المتبقي

- إنشاء مشروع Supabase فعلي وتشغيل migration.
- توليد types الرسمية من Supabase بعد تطبيق المخطط.
- ربط لوحة التحكم بقراءات Supabase بدل البيانات التجريبية.
- اختبار تدفق إنشاء منظمة النشاط الأولى على مشروع Supabase فعلي.
- ربط مزود WhatsApp وطبقة الذكاء الاصطناعي ومزود الدفع.
