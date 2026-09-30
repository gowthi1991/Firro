# Known issues

Nothing here blocks review. Items are ordered by how much they matter before launch.

1. **Placeholders are live.** WhatsApp number `911234567890`, contact email `hello@getfirro.com`, and the lead endpoint (unset → console stub) are all placeholders. See "Placeholders" in the README.
2. **Privacy notice is a draft** with a visible banner. It needs legal review (retention period, processor list, grievance contact) before launch.
3. **Two overlaps exist in the approved desktop design and were kept.** The hero prep-sheet card covers part of the "Carbs" orbit chip, and the nutrition "linked ingredients" card covers the Fibre "9g" value. Both are the same in the reference.
4. **Automated tests run in Chromium only**, which is what CI installs. The Safari/Firefox scroll-reveal fallback was checked by hand in Playwright's WebKit and Firefox builds (all 47 reveal elements show on scroll, no console errors). A real iPhone and a low-end Android haven't been tried.
5. **Lighthouse was run against `astro preview` on localhost** with simulated mobile throttling. Numbers on the production host and CDN will differ a little.
6. **Bricolage Grotesque has no italic**, so the italic accents are synthesised by the browser. This matches the reference.
7. **The mobile FAB (56px, bottom-right) floats over content as you scroll**, for example the last value in a card. It hides over the hero CTAs and the demo form. Everywhere else, the overlap is the usual trade-off for a floating button.
8. **`npm audit` reports 3 high-severity advisories** (`path-to-regexp` ReDoS, GHSA-9wv6-86v2-598j) through `@astrojs/vercel` → `@vercel/routing-utils`. That code runs at build time to generate routing config and never sees request input. The only offered fix downgrades the adapter three majors (`npm audit fix --force` → 8.0.4), which would break the build. Revisit when the adapter updates.
9. **Lead capture hasn't run against real Neon or Resend.** No credentials exist yet. Unit tests cover the handler with an in-memory store, and the browser tests mock `/api/lead`. Do the smoke test in the README after setting the Vercel env vars.
10. **The rate limit isn't atomic.** It counts then inserts, so a burst of parallel requests for one number could store a 4th lead. That's fine for a demo form.
11. **A slow Resend adds up to 8s** before the visitor sees "Got it." (the email is awaited with a timeout, then logged if it fails).
