// Illustrative numbers on the homepage must stay labelled as sample data (CLAUDE.md: anything the
// reference labels "Sample data" stays labelled). This guards against a label being dropped.
import { test, expect } from '@playwright/test';
import { settle } from './helpers';

const LABELLED = [
  { section: '#top', text: 'Sample data' }, // hero orbit + story cards
  { section: '#batch', text: 'Plus one packing ticket per parcel. Sample data.' }, // prep sheet
  { section: '#nutrition', text: 'Sample data' }, // meal card
  { section: '#platform', text: 'Sample data' }, // under-the-hood bento
];

for (const width of [1440, 390]) {
  test(`sample-data labels are present and visible at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await settle(page);

    for (const { section, text } of LABELLED) {
      const label = page.locator(section).getByText(text, { exact: true });
      await expect(label, `${section}: "${text}"`).toHaveCount(1);
      await label.scrollIntoViewIfNeeded();
      await expect(label, `${section}: "${text}"`).toBeVisible();
    }
    // exactly these four on the page — no unlabelled copies, none lost
    await expect(page.locator('main').getByText(/Sample data\.?$/)).toHaveCount(LABELLED.length);

    // the live feed is labelled "Sample kitchen"; the brief hides that label on mobile only
    const kitchen = page.locator('.band').getByText('Sample kitchen', { exact: true });
    if (width >= 768) await expect(kitchen).toBeVisible();
    else await expect(kitchen).toBeHidden();
  });
}
