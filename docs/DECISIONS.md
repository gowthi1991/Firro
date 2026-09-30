# Decisions

One line each: **what** — why — how to change.

## Process

1. **Built in the handoff folder, turned into a clone** (`git init` + fetch `origin/main`, branch `feat/marketing-site`) instead of a separate fresh clone — the folder already had the repo-root layout (`CLAUDE.md` + `handoff/`) and `main` only held a README. — To redo in a fresh clone, follow `handoff/RUN.md`.

## Fidelity to the reference

2. **`.fold` (tickets fold into the prep sheet) is implemented even though it never ran in the reference** — the reference has a stray `}` after `@keyframes fold`, so browsers drop the `.fold` rule; the brief (§3.6) asks for the fold. — Remove the `@supports` `.fold` block in `Batch.astro` to match the reference exactly.
3. **Timeline nodes on the forest band stay gold under reduced motion** — in the reference, `.play .hnode { background:#2E6B47 }` wins the cascade once the sequence plays, turning the nodes green on green; gold is the sequence's own final state (`hnodeG`) and the brief asks for final states. This is the only visible delta in `how` (0.13% of pixels). — `HowItWorks.astro`, reduced-motion block.
4. **Unused reference CSS not ported**: `.lit`, `.bar`, `.line-draw`, `.ringchart`, `.tick`, `.path`, `.seg`, `.icon` (and their keyframes) are defined but never used in the reference markup. — Port from the reference `<style>` if a later design uses them.
5. **Orbit arms are zero-width lines instead of full-size squares** — same rotation centre and chip positions, but the invisible rotated square corners widened the page (horizontal scroll at ≤1280). — `.arm` in `Hero.astro`.
6. **Hero word-by-word rise also stops under reduced motion** — in the reference those animations are inline styles, which escaped its reduced-motion rule. — `.w` in `Hero.astro`.
7. **Second cost bar keeps the reference's effective 200ms delay** (its inline `animation-delay` overrides the 600ms class delay). — `.play .wbar.w2` in `Platform.astro`.
8. **Hero story sequence (pop-ins, 48→47 swap, "Ready" chip) waits until the cards are on screen** — on mobile they sit below the fold and would otherwise finish unseen. Desktop is unchanged (they're in view on load). — `:global(html.js) .story:not(.play)` in `Hero.astro`; threshold in `sequences.ts`.
9. **kcal number exposed as a visually-hidden "520" + `aria-hidden` counter** instead of the reference's `role="text"` (not a valid ARIA role); diet mark gets `role="img"`. — `Nutrition.astro`.
10. **Footer bottom row gains a "Privacy" link** — the privacy notice needs a persistent entry point beyond the form's consent line. — `Footer.astro`.

## Responsive (the reference is desktop-only)

11. **Stepped type scale per breakpoint** using the brief's exact H1/H2 values (80/68 → 68/58 → 60/52 → 44/38); `clamp()` only inside the mobile range so 320–390 scale smoothly. Other headings scale in proportion. — `:root` media blocks at the top of `global.css`.
12. **Hero story-card offsets tighten below 1440** (`.prep` right −16% → −5% at 1280–1439, smaller at laptop) so nothing leaves the viewport; on tablet the cards spread further out so they don't cover the orbit chips. — `Hero.astro` responsive block.
13. **Mobile hero**: 300px orbit with chips on a ring at 12% inset (12px chips); story cards leave the orbit and stack pause (left) → prep sheet (full width) → delivery (right), like a message thread. — `Hero.astro` `@media (max-width: 767px)`.
14. **Mobile "How it works" is a vertical timeline whose length and node timings are measured in JS** — card heights vary, so each card switches on when the marker actually reaches its node. — `initVerticalTimeline()` in `sequences.ts`.
15. **Mobile batch tickets: all six, three per row** (id above dish) — keeps "… and 136 more" arithmetically true (6 + 136 = 142). — `Batch.astro`.
16. **Tablet bento**: Early warnings spans the full width (the trend chart needs it), Subscriptions tall on the left, Costing and GST stacked on the right. — `Platform.astro` `@media (max-width: 1023px)`.
17. **Live feed wraps to two lines from tablet down** (the one-liner didn't fit at 768); "Sample kitchen" hides only on mobile per the brief. — `LiveFeed.astro`.
18. **Laptop nutrition**: 6/6 columns and the "linked ingredients" card sits over the Fibre row (as at desktop) rather than covering the allergen chips. — `Nutrition.astro`.
19. **Menu sheet overlays the page** (absolute under the pill) rather than pushing content down; focus moves to the first link, Esc / outside click / link tap close it and return focus. — `Nav.astro`, `nav.ts`.
20. **WhatsApp FAB**: hides while the demo form is in view at every width (not just mobile) so it never covers "Book my demo"; on mobile it also hides while the hero CTAs (which include "Chat on WhatsApp") are visible and is always the 56px icon when shown. Desktop keeps the reference behaviour (collapses after 480px). — `fab.ts`.

## Behaviour, a11y & form

21. **`html.js` gate with a 3s safety net** — the inline head script adds `js`; if the bundled module never marks `js-ready`, the class is removed so nothing stays hidden. — `bootScript` in `Base.astro`.
22. **Safari/Firefox fallback**: `animation-timeline: view()` rules live in `@supports`; otherwise `reveal.ts` adds `.in-view` (fade/rise with the same stagger; fold and nudge play once). Verified in Firefox 155 (fallback path) and WebKit (native). — `global.css`, `Batch.astro`, `reveal.ts`.
23. **Form copy not in the reference was written for errors, loading and failure** ("Please enter your name.", "Booking…", "That didn't go through…"). Labels stay verbatim (no asterisks — required state is announced via `aria-required`). — `demo.errors` / `demo.failure` in `src/content/site.ts`.
24. **Phone is normalised to `+91XXXXXXXXXX`** before `submitLead`; payload also carries `page` and `submitted_at`. — `form.ts`, `lib/phone.ts`, `lib/lead.ts`.
25. **Honeypot hits get the success screen but nothing is sent.** — `form.ts`.
26. **The Under-the-hood countdown counts to 21:00 in Asia/Kolkata (IST) for every visitor**, not the visitor's local 21:00 as in the reference and brief §4 — owner's call: the cut-off is the kitchens' time in Coimbatore. Uses a fixed UTC+05:30 offset (India has no DST); the "AT 21:00" label is unchanged. Tested in four timezones. — `secondsUntilLock()` in `src/scripts/countdown.ts`.
27. **Error-state test forces a failure by making the stub's `console.info` throw** — avoids adding a test-only hook to production code. — `tests/behaviour.spec.ts`.

## SEO, assets, tooling

28. **Meta description is the hero line + a condensed sub-copy (153 chars)** — brief limit is 155. — `SEO.description` in `src/config/site.ts`.
29. **OG image is laid out in HTML and captured with Playwright, then compressed with sharp** — sharp/librsvg can't render the brand fonts for the headline; the wordmark is the brand SVG. — `scripts/generate-assets.mjs` (`npm run gen:assets`).
30. **Fonts self-hosted as Latin-only subsets**; Bricolage uses the `opsz` variable file to match the reference's Google Fonts request. JetBrains Mono ships 500/700 only, so `font-weight:600` renders as 700 — same as the reference. — `Base.astro`.
31. **404 has its own copy ("This dish isn't on the menu.") and no canonical (`noindex`).** — `src/pages/404.astro`.
32. **Visual tests serve the reference's Google Fonts from the local @fontsource files** — hermetic in CI, identical binaries on both sides. — `tests/helpers.ts`.
33. **CI also runs `npm run lint`** in addition to the brief's steps. — `.github/workflows/ci.yml`.
34. **Node 22.12+ instead of Node 20** — Astro 7 (latest stable, brief §1) refuses to run on Node 20; the brief allows "20 LTS or newer". CI, `engines` and `.nvmrc` use 22. — `.github/workflows/ci.yml`, `package.json`.

## Lead capture backend (`feat/lead-backend`)

35. **One Vercel function, everything else prerendered** — `@astrojs/vercel` with `output: 'static'`; only `src/pages/api/lead.ts` sets `prerender = false`. — `astro.config.mjs`.
36. **Framework-free handler with injected dependencies** (`createLeadHandler({ store, notify, hashIp, log })`) so validation, rate limiting, honeypot and email-failure paths are unit-tested without a database. — `src/server/lead-handler.ts`; production wiring in `src/server/lead-deps.ts`.
37. **Server error messages reuse the form's copy** (`demo.errors` in `src/content/site.ts`), so a 400 can be shown inline without translation, and client and server always agree. — `src/lib/lead-schema.ts`.
38. **Oversized bodies get 413, not 400** — 413 is the accurate status; the body is still `{ ok:false, errors:{ form } }`. The declared `Content-Length` is checked before reading, and the actual byte length after. — `lead-handler.ts`.
39. **No `DATABASE_URL` → 503** (the form shows its "didn't go through" state with the WhatsApp fallback) rather than pretending success; losing leads silently is worse. — `lead-handler.ts`.
40. **The IP hash is salted** — `SHA-256(IP_HASH_SALT + ip)`. An unsalted hash of an IPv4 address can be reversed by brute force; set `IP_HASH_SALT` in Vercel. It's optional so a missing salt never breaks submissions. — `lead-deps.ts`.
41. **Table created lazily from the migration file itself** — `migrations/001_leads.sql` is imported with `?raw`, split on statement-ending semicolons and run once per function instance (`CREATE … IF NOT EXISTS`); a failure retries on the next request. One SQL source, no drift. Adds an index on `(phone, created_at)` for the rate-limit query. — `lead-deps.ts`.
42. **Rate limit = count query before insert** (3 per phone per 24h), as specified. Not atomic: a burst of parallel requests could store a 4th; acceptable for a demo form. — `lead-handler.ts`.
43. **Resend called with `fetch`, no SDK** — one POST, one less dependency. The email is awaited with an 8s timeout (Vercel may freeze a function after it responds); failures are logged and the visitor still gets `{ ok:true }`. — `lead-deps.ts`.
44. **Default sender `onboarding@resend.dev`** so it works before the domain is verified; set `LEAD_FROM_EMAIL` once `getfirro.com` is verified in Resend. — `.env.example`, README.
45. **`PUBLIC_LEAD_ENDPOINT` defaults to `/api/lead`; `stub` keeps the old console stub** for local work without a database. — `src/lib/lead.ts`.
46. **The form now sends the honeypot field (`website`)** so the server can drop direct bot POSTs too; the browser still drops filled honeypots without sending. `maxlength` on inputs mirrors the server limits. — `form.ts`, `Demo.astro`.
47. **Unit tests use the Playwright runner** (`tests/unit/`, no browser) instead of adding Vitest — one runner, one CI step. — `tests/unit/lead.spec.ts`.
48. **Tests and `npm run preview` serve `.vercel/output/static` with http-server** — the Vercel adapter doesn't support `astro preview`. Form tests mock `/api/lead` with `page.route()`. Use `npm run dev` (or `vercel dev`) to exercise the real function locally. — `playwright.config.ts`, `package.json`.
49. **Privacy draft names the processors** (Vercel, Neon, Resend), the hashed IP and browser type, possible processing outside India, and deletion of notification emails at the 12-month limit. Still a draft pending legal review. — `src/content/privacy.ts`.

## Vercel project `getfirro`

50. **Project Node.js version set to 22.x** (it was 24.x) to match CI, `.nvmrc` and `engines`. Changed through the Vercel API (`PATCH /v9/projects/getfirro`). — Vercel → Settings → General.
51. **Functions pinned to Mumbai (`bom1`)** in `vercel.json`, next to the Coimbatore audience. — `vercel.json`.
52. **`IP_HASH_SALT` is a different random value for Production and Preview.** Production was added first and is sensitive, so it can't be read back to reuse. Separate salts also keep preview hashes unlinkable to production ones. Both values were generated with `openssl rand -hex 32` and passed on stdin (Preview through the Vercel API), never on the command line or in output. — Vercel env.
53. **`LEAD_FROM_EMAIL` is not marked sensitive** (it's an address, not a secret), so it stays readable in the dashboard. — Vercel env.
54. **The function logs a lead's id on insert (`[lead] stored <id>`), `[lead] notified <id>` after an email, and the Neon region once per cold start.** The Neon integration's variables are sensitive, so their values can't be read by the CLI, API or `vercel env run`; function logs are the only place to confirm storage and region from outside. No personal data is logged. — `lead-handler.ts`, `lead-deps.ts`, `neon-region.ts`.
55. **Domains added through the Vercel API**, because `vercel domains add` refuses while the latest production deployment (from `main`, which only has a README) is in error. The API accepted both domains. — Vercel → Settings → Domains.
56. **`www.getfirro.com` 308-redirects to `getfirro.com`** so there's one canonical host, matching the canonical URLs, sitemap and OG tags. — Vercel → Domains → www.getfirro.com.
57. **End-to-end test ran against the preview through `vercel curl`** (it handles deployment protection, so no bypass secret was created or stored). Storage and email were confirmed from function logs, because the database can't be queried from outside Vercel (see decision 54).

## Security headers & analytics

58. **`regions` left at `bom1`**: the function log after a fresh deploy still reports the Neon database in `us-east-1`, so it hasn't been recreated in Mumbai or Singapore yet. Once it has, set `bom1` (Mumbai) or `sin1` (Singapore) in `vercel.json` and check the `[lead] database region:` log line. — `vercel.json`.
59. **The CSP allows the one inline script (the boot script) by SHA-256 hash, not `'unsafe-inline'`.** The script now lives in `src/config/boot-script.ts`, and `tests/security.spec.ts` fails with the new hash if it changes. — `vercel.json`.
60. **`style-src` keeps `'unsafe-inline'`**: the reference design uses many `style=""` attributes (animation delays, orbit angles, bar widths), which can't be hashed. Scripts stay locked down. — `vercel.json`.
61. **No `upgrade-insecure-requests`**: every resource is same-origin, HSTS already forces HTTPS, and it would break the local HTTP test server. — `vercel.json`.
62. **Vercel's preview toolbar (`vercel.live`) is not allowed by the CSP**, per the brief ("only self, the fonts, and Vercel Analytics"). It won't load on previews. Add `https://vercel.live` to `script-src`/`frame-src`/`connect-src` if you want it. — `vercel.json`.
63. **Tests and `npm run preview` use `scripts/serve-static.mjs`**, which applies the `vercel.json` headers, so the CSP is tested locally. The Playwright site server never reuses an already-running server: a stray `npm run dev` on port 4321 was being tested instead of the build. — `playwright.config.ts`.
64. **Analytics is injected from the bundled script, not the Astro components**, so no new inline scripts need CSP hashes. It isn't injected on localhost (there are no `/_vercel` routes there). `track()` removes the `?text=` from WhatsApp hrefs before sending. Custom events are only recorded on a Vercel plan that includes them. — `src/lib/analytics.ts`.
65. **The Zoho CRM hook and the prefilled WhatsApp links are deferred to a later PR, at the owner's request.** The Zoho work is kept on the local branch `feat/zoho-crm`, which is not pushed. — n/a.

## Post-launch fixes (`fix/post-launch`)

66. **The privacy page's "Draft prepared September 2026" line became "Last updated September 2026"**, along with the requested title and meta-description fixes, since it's the same draft leftover the owner removed the banner for. The code comment in `privacy.ts` no longer says DRAFT. — `src/content/privacy.ts`.
67. **The prefilled WhatsApp message is set once as `WHATSAPP_MESSAGE` and fully percent-encoded** (`encodeURIComponent` plus `'` → `%27`), so every link built from `WHATSAPP_URL` gets it. The `wa.me` link in the lead-notification email is not prefilled: it messages the lead, not Firro. — `src/config/site.ts`.
68. **The Zoho CRM hook came over unchanged from `feat/zoho-crm`.** The API version is `v8` (`ZOHO_LEADS_URL`), which should be confirmed on the first live sync. If Zoho rejects `Lead_Source: "Website"`, add that picklist value (README step 5). The CRM sync runs alongside the email (`Promise.allSettled`), so neither can delay or fail the other. — `src/server/zoho-crm.ts`.
69. **"Sample data check" was read as an automated test, with no homepage change.** `tests/sample-data.spec.ts` asserts the four "Sample data" labels (hero, batch note, nutrition, platform) are present and visible at 1440 and 390, that there are exactly four, and that "Sample kitchen" shows on desktop and is hidden on mobile. — `tests/sample-data.spec.ts`.
70. **`engines.node` is `^22.12.0`**: it keeps Vercel on Node 22 (an open `>=` range made Vercel ignore the project's 22.x setting, build on 24.x, and it would silently upgrade on the next major) and keeps Astro 7's 22.12 minimum. `22.x` was tried first but let Node 22.0–22.11 pass. Local development on another major gets an `EBADENGINE` warning; the README says to `nvm use` the pinned 22. — `package.json`, `README.md`.
71. **esbuild's postinstall is approved by name** (`"allowScripts": { "esbuild": true }`), written by `npx npm@latest install-scripts approve esbuild --no-allow-scripts-pin`, so future esbuild versions stay approved. The npm 12 docs say a name-only entry "matches every installed version"; the default pinned form (`esbuild@0.28.2`) would warn again on every esbuild bump. The local npm 11 has no `install-scripts` command, hence `npx npm@latest`. — `package.json`.
