# Firro marketing site — Build Brief (v1)

**Goal:** turn the approved design (`handoff/design/reference/firro-home-v3.html`) into a
production-quality, responsive static website in this repo, and open a pull request for
review. Frontend only — the backend (lead capture) comes later.

**Audience:** owners of tiffin services, subscription meal brands and cloud kitchens in
Coimbatore. Most will open the site from a WhatsApp link **on a budget Android phone**.
Mobile quality and speed matter as much as desktop fidelity.

---

## 1. Stack (decided — do not change)

| Concern | Choice |
|---|---|
| Framework | **Astro** (latest stable), static output, TypeScript strict |
| Styling | Plain CSS: `src/styles/tokens.css` (copy of `handoff/design/tokens.css`) + `global.css` + component-scoped `<style>` in `.astro` files |
| JS | Small vanilla TS modules in `src/scripts/`, loaded with Astro `<script>` (bundled). No React/Vue/Tailwind/jQuery |
| Fonts | Self-hosted via `@fontsource-variable/bricolage-grotesque`, `@fontsource-variable/manrope`, `@fontsource/jetbrains-mono` (500, 700). Latin subset. Preload the display font. `font-display: swap` |
| Tests | Playwright (`@playwright/test`) + `@axe-core/playwright` |
| Formatting | Prettier (+ `prettier-plugin-astro`) |
| Node | 20 LTS or newer; npm |
| Site URL | `https://getfirro.com` (Astro `site` config) |

## 2. Repository structure

```
src/
  config/site.ts          # SITE_URL, WHATSAPP_NUMBER (placeholder), CONTACT, SOCIAL — single source
  content/site.ts         # ALL page copy as typed objects, verbatim from the reference
  layouts/Base.astro      # <head>, SEO, fonts, skip link, Nav, Footer, WhatsApp FAB
  pages/index.astro       # composes the sections
  pages/privacy.astro     # draft privacy notice (see §8)
  pages/404.astro
  components/             # one component per section + shared pieces (see §3)
  components/illustrations/  # every inline SVG from the reference, as .astro components
  scripts/                # sequences.ts, reveal.ts, countdown.ts, fab.ts, form.ts, nav.ts
  lib/lead.ts             # submitLead() stub — backend later
  lib/analytics.ts        # track() no-op + data-event wiring — provider later
  styles/tokens.css, global.css
public/                   # favicons, manifest, og image, robots.txt
tests/                    # visual.spec.ts, responsive.spec.ts, a11y.spec.ts, behaviour.spec.ts
docs/                     # DECISIONS.md, KNOWN_ISSUES.md, PR_BODY.md, screenshots/
.github/workflows/ci.yml
```

Commit the `handoff/` folder unchanged as the first commit on the branch so reviewers
can see the source material.

## 3. Page anatomy (build in this order; one component each)

Match the reference exactly at 1440px: copy, spacing, type sizes, colours, radii,
shadows, SVGs, animation timings and easings.

1. **Nav** — sticky floating glass pill: `firro.` wordmark (text, not image), links
   (How it works, Batch cooking, Nutrition, Platform, FAQ → in-page anchors), "Book a demo".
2. **Hero** (`#top`) — "Now piloting in Coimbatore" chip; H1 "Firro plans tomorrow's prep from
   *today's subscriptions.*" (italic accent class `.acc`); sub-copy; CTAs "Book a demo" →
   `#demo`, "Chat on WhatsApp" → WhatsApp link; trust row (3 items).
   **Hero visual:** rings, gold orbiting dot, the power-bowl SVG that assembles item by
   item with steam, five orbiting nutrition chips (Protein 42g, Fibre 9g, Carbs 48g, Fat 16g,
   520 kcal — text stays upright), three story cards: subscription pause (07:12), prep sheet
   (Chicken power bowl 48→47 swap, "Ready" chip springs in), "Lunch is on the way" amber chip.
   "Sample data" caption.
3. **Live feed band** — "A day in the kitchen" label + one-line feed cycling 5 events (15s loop).
4. **Problem** — "Sound familiar?" + 3 numbered cards.
5. **How it works** (`#how`) — forest band, 4 step cards, timed sequence (marker travels the
   track, each card switches on). Plays once on first view.
