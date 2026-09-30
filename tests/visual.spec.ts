// Section-by-section comparison of the build against the approved reference at 1440×900.
// Both pages render in the same browser with reduced motion (final states), identical local fonts,
// the live countdown masked, and the sticky nav / FAB hidden for section shots.
// Tolerance: ≤ 3% of pixels may differ per section (BUILD_BRIEF §11). Documented deliberate deltas:
//  - how: timeline nodes stay gold in reduced motion (reference turns them green once .play is set)
//  - footer: extra "Privacy" link in the bottom row
import { test, expect, type Page } from '@playwright/test';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { REFERENCE_URL, settle, useLocalFontsForReference } from './helpers';

const MAX_DIFF_RATIO = 0.03;

const SECTIONS: { name: string; ref: string; build: string }[] = [
  { name: 'nav', ref: 'nav', build: '.site-header nav' },
  { name: 'hero', ref: 'header#top', build: '#top' },
  { name: 'feed', ref: 'body > div > div:nth-of-type(2)', build: '.band' },
  {
    name: 'problem',
    ref: 'body > div > section:nth-of-type(1)',
    build: 'section[aria-labelledby="problem-title"]',
  },
  { name: 'how', ref: '#how', build: '#how' },
  { name: 'batch', ref: '#batch', build: '#batch' },
  { name: 'nutrition', ref: '#nutrition', build: '#nutrition' },
  { name: 'platform', ref: '#platform', build: '#platform' },
  { name: 'pilot', ref: 'body > div > section:nth-of-type(6)', build: 'section.pilot' },
  { name: 'faq', ref: '#faq', build: '#faq' },
  { name: 'demo', ref: '#demo', build: '#demo' },
  { name: 'footer', ref: 'footer', build: 'footer' },
];

const MASK_CSS = `
  .fab, [data-fab], .skip-link { visibility: hidden !important; }
  .lockclock { visibility: hidden !important; }
  .lockring { background: #cccccc !important; }`;
const HIDE_NAV = `nav.glass, .site-header { visibility: hidden !important; }`;

async function shoot(page: Page, selector: string, hideNav: boolean): Promise<PNG> {
  if (hideNav) await page.addStyleTag({ content: HIDE_NAV });
  const el = page.locator(selector).first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  return PNG.sync.read(await el.screenshot());
}

test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });

for (const s of SECTIONS) {
  test(`${s.name} matches the reference at 1440px`, async ({ browser }, testInfo) => {
    const refPage = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      reducedMotion: 'reduce',
    });
    const buildPage = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      reducedMotion: 'reduce',
    });
    await useLocalFontsForReference(refPage);
    await refPage.goto(REFERENCE_URL);
    await buildPage.goto('/');
    for (const p of [refPage, buildPage]) {
      await settle(p);
      await p.addStyleTag({ content: MASK_CSS });
    }

    const a = await shoot(refPage, s.ref, s.name !== 'nav');
    const b = await shoot(buildPage, s.build, s.name !== 'nav');
    expect(Math.abs(a.height - b.height), 'section height (px)').toBeLessThanOrEqual(4);

    const w = Math.min(a.width, b.width);
    const h = Math.min(a.height, b.height);
    const crop = (img: PNG) => {
      const out = new PNG({ width: w, height: h });
      PNG.bitblt(img, out, 0, 0, w, h, 0, 0);
      return out;
    };
    const diff = new PNG({ width: w, height: h });
    const bad = pixelmatch(crop(a).data, crop(b).data, diff.data, w, h, { threshold: 0.1 });
    const ratio = bad / (w * h);
    await testInfo.attach(`${s.name}-diff.png`, {
      body: PNG.sync.write(diff),
      contentType: 'image/png',
    });
    await refPage.close();
    await buildPage.close();
    expect(ratio, `${s.name}: ${(ratio * 100).toFixed(2)}% of pixels differ`).toBeLessThanOrEqual(
      MAX_DIFF_RATIO,
    );
  });
}
