// The only inline script on the site. Runs before first paint: enables JS-only hidden states,
// detects @property support, and removes the gate again if the bundled script never boots
// (content must never stay hidden).
//
// The Content-Security-Policy in vercel.json allows it by SHA-256 hash. If you change this string,
// update the hash there — tests/security.spec.ts fails until you do (it prints the new value).
export const BOOT_SCRIPT = `(function(d){var h=d.documentElement;h.classList.add('js');if(window.CSS&&CSS.registerProperty)h.classList.add('prop');setTimeout(function(){if(!h.classList.contains('js-ready'))h.classList.remove('js')},3000)})(document)`;
