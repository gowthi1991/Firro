# Known issues

Nothing here blocks review. Items are ordered by how much they matter before launch.

1. **Placeholders are live.** WhatsApp number `911234567890`, contact email `hello@getfirro.com`, and the lead endpoint (unset → console stub) are all placeholders. See "Placeholders" in the README.
2. **Privacy notice is a draft** with a visible banner. It needs legal review (retention period, processor list, grievance contact) before launch.
3. **The countdown uses the visitor's local clock**, as in the reference ("21:00 local"). A visitor outside IST sees their own 21:00. If the cut-off should always be 21:00 IST, compute it in `Asia/Kolkata` in `src/scripts/countdown.ts`.
4. **Two overlaps exist in the approved desktop design and were kept.** The hero prep-sheet card covers part of the "Carbs" orbit chip, and the nutrition "linked ingredients" card covers the Fibre "9g" value. Both are the same in the reference.
5. **Automated tests run in Chromium only**, which is what CI installs. The Safari/Firefox scroll-reveal fallback was checked by hand in Playwright's WebKit and Firefox builds (all 47 reveal elements show on scroll, no console errors). A real iPhone and a low-end Android haven't been tried.
6. **Lighthouse was run against `astro preview` on localhost** with simulated mobile throttling. Numbers on the production host and CDN will differ a little.
7. **Bricolage Grotesque has no italic**, so the italic accents are synthesised by the browser. This matches the reference.
8. **The mobile FAB (56px, bottom-right) floats over content as you scroll**, for example the last value in a card. It hides over the hero CTAs and the demo form. Everywhere else, the overlap is the usual trade-off for a floating button.
