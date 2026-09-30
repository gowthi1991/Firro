## Summary

This PR builds the Firro marketing site v1 from the approved **Heritage light v3** design. It's a static Astro site with plain CSS and about 2.4 KB (gzipped) of vanilla TypeScript.

At 1440px every section matches the reference to within 0.16% of pixels, and most match exactly. Mobile, tablet and laptop layouts are designed per the brief. Every animation from the reference is ported, with reduced-motion and Safari/Firefox fallbacks. The demo form is frontend-only and uses a stubbed submit.

Nothing is deployed and nothing has been merged. `main` is untouched.

## What's included (by section)

| Section       | Notes                                                                                                                                                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Nav           | Floating glass pill with in-page links and "Book a demo". Below 1024px a menu button opens an overlay sheet (focus management, Esc / outside click / link tap to close).                                                       |
| Hero          | Word-by-word H1, bowl assembling item by item with steam, gold orbit dot, five upright orbiting nutrition chips. The three story cards (pause 07:12, prep sheet 48→47 swap with "Ready" spring, delivery) play when on screen. |
| Live feed     | Five events on a 15s loop. On mobile it wraps to two lines and hides "Sample kitchen".                                                                                                                                         |
| Problem       | Three numbered cards.                                                                                                                                                                                                          |
| How it works  | Forest band with a one-time timed sequence (marker travels, nodes and cards switch on). On mobile it's a measured vertical timeline.                                                                                           |
| Batch cooking | Checks and CTA. Tickets fold into the prep sheet; the arrow nudges, and points down on mobile.                                                                                                                                 |
| Nutrition     | One-time sequence: bowl, linked-ingredients card, kcal 0→520 (`@property`, static 520 fallback), bars, allergen chips.                                                                                                         |
| Platform      | Four app cards (reference SVGs) and the Under-the-hood bento: live countdown ring to 21:00 local (pauses when the tab is hidden), early-warning trend, 31% costing, GST invoice.                                               |
| Pilot band    | Forest/gold band, gold CTA, three kitchen types.                                                                                                                                                                               |
| FAQ           | Six native `<details>`, first open. Also emitted as FAQPage JSON-LD.                                                                                                                                                           |
| Demo form     | Inline validation on blur and submit, Indian mobile numbers (+91, spaces), honeypot, "Booking…" loading state, "Got it." success, error with retry and WhatsApp fallback, `track('form_submit')`, consent links to `/privacy`. |
| Footer        | Wordmark, tagline, Product / Talk to us columns, © and DPIIT line, plus a Privacy link.                                                                                                                                        |
| WhatsApp FAB  | Collapses after 480px of scroll. Hidden over the demo form. On mobile it's a 56px icon that stays clear of the hero CTAs.                                                                                                      |
| Pages & SEO   | `/privacy` (draft, with banner), `/404`, canonical, OG and Twitter tags, `og.png` 1200×630, favicons and manifest, Organization + WebSite + FAQPage JSON-LD, sitemap, robots.txt, `theme-color`, `lang="en-IN"`.               |

## Screenshots

