# PROGRESS

## 2026-05-28

### Completed

#### Auth Fixes
- Fixed Supabase Auth signup error (`fetch failed`) caused by `NEXT_PUBLIC_SUPABASE_URL` having trailing whitespace/newline in Vercel.
- Corrected all Vercel environment variables to remove whitespace (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_APP_URL`, etc.).
- Configured Supabase Auth URL Configuration:
  - Site URL → `https://musnid1.vercel.app`
  - Redirect URLs → `https://musnid1.vercel.app/**`
- Improved Supabase Auth error detection in `src/app/sign-in/actions.ts`:
  - Added Supabase-specific error codes (`user_already_exists`, `signup_disabled`, `email_provider_disabled`, `over_email_send_rate_limit`).
  - Added detection for redirect URL rejection errors (`redirect_url` error key).
- Improved error messages in `src/app/sign-in/page.tsx` to include actionable guidance per error type.
- Changed post-signup flow: admin creates user then redirects to `/sign-in?message=account_created` instead of auto-login, giving the user clear confirmation.
- Removed erroneously created `src/middleware.ts` (Next.js 16 uses `src/proxy.ts` for session middleware — `middleware.ts` conflicted with it).

#### New Design System (from bolt.new)
- Added Tajawal font as primary Arabic font (alongside IBM Plex Sans Arabic) in `globals.css`.
- Added full color scale system: `primary-*` (blue 50–950), `accent-*` (green 50–950), `surface-*` (gray 50–950).
- Added animation utilities: `animate-fade-in`, `animate-fade-in-up`, `animate-float`, `delay-100` through `delay-600`.
- Added component utilities: `.glass`, `.glass-card`, `.gradient-text`, `.gradient-bg`, `.gradient-bg-subtle`, `.btn-primary`, `.btn-secondary`, `.section-padding`, `.container-max`, `.section-title`, `.section-subtitle`.
- Created `src/hooks/useInView.ts` — IntersectionObserver hook for scroll-triggered animations.
- Created 10 landing page components in `src/components/landing/`:
  - `Navbar.tsx` — fixed nav with dark mode toggle (uses `next-themes`), mobile menu.
  - `Hero.tsx` — hero section with animated dashboard mockup.
  - `Features.tsx` — 8 feature cards with scroll animations.
  - `HowItWorks.tsx` — 4-step process with connecting line.
  - `Benefits.tsx` — stats grid + benefit cards.
  - `Testimonials.tsx` — 3 testimonial cards.
  - `FAQ.tsx` — accordion FAQ component.
  - `Pricing.tsx` — 3 pricing cards with highlighted middle tier.
  - `Contact.tsx` — contact form + info cards.
  - `Footer.tsx` — full footer with links and CTA.
- Replaced `src/app/page.tsx` with new full landing page using all 10 components.
- Redesigned `src/app/sign-in/page.tsx`: gradient background, glass card form, stats, two-column layout on desktop.
- Redesigned `src/app/dashboard/layout.tsx`: dark `surface-900` header with gradient logo, updated nav links.
- Redesigned all dashboard pages with `glass-card` style and `surface-*` colors:
  - `dashboard/page.tsx` — stats cards, conversations, bot status, automations.
  - `dashboard/customers/page.tsx` — custom table with tag badges.
  - `dashboard/knowledge/page.tsx` — articles list + add form.
  - `dashboard/automations/page.tsx` — rules list + add form.
  - `dashboard/settings/page.tsx` — org display + create form.

#### Database Schema (Full Rebuild)
- Created `supabase/migrations/20260528001_musnid_schema.sql` — complete schema replacing old incorrect tables.
- Migration drops old tables in safe order: `automations → knowledge_articles → messages → conversations → customers → organizations`, plus old enum types and functions.
- Migration creates the correct مُسنِد schema (Migrations 1–9 from build prompt):
  - **Migration 1**: `profiles` (linked to `auth.users`), `businesses` (multi-tenant core with slug, WhatsApp, subscription, bot settings).
  - **Migration 2**: `menu_categories`, `menu_items` (restaurant/café menus with availability toggle).
  - **Migration 3**: `staff_members`, `services` (clinic/salon staff and service catalog).
  - **Migration 4**: `calendar_overrides`, `appointments` (smart calendar + appointment booking).
  - **Migration 5**: `customers`, `conversations`, `messages` (WhatsApp conversation engine with 24h window tracking).
  - **Migration 6**: `consents` (PDPL-compliant opt-in/opt-out per consent type).
  - **Migration 7**: `message_templates` (Twilio-approved template management).
  - **Migration 8**: Full RLS on all 13 tables via `user_owns_business()` helper function.
  - **Migration 9**: `update_updated_at` trigger on all mutable tables + `handle_new_user` trigger to auto-create `profiles` on signup.
- Fixed FK ordering issue from build prompt: `customers` created before `appointments` (which references it).
- Updated `src/types/database.ts` to reflect new schema — all 13 tables with full `Row`, `Insert`, `Update`, `Relationships` types + 7 enums.

### Verification

- Account creation flow confirmed working on `https://musnid1.vercel.app/sign-in`.
- Success message "تم إنشاء حسابك بنجاح!" displayed after signup.
- New design deployed to Vercel across all pages (landing, sign-in, dashboard).
- Migration file ready — pending manual execution in Supabase SQL Editor.

### Remaining

- Execute `20260528001_musnid_schema.sql` in Supabase SQL Editor.
- Regenerate `src/types/database.ts` from live Supabase schema after migration:
  ```bash
  npx supabase gen types typescript --project-id zkhkfxtuycixymesrkzt > src/types/database.ts
  ```
- Update `src/lib/dashboard-data.ts` and `src/app/dashboard/` to query `businesses` instead of `organizations`.
- Update `src/app/sign-in/actions.ts` signup flow to create a `businesses` record (new schema) instead of `organizations`.
- Test full sign-up → onboarding → dashboard flow on production.
- Integrate WhatsApp (Twilio), AI bot (Claude), and payments (Moyasar).

---

## 2026-05-27

### Completed

- Paused the older Supabase project `masrofati`.
- Created the new Supabase project `musnid1`.
- Applied the initial schema migration from `supabase/migrations/202605250001_initial_schema.sql`.
- Verified the Supabase public schema includes:
  - `organizations`
  - `customers`
  - `conversations`
  - `messages`
  - `knowledge_articles`
  - `automations`
- Collected the required Supabase values for Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Initialized Git locally for the project.
- Created the initial commit.
- Connected the local repository to GitHub:
  - `https://github.com/mansorAI/musnid1.git`
- Pushed branch `main` to GitHub.
- Imported the GitHub repository into Vercel.
- Configured Vercel environment variables.
- Fixed Vercel framework settings from `Other` to `Next.js`.
- Redeployed the project successfully.
- Verified the production site opens and renders the Musnid landing page.
- Added email sign-up from `/sign-in` so new users can start onboarding without manual Supabase user creation.
- Updated `/dashboard` to require first-organization setup in live Supabase environments.
- Added live conversation reads from Supabase when an organization exists.

### Verification

- Local production build succeeded with:

```bash
npm.cmd run build
```

- Vercel deployment reached `Ready`.
- Production page rendered instead of the earlier `404: NOT_FOUND`.

### Important Follow-Up

- Rotate the Supabase `service_role` key because it was shared during setup.
- Update the new `SUPABASE_SERVICE_ROLE_KEY` value in Vercel after rotation.
- Add the production Vercel URL to Supabase:

```text
Authentication > URL Configuration > Site URL
```

- Confirm login and dashboard flows against the live Supabase project.
- Add `NEXT_PUBLIC_APP_URL` in Vercel after confirming the final production URL, then redeploy so auth email redirects point to production.
- Seed or ingest real customers/conversations through the upcoming WhatsApp integration.

## 2026-05-25

### Completed

- Completed phase 1: founded the Musnid app.
- Created a Next.js project named `musnid` with TypeScript, Tailwind, App Router, and `src/`.
- Installed the first-phase libraries: Supabase, React Hook Form, Zod, TanStack Query, Zustand, date-fns, shadcn/ui, and UI helpers.
- Configured shadcn/ui with RTL support and added the required base components with `sonner`.
- Added a manual `form` component following the local shadcn style.
- Configured the global Arabic RTL layout and IBM Plex Sans Arabic.
- Changed font loading to CSS with fallback instead of `next/font/google`.
- Added Theme, TanStack Query, and Toaster providers.
- Added Supabase clients for browser, server, and service-role usage.
- Added a Next 16-compatible proxy for Supabase session refresh and `/dashboard` protection.
- Added `.env.local.example`.
- Replaced the default Next page with the Arabic Musnid landing page.
- Added `/sign-in` with a Supabase Auth server action.
- Added `/dashboard` as the initial operations dashboard with demo data.
- Added the dashboard layout and internal navigation.
- Added `/dashboard/customers`, `/dashboard/knowledge`, `/dashboard/automations`, and `/dashboard/settings`.
- Added server actions for creating organizations, knowledge articles, and automations when Supabase Auth is available.
- Added `dashboard-data` to use Supabase when configured and local demo data otherwise.
- Added the initial database migration with the core tables and RLS.
- Updated `src/types/database.ts` to reflect the initial schema.
- Updated project documentation.
- Ran lint and build successfully during local development.

### Current Phase

- Phase 2 is active: live Supabase and Vercel deployment are now connected.

### Remaining

- Rotate exposed Supabase service-role credentials.
- Generate official Supabase types from the live project if the schema changes.
- Test real sign-up/sign-in and organization creation flows on production.
- Replace remaining demo dashboard reads with live Supabase data where needed.
- Integrate WhatsApp provider, AI response layer, and payment provider.
