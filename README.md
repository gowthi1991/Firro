# Firro — marketing site

The public website for **Firro**, the operating system for subscription and tiffin kitchens
(Coimbatore, India). It lives at <https://getfirro.com> once deployed.

It is a static [Astro](https://astro.build) site with plain CSS and a few small vanilla TypeScript
modules. There is no UI framework, no backend and no tracking. It is built from the approved
design in `handoff/design/reference/firro-home-v3.html` ("Heritage light v3").

## Run it

Requires Node 20+.

```bash
npm install
npm run dev        # http://localhost:4321
```

| Command               | What it does                                                            |
| --------------------- | ----------------------------------------------------------------------- |
| `npm run dev`         | Local dev server                                                        |
| `npm run build`       | Production build to `dist/`                                             |
| `npm run preview`     | Serve the production build                                              |
| `npm run check`       | `astro check` (TypeScript, strict)                                      |
| `npm run lint`        | Prettier check (`npm run format` to fix)                                |
| `npm run test`        | Playwright: visual, responsive, behaviour, a11y (run `build` first)     |
| `npm run gen:assets`  | Regenerate favicons, app icons and `public/og.png` from `handoff/brand` |
| `npm run screenshots` | Regenerate `docs/screenshots/` (needs `npm run preview` running)        |

The first test run needs `npx playwright install chromium`.

## Structure

```
src/
  config/site.ts        # site URL, WhatsApp number, contact email, SEO defaults (placeholders marked TODO)
  content/site.ts       # all home-page copy, verbatim from the reference
  content/privacy.ts    # draft privacy notice text
  layouts/Base.astro    # <head>, SEO, fonts, JSON-LD, skip link, nav, footer, FAB
  pages/                # index, privacy, 404
  components/           # one component per section + icons/ + illustrations/ (reference SVGs, unchanged)
  scripts/              # sequences, reveal fallback, countdown, FAB, nav sheet, form
  lib/                  # lead.ts (submit stub), analytics.ts (no-op track), phone.ts
  styles/               # tokens.css (from handoff) + global.css
public/                 # favicons, manifest, og.png, robots.txt
tests/                  # Playwright suites
handoff/                # design source material (reference, tokens, brand, brief)
docs/                   # PLAN, DECISIONS, KNOWN_ISSUES, PR_BODY, screenshots/
```

## Placeholders to fill before launch

| What                  | Where                                               | Now                                            |
| --------------------- | --------------------------------------------------- | ---------------------------------------------- |
| WhatsApp number       | `WHATSAPP_NUMBER` in `src/config/site.ts`           | `911234567890` (used by every WhatsApp link)   |
| Contact email         | `CONTACT.email` in `src/config/site.ts`             | `hello@getfirro.com` (privacy page + JSON-LD)  |
| Lead-capture endpoint | `PUBLIC_LEAD_ENDPOINT` env var (see `.env.example`) | unset → form logs to console (stub)            |
| Privacy notice        | `src/content/privacy.ts`                            | draft, shown with a "pending review" banner    |
| Analytics             | `track()` in `src/lib/analytics.ts`                 | no-op; `data-event` attributes already on CTAs |
| Social profiles       | `SOCIAL` in `src/config/site.ts`                    | none (feeds JSON-LD `sameAs`)                  |

Everything labelled "Sample data" on the page is illustrative and stays labelled.

## Backend (later)

The demo form calls `submitLead(payload)` in `src/lib/lead.ts`. Set `PUBLIC_LEAD_ENDPOINT` to any URL
that accepts a JSON `POST`, such as a Supabase edge function that stores the lead and notifies the
team on email or WhatsApp. Without it, the stub logs the payload and resolves successfully. The
payload is `{ name, phone (+91…), kitchen, city, meals, current_tool, consent, page, submitted_at }`.

## Deploying (not done yet)

The build output is fully static, so any static host works:

- **Vercel / Netlify**: framework "Astro", build command `npm run build`, output directory `dist`.
  Set `PUBLIC_LEAD_ENDPOINT` in the host's environment settings when the backend exists.
- Point `getfirro.com` at the host. `site` in `astro.config.mjs` already uses that domain for
  canonical URLs, the sitemap and OG tags.

## Quality gates

CI (`.github/workflows/ci.yml`) runs lint, type-check, build and the Playwright suites on every
PR. The visual suite compares each home-page section with the reference at 1440px, and at most
3% of pixels may differ. See `docs/DECISIONS.md` for every deliberate difference from the design.
