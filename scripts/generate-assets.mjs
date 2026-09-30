// Generates favicons, app icons and the Open Graph image into public/.
// Run once with `npm run gen:assets`; the outputs are committed.
// Icons: rasterised from handoff/brand with sharp. OG image: laid out in HTML (so the self-hosted
// brand fonts render exactly), captured with Playwright's Chromium, then compressed with sharp.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { chromium } from '@playwright/test';

const require = createRequire(import.meta.url);
const root = new URL('../', import.meta.url);
const pub = new URL('public/', root);
await mkdir(pub, { recursive: true });

const stripMeta = (svg) =>
  svg.replace(/<metadata>[\s\S]*?<\/metadata>/g, '').replace(/\s*xmlns:c2pa="[^"]*"/, '');

// --- favicons & app icons --------------------------------------------------------------
const iconSvg = stripMeta(
  await readFile(new URL('handoff/brand/firro-f-app-icon-forest.svg', root), 'utf8'),
);
await writeFile(new URL('favicon.svg', pub), iconSvg);
const iconBuf = Buffer.from(iconSvg);
for (const [name, size] of [
  ['favicon-32.png', 32],
  ['apple-touch-icon.png', 180],
  ['icon-192.png', 192],
  ['icon-512.png', 512],
]) {
  await sharp(iconBuf, { density: 300 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(fileURLToPath(new URL(name, pub)));
}

// --- Open Graph image (1200×630) ---------------------------------------------------------
const logo = stripMeta(
  await readFile(new URL('handoff/brand/firro-logo-on-dark-tight.svg', root), 'utf8'),
);
const font = (p) =>
  `data:font/woff2;base64,${require('node:fs').readFileSync(require.resolve(p)).toString('base64')}`;
const bricolage = font(
  '@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-opsz-normal.woff2',
);
const manrope = font('@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2');
const html = `<!doctype html><html><head><style>
@font-face{font-family:'Bricolage Grotesque';src:url(${bricolage}) format('woff2');font-weight:200 800}
@font-face{font-family:'Manrope';src:url(${manrope}) format('woff2');font-weight:200 800}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;overflow:hidden;font-family:Manrope,sans-serif;
  background:radial-gradient(700px 500px at 88% 8%,rgba(217,180,90,.22),transparent 60%),
  linear-gradient(rgba(240,215,138,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(240,215,138,.06) 1px,transparent 1px),
  linear-gradient(160deg,#1F4A33,#0E2A1C);background-size:auto,64px 64px,64px 64px,auto;
  padding:72px 80px;display:flex;flex-direction:column;justify-content:space-between}
.logo svg{height:74px;width:auto;display:block}
h1{font-family:'Bricolage Grotesque';font-weight:800;font-size:76px;line-height:.98;letter-spacing:-.04em;color:#FBF1D2;max-width:15ch}
em{font-style:italic;font-weight:600;color:#F0D78A}
.row{display:flex;justify-content:space-between;align-items:center;color:#C9DBC4;font-size:24px;font-weight:600}
.chip{display:inline-flex;align-items:center;gap:12px;font-size:18px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#E9C46A}
.dot{width:12px;height:12px;border-radius:50%;background:#F0D78A;box-shadow:0 0 0 6px rgba(240,215,138,.18)}
</style></head><body>
<div class="logo">${logo}</div>
<h1>Firro plans tomorrow's prep from <em>today's subscriptions.</em></h1>
<div class="row"><span>The operating system for subscription kitchens</span><span class="chip"><span class="dot"></span>getfirro.com</span></div>
</body></html>`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
const shot = await page.screenshot({ type: 'png' });
await browser.close();
await sharp(shot)
  .png({ compressionLevel: 9, palette: false })
  .toFile(fileURLToPath(new URL('og.png', pub)));

console.log('assets written to public/');
