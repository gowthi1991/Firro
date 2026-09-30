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
