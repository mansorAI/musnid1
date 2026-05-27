# CHANGELOG

## 2026-05-27

### Added

- Added production Supabase setup for the `musnid1` project.
- Applied the initial Supabase schema migration to the live database.
- Added GitHub repository deployment flow through `mansorAI/musnid1`.
- Added Vercel deployment with Next.js framework settings.
- Added production environment variable setup notes.
- Added email sign-up flow to the sign-in page.

### Changed

- Updated project documentation to reflect the live Supabase and Vercel deployment.
- Clarified that GitHub Pages is not used; Vercel is the deployment target.

### Security

- Documented the need to rotate the Supabase `service_role` key after setup.

## 2026-05-25

### Added

- Created the Next.js project in `musnid` with TypeScript, Tailwind, and App Router.
- Added Supabase, React Hook Form, Zod, TanStack Query, Zustand, date-fns, and shadcn/ui dependencies.
- Added shadcn/ui components: button, input, label, card, dialog, dropdown-menu, form, select, switch, table, tabs, and sonner.
- Added `src/components/ui/form.tsx` manually with React Hook Form integration.
- Added RTL setup, Arabic font styling, and Musnid metadata.
- Added app providers in `src/components/providers.tsx`.
- Added Supabase clients in `src/lib/supabase`.
- Added Supabase session protection logic through `src/lib/supabase/middleware.ts` and `src/proxy.ts`.
- Added `.env.local.example`.
- Added progress and changelog tracking files.
- Added landing, sign-in, dashboard, customers, knowledge, automations, and settings pages.
- Added initial Supabase migration and database TypeScript types.

### Changed

- Used `sonner` instead of the older shadcn toast component.
- Loaded IBM Plex Sans Arabic through CSS to avoid build failures when Google Fonts is unavailable.
- Used the Next 16 `proxy.ts` convention instead of the older middleware route guard pattern.

### Verified

- ESLint passed locally.
- Next.js production build passed locally.
