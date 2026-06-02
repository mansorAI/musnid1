# PROGRESS

---

## 2026-06-02 — نظام الموظفين المرتبط بحسابات التطبيق

### تم إنجازه

#### 1. `src/types/database.ts`
- إضافة `EmployeeActionType`
- إضافة 4 أنواع جديدة: `BusinessEmployee`, `EmployeePermissions`, `EmployeeSession`, `EmployeeAuditLog`

#### 2. `src/app/dashboard/staff/actions.ts`
6 Server Actions جديدة:
- `searchProfileByEmail` — بحث عن مستخدم بالإيميل
- `linkEmployee` — ربط موظف (staff أو cashier) مع إنشاء السجلات المناسبة
- `updateEmployeePermissions` — تحديث صلاحيات الكاشير
- `removeEmployee` — إزالة موظف
- `getLinkedEmployees` — جلب الموظفين المرتبطين مع بياناتهم وصلاحياتهم
- `getEmployeeSessions` — جلب جلسات دخول/خروج موظف
- `getEmployeeAuditLog` — جلب سجل إجراءات موظف

#### 3. `src/components/dashboard/LinkedEmployeesPanel.tsx` — جديد
Client Component كامل يحتوي:
- `AddEmployeeDialog` — dialog بـ 3 خطوات (إيميل → نوع → تفاصيل)
- `PermissionsDialog` — تعديل صلاحيات الكاشير
- `LogDialog` — عرض جلسات الدخول/الخروج والإجراءات
- `EmployeeCard` — بطاقة كل موظف مع أزرار: صلاحيات، سجلات، إزالة
- `LinkedEmployeesPanel` — المكوّن الرئيسي

#### 4. `src/app/dashboard/staff/page.tsx`
أعيد تصميمه بقسمين:
- **الموظفون**: المرتبطون بالتطبيق (كاشير + طاقم عمل)
- **دليل الفريق**: `staff_members` للبوت وزون + نموذج الإضافة اليدوية

### ملاحظة
قاعدة البيانات مشتركة مع الموبايل — Migration واحد يخدم المشروعين:
`musnid-mobile/supabase/migrations/20260602000000_employee_work_system.sql`

**آخر تحديث:** 2026-06-02
**الحالة:** نظام الموظفين مكتمل في الويب ✅ | ينتظر تطبيق migration على Supabase ⏳

---

## 2026-06-01 — Light/Dark Theme Toggle & Design Consistency Fix

### Completed

#### Theme System Overhaul
- **Problem:** Dashboard was hardcoded dark (inline `#16161f` / `#13131e` styles) — mixed with light page background causing visual inconsistency.
- **Default theme changed to light** — updated `src/components/providers.tsx`: `defaultTheme="dark"` → `defaultTheme="light"`, disabled `enableSystem` to prevent OS preference overriding the explicit default.
- **New `ThemeToggle` button** (`src/components/theme-toggle.tsx`):
  - Renders Sun icon in dark mode, Moon icon in light mode.
  - Uses `useTheme()` from next-themes with `mounted` guard to prevent hydration mismatch.
  - Placed in dashboard header next to the sign-out button.
- **Dashboard layout** (`src/app/dashboard/layout.tsx`) — fully adaptive header:
  - Light: `bg-white border-surface-200` with dark text/nav.
  - Dark: `bg-surface-900 border-surface-800` with light text/nav.
  - Logo text, business name, nav links, and sign-out button all use `dark:` variants.
- **Dashboard page** (`src/app/dashboard/page.tsx`) — replaced all hardcoded dark hex colors with Tailwind adaptive classes:
  - Cards: `bg-white dark:bg-[#16161f]` with `border-surface-200 dark:border-white/[0.07]`.
  - Welcome hero: `bg-surface-100 dark:bg-[#13131e]`.
  - Text: `text-surface-900 dark:text-white` (headings) / `text-surface-500 dark:text-surface-400` (subtitles).
  - Accent top borders and icon circle backgrounds kept as inline styles (color-specific).
- `localStorage` note: existing users with "dark" saved in localStorage need to run `localStorage.removeItem('theme')` once to reset to new default.

#### Files Added
- `src/components/theme-toggle.tsx`

#### Main Files Updated
- `src/components/providers.tsx`
- `src/app/dashboard/layout.tsx`
- `src/app/dashboard/page.tsx`

#### Commits
- `41511a6` — feat: add light/dark theme toggle with light mode as default

