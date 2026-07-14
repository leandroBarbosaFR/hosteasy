# Hosteasy

SaaS for short-stay hosts (Airbnb / Booking). Each rental property gets a **tablet** that the guest interacts with (stay info, extras, guides, web shortcuts, chat). The host operates everything from a web dashboard.

Marketing site at `/`, app surfaces at `/login`, `/dashboard`, `/admin`, and `/tablet/[tabletCode]`.

---

## Stack

- **Next.js 16** (App Router) — note: this version uses **`proxy.ts`** at the project root in place of the legacy `middleware.ts` file convention.
- **React 19**
- **Tailwind v4** (CSS-first theme in `src/app/globals.css`)
- **shadcn** (`base-nova` preset) + **Base UI**
- **lucide-react** icons
- **Supabase** (Postgres + Auth + RLS) via `@supabase/supabase-js` and `@supabase/ssr`
- **zod** for input validation
- Package manager: **pnpm**

---

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
CRON_SECRET=...
```

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — get them from **Supabase dashboard → Project Settings → API**.
- `SUPABASE_SERVICE_ROLE_KEY` — same page. **Server-only.** Never expose to the browser. Used for the super-admin actions and for the unauthenticated tablet routes.
- `NEXT_PUBLIC_SITE_URL` — base URL used for password-reset / email-confirmation redirects. Use `http://localhost:3000` locally and your production URL in deployment env.
- `CRON_SECRET` — any long random string. Vercel sends it as `Authorization: Bearer` on cron invocations of `/api/cron/sync-reservations` (hourly iCal sync of every active Airbnb/Booking feed, see `vercel.json`). Hourly crons need a Vercel Pro plan; on Hobby change the schedule to daily.
- Optional: `NEXT_PUBLIC_CONTACT_WHATSAPP`, `NEXT_PUBLIC_CONTACT_WHATSAPP_DISPLAY`, `NEXT_PUBLIC_CONTACT_EMAIL` — override the marketing-site contact details (`src/lib/site.ts`).
- Optional: `HOSTEASY_MONTHLY_COST_BRL` — plan price used by the ROI panel (default 99).

### Optional integrations (features activate when the keys exist)

All of these are env-gated in `src/lib/deliver.ts` / `src/lib/mercadopago.ts` — with no keys, notifications stay in-app only and extras use the manual PIX-key flow.

```
# E-mail delivery of notifications (Resend)
RESEND_API_KEY=...
NOTIFY_EMAIL_FROM="Hosteasy <avisos@yourdomain.com>"

# WhatsApp delivery of notifications (Meta WhatsApp Cloud API)
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_TEMPLATE_NAME=...        # approved template with one {{1}} body param
WHATSAPP_TEMPLATE_LANG=pt_BR      # default

# PIX charging for extras (Mercado Pago)
MERCADOPAGO_ACCESS_TOKEN=...
# then register the webhook in the MP dashboard (payment events):
#   https://<your-domain>/api/webhooks/mercadopago
```

Notes:
- Without `WHATSAPP_TEMPLATE_NAME`, WhatsApp messages are sent as plain text, which Meta only delivers inside a 24-hour session window — fine for testing, use an approved template in production.
- The host sets their own WhatsApp number and toggles per-channel delivery in **Dashboard → Ajustes → Notificações**.
- With Mercado Pago configured, approving an order creates a PIX charge; the guest sees the QR on the tablet and the webhook flips the order to `paid` automatically.

---

## Database setup

The schema lives at `supabase/migrations/`. Two ways to apply it.

### Option A — Supabase CLI (recommended)

```bash
# 1. install if you don't have it
brew install supabase/tap/supabase

# 2. link your project
supabase link --project-ref YOUR-PROJECT-REF

# 3. push the schema + RLS
supabase db push
```

`supabase db push` reads every file under `supabase/migrations/*.sql` in order. The two we ship:

| File                                 | What it does                                      |
|--------------------------------------|---------------------------------------------------|
| `supabase/migrations/0001_schema.sql` | Tables, enums, indexes, `updated_at` triggers, auto-profile-on-signup trigger |
| `supabase/migrations/0002_rls.sql`    | Helper functions + Row Level Security policies   |
| `supabase/migrations/0003_roi_engine.sql` | iCal sync, extras categories, late checkout, review boost, PIX |
| `supabase/migrations/0004_staff_tasks.sql` | Staff tasks + comments (the `/staff` workspace) |
| `supabase/migrations/0005_ops_suite.sql` | Worker specialties, host↔staff chat, inventory/stock, in-app notifications |

### Option B — Raw psql

Grab your connection string from **Supabase dashboard → Project Settings → Database → Connection string**.

```bash
psql "$DATABASE_URL" -f supabase/migrations/0001_schema.sql
psql "$DATABASE_URL" -f supabase/migrations/0002_rls.sql
```

---

## Seeding

`supabase/seed.sql` creates:

- 1 host (`Leandro · Floripa`)
- 3 properties (`Vilas do Luiz · 102`, `· 304`, `Costa Azul · A12`)
- 3 tablets (`TAB-102`, `TAB-304`, `TAB-A12`)
- 4 reservations (Marina, Tiago, Família Oliveira, Ana — matching the marketing mockups)
- Guest stays with access tokens for the active reservations
- 4 extras (Café da manhã, Late check-out, Transfer aeroporto, Compras prontas)
- 4 guide categories per property (Wi-Fi, Cozinha, AC, Check-out) with items
- 8 web shortcuts (Airbnb, Booking, Maps, iFood, Uber, WhatsApp, YouTube, Notícias)
- 3 message templates and a few demo messages

You need to know **your auth user's UUID** so the seed can link the host to you. The flow is:

