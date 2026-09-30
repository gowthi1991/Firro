// Captures docs/screenshots/ from a running preview (`npm run preview`).
// desktop-<section>.png at 1440, mobile-<section>.png at 390, plus full-page shots.
// Reduced motion = every sequence in its final state; countdown shows the live value.
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import sharp from 'sharp';

const BASE = process.env.BASE_URL ?? 'http://localhost:4321';
const OUT = 'docs/screenshots';
const SECTIONS = [
  ['hero', '#top'],
  ['feed', '.band'],
  ['problem', 'section[aria-labelledby="problem-title"]'],
  ['how', '#how'],
  ['batch', '#batch'],
  ['nutrition', '#nutrition'],
  ['platform', '#platform'],
  ['pilot', 'section.pilot'],
  ['faq', '#faq'],
  ['demo', '#demo'],
  ['footer', 'footer'],
];

await mkdir(OUT, { recursive: true });
const shrink = (buf, file) =>
  sharp(buf).png({ palette: true, quality: 90, compressionLevel: 9 }).toFile(file);
const browser = await chromium.launch();

for (const [kind, width, height] of [
  ['desktop', 1440, 900],
  ['mobile', 390, 844],
]) {
  const page = await browser.newPage({
    viewport: { width, height },
    reducedMotion: 'reduce',
    deviceScaleFactor: 1,
    isMobile: kind === 'mobile',
    hasTouch: kind === 'mobile',
  });
  await page.goto(BASE + '/');
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 300) {
      scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 30));
    }
    scrollTo(0, 0);
  });
  await page.addStyleTag({ content: '[data-fab]{visibility:hidden!important}' });
  await shrink(await page.screenshot({ fullPage: true }), `${OUT}/${kind}-full.png`);
  await page.addStyleTag({ content: '.site-header{visibility:hidden!important}' });
  for (const [name, sel] of SECTIONS) {
    const el = page.locator(sel).first();
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    await shrink(await el.screenshot(), `${OUT}/${kind}-${name}.png`);
  }
  await page.close();
}

// Mobile menu open, and the privacy page
const m = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
await m.goto(BASE + '/');
await m.evaluate(() => document.fonts.ready);
await m.getByRole('button', { name: 'Menu' }).click();
await shrink(await m.screenshot(), `${OUT}/mobile-menu.png`);
await m.goto(BASE + '/privacy');
await m.evaluate(() => document.fonts.ready);
await shrink(await m.screenshot(), `${OUT}/mobile-privacy.png`);
await browser.close();
console.log(`screenshots written to ${OUT}/`);
