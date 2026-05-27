# PROGRESS

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