### Verification
- `npx tsc --noEmit` passes.
- Pushed to `main` → Vercel auto-deployed to `https://www.musnid.com`.

---

## 2026-06-01 — Sales & Dashboard Redesign: Mobile Parity

### Completed

#### Dashboard Page — Mobile-Style Redesign (`src/app/dashboard/page.tsx`)
- Replaced generic stat cards with mobile-matched design:
  - **Hardcoded dark backgrounds** (`#16161f` / `#13131e`) so cards always look like mobile regardless of light/dark web theme.
  - Colored top border (`borderTop: 2px solid color`) per card.
  - Icon in rounded colored circle (26% opacity — visible on all backgrounds).
  - Green "مباشر" pulse dot on each live card.
  - Large bold white number (text-3xl font-extrabold).
- Welcome hero section matching mobile:
  - Business name + "المبيعات والفوترة" in header row.
  - Green animate-pulse dot with "مباشر" label.
  - "مرحباً {business.name}" heading.
  - "ملخص الفواتير والمبيعات اليوم" subtitle.
  - Glow orbs (primary + teal, low opacity).
- "واتساب ذكي" section — 4 stat cards (active, escalated, customers, total) when Supabase connected.
- "الإحصائيات" section — 4 sales cards when invoice schema exists:
  - **مبيعات اليوم** — shows `total_amount` gross (matching mobile dashboard behavior).
  - **الكاشير** — special card with "فتح الكاشير" button (33% opacity, prominent) linking to `/dashboard/sales/products`.
  - **فواتير اليوم** — today's invoice count.
  - **إجمالي الفواتير** — all-time invoice count.
- "إجراءات سريعة" section — 4 action rows matching mobile layout (chevron left, icon + title/subtitle right).
- Removed old bot status / automations / conversations widgets.