6. **Batch cooking** (`#batch`) — copy + 4 checks + "See it with my numbers" → `#demo`;
   tickets fold into the prep sheet.
7. **Nutrition** (`#nutrition`) — meal card sequence (bowl assembles → linked-ingredients card →
   kcal counts 0→520 → bars fill → allergen chips pop). Plays once on first view.
8. **Platform** (`#platform`) — 4 app cards with illustration panels; then **Under the hood**
   bento: Subscriptions (live countdown ring to 21:00 local + cutoff boxes), Early warnings
   (dotted trend draws, amber pulse, "In progress" chip), Recipe costing (31%), GST (invoice
   number). "Sample data" caption.
9. **Pilot band** — forest/gold band, gold "Book a demo", 3 kitchen types.
10. **FAQ** (`#faq`) — 6 `<details>` items, first open.
11. **Demo** (`#demo`) — copy + 3 promises + form (see §7).
12. **Footer** — forest; wordmark, tagline, Product + Talk to us columns, © line, DPIIT line.
13. **WhatsApp FAB** — fixed bottom-right; collapses to an icon after 480px scroll, expands on
    hover/focus.

Put all copy in `src/content/site.ts`; components read from it. Put every inline SVG into
`src/components/illustrations/*.astro` unchanged (you may tidy attributes, never redraw).

## 4. Behaviour & motion (port faithfully)

- Every animation, keyframe, delay and easing in the reference is intentional — port them.
- One-time sequences (`.hseq`, `.nseq`, `.wseq`): add `.play` via IntersectionObserver with
  thresholds 0.6 / 0.45 / 0.35, then disconnect. No replays.
- Countdown: ticks every second to next 21:00 local; ring `--p` = elapsed fraction of 24h.
  Pause the interval when the tab is hidden (`visibilitychange`).
- Scroll-driven effects in the reference use `animation-timeline: view()` (Chromium only).
  **Required:** a fallback for Safari/Firefox. Wrap scroll-timeline CSS in
  `@supports (animation-timeline: view())`; otherwise reveal with IntersectionObserver
  adding `.in-view`. Content must never be invisible if JS fails: gate hidden initial
  states behind an `html.js` class set by an inline script in `<head>`.
- `prefers-reduced-motion: reduce`: keep every reduced-motion rule from the reference; all
  sequences render in their final state; the countdown still ticks.
- `@property --kc` counter: if unsupported, show "520" statically.
- No layout shift from animations (animate transform/opacity only; reserve sizes).

## 5. Responsive rules (the reference is desktop-only — you design the rest)

Breakpoints: **≥1280 desktop** (match reference) · **1024–1279 laptop** · **768–1023 tablet**
· **<768 mobile** (verify at 390 and 360). Use fluid type with `clamp()`.

| Area | Laptop | Tablet | Mobile |
|---|---|---|---|
| Gutter / section-y | 32 / 96 | 28 / 80 | 20 / 64 |
| H1 / H2 | 68 / 58 | 60 / 52 | 44 / 38 (line-height .98) |
| Nav | as desktop, tighter gaps | links hidden → menu button opens a sheet with the 5 links | wordmark + "Book a demo" (compact) + menu button; sheet is keyboard-accessible, closes on Esc/link tap |
| Hero | 2 columns, orbit 480px | stack: text then visual (orbit 440px) | text first; CTAs full-width stacked; trust row wraps. Visual: bowl + rings at ~300px with orbiting chips on a smaller ring; **story cards leave the orbit** and stack below as a vertical sequence (pause → prep sheet full width → delivery). Nothing overlaps, nothing clips at 360 |
| Live feed | as desktop | as desktop | label on its own line, feed wraps to 2 lines, hide "Sample kitchen" |
| Problem cards | 3 col | 1 col | 1 col |
| How it works | 4 col | 2×2, track hidden, nodes still light in order | **vertical timeline**: track runs down the left, marker travels down, cards stack |
| Batch | as desktop | stack: copy, then visual | show 3 tickets in a row, arrow points **down**, prep sheet full width |
| Nutrition | 2 col | stack (card first) | card full width; linked-ingredients card sits below, not overlapping |
| Platform apps | 4 col | 2 col | 1 col (illustration panel 160px tall) |
| Under the hood | bento as desktop | 2 col | 1 col; ring 240px; trend chart keeps aspect |
| Pilot band | 2 col | stack | stack, button full width |
| FAQ | 2 col | stack | stack |
| Demo form | 2 col | stack | stack; fields single column; inputs ≥16px font (no iOS zoom) |
| FAB | as desktop | as desktop | icon-only after hero; 56px; never covers the form submit button (hide while `#demo` form is in view) |

