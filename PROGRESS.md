# PROGRESS

## 2026-05-29

### Completed

#### Phase 5 — Live Dashboard + Realtime Conversations + Smart Calendar

**Real Dashboard Stats**
- Replaced static demo stats in `/dashboard/page.tsx` with live counts from Supabase: active conversations, total customers, escalated conversations, total conversations.
- Fallback to demo data when Supabase is not configured.
- Added "مباشر" pulse indicator on stat cards when data is live.

**`/dashboard/conversations` — Realtime**
- New route with server component (`page.tsx`) that fetches initial conversations via SSR.
- Client component `realtime-conversations.tsx` subscribes to `postgres_changes` on the `conversations` table (filtered by `business_id`) using the browser Supabase client.
- On any INSERT / UPDATE / DELETE: refetches the full conversation list with customer join (`customers(name,phone)`).
- Shows a live connection indicator (Wifi icon, green "متصل" / grey "جاري الاتصال").
- Status badges color-coded: green (نشطة), amber (بانتظار مراجعة), grey (مغلقة).

**`/dashboard/calendar` — Smart Calendar**
- Reads `businesses.working_hours` JSONB (set during onboarding) and renders a 7-day grid showing open/close times or "مغلق" per day.
- Fetches upcoming `calendar_overrides` (from today onwards, up to 30 records) and lists them with date, hours or "مغلق", and optional notes.
- Client component `calendar-override-form.tsx` has a date picker, is_closed checkbox (toggles hour inputs), and notes field — submits via `addCalendarOverride` server action.
- Delete button per override using `deleteCalendarOverride` server action + `revalidatePath`.

**Data layer (`dashboard-data.ts`)**
- Added `getDashboardStats()` — parallel Supabase counts for conversations, customers, active, escalated.
- Added `getCalendarData()` — fetches working_hours from business + upcoming calendar_overrides.
- Added `getMenuData()` — fetches menu_categories + menu_items.
- Added `getStaffData()` — fetches staff_members.
- Added `getServicesData()` — fetches services with staff_members join + active staff list.

---

#### Phase 6 — Menu, Staff, Services

**`/dashboard/menu` — Instant Availability Toggle**
- Server component fetches `menu_categories` + `menu_items`.
- Client component `menu-availability.tsx` uses `useOptimistic` (React 19) for instant UI feedback.
- Toggle switch updates `is_available` directly via browser Supabase client (RLS-protected) — no server round-trip, truly instant.
- Items grouped by category, uncategorized items shown last.
- Demo data shown when no real menu items exist.
- Shown in nav only for `restaurant` and `cafe` business types.

**`/dashboard/staff` — Staff Management**
- Lists staff members with name, title, specialty, and active/inactive status badge.
- Toggle active status via `toggleStaffActive` server action.
- Add form via `addStaffMember` server action.
- Demo data shown when no staff records exist.
- Shown in nav only for `clinic` and `salon` business types.

**`/dashboard/services` — Services Catalog**
- Lists services with name, description, duration, price, and linked staff member.
- Toggle active status via `toggleServiceActive` server action.
- Add form with optional staff assignment dropdown (populated from active staff).
- Shown in nav only for `clinic` and `salon` business types.

**Dashboard layout nav**
- Added "المحادثات" and "التقويم" to core nav (always visible).
- Conditionally adds "المنيو" for restaurant/cafe, or "الفريق" + "الخدمات" for clinic/salon.

### Verification
- `npm run build` passes with all 16 routes building successfully.
- Pushed to GitHub (`mansorAI/musnid1`) — Vercel auto-deployed.
- Enabled Supabase Realtime on `conversations` table via **Database → Publications → supabase_realtime**.
- Created a second test account and completed the 4-step onboarding flow on production.
- Confirmed on `https://musnid1.vercel.app/dashboard`:
  - All 4 stat cards show real Supabase counts (0) with green "مباشر" pulse indicator.
  - `/dashboard/conversations` shows green "متصل" Realtime indicator — live subscription confirmed active.
  - Nav dynamically shows/hides المنيو / الفريق / الخدمات based on business type.

---

#### Phase 7 — WhatsApp + AI Bot (Claude)

**Twilio WhatsApp Sandbox**
- Created Twilio account and activated WhatsApp Sandbox (`+14155238886`).
- Connected personal WhatsApp number to sandbox via `join team-swing`.
- Added Twilio env vars to Vercel: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`.
- Added `ANTHROPIC_API_KEY` to Vercel for Claude AI integration.
- Configured Sandbox webhook URL: `https://musnid1.vercel.app/api/whatsapp/webhook` (POST).

