import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { scrollThrough, settle } from './helpers';

const PAGES = ['/', '/privacy', '/404'];

for (const path of PAGES) {
  for (const width of [1440, 390]) {
    test(`axe: ${path} at ${width}px has no serious or critical violations`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(path);
      await settle(page);
      await scrollThrough(page);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      const blocking = results.violations.filter((v) =>
        ['serious', 'critical'].includes(v.impact ?? ''),
      );
      const summary = blocking.map(
        (v) =>
          `${v.id} (${v.impact}): ${v.nodes
            .map((n) => n.target.join(' '))
            .slice(0, 5)
            .join(' | ')}`,
      );
      expect(summary).toEqual([]);
    });
  }
}

test('page structure: landmarks, one h1, skip link', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('header.site-header')).toHaveCount(1);
  await expect(page.locator('main#main')).toHaveCount(1);
  await expect(page.locator('footer')).toHaveCount(1);
  await expect(page.getByRole('navigation', { name: 'Primary' })).toHaveCount(1);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeInViewport();
});

test('decorative SVGs are hidden from assistive tech', async ({ page }) => {
  await page.goto('/');
  const exposed = await page.$$eval('svg', (svgs) =>
    svgs
      .filter((s) => !s.closest('[aria-hidden="true"]') && s.getAttribute('role') !== 'img')
      .map((s) => s.outerHTML.slice(0, 80)),
  );
  expect(exposed).toEqual([]);
});

test('heading levels never skip', async ({ page }) => {
  await page.goto('/');
  const levels = await page.$$eval('h1, h2, h3, h4', (hs) => hs.map((h) => Number(h.tagName[1])));
  for (let i = 1; i < levels.length; i++) {
    expect(levels[i]! - levels[i - 1]!).toBeLessThanOrEqual(1);
  }
});
