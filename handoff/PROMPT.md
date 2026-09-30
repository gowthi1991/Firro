You are working unattended overnight on the Firro marketing website in this repository
(github.com/gowthi1991/Firro). The owner will review your pull request tomorrow morning.
Do not ask any questions at any point — make the best decision, log it in
docs/DECISIONS.md, and keep going.

Read these first, fully, before writing any code:
1. CLAUDE.md (standing rules and hard limits)
2. handoff/docs/BUILD_BRIEF.md (scope, stack, responsive rules, acceptance criteria)
3. handoff/design/reference/firro-home-v3.html (the approved design — open it in a browser via
   Playwright and study every section, animation and SVG)
4. handoff/design/tokens.css and the files in handoff/brand/

Then:
1. Create branch `feat/marketing-site` from `main`. First commit: the `handoff/` folder and
   CLAUDE.md as-is ("chore: add design handoff").
2. Write a short plan to docs/PLAN.md mapping every item in BUILD_BRIEF §3–§13 to tasks.
3. Build the site section by section in the order of BUILD_BRIEF §3. After each section:
   build, compare against the reference at 1440px with Playwright screenshots, fix
   differences, commit.
4. Implement the responsive rules (§5) for every section and verify at 1280, 1024, 768, 390
   and 360. Commit.
5. Form stub, /privacy draft, /404, SEO, OG image, favicons, JSON-LD, sitemap (§7–§9). Commit.
6. Write the Playwright test suites and CI workflow (§11). Make everything pass. Commit.
7. Run Lighthouse if possible; save screenshots to docs/screenshots/; write README,
   DECISIONS.md, KNOWN_ISSUES.md and docs/PR_BODY.md with real results.
8. Push the branch and open the PR with `gh pr create` (fallback per §12).

Quality bar: this is the company's public face. Copy must be verbatim, visuals must match
the reference closely at desktop, and the mobile layout must feel designed, not squashed.
Before opening the PR, walk through the Definition of Done (§13) and tick or explain every
item in the PR body. When finished, print the PR URL (or compare URL) as your last line.