**Webhook `POST /api/whatsapp/webhook`**
- Installed `twilio` and `@anthropic-ai/sdk` packages.
- Built `src/app/api/whatsapp/webhook/route.ts` — full end-to-end pipeline:
  1. Parses Twilio URL-encoded form body (From, To, Body, MessageSid, ProfileName).
  2. Finds business by `whatsapp_number` in `businesses` table via service-role Supabase client.
  3. Finds or creates `customers` row (by phone), updates `last_message_at` and `total_messages`.
  4. Finds active `conversations` row or creates new one, extends 24h window.
  5. Saves inbound message to `messages` table.
  6. Generates AI reply using `claude-haiku-4-5-20251001` with business-specific system prompt (name, type, city, description, personality, dialect from `bot_settings`).
  7. Sends reply via Twilio WhatsApp API.
  8. Saves outbound message with `ai_metadata` to `messages` table.
  9. Updates `conversations.summary` and `last_message_at`.
- Updated `businesses.whatsapp_number` in Supabase to match sandbox number `+14155238886`.

### Verification
- End-to-end test confirmed on production:
  - Sent "الو" from personal WhatsApp to `+14155238886`.
  - Bot replied in Arabic with correct personality: "الوا! 👋😊 كيفك أنت! فضل، شنو أخبارك؟ كيف نساعدك في لتجميل؟ ✨💄"
  - Conversation and messages saved in Supabase.
  - `/dashboard/conversations` updates in real-time via Realtime subscription.

---

#### Phase 8 — Knowledge Base + Calendar Editor + Smart Booking

**`/dashboard/knowledge` — Live Knowledge Base**
- Replaced "coming soon" placeholder with a fully functional knowledge base.
- Articles stored in `businesses.bot_settings.knowledge` as JSONB array (no migration needed).
- Server actions: `addKnowledgeArticle`, `toggleKnowledgeArticle`, `deleteKnowledgeArticle`.
- Toggle button per article (مفعّلة / متوقفة) + trash icon to delete.
- Webhook reads enabled articles and injects them into Claude's system prompt automatically.

**`/dashboard/calendar` — Working Hours Editor with Dual Shifts**
- Replaced static read-only display with a full editor component (`working-hours-editor.tsx`).
- Each day: single period by default with open/close times.
- Button "+ فترتان" splits any day into morning + evening shifts.
- Evening shift has a dedicated 🗑️ delete button to collapse back to single period.
- `updateWorkingHours` server action saves to `businesses.working_hours` JSONB.
- Webhook reads `working_hours` automatically and includes it in Claude's system prompt.

**`/dashboard/calendar` — Upcoming Appointments**
- Added `getUpcomingAppointments()` to `dashboard-data.ts`.
- Calendar page now shows upcoming appointments with customer name, phone, doctor, time, and date.
- Shows "لا توجد مواعيد قادمة بعد" when empty.

**Smart Booking Bot (Clinics & Salons)**
- Webhook detects business type (`clinic` / `salon`) and fetches active staff with specialties and working hours.
- Fetches booked appointments for the next 14 days.
- Claude guides the conversation: specialty → doctor → available time slot → confirmation.
- Booking confirmation detected via `[BOOKING:staff_id:YYYY-MM-DD:HH:MM:duration]` marker in Claude's reply.
- Marker stripped from reply before sending to customer.
- Appointment saved to `appointments` table with customer info.
- Duplicate/overlap prevention: checks ±29 min window before saving — rejects if conflict exists.
- Claude receives today's date so it calculates correct YYYY-MM-DD for days like "الأحد القادم".
- Conversation history (last 10 messages) passed to Claude for multi-turn booking context.

**Webhook Improvements**
- Added today's date + day name to system prompt so Claude uses correct booking dates.
- Clarified slot interval: every 30 minutes only (9:00, 9:30, 10:00...).
- Bot never suggests times already in the booked appointments list.

### Architecture Decision — WhatsApp Provider
- Twilio Sandbox used for development/testing (shared number `+14155238886`).
- Twilio Trial account hit daily message limit during testing — decided to upgrade to Pay as you go.
- Discussed multi-tenant WhatsApp strategy:
  - **Short term:** Musnid buys Twilio numbers for customers (Twilio-assigned numbers).
  - **Long term (correct path):** Meta WhatsApp Cloud API with Embedded Signup — customer connects their OWN phone number via one-click Meta OAuth flow. 1000 free conversations/month.
