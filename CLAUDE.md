@AGENTS.md

# مُسنِد — سياق مشروع الويب

## قاعدة البيانات مشتركة مع الموبايل

| المشروع | المسار | التقنية |
|---------|--------|---------|
| **الويب (هذا المجلد)** | `C:\pro\musnid1\musnid\` | Next.js 16 + Server Components |
| الموبايل | `C:\pro\musnid1\musnid-mobile\` | Expo SDK 56 + expo-router |

- Supabase واحد لكلا المشروعين — Migration يُطبَّق مرة واحدة فقط.
- أي جدول أو نوع جديد يُضاف في `src/types/database.ts` للويب و`types/database.ts` للموبايل.

**أي إضافة أو تحديث يُطبَّق على المشروعين تلقائياً بدون الحاجة لطلب صريح.**
- كيّف كل تغيير لبنية كل مشروع (Server Actions للويب، React Query للموبايل).
- الاستثناء الوحيد: إصلاح bug صغير خاص بمنصة واحدة فقط.

## بنية هذا المشروع (الويب)

- الصفحات: `src/app/dashboard/[قسم]/page.tsx`
- الإجراءات: `src/app/dashboard/[قسم]/actions.ts`
- لوحة الأدمن: `src/app/admin/`
- المكونات التفاعلية: `src/components/dashboard/`
- الأنواع: `src/types/database.ts`
- البيانات: `src/lib/dashboard-data.ts`
- بيانات الأدمن: `src/lib/admin-data.ts`
- الحماية: `src/proxy.ts` + `src/lib/supabase/middleware.ts`

## المعمارية

- Next.js 16 (Turbopack) + Supabase + Twilio + Claude Sonnet
- تطبيق جوال: Expo SDK 56
- قاعدة البيانات: Supabase / PostgreSQL
- النشر: Vercel → musnid.com
- اللغة: TypeScript في كل مكان

## ملاحظة تقنية مهمة — Middleware

Next.js 16 يستخدم `proxy.ts` بدل `middleware.ts`.
- **لا تنشئ `src/middleware.ts`** — سيتعارض مع `src/proxy.ts` ويوقف السيرفر.
- الحماية تتم في `src/proxy.ts` فقط.

## قواعد الكود

- كل دالة موثّقة بتعليق واضح
- لا تبسّط منطق SurfaceScore إلى تذكير زمني عادي تحت أي ظرف
- لا تخلط نوع بيانات المواعيد (appointments) بنوع بيانات المهام (tasks)
- نفّذ مرحلة واحدة في كل جلسة فقط ولا تتجاوزها

## الملفات المرجعية

- PROGRESS.md — حالة المشروع الحالية

## تحديث PROGRESS.md — قاعدة إلزامية

بعد إتمام أي تحديث أو إضافة، حدّث ملف PROGRESS.md في **كلا المشروعين** تلقائياً:
- الويب: `C:\pro\musnid1\musnid\PROGRESS.md`
- الموبايل: `C:\pro\musnid1\musnid-mobile\PROGRESS.md`

يحتوي التحديث على: ما تم، الملفات المعدّلة، القرارات التقنية، التاريخ.

## المهارات

@.claude/skills/frontend.md

**عند أي مهمة تصميم UI أو بناء مكوّنات — قبل كتابة أي كود — اقرأ هذا الملف:**
- `.claude/skills/ui-ux.md`

مهام التصميم تشمل: صفحة جديدة، مكوّن جديد، تعديل تخطيط، تحسين واجهة، إضافة ألوان أو خطوط.
مهام البرمجة البحتة (Server Action، إصلاح bug، migration) لا تحتاج قراءة ui-ux.md.

## تعليمات التصميم

طبّق إرشادات المهارتين للجودة والسلوك فقط.
لا تغيّر الهوية البصرية الحالية للموقع (الألوان، الخطوط، نمط البطاقات).
أي مكوّن جديد يجب أن يتوافق مع ما هو موجود في الموقع.
ه