```bash
# 1. start the app
pnpm dev

# 2. open http://localhost:3000/signup and create an account with your email
#    (Supabase auto-creates a row in public.profiles via trigger)

# 3. find your user id
psql "$DATABASE_URL" -c "select id, email from auth.users order by created_at desc limit 5;"

# 4. run the seed, passing your id (replace UUID)
psql "$DATABASE_URL" \
  -v owner_user_id="'UUID-HERE'" \
  -f supabase/seed.sql
```

This promotes your profile to **`super_admin`**, sets `host_id` to Leandro's host, and adds you as a `host_admin` member so you can sign in and immediately see everything.

If you run the seed without `owner_user_id`, the host, properties, tablets etc. are created but unattached — sign in afterwards and either re-run the seed with your id, or run:

```sql
update profiles set role = 'super_admin',
       host_id = '11111111-1111-1111-1111-111111111111'
 where id = 'YOUR-USER-ID';
insert into host_members (host_id, user_id, role)
  values ('11111111-1111-1111-1111-111111111111', 'YOUR-USER-ID', 'host_admin')
  on conflict do nothing;
```

### Promoting an existing user to super_admin manually

```sql
update profiles set role = 'super_admin' where email = 'you@example.com';
```

---

## Running

```bash
pnpm install
pnpm dev
```

App at `http://localhost:3000`.

| URL | Notes |
|---|---|
| `/` | Marketing landing (untouched) |
| `/signup` | Account creation (provisions a host on first signup) |
| `/login` | Login (the existing `/entrar` link still works — redirects here) |
| `/forgot-password` then `/reset-password` | Email-based recovery via Supabase |
| `/dashboard` | Host admin / staff dashboard |
| `/dashboard/reservations`, `/messages`, `/revenue`, `/properties`, `/settings` | Sub-pages |
| `/admin` | Super-admin (only visible to `role = super_admin`) |
| `/admin/hosts`, `/admin/properties`, `/admin/tablets` | Listings + creates |
| `/tablet/TAB-102` | Guest tablet — public, scoped by `tablet_code` |

After running the seed, browse to `/tablet/TAB-102` to see the guest UI for Marina's stay. `/tablet/TAB-304` and `/tablet/TAB-A12` work too.

---

## Roles

| Role          | Where it lives | What it can do |
|---------------|---------------|----------------|
| `super_admin` | `profiles.role` | Everything across all hosts. Lives at `/admin`. |
| `host_admin`  | `profiles.role` + `host_members.role` | Manage the host: properties, tablets, reservations, guides, extras, team, billing. Lives at `/dashboard`. |
| `host_staff`  | `host_members.role` | View reservations and messages, reply to guests. Cannot delete properties or manage team. Lives at `/dashboard`. |

RLS enforces these in the database. The UI doubles the check (e.g. team management UI is hidden for staff) but the database is the source of truth.

---

## Auth flow notes

- **Email confirmations**: by default Supabase requires email confirmation. Disable in **Supabase dashboard → Authentication → Providers → Email** if you want signups to log in instantly. Either way, `/auth/callback` handles the redirect.
- **Password reset**: `/forgot-password` calls `supabase.auth.resetPasswordForEmail` with `redirectTo = ${NEXT_PUBLIC_SITE_URL}/auth/callback?next=/reset-password`. Supabase emails a link; clicking it exchanges the code for a session and bounces the user to `/reset-password` where they pick a new password.
- **Logout**: any sidebar's "Sair" button posts to the `logoutAction` server action which signs out and redirects to `/login`.

---

## Tablet (guest) access

Tablet routes are unauthenticated. Each tablet is identified by its `tablet_code` (e.g. `TAB-102`). Everything the tablet reads/writes goes through server actions / server components that use the **service-role client** (`src/lib/supabase/admin.ts`) — RLS does not apply, so the server code is responsible for only exposing guest-safe data. The browser never receives a service-role key.

To test a tablet without an active stay, visit `/tablet/<CODE>` after seeding. The home screen, guides, web shortcuts and settings all render. Extras can be browsed but the "Pedir" button only enables when there is an active reservation linked to that tablet.

To "activate" a guest stay manually for testing:

```sql
update reservations
   set status = 'in_stay', check_in = current_date, check_out = current_date + 3
 where guest_name = 'Marina Souza';
```

---

## Project layout

```
src/
  app/
    (auth)/                  login, signup, forgot/reset password, auth actions
    (host)/dashboard/        host dashboard + sub-pages
    (admin)/admin/           super-admin
    (tablet)/tablet/         guest tablet
    auth/callback/           Supabase email-link landing
    entrar/                  redirects to /login (preserves landing link)
    page.tsx, recursos/, ... marketing landing (untouched)
  components/
    app/                     dashboard primitives (sidebars, cards, threads)
    landing/                 marketing components (untouched)
    ui/                      shadcn button
  lib/
    supabase/{browser,server,admin}.ts
    auth.ts, format.ts, utils.ts
    data/host.ts, data/tablet.ts
  types/db.ts
supabase/
  migrations/0001_schema.sql
  migrations/0002_rls.sql
  seed.sql
proxy.ts                     Next 16 route guard
```

---

## Things not built (intentional, scoped for later)

- Payments — pricing/billing pages are placeholders. Wire Stripe (or another gateway) into `extra_orders` and host plan billing when ready.
- Push / email notifications.
- PMS integrations (Stays, Hostaway, Airbnb sync). The reservation table is shaped for them; `source` and `tablet_id` are already there.
- Tablet realtime — guest/host messages refetch on send. Drop a Supabase Realtime subscription on `messages` filtered by `reservation_id` to make it live without polling.
- Image uploads for properties and guide items (the schema has `cover_image_url` / `image_url` ready).
