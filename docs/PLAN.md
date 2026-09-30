# Build plan — Firro marketing site v1

Source of truth: `handoff/design/reference/firro-home-v3.html` (visuals + copy) and
`handoff/docs/BUILD_BRIEF.md` (architecture, responsive, a11y, process).
If a session stops, resume from the first unchecked item.

## 0. Setup

- [x] Branch `feat/marketing-site` from `main`; commit handoff (`chore: add design handoff`)
- [ ] Scaffold Astro (static, TS strict), Prettier, fonts, `src/styles/tokens.css` + `global.css` (§1–2)
- [ ] `src/config/site.ts` (URL, WhatsApp placeholder, contact) and `src/content/site.ts` (all copy, verbatim)

## 1. Sections, in brief §3 order (each: build → screenshot vs reference at 1440 → fix → commit)

- [ ] Nav (+ mobile menu sheet) - [ ] Hero (bowl SVG, orbit chips, 3 story cards)
- [ ] Live feed band - [ ] Problem
- [ ] How it works (`.hseq`) - [ ] Batch cooking (fold/nudge)
- [ ] Nutrition (`.nseq`, kcal counter) - [ ] Platform apps + Under the hood (`.wseq`, countdown)
- [ ] Pilot band - [ ] FAQ
- [ ] Demo form - [ ] Footer
- [ ] WhatsApp FAB

## 2. Behaviour & motion (§4)

- [ ] One-time sequences via IntersectionObserver (0.6 / 0.45 / 0.35), no replays
- [ ] Countdown to 21:00 local, pauses on hidden tab
- [ ] `animation-timeline: view()` behind `@supports`; IO `.in-view` fallback; hidden states gated on `html.js`
- [ ] Reduced motion: every reference rule kept, sequences final, countdown ticks
- [ ] `@property --kc` fallback shows 520

## 3. Responsive (§5) — verify 1280 / 1024 / 768 / 390 / 360

- [ ] Gutters, section spacing, H1/H2 scale per breakpoint
- [ ] Per-section rules from the §5 table (hero reflow, vertical timeline, tickets, bento, form…)
- [ ] No horizontal scroll 320–1920, tap targets ≥ 44px

## 4. Form, pages, SEO (§7–§9)

- [ ] Demo form: validation (submit + blur), honeypot, loading/success/error, `submitLead` stub, `track()`
- [ ] `/privacy` draft (banner), `/404`
- [ ] Head meta, OG image (sharp), favicons + manifest, JSON-LD, sitemap, robots
- [ ] `data-event` attributes + no-op analytics

## 5. Tests & CI (§11)

- [ ] visual.spec.ts, responsive.spec.ts, behaviour.spec.ts, a11y.spec.ts — all green
- [ ] `.github/workflows/ci.yml`

## 6. Wrap-up (§10, §12, §13)

- [ ] Lighthouse (mobile) numbers
- [ ] docs/screenshots, README, DECISIONS.md, KNOWN_ISSUES.md, PR_BODY.md
- [ ] Push branch, open PR