Tap targets ≥44×44. No horizontal scroll at any width from 320 to 1920.

## 6. Accessibility (WCAG 2.2 AA)

Landmarks (`header`, `nav`, `main`, `footer`), skip link to `#main`, exactly one H1, logical
heading order, visible `:focus-visible` ring (2px `--heritage`, offset 3px), all decorative
SVG `aria-hidden="true"`, meaningful ones `role="img"` + label, form labels + inline
error messages linked with `aria-describedby`, success message in an `aria-live="polite"`
region, FAQ via native `<details>/<summary>`, colour contrast ≥4.5:1 for text (gold-light
only on forest). axe must report **zero serious/critical** violations on `/` and `/privacy`.

## 7. Demo form (frontend only — backend later)

Fields as in the reference: Your name*, Phone* (Indian mobile: accept `+91`, spaces;
10 digits starting 6–9), Kitchen name*, City*, Meals a day* (select, options verbatim),
What do you use today? (optional), consent checkbox* linking to `/privacy`.
Add a visually hidden honeypot field. Validate on submit and on blur; show inline errors.
Submit calls `submitLead(payload)` from `src/lib/lead.ts`:

```ts
// TODO(backend): replace with real endpoint (Supabase/edge function + email/WhatsApp notify)
export async function submitLead(p: LeadPayload): Promise<{ ok: boolean }> {
  const url = import.meta.env.PUBLIC_LEAD_ENDPOINT;
  if (url) { const r = await fetch(url, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(p) }); return { ok: r.ok }; }
  console.info('[lead:stub]', p); await new Promise(r => setTimeout(r, 600)); return { ok: true };
}
```
Loading state on the button ("Booking…", disabled), success state exactly as reference
("Got it." panel), error state with retry + WhatsApp fallback link. Fire
`track('form_submit')`. Add `.env.example` with `PUBLIC_LEAD_ENDPOINT=`.

## 8. Pages, SEO & meta

- `/privacy` — **draft** privacy notice in site styling, with a visible "Draft — pending
  review" banner. Cover: what the demo form collects, why (to arrange a demo call),
  retention (until the enquiry is closed, max 12 months), no selling/sharing, how to
  request access/correction/deletion (contact placeholder), reference to India's Digital
  Personal Data Protection Act, 2023. Plain language. No invented company details beyond
  "Uyir AI Labs Pvt Ltd", Coimbatore.
- `/404` — on-brand, link home.
- Head: title "Firro — The operating system for subscription kitchens"; meta description
  (≤155 chars, from hero copy); canonical; `lang="en-IN"`; `theme-color` `#1F4A33`;
  Open Graph + Twitter card; `og.png` 1200×630 (forest background, cream wordmark from
  `handoff/brand/firro-logo-on-dark-tight.svg`, headline text) — generate once with a node
  script using `sharp` and commit the PNG.
- Favicons from `handoff/brand/firro-f-app-icon-forest.svg`: `favicon.svg`, 32px PNG,
  180px apple-touch-icon, 192/512 PNGs, `site.webmanifest`.
- JSON-LD: `Organization` (Uyir AI Labs Pvt Ltd, brand Firro), `WebSite`, `FAQPage` (6 Q&As verbatim).
- `@astrojs/sitemap`, `robots.txt` allowing all + sitemap URL.
- Analytics: none installed. Add `data-event` attributes (`book_demo_click`,
  `whatsapp_click`, `form_submit`) and a no-op `track()` for later.

## 9. Placeholders (centralise; list them in the PR)

- `WHATSAPP_NUMBER = '911234567890'` in `src/config/site.ts` → every WhatsApp link.
- Privacy notice text (draft), contact email placeholder `hello@getfirro.com` (TODO confirm).
- `PUBLIC_LEAD_ENDPOINT` (unset → stub).
- All "Sample data" content stays labelled exactly as in the reference.

