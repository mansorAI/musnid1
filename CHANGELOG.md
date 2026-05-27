# CHANGELOG

## 2026-05-25

### Added
- إنشاء مشروع Next.js في `musnid` بإعدادات TypeScript وTailwind وApp Router.
- إضافة مكتبات Supabase وReact Hook Form وZod وTanStack Query وZustand وdate-fns وshadcn/ui.
- إضافة مكونات shadcn/ui: button, input, label, card, dialog, dropdown-menu, form, select, switch, table, tabs, sonner.
- إضافة `src/components/ui/form.tsx` يدويًا بتكامل React Hook Form.
- إضافة إعداد RTL وخط عربي وتحديث metadata لمشروع مُسنِد.
- إضافة مزودات التطبيق في `src/components/providers.tsx`.
- إضافة عملاء Supabase في `src/lib/supabase`.
- إضافة منطق حماية جلسة Supabase في `src/lib/supabase/middleware.ts` وربطه عبر `src/proxy.ts` المتوافق مع Next 16.
- إضافة ملف `.env.local.example`.
- إضافة ملفات التتبع `PROGRESS.md` و`CHANGELOG.md`.
- توثيق اكتمال فحص ESLint وبناء Next.js للمرحلة 1.
- تشغيل خادم التطوير والتحقق من استجابة الصفحة محليًا.

### Changed
- استبدال مكوّن `toast` المطلوب في الخطة بـ `sonner` بسبب إهمال `toast` في shadcn الحالي.
- تحميل خط IBM Plex Sans Arabic عبر CSS مع fallback لتجنب فشل البناء عند انقطاع Google Fonts.
- نقل Next route guard من convention القديم `middleware.ts` إلى `proxy.ts`.
