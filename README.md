# Musnid

Musnid is an Arabic SaaS dashboard for managing WhatsApp customer conversations for small and medium businesses. It includes a landing page, Supabase-backed authentication, dashboard pages, knowledge articles, automations, and an initial Postgres schema with RLS.

## Current Status

- Next.js 16 app with App Router, TypeScript, Tailwind, and shadcn/ui.
- Arabic RTL interface with IBM Plex Sans Arabic loaded through CSS.
- Supabase browser, server, and service-role clients.
- Supabase project created and initial database migration applied.
- GitHub repository connected at `mansorAI/musnid1`.
- Production deployment completed on Vercel.
- Main app routes are available:
  - `/`
  - `/sign-in`
  - `/dashboard`
  - `/dashboard/customers`
  - `/dashboard/knowledge`
  - `/dashboard/automations`
  - `/dashboard/settings`

## Local Development

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

On Windows PowerShell, if script execution blocks `npm`, use:

```bash
npm.cmd run dev
npm.cmd run build
```

## Environment Variables

Create `.env.local` locally and add the real values:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Optional integration keys planned for later phases:

```env
ANTHROPIC_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=
MOYASAR_PUBLIC_KEY=
MOYASAR_SECRET_KEY=
RESEND_API_KEY=
```

Do not commit real `.env` files. Vercel should store production values in Project Settings > Environment Variables.

## Supabase

The initial migration is:

```text
supabase/migrations/202605250001_initial_schema.sql
```

It creates:

- `organizations`
- `customers`
- `conversations`
- `messages`
- `knowledge_articles`
- `automations`

It also enables Row Level Security and owner-scoped policies.

After changing the database schema, regenerate/update `src/types/database.ts` as needed.

## Deployment

The app is deployed through Vercel from GitHub.

Vercel settings:

- Framework Preset: `Next.js`
- Root Directory: `./`
- Production branch: `main`

Required Vercel environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
```

After deployment, set the production Vercel URL in Supabase Auth settings:

```text
Supabase > Authentication > URL Configuration > Site URL
```

## Security Notes

- `SUPABASE_SERVICE_ROLE_KEY` must stay server-side only.
- If the service-role key was shared outside a secure secret manager, rotate it in Supabase and update Vercel.
- Do not expose service-role keys in client components, screenshots, commits, or public docs.

## Useful Commands

```bash
npm.cmd run lint
npm.cmd run build
git status
git push
```