- **Decision:** Migrate to Meta Cloud API next — it's the only way customers can use their own Saudi numbers.

### Remaining
- **Phase 9:** Meta WhatsApp Cloud API integration with Embedded Signup — replace Twilio entirely.
- `/dashboard/conversations/{id}` — individual chat view with message history.
- Moyasar payment integration.
- Admin panel for assigning resources to customers.

---

## 2026-05-28

### Completed

#### Phase 4 — Onboarding Flow
- Added `/onboarding` as the first setup experience for authenticated users without a business.
- Built a 4-step onboarding form:
  - Step 1: basic business info (`name`, `type`, `city`, `description`).
  - Step 2: contact info (`contact_phone`, `contact_email`, `whatsapp_number`).
  - Step 3: weekly working hours saved into `businesses.working_hours` as JSONB.
  - Step 4: bot settings saved into `businesses.bot_settings` as JSONB.
- Added `src/app/onboarding/actions.ts` to create the final `businesses` row with a unique `slug` and current user `owner_id`.
- Added redirect guard: users who already have a business are sent from `/onboarding` to `/dashboard`.
- Updated login flow so users without a business are sent to `/onboarding`.
- Updated service-role signup flow to sign the user in after account creation when possible, then redirect to `/onboarding`.
- Updated `/dashboard/page.tsx` so live Supabase users without a business are redirected to `/onboarding` instead of `/dashboard/settings`.
- Kept `/dashboard/settings` for post-creation management, with loading feedback on the create form.
- Added shared pending submit button UI in `src/components/ui/submit-button.tsx`.
- Added loading/disabled states to submit actions:
  - Sign in
  - Sign up
  - Sign out
  - Dashboard settings create business
  - Onboarding final submit
  - Landing contact form
- Added success feedback after onboarding/business creation via `/dashboard?created_business=1`.
- Fixed customer page schema mismatch from `last_seen_at` to `last_message_at`.
- Fixed a React lint issue in `Navbar.tsx` related to setting mounted state inside an effect.

#### Phase 4 Verification
- `npm.cmd run lint` passes.
- `npm.cmd run build` passes.
- Local `/onboarding` route responds with HTTP 200.
- Browser plugin preview was attempted twice but failed due to the local browser runtime (`windows sandbox failed: spawn setup refresh`), not an application build error.

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

#### Dashboard Migration to New Schema
- Executed `20260528001_musnid_schema.sql` in Supabase SQL Editor — ran successfully ("Success. No rows returned").
- Updated `src/lib/dashboard-data.ts`:
  - Renamed `getCurrentOrganization` → `getCurrentBusiness`, now queries `businesses` table.
  - `getCustomers` now uses `business_id` against `businesses`.
  - `getKnowledgeArticles` and `getAutomations` return demo data only (no table in new schema — will be driven by `bot_settings` JSONB in future release).
  - `getConversations` updated to match new `conversations` schema (status: `active | escalated | closed`).
- Updated `src/app/dashboard/actions.ts`:
  - Replaced `createOrganization` with `createBusiness` — generates a unique `slug` automatically, upserts `profiles` row for pre-trigger users, inserts into `businesses`.
  - Removed `createKnowledgeArticle` and `createAutomation` (tables no longer exist).
- Updated all dashboard pages to use `getCurrentBusiness` and `createBusiness`:
  - `dashboard/layout.tsx` — shows `business.name` in header.
  - `dashboard/page.tsx` — redirects to settings if no business found.
  - `dashboard/settings/page.tsx` — displays `business` fields; form calls `createBusiness`.
  - `dashboard/knowledge/page.tsx` — removed add form, shows "coming soon" notice.
  - `dashboard/automations/page.tsx` — removed add form, shows "coming soon" notice.
  - `dashboard/customers/page.tsx` — no change needed (already compatible).

### Remaining

- Test full sign-up → business creation → dashboard flow on production.
- Regenerate `src/types/database.ts` from live Supabase if schema changes further:
  ```bash
  npx supabase gen types typescript --project-id zkhkfxtuycixymesrkzt > src/types/database.ts
  ```
- Build onboarding flow (4 steps from build prompt § Phase 4).
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
