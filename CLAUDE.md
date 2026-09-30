# CLAUDE.md — Firro marketing site

You are building the public marketing website for **Firro**, an operating system for
subscription and tiffin kitchens (Coimbatore, India). Domain: https://getfirro.com.
Owner: Gowtham (founder). He is asleep while you work. **Do not ask questions — decide,
log the decision, keep going.**

## Source of truth (in priority order)
1. `handoff/docs/BUILD_BRIEF.md` — scope, stack, responsive rules, acceptance criteria.
2. `handoff/design/reference/firro-home-v3.html` — the approved desktop design (1440px),
   runnable in a browser. Every word of copy, every colour, radius, shadow, animation
   timing and SVG illustration comes from this file. **Copy text verbatim.**
3. `handoff/design/tokens.css` — the design tokens extracted from the reference.
4. `handoff/brand/` — logo and icon files (SVG + PNG).

If the brief and the reference disagree, the reference wins for visuals and copy,
the brief wins for architecture, responsiveness, accessibility and process.

## Autonomy rules
- Never stop to ask. When something is ambiguous, choose the option closest to the
  reference, then append one line to `docs/DECISIONS.md` (what, why, how to change).
- If something fails 3 times in a row, stop fighting it: write it up in
  `docs/KNOWN_ISSUES.md` with what you tried, and move on to the next task.
- Work in small steps. Build and test after every section. Commit after every
  working section with a Conventional Commit message (`feat(hero): …`).
- Keep going until every item in the brief's Definition of Done is checked or logged.

## Hard limits
- Work only on branch `feat/marketing-site`. Never commit to or push `main`.
  Never force-push. Never merge the PR. Never deploy.
- No backend. No secrets, API keys or `.env` values committed. The demo form is
  frontend-only (see brief §7).
- Do not invent facts, customer names, metrics, prices or testimonials. Anything in
  the reference labelled "Sample data" stays labelled.
- Do not add stock photos, AI images, emoji or icon fonts. All imagery is the inline
  SVG illustrations from the reference.
- Do not add UI frameworks (React, Vue, Tailwind, component kits). Astro + plain CSS + small
  vanilla TypeScript only.
- Do not remove or weaken `prefers-reduced-motion` handling or accessibility features.

## Commands
- `npm run dev` — local dev server
- `npm run build` — production build (must pass with zero errors/warnings you introduced)
- `npm run check` — `astro check` type-check
- `npm run test` — Playwright (visual, responsive, a11y)
- `npm run lint` — Prettier check