|                | Desktop (1440)                                                                                                          | Mobile (390)                                                                                                                                                                                                                          |
| -------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Full page      | [desktop-full](https://github.com/gowthi1991/Firro/blob/feat/marketing-site/docs/screenshots/desktop-full.png?raw=true) | [mobile-full](https://github.com/gowthi1991/Firro/blob/feat/marketing-site/docs/screenshots/mobile-full.png?raw=true)                                                                                                                 |
| Hero           | ![](https://github.com/gowthi1991/Firro/blob/feat/marketing-site/docs/screenshots/desktop-hero.png?raw=true)            | ![](https://github.com/gowthi1991/Firro/blob/feat/marketing-site/docs/screenshots/mobile-hero.png?raw=true)                                                                                                                           |
| How it works   | ![](https://github.com/gowthi1991/Firro/blob/feat/marketing-site/docs/screenshots/desktop-how.png?raw=true)             | ![](https://github.com/gowthi1991/Firro/blob/feat/marketing-site/docs/screenshots/mobile-how.png?raw=true)                                                                                                                            |
| Batch          | ![](https://github.com/gowthi1991/Firro/blob/feat/marketing-site/docs/screenshots/desktop-batch.png?raw=true)           | ![](https://github.com/gowthi1991/Firro/blob/feat/marketing-site/docs/screenshots/mobile-batch.png?raw=true)                                                                                                                          |
| Nutrition      | ![](https://github.com/gowthi1991/Firro/blob/feat/marketing-site/docs/screenshots/desktop-nutrition.png?raw=true)       | ![](https://github.com/gowthi1991/Firro/blob/feat/marketing-site/docs/screenshots/mobile-nutrition.png?raw=true)                                                                                                                      |
| Platform       | ![](https://github.com/gowthi1991/Firro/blob/feat/marketing-site/docs/screenshots/desktop-platform.png?raw=true)        | ![](https://github.com/gowthi1991/Firro/blob/feat/marketing-site/docs/screenshots/mobile-platform.png?raw=true)                                                                                                                       |
| Demo form      | ![](https://github.com/gowthi1991/Firro/blob/feat/marketing-site/docs/screenshots/desktop-demo.png?raw=true)            | ![](https://github.com/gowthi1991/Firro/blob/feat/marketing-site/docs/screenshots/mobile-demo.png?raw=true)                                                                                                                           |
| Menu / privacy | —                                                                                                                       | [menu](https://github.com/gowthi1991/Firro/blob/feat/marketing-site/docs/screenshots/mobile-menu.png?raw=true) · [privacy](https://github.com/gowthi1991/Firro/blob/feat/marketing-site/docs/screenshots/mobile-privacy.png?raw=true) |

The rest of the sections are in [`docs/screenshots/`](https://github.com/gowthi1991/Firro/tree/feat/marketing-site/docs/screenshots).

## Responsive approach

- Breakpoints are ≥1280 (matches the reference), 1024–1279, 768–1023 and <768. The type scale steps through the brief's H1/H2 values (80/68 → 68/58 → 60/52 → 44/38) and uses `clamp()` inside the mobile range. Gutter and section spacing are 44/100 → 32/96 → 28/80 → 20/64.
- **Mobile hero:** text first, full-width stacked CTAs, then a 300px bowl and rings with the chips on a smaller ring. The story cards leave the orbit and stack below as a thread: pause → full-width prep sheet → delivery.
- **Tablet:** sections stack, the hero orbit is 440px with the story cards spread outwards, how-it-works is 2×2 with nodes still lighting in order, and the bento is 2 columns.
- There's no horizontal overflow from 320 to 1920px on `/`, `/privacy` and `/404` (tested). Tap targets are at least 44px and inputs use 16px text on mobile (tested).

## Test & Lighthouse results

`npm run lint` ✅ · `npm run check` ✅ (0 errors, 0 warnings, 0 hints) · `npm run build` ✅ (no warnings) · `npm run test` ✅ **69/69 passed**

| Suite              | Tests | What it covers                                                                                                                                                                                       |
| ------------------ | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| visual.spec.ts     | 12    | Each section vs the reference at 1440×900, reduced motion, same local fonts, countdown masked, ≤3% pixels                                                                                            |
| responsive.spec.ts | 31    | No overflow at 8 widths × 3 pages, menu sheet at 390/768, hero cards don't overlap at 360/390, tap targets, input font size                                                                          |
| behaviour.spec.ts  | 17    | `.play` on scroll, kcal 520, countdown format + fixed-clock value, FAB collapse/hide, FAQ, form validation/success/error/honeypot, reduced-motion final states, no-JS visibility, `data-event` hooks |
| a11y.spec.ts       | 9     | axe (WCAG 2.2 AA tags) on `/`, `/privacy`, `/404` at 1440 and 390: **0 serious/critical**; landmarks, one H1, skip link, decorative SVGs hidden, heading order                                       |

**Visual diff vs reference at 1440px** (pixelmatch, threshold 0.1):

| Section   | Height ref / build (px) | Pixels differing                   |
| --------- | ----------------------- | ---------------------------------- |
| nav       | 66 / 66                 | 0.00%                              |
| hero      | 945 / 945               | 0.03%                              |
| feed      | 60 / 60                 | 0.00%                              |
| problem   | 818 / 818               | 0.00%                              |
| how       | 701 / 701               | 0.11% (gold nodes, see decision 3) |
| batch     | 921 / 921               | 0.00%                              |
| nutrition | 837 / 837               | 0.00%                              |
| platform  | 1874 / 1874             | 0.00%                              |
| pilot     | 441 / 441               | 0.00%                              |
| faq       | 724 / 724               | 0.00%                              |
| demo      | 811 / 811               | 0.16%                              |
| footer    | 376 / 376               | 0.01% (added Privacy link)         |

**Lighthouse 12** (mobile, simulated throttling, against `astro preview`):

| Page       | Performance | Accessibility | Best practices | SEO | LCP   | CLS   | TBT  |
| ---------- | ----------- | ------------- | -------------- | --- | ----- | ----- | ---- |
| `/`        | 98          | 100           | 100            | 100 | 2.3 s | 0.001 | 0 ms |
| `/privacy` | 99          | 100           | 100            | 100 | 1.8 s | 0.012 | 0 ms |

**Budgets:** JS is 2.4 KB gzipped (budget 20 KB). CSS is about 12 KB gzipped (budget 70 KB). The only raster images are the favicons and the OG image.

**Cross-browser:** the scroll-reveal fallback was checked by hand in Playwright Firefox 155, which has no `animation-timeline`: all 47 reveal elements appear on scroll and there are no errors. WebKit and Chromium use native scroll-driven animations. CI runs Chromium.

## Decisions

The full list of 32 is in [docs/DECISIONS.md](https://github.com/gowthi1991/Firro/blob/feat/marketing-site/docs/DECISIONS.md). The top five:

1. **The tickets-fold animation is implemented even though it never ran in the reference.** A stray `}` there made browsers drop the `.fold` rule, and brief §3.6 asks for the fold.
2. **Timeline nodes stay gold under reduced motion.** In the reference's cascade they turn green on the forest band once the sequence plays; gold is the sequence's real final state.
3. **Mobile batch tickets show all six, three per row.** Showing only three would make "… and 136 more" wrong (6 + 136 = 142).
4. **Mobile "How it works" is a vertical timeline measured in JS.** Card heights vary, so each card switches on when the marker actually reaches its node.
5. **The FAB hides over the demo form at every width**, and on mobile it also hides while the hero's own WhatsApp CTA is visible.

## Known issues

These are in [docs/KNOWN_ISSUES.md](https://github.com/gowthi1991/Firro/blob/feat/marketing-site/docs/KNOWN_ISSUES.md). In short:

- The placeholders below are live.
- The privacy notice is a draft.
- The countdown uses the visitor's local clock, as in the reference, not IST.
- Two overlaps from the approved design are kept: the hero prep card over "Carbs", and the nutrition link card over "9g".
- Tests run in Chromium only; Firefox and WebKit were checked once by hand.
- Lighthouse numbers come from localhost.

## Placeholders to fill before launch

- [ ] `WHATSAPP_NUMBER` in `src/config/site.ts` is `911234567890`. Every WhatsApp link reads from it.
- [ ] `CONTACT.email` in `src/config/site.ts` is `hello@getfirro.com` (TODO confirm). It's used on the privacy page and in JSON-LD.
- [ ] `PUBLIC_LEAD_ENDPOINT` env var is unset, so the form uses the console stub. See `.env.example`.
- [ ] The privacy notice in `src/content/privacy.ts` needs legal review, then remove the draft banner.
- [ ] Analytics: pick a provider and wire `track()` in `src/lib/analytics.ts`. The `data-event` attributes are already on the CTAs.

## How to review locally

```bash
npm install
npm run build && npm run preview   # http://localhost:4321
npx playwright install chromium && npm run test
```

## Backend TODOs

- [ ] Lead capture: implement an endpoint (for example a Supabase edge function) that accepts the JSON `POST` from `submitLead()` in `src/lib/lead.ts`, stores it, and notifies the team by email or WhatsApp. Then set `PUBLIC_LEAD_ENDPOINT`.
- [ ] Server-side validation and rate limiting on that endpoint. The honeypot is only a first filter.
- [ ] Retention job: delete leads 12 months after submission, per the draft privacy notice.

## Definition of Done

- [x] Every section of the reference is built, copy is verbatim, and visuals match at 1440 (≤0.16% per section)
- [x] All motion is ported; reduced-motion and no-JS states are correct; Safari/Firefox fallbacks work
- [x] Responsive at 1280 / 1024 / 768 / 390 / 360 with no overflow; mobile hero reworked per §5
- [x] Form: validation, loading, success, error; stubbed submit; honeypot; consent → /privacy
- [x] /privacy (draft banner), /404, SEO meta, OG image, favicons, manifest, JSON-LD, sitemap, robots
- [x] `npm run check`, `npm run build`, `npm run test`, `npm run lint` all pass
- [x] axe: 0 serious/critical; Lighthouse numbers recorded
- [x] docs/DECISIONS.md, docs/KNOWN_ISSUES.md, docs/screenshots/, README updated
- [x] CI workflow added; branch pushed; PR opened

🤖 Generated with [Claude Code](https://claude.com/claude-code)