#### Sales Page — Mobile Parity
- **`src/app/dashboard/sales/sales-list.tsx`** (new client component):
  - Period filter tabs: **اليوم** (default) / **الشهر** / **السنة** — matching mobile.
  - 3 stat cards update per filter: مبيعات (net = total − VAT) / ضريبة / عدد الفواتير.
  - Export button — downloads UTF-8 BOM CSV with invoice number, date, time, net, VAT, total, status, and summary row (web equivalent of mobile's Excel export).
  - Invoice card list: chevron left, invoice number + date + buyer right-aligned, amount (teal) + status badge far right.
- **`src/app/dashboard/sales/page.tsx`** — rewrote as thin server wrapper:
  - Fetches all invoices via `getAllSalesInvoices()` (no row limit) and passes to `SalesList`.
  - Header buttons: "كاشير المنتجات" + "إعدادات الفوترة".

#### Data Layer (`src/lib/dashboard-data.ts`)
- Added `getAllSalesInvoices()` — fetches complete invoice list for the business without `.limit(30)` cap, enabling accurate period filtering on the sales page.

#### Bug Fixes Applied During Session
- **Broken `/dashboard/sales/new` link** — removed button pointing to non-existent route.
- **Card colors invisible in light mode** — fixed by hardcoding dark backgrounds instead of relying on `dark:` Tailwind variants.
- **Icon circles too transparent** — changed from `color + "1a"` (10% opacity) to `color + "26"` (15% opacity hex = visible).
- **Cashier button too faint** — changed from `color + "20"` (12% opacity) to `color + "33"` (20% opacity hex = prominent).
- **Sales number mismatch web vs mobile** — web now shows `total_amount` gross (matching mobile `todayRevenue`); the net-revenue fix from mobile PROGRESS.md was applied to the sales *list* page only, not the dashboard card.

#### Mobile Updates Applied to Web
| Mobile feature | Web equivalent |
|---|---|
| Cashier card on dashboard | `/dashboard/sales/products` direct link card |
| Period filters اليوم/الشهر/السنة | `SalesList` client filter tabs |
| Net-revenue in sales list cards | `netSales = total − VAT` in `SalesList` stats |
| Excel export | CSV download (UTF-8 BOM, same columns + summary row) |
| Dark card design C.card `#16161f` | Hardcoded inline style, theme-independent |

#### Commits
- `eebe39b` — initial redesign (dashboard + sales + data layer)
- `35d29a6` — fix broken sales/new link
- `caa4704` — fix dark card backgrounds + match mobile gross sales total

#### Files Added
- `src/app/dashboard/sales/sales-list.tsx`

#### Main Files Updated
- `src/app/dashboard/page.tsx`
- `src/app/dashboard/sales/page.tsx`
- `src/lib/dashboard-data.ts`

### Verification
- `npx.cmd tsc --noEmit` passes.
- `npm.cmd run build` passes (21 routes, all ƒ dynamic).
- Pushed to `main` → Vercel auto-deployed to `https://www.musnid.com`.

### Remaining
- Apply `20260601090000_personal_tasks_engine_web.sql` in Supabase SQL Editor (tasks feature).
- `/dashboard/sales/new` — manual invoice creation page (mobile `sales/new.tsx` equivalent).
- End-to-end test: cashier flow, invoice list filters, CSV export on production.
- Smart tasks live testing after migration.

---

## 2026-06-01 — Mobile Progress Parity: Theme + Smart Tasks

### Completed

#### Web Theme System
- Reviewed the latest mobile `PROGRESS.md` from `C:\pro\musnid1\musnid-mobile\PROGRESS.md`.
- Reviewed the existing web `PROGRESS.md` before making changes so the new work only fills the missing parity items.
- Mirrored the relevant mobile theme work in the web app.
- Kept the existing `next-themes` setup and changed the default theme to dark to match the mobile default.
- Added `src/components/theme-selector.tsx` with two card-style options:
  - `داكن`
  - `فاتح`
- Added a new "المظهر" section to `/dashboard/settings` so web users can switch themes from the dashboard.

#### Smart Personal Tasks Engine — Web Phase 1
- Added `supabase/migrations/20260601090000_personal_tasks_engine_web.sql`.
- New tables:
  - `personal_tasks`
  - `task_time_windows`
  - `user_energy_map`
  - `task_surface_log`
  - `task_suppression_factors`
- Added `task_context_tag` enum for:
  - `general`
  - `calls`
  - `shopping`
  - `mail`
  - `errands`
- Added full RLS so each authenticated user can only manage their own task data.
- Added `increment_task_delays()` for future scheduled delay increments.

#### Algorithm Layer
- Added `src/lib/task-engine.ts` with pure functions matching the mobile phase-1 logic:
  - `computeDebt`
  - `computeMomentum`
  - `calculateSurfaceScore`
  - `scoreTasks`
  - `computeAdaptiveThreshold`
  - `computeSuppressionDelta`
  - `updateEnergyLevel`
  - `extractContextTag`
  - `TAG_META`

#### Dashboard Tasks UI
- Added `/dashboard/tasks`.
- Added dashboard nav item "المهام".
- The page includes:
  - Add task form with Arabic auto context detection.
  - Context chips for calls, shopping, mail, errands, and general.
  - Timeline-style task cards with a fixed 62px row height.
  - Time column, task card column, and energy score column.
  - Context banner when non-general tasks are present.
  - Hidden tasks section labeled "تنتظر لحظتها".
  - Actions for "تم", "لاحقاً", and ignore.
- Added `src/app/dashboard/tasks/actions.ts`:
  - `addPersonalTask`
  - `completePersonalTask`
  - `snoozePersonalTask`
  - `ignorePersonalTask`
- Actions log outcomes, update suppression factors, and update the user's hourly energy map.

#### Types and Data Layer
- Updated `src/types/database.ts` with the 5 new task tables and exported row helper types.
- Added `TaskContextTag` to `src/types/index.ts`.
- Added `getTasksData()` to `src/lib/dashboard-data.ts`.
- The tasks page falls back to demo smart tasks when Supabase is not configured.

#### Sales and ZATCA Billing Visibility
- Reviewed the mobile progress section for "أساس نظام المبيعات والفوترة ZATCA" and "إصلاحات الفوترة وSupabase".
- Confirmed the web app had no visible sales/billing routes even though mobile expects the same platform database.
- Copied the mobile ZATCA migration into the web project so both apps use the same database schema:
  - `supabase/migrations/20260531061600_zatca_fatoora_schema.sql`
- The shared schema includes:
  - `invoice_settings`
  - `sales_products`
  - `invoices`
  - `invoice_items`
  - `zatca_devices`
  - `zatca_submissions`
- Added `src/lib/zatca.ts`:
  - VAT calculation for `none`, `inclusive`, and `exclusive`.
  - Stable invoice number generation.
  - ZATCA Phase 1 TLV Base64 QR payload generation.
- Added web sales routes:
  - `/dashboard/sales` — invoices list and daily summary.
  - `/dashboard/sales/products` — product cashier using the existing shared `menu_items` table.
  - `/dashboard/sales/settings` — VAT and seller settings.
  - `/dashboard/sales/[id]` — invoice detail and QR payload display.
- Added `src/app/dashboard/sales/actions.ts`:
  - `saveInvoiceSettings`
  - `addSalesProduct`
  - `issueProductInvoice`
- Added sales/billing visibility:
  - Dashboard navigation item "المبيعات".
  - Settings card linking to "المبيعات والفوترة".
- Kept the same fallback behavior documented in mobile:
  - Try `invoice_settings` first.
  - If the table is missing, save/read temporary settings from `businesses.bot_settings.invoice_settings`.
  - Actual invoice issuing still requires `invoices` and `invoice_items` from the shared migration.
- Updated `src/types/database.ts` with shared invoice/ZATCA tables and enums.
- Added sales data loaders to `src/lib/dashboard-data.ts`.

#### Files Added
- `src/lib/task-engine.ts`
- `src/lib/zatca.ts`
- `src/app/dashboard/tasks/page.tsx`
- `src/app/dashboard/tasks/actions.ts`
- `src/app/dashboard/sales/page.tsx`
- `src/app/dashboard/sales/products/page.tsx`
- `src/app/dashboard/sales/settings/page.tsx`
- `src/app/dashboard/sales/[id]/page.tsx`
- `src/app/dashboard/sales/actions.ts`
- `src/components/theme-selector.tsx`
- `supabase/migrations/20260531061600_zatca_fatoora_schema.sql`
- `supabase/migrations/20260601090000_personal_tasks_engine_web.sql`

#### Main Files Updated
- `src/components/providers.tsx` — default theme changed to dark.
- `src/app/dashboard/layout.tsx` — added "المهام" and "المبيعات" navigation items.
- `src/app/dashboard/settings/page.tsx` — added the "المظهر" section and sales/billing entry.
- `src/lib/dashboard-data.ts` — added smart tasks data loading/scoring and sales/billing loaders.
- `src/types/database.ts` — added task tables, invoice/ZATCA tables, enums, and helper row types.
- `src/types/index.ts` — added `TaskContextTag`.
- `PROGRESS.md` — documented today's web parity work.

### Verification
- `npx.cmd tsc --noEmit` passes.
- `npm.cmd run lint` passes.
- `npm.cmd run build` passes.
- Next build includes `/dashboard/tasks`, `/dashboard/sales`, `/dashboard/sales/products`, `/dashboard/sales/settings`, and `/dashboard/sales/[id]` as dynamic routes.
- Applied `supabase/migrations/20260531061600_zatca_fatoora_schema.sql` in Supabase SQL Editor successfully (`Success. No rows returned`).
- Confirmed the web and mobile apps now target the same shared Supabase invoice/ZATCA tables.
- Confirmed GitHub remote is connected to `https://github.com/mansorAI/musnid1.git`.
- Committed and pushed today's web changes to `main`:
  - `f82ed81 Add sales billing and smart tasks dashboard`
- Vercel production deployment was triggered from the GitHub push for commit `f82ed81`.

### Remaining
- Apply `20260601090000_personal_tasks_engine_web.sql` in Supabase SQL Editor before using real task data in production.
- Add end-to-end browser testing for `/dashboard/tasks` after migration is applied.
- Confirm the Vercel deployment for `f82ed81` reaches `Ready`.
- Test `/dashboard/sales`, `/dashboard/sales/settings`, and `/dashboard/sales/products` on `https://www.musnid.com` after Vercel is ready.
- Add end-to-end cashier testing for `/dashboard/sales/products` on production.
- Decide whether smart tasks should remain user-personal or become business/team shared in a later phase.

## 2026-05-29 — Mobile Expo + Restaurant Order Webhook

### Completed

#### Mobile Expo Compatibility
- Diagnosed Expo Go incompatibility with the mobile project on iOS.
- Downgraded the mobile app to Expo SDK 54 so it can run with the current Expo Go version available on the App Store.
- Confirmed SDK-compatible dependencies with `npx.cmd expo install --check`.
- Installed local tunnel support with `@expo/ngrok` and ran the mobile app through `expo start --clear --tunnel`.
- Connected the mobile app to the same Supabase project used by the web app.

#### Mobile App UX Updates
- Added a skip button to onboarding working-hours step so owners can complete setup and edit working hours later.
- Made service duration optional in the mobile service creation screen.
- Added clear menu item availability labels in the mobile menu list:
  - `متوفر`
  - `نفذ`
- Added a structured order-summary card renderer in the mobile conversation detail screen for messages starting with `طلب جديد:`.

#### Restaurant Order Collection in Webhook
- Added `src/lib/bot/restaurant-order.ts`.
- Integrated restaurant/cafe/retail order collection into `src/app/api/whatsapp/webhook/route.ts`.
- The webhook now handles lightweight restaurant ordering before falling back to Claude:
  - Matches customer text against available `menu_items`.
  - Asks for pickup or delivery.
  - Requests address for delivery.
  - Collects customer notes.
  - Handles paid add-ons from `businesses.bot_settings.paid_addons` when configured.
  - Falls back to default add-ons for common cases like extra mayo/cheese.
  - Asks for final confirmation.
- Stores in-progress order state in:
  - `conversations.metadata.restaurant_order_draft`
- On confirmation, inserts a structured owner-facing message into the conversation:

```text
طلب جديد:
العميل: 05xxxxxxxx
طريقة الطلب: استلام
الأصناف:
- برجر دجاج
- بيبسي
الإضافات:
- زيادة مايونيز +2 ر.س
الملاحظات:
- بدون كاتشب
الإجمالي: 31 ر.س
```

### Verification
- `npx.cmd tsc --noEmit` passes in the web project.
- Mobile TypeScript check now starts after adjusting `ignoreDeprecations` to `5.0`; remaining errors are pre-existing typed-route/Supabase relationship issues outside the order work.

### Remaining
- Test the restaurant order flow end-to-end through Twilio WhatsApp after deploying the webhook.
- Add an admin UI later for configuring paid add-ons instead of relying on JSON in `bot_settings.paid_addons`.

---

## 2026-05-30

### Completed

#### Domain Migration — musnid1.vercel.app → www.musnid.com
- Purchased domain `musnid.com` and connected it to Vercel.
- Updated `NEXT_PUBLIC_APP_URL` in Vercel Environment Variables to `https://www.musnid.com`.
- Updated Supabase Auth → URL Configuration:
  - Site URL: `https://www.musnid.com`
  - Redirect URLs: `https://www.musnid.com/**` (removed old `musnid1.vercel.app/**`)
- Updated hardcoded URL in `src/app/sign-in/page.tsx` (redirect_url error message).
- Updated all references in `PROGRESS.md`.
- Redeployed on Vercel — status: Ready.
- Production site confirmed live on `https://www.musnid.com`.

#### Bot Testing (curl-based)
- Tested webhook end-to-end without WhatsApp using curl POST to `/api/whatsapp/webhook`.
- Confirmed: messages saved to Supabase, Claude generates reply, conversation appears in `/dashboard/conversations` with Realtime update.
- Test command: `curl -X POST https://www.musnid.com/api/whatsapp/webhook -d "From=whatsapp:+966500000001&To=whatsapp:+14155238886&Body=أبي أحجز موعد&MessageSid=test-1"`

#### Architecture Decision — WhatsApp Multi-Tenant Strategy
- Discussed how customers connect WhatsApp to Musnid.
- Current state: single Twilio account (owner's), webhook hardcoded to it.
- Options evaluated:
  - Twilio per-customer: customer enters their own Twilio credentials (complex for customer).
  - Musnid buys numbers for customers: simpler but only Twilio international numbers, not Saudi.
  - **Meta WhatsApp Cloud API with Embedded Signup**: customer connects their own Saudi number via one-click Meta OAuth. 1000 free conversations/month. Only option that gives customers their own number.
- **Decision: Migrate to Meta Cloud API (Phase 9)** — it's the correct long-term architecture.
- Twilio Sandbox continues for development/testing until Meta integration is ready.

### Remaining
- **Phase 9:** Meta WhatsApp Cloud API — Embedded Signup flow so customers connect their own number.
- `/dashboard/conversations/{id}` — individual chat view with message history.
- Moyasar payment integration.
- Twilio → upgrade to Pay as you go to remove daily message limit during testing.

---

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
- Confirmed on `https://www.musnid.com/dashboard`:
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
- Configured Sandbox webhook URL: `https://www.musnid.com/api/whatsapp/webhook` (POST).

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
  - Site URL → `https://www.musnid.com`
  - Redirect URLs → `https://www.musnid.com/**`
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

- Account creation flow confirmed working on `https://www.musnid.com/sign-in`.
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