## 10. Performance budgets (mobile, throttled)

LCP < 2.5s · CLS < 0.05 · TBT < 150ms · total JS < 20KB gzip · CSS < 70KB gzip · no raster
images on the page except favicons/OG. Target Lighthouse mobile: Performance ≥ 90,
Accessibility ≥ 95, Best Practices ≥ 95, SEO = 100. Run Lighthouse against `npm run preview`
if Chrome is available (`npx lighthouse … --preset=perf --form-factor=mobile`); record the
scores in the PR. If it can't run, say so in the PR.

## 11. Verification loop (do this per section, then for the whole page)

1. Serve the reference: `npx http-server handoff/design/reference -p 4400` (or any static server).
2. Playwright, viewport 1440×900, `reducedMotion: 'reduce'`, fonts loaded, countdown masked:
   screenshot the reference section and your section; compare. Iterate until they match
   closely (target `maxDiffPixelRatio` ≤ 0.03 per section; document any deliberate delta).
3. Screenshot your build at 1280, 1024, 768, 390, 360 — check for overflow, overlap, clipping.
4. Save final screenshots to `docs/screenshots/` (`desktop-<section>.png`, `mobile-<section>.png`,
   plus `desktop-full.png`, `mobile-full.png`).

### Tests to write (all must pass in `npm run test`)
- `visual.spec.ts` — section-by-section comparison against the reference at 1440 (with a
  documented tolerance).
- `responsive.spec.ts` — for each breakpoint: no horizontal scroll, no element overflowing the
  viewport, nav menu works on mobile, hero cards don't overlap on mobile.
- `behaviour.spec.ts` — sequences get `.play` when scrolled into view; countdown format
  `HH:MM:SS`; FAB collapses after scroll; FAQ toggles; form validation errors appear and the
  success state shows after a valid stub submit; reduced-motion renders final states.
- `a11y.spec.ts` — axe on `/` and `/privacy`: zero serious/critical.

CI: `.github/workflows/ci.yml` on PRs — `npm ci`, `npm run check`, `npm run build`,
`npx playwright install --with-deps chromium`, `npm run test`.

## 12. Git & PR

- Branch: `feat/marketing-site` from `main`. Conventional commits, one per working step, e.g.
  `chore: add design handoff`, `chore: scaffold astro`, `feat(tokens): …`, `feat(hero): …`,
  `feat(responsive): …`, `test: …`, `ci: …`, `docs: …`.
- Update `README.md`: what this is, how to run, structure, placeholders, how to deploy later
  (Vercel/Netlify static — do **not** deploy).
- When done: `git push -u origin feat/marketing-site`, then
  `gh pr create --base main --head feat/marketing-site --title "feat: Firro marketing site v1 (Heritage light v3)" --body-file docs/PR_BODY.md`.
  If `gh` is missing or unauthenticated, push the branch, keep `docs/PR_BODY.md`, and print the
  compare URL `https://github.com/gowthi1991/Firro/compare/main...feat/marketing-site`.
- `docs/PR_BODY.md` sections: Summary · What's included (by section) · Screenshots (relative
  links to `docs/screenshots/`) · Responsive approach · Test & Lighthouse results (real numbers) ·
  Decisions (link DECISIONS.md, top 5 inline) · Known issues · Placeholders to fill before
  launch · How to review locally (3 commands) · Backend TODOs.

## 13. Definition of Done

- [ ] Every section of the reference is built, copy verbatim, visuals match at 1440
- [ ] All motion ported; reduced-motion and no-JS states correct; Safari/Firefox fallbacks
- [ ] Responsive at 1280 / 1024 / 768 / 390 / 360, no overflow, mobile hero reworked per §5
- [ ] Form: validation, loading, success, error; stubbed submit; honeypot; consent → /privacy
- [ ] /privacy (draft banner), /404, SEO meta, OG image, favicons, manifest, JSON-LD, sitemap, robots
- [ ] `npm run check`, `npm run build`, `npm run test`, `npm run lint` all pass
- [ ] axe: zero serious/critical; Lighthouse numbers recorded (or reason why not)
- [ ] docs/DECISIONS.md, docs/KNOWN_ISSUES.md, docs/screenshots/, README updated
- [ ] CI workflow added; branch pushed; PR opened (or compare URL printed)
