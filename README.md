# Firro — marketing site

The public website for **Firro**, the operating system for subscription and tiffin kitchens
(Coimbatore, India). It lives at <https://getfirro.com> once deployed.

It is an [Astro](https://astro.build) site with plain CSS and a few small vanilla TypeScript
modules, deployed on Vercel. Every page is prerendered; the only server code is one function,
`POST /api/lead`, which stores demo requests in Postgres (Neon) and emails the team (Resend).
There is no UI framework and no tracking. It is built from the approved
design in `handoff/design/reference/firro-home-v3.html` ("Heritage light v3").

## Run it

Requires Node 22.12+ (Astro 7). `.nvmrc` pins 22.

```bash
npm install
cp .env.example .env   # optional: fill in to exercise /api/lead locally
npm run dev            # http://localhost:4321 (pages + /api/lead)
```

Without `DATABASE_URL`, `/api/lead` answers 503 and the form shows its "didn't go through" state.
Set `PUBLIC_LEAD_ENDPOINT=stub` in `.env` to log submissions in the browser console instead.

| Command               | What it does                                                                                        |
| --------------------- | --------------------------------------------------------------------------------------------------- |
| `npm run dev`         | Local dev server                                                                                    |
| `npm run build`       | Production build (Vercel output in `.vercel/output/`)                                               |
| `npm run preview`     | Serve the prerendered pages statically (no `/api/lead`; use `npm run dev` or `vercel dev`)          |
| `npm run check`       | `astro check` (TypeScript, strict)                                                                  |
| `npm run lint`        | Prettier check (`npm run format` to fix)                                                            |
| `npm run test`        | Playwright: unit (lead validation/handler), visual, responsive, behaviour, a11y (run `build` first) |
| `npm run gen:assets`  | Regenerate favicons, app icons and `public/og.png` from `handoff/brand`                             |
| `npm run screenshots` | Regenerate `docs/screenshots/` (needs `npm run preview` running)                                    |

The first test run needs `npx playwright install chromium`.

## Structure

```
src/
  config/site.ts        # site URL, WhatsApp number, contact email, SEO defaults (placeholders marked TODO)
  content/site.ts       # all home-page copy, verbatim from the reference
  content/privacy.ts    # draft privacy notice text
  layouts/Base.astro    # <head>, SEO, fonts, JSON-LD, skip link, nav, footer, FAB
  pages/                # index, privacy, 404
  pages/api/lead.ts     # POST /api/lead — the only server-rendered route (Vercel function)
  server/               # lead handler, Neon store + Resend email (lead-deps.ts), email template
  components/           # one component per section + icons/ + illustrations/ (reference SVGs, unchanged)
  scripts/              # sequences, reveal fallback, countdown, FAB, nav sheet, form
  lib/                  # lead.ts (form → /api/lead), lead-schema.ts (zod), phone.ts, analytics.ts (no-op)
  styles/               # tokens.css (from handoff) + global.css
public/                 # favicons, manifest, og.png, robots.txt
migrations/001_leads.sql  # leads table (also applied automatically on the first request)
tests/                  # Playwright suites; tests/unit/ runs without a browser
handoff/                # design source material (reference, tokens, brand, brief)
docs/                   # PLAN, DECISIONS, KNOWN_ISSUES, PR_BODY, screenshots/
```

## Placeholders to fill before launch

| What            | Where                                     | Now                                                                                  |
| --------------- | ----------------------------------------- | ------------------------------------------------------------------------------------ |
| WhatsApp number | `WHATSAPP_NUMBER` in `src/config/site.ts` | `917845551223` (used by every WhatsApp link)                                         |
| Contact email   | `CONTACT.email` in `src/config/site.ts`   | `support@getfirro.com` (privacy page + JSON-LD)                                      |
| Lead capture    | Vercel env vars (see below)               | `/api/lead` built; needs `DATABASE_URL` etc.                                         |
| Privacy notice  | `src/content/privacy.ts`                  | draft text, banner removed for launch                                                |
| Analytics       | `track()` in `src/lib/analytics.ts`       | Vercel Web Analytics + Speed Insights (custom events need a plan that includes them) |
| Social profiles | `SOCIAL` in `src/config/site.ts`          | none (feeds JSON-LD `sameAs`)                                                        |

Everything labelled "Sample data" on the page is illustrative and stays labelled.

## Lead capture (`POST /api/lead`)

The demo form posts JSON to `/api/lead` (`src/lib/lead.ts` → `src/pages/api/lead.ts`). The function:

1. Rejects bodies over 5 KB (413) and malformed JSON (400).
2. Silently accepts and drops honeypot hits (hidden `website` field filled) with 200.
3. Validates with zod (`src/lib/lead-schema.ts`): name, Indian mobile (normalised to
   `+91XXXXXXXXXX`), kitchen, city, meals (one of `under-50`, `50-200`, `200-500`, `500-plus`),
   optional current tool, consent must be `true`. Errors come back as
   `{ ok: false, errors: { field: message } }` with 400, and the form shows them inline.
4. Allows at most 3 submissions per phone per 24h (429, shown as a friendly message).
5. Stores the lead in the `leads` table. Only a salted SHA-256 hash of the IP is kept, never the
   IP itself. The table is created on the first request if missing; `migrations/001_leads.sql` is
   the same SQL if you prefer to run it yourself.
6. Emails `LEAD_NOTIFY_EMAIL` via Resend with every field and a one-tap `wa.me` link. If the email
   fails, the lead is still saved, the visitor still sees "Got it.", and the error is logged.

Replies: `{ ok: true }` (200) · 400 validation · 413 too large · 429 rate limited · 503 no
`DATABASE_URL` · 500 database error.

## Deploying to Vercel (not done yet)

1. **Import the repo** in Vercel. Framework preset: Astro. Build command `npm run build`. Leave
   the output directory empty (the adapter writes `.vercel/output`). Node.js version: **22.x**.
2. **Create a Postgres database** on [Neon](https://neon.tech) (or via the Vercel → Storage →
   Neon integration, which sets `DATABASE_URL` for you). Optionally run `migrations/001_leads.sql`
   in the Neon SQL editor. Otherwise the first submission creates the table.
3. **Set up Resend**: create an API key, and verify `getfirro.com` as a sending domain so you can
   send from, e.g., `leads@getfirro.com`.
4. **Environment variables** (Production and Preview):

   | Variable               | Required | Example / notes                                                      |
   | ---------------------- | -------- | -------------------------------------------------------------------- |
   | `DATABASE_URL`         | yes      | `postgres://…neon.tech/neondb?sslmode=require`                       |
   | `RESEND_API_KEY`       | yes      | `re_…`                                                               |
   | `LEAD_NOTIFY_EMAIL`    | yes      | who gets new-lead emails; comma-separate several                     |
   | `LEAD_FROM_EMAIL`      | no       | `Firro leads <leads@getfirro.com>`; defaults to Resend's test sender |
   | `IP_HASH_SALT`         | no       | long random string, so stored IP hashes can't be reversed            |
   | `ZOHO_CRM_*` (3 vars)  | no       | optional Zoho CRM sync — see "Zoho CRM (optional)" below             |
   | `PUBLIC_LEAD_ENDPOINT` | no       | leave unset (defaults to `/api/lead`); `stub` disables sending       |

5. **Point `getfirro.com`** at the Vercel project. `site` in `astro.config.mjs` already uses that
   domain for canonical URLs, the sitemap and OG tags.
6. **Smoke test**: submit the form once on the preview URL, then check that the row exists in
   Neon and the email arrived.

## Zoho CRM (optional)

When `ZOHO_CRM_CLIENT_ID`, `ZOHO_CRM_CLIENT_SECRET` and `ZOHO_CRM_REFRESH_TOKEN` are all set, every
stored lead is also created as a **Lead** in Zoho CRM on the India data centre
(`accounts.zoho.in` / `www.zohoapis.in`):

| Zoho field             | Value                                                         |
| ---------------------- | ------------------------------------------------------------- |
| First Name / Last Name | the name, split on the last space (Zoho requires a last name) |
| Company                | kitchen name                                                  |
| Phone, Mobile          | `+91XXXXXXXXXX`                                               |
| City                   | city                                                          |
| Lead Source            | `Website`                                                     |
| Description            | meals range, current tool and the Firro lead id               |

A CRM failure never fails the form. The lead is already in Postgres, and the error shows in the
function logs as `[lead] CRM sync failed`. Leave the variables unset to switch the hook off.

**Create the self-client and refresh token (one-time):**

1. Sign in to <https://api-console.zoho.in> with the Zoho account that owns the CRM, then choose
   **Add Client → Self Client → Create**. Copy the **Client ID** and **Client Secret**.
2. Open the **Generate Code** tab. Enter the scope `ZohoCRM.modules.leads.CREATE`, pick 10 minutes,
   add a description, and click **Create**. Copy the **grant code**, which expires in 10 minutes.
3. Exchange the grant code for a refresh token in a terminal (fill in the three values):
   ```bash
   curl -s -X POST https://accounts.zoho.in/oauth/v2/token -d grant_type=authorization_code -d client_id=CLIENT_ID -d client_secret=CLIENT_SECRET -d code=GRANT_CODE
   ```
   The JSON response contains `refresh_token`. It doesn't expire, so treat it like a password.
4. Add `ZOHO_CRM_CLIENT_ID`, `ZOHO_CRM_CLIENT_SECRET` and `ZOHO_CRM_REFRESH_TOKEN` in Vercel
   (Production, and Preview if you want previews to sync) as sensitive variables, then redeploy.
5. In Zoho CRM, check that **Lead Source** has a `Website` option (Setup → Modules and Fields →
   Leads → Lead Source). Add it if it's missing.
6. Submit a test lead. The function log should show `[lead] CRM synced <id>`.

The API version is in `ZOHO_LEADS_URL` in `src/server/zoho-crm.ts`.

## Quality gates

CI (`.github/workflows/ci.yml`) runs lint, type-check, build and the Playwright suites on every
PR. The visual suite compares each home-page section with the reference at 1440px, and at most
3% of pixels may differ. See `docs/DECISIONS.md` for every deliberate difference from the design.
