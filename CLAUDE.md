@AGENTS.md

# Possible — سياق مشروع الويب

> للسياق الكامل وقواعد الأعمال، اقرأ `C:\pro\Possible\CLAUDE.md` أولاً.

## المشروعان — يجب التعديل على كليهما دائماً

| المشروع | المسار | التقنية |
|---------|--------|---------|
| **الويب (هذا المجلد)** | `C:\pro\Possible\web-app\` | Next.js 16 + Server Components |
| الموبايل | `C:\pro\Possible\mobile-app\` | Expo SDK 56 + expo-router |

- Supabase واحد لكلا المشروعين — Migration يُطبَّق مرة واحدة فقط.
- أي جدول أو نوع جديد يُضاف في `src/types/database.ts` للويب و`types/database.ts` للموبايل.

**أي إضافة أو تحديث يخص الأعمال يُطبَّق على المشروعين تلقائياً.**
- الاستثناء الوحيد: إصلاح bug صغير خاص بمنصة واحدة فقط.

## صلاحيات الدخول — قاعدة صارمة

- **هذا الموقع للأعمال فقط.** يُمنع منعاً باتاً السماح للأفراد بالدخول.
- إذا حاول حساب فردي (role = "customer") الوصول، يُعاد توجيهه إلى `/individual-app`.
- المنع مُطبَّق في طبقتين:
  1. `src/proxy.ts` (middleware — يعترض جميع المسارات المحمية)
  2. `src/app/sign-in/actions.ts` (بعد تسجيل الدخول المباشر)

## بنية هذا المشروع (الويب)

```
web-app/src/
├── app/
│   ├── sign-in/         ← تسجيل الدخول
│   ├── onboarding/      ← إعداد المنشأة الجديدة
│   ├── dashboard/       ← لوحة تحكم الأعمال
│   │   ├── [قسم]/page.tsx
│   │   └── [قسم]/actions.ts
│   ├── admin/           ← لوحة تحكم الأدمن
│   └── individual-app/  ← صفحة إعادة توجيه الأفراد
├── components/
│   └── dashboard/       ← مكونات تفاعلية
├── lib/
│   ├── supabase/        ← client, server, middleware
│   ├── dashboard-data.ts
│   └── admin-data.ts
└── types/
    └── database.ts
```

## المعمارية

- Next.js 16 (Turbopack) + Supabase + Twilio + Claude Sonnet
- النشر: Vercel
- اللغة: TypeScript في كل مكان

## ملاحظة تقنية مهمة — Middleware

Next.js 16 يستخدم `src/proxy.ts` بدل `middleware.ts`.
- **لا تنشئ `src/middleware.ts`** — سيتعارض مع `src/proxy.ts` ويوقف السيرفر.
- الحماية تتم في `src/proxy.ts` فقط.

## قواعد الكود

- لا تخلط نوع بيانات المواعيد (appointments) بنوع بيانات المهام (tasks).
- نفّذ مرحلة واحدة في كل جلسة ولا تتجاوزها.

## تحديث PROGRESS.md — قاعدة إلزامية

بعد إتمام أي تحديث، حدّث ملف PROGRESS.md في **الجذر وكلا المشروعين**:
- الجذر: `C:\pro\Possible\PROGRESS.md` (ملخص)
- الويب: `C:\pro\Possible\web-app\PROGRESS.md` (تفصيل)
- الموبايل: `C:\pro\Possible\mobile-app\PROGRESS.md` (تفصيل)

## المهارات

@.claude/skills/frontend.md

**عند أي مهمة تصميم UI أو بناء مكوّنات — قبل كتابة أي كود — اقرأ هذا الملف:**
- `.claude/skills/ui-ux.md`

## تعليمات التصميم

لا تغيّر الهوية البصرية الحالية للموقع (الألوان، الخطوط، نمط البطاقات).
أي مكوّن جديد يجب أن يتوافق مع ما هو موجود في الموقع.
