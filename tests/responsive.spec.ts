import { test, expect, type Page } from '@playwright/test';
import { scrollThrough, settle } from './helpers';

const WIDTHS = [320, 360, 390, 768, 1024, 1280, 1440, 1920];

/** Elements whose box leaves the viewport horizontally, ignoring ones clipped by an ancestor. */
async function overflowing(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const clipped = (el: Element) => {
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        const cs = getComputedStyle(p);
        if (/(hidden|clip)/.test(cs.overflowX) || /(hidden|clip)/.test(cs.overflow)) return true;
      }
      return false;
    };
    const out: string[] = [];
    for (const el of document.querySelectorAll('body *')) {
      if (el.closest('.hp, .sr-only, .skip-link')) continue;
      const cs = getComputedStyle(el);
      if (cs.position === 'fixed' || cs.display === 'none') continue;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      if ((r.right > vw + 1 || r.left < -1) && !clipped(el)) {
        out.push(
          `${el.tagName.toLowerCase()}.${[...el.classList].join('.')} [${Math.round(r.left)}, ${Math.round(r.right)}]`,
        );
      }
    }
    return out;
  });
}

for (const width of WIDTHS) {
  for (const path of ['/', '/privacy', '/404']) {
    test(`${path} has no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(path);
      await settle(page);
      await scrollThrough(page);
      const sw = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(sw, 'document scrollWidth').toBeLessThanOrEqual(width);
      expect(await overflowing(page)).toEqual([]);
    });
  }
}

for (const width of [390, 768]) {
  test(`menu sheet works at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    const btn = page.getByRole('button', { name: 'Menu' });
    const sheet = page.locator('#nav-sheet');
    await expect(btn).toBeVisible();
    await expect(page.locator('.site-header .links')).toBeHidden();
    await expect(sheet).toBeHidden();

    const h1Before = (await page.locator('h1').boundingBox())!.y;
    await btn.click();
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    // the sheet overlays the page; it must not push content down
    expect((await page.locator('h1').boundingBox())!.y).toBe(h1Before);
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole('link')).toHaveCount(5);
    await expect(sheet.getByRole('link').first()).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await expect(btn).toBeFocused();

    await btn.click();
    await sheet.getByRole('link', { name: 'FAQ' }).click();
    await expect(sheet).toBeHidden();
    await expect(page).toHaveURL(/#faq$/);
  });
}

test('desktop shows inline nav links and no menu button', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await expect(page.locator('.site-header .links')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Menu' })).toBeHidden();
});

for (const width of [360, 390]) {
  test(`hero story cards stack without overlapping at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await settle(page);
    const boxes = await page.evaluate(() =>
      ['.orbitwrap', '.card.pause', '.card.prep', '.card.delivery'].map((s) => {
        const r = document.querySelector(s)!.getBoundingClientRect();
        return { s, top: r.top, bottom: r.bottom, left: r.left, right: r.right };
      }),
    );
    for (let i = 0; i < boxes.length; i++) {
      const a = boxes[i]!;
      expect(a.left, `${a.s} left`).toBeGreaterThanOrEqual(0);
      expect(a.right, `${a.s} right`).toBeLessThanOrEqual(width);
      for (let j = i + 1; j < boxes.length; j++) {
        const b = boxes[j]!;
        const overlap = a.bottom > b.top + 0.5 && b.bottom > a.top + 0.5;
        expect(overlap, `${a.s} overlaps ${b.s}`).toBe(false);
      }
    }
    // vertical sequence: pause → prep sheet → delivery
    expect(boxes[1]!.top).toBeLessThan(boxes[2]!.top);
    expect(boxes[2]!.top).toBeLessThan(boxes[3]!.top);
  });
}

test('tap targets are at least 44px on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto('/');
  await settle(page);
  const small = await page.evaluate(() => {
    const out: string[] = [];
    const sel = '.site-header a, .site-header button, .btn, summary, .footer a, [data-fab]';
    for (const el of document.querySelectorAll<HTMLElement>(sel)) {
      const r = el.getBoundingClientRect();
      if (!r.width) continue;
      if (r.height < 44 || r.width < 44)
        out.push(`${el.textContent?.trim()} ${Math.round(r.width)}×${Math.round(r.height)}`);
    }
    return out;
  });
  expect(small).toEqual([]);
});

test('form inputs use at least 16px text on mobile (no iOS zoom)', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto('/');
  const sizes = await page.$$eval('#demo .field input, #demo select', (els) =>
    els.map((e) => parseFloat(getComputedStyle(e).fontSize)),
  );
  for (const s of sizes) expect(s).toBeGreaterThanOrEqual(16);
});
