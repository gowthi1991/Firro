// Security headers from vercel.json (served locally by scripts/serve-static.mjs, exactly as on
// Vercel) and a check that the Content-Security-Policy blocks nothing the site needs.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { test, expect, type Page } from '@playwright/test';
import { BOOT_SCRIPT } from '../src/config/boot-script';
import { scrollThrough, settle } from './helpers';

const vercel = JSON.parse(readFileSync('vercel.json', 'utf8')) as {
  headers: { source: string; headers: { key: string; value: string }[] }[];
};
const configured = Object.fromEntries(
  vercel.headers[0]!.headers.map((h) => [h.key.toLowerCase(), h.value]),
);

test('vercel.json CSP allows the inline boot script by its current hash', () => {
  const hash = `'sha256-${createHash('sha256').update(BOOT_SCRIPT).digest('base64')}'`;
  expect(
    configured['content-security-policy'],
    `update script-src in vercel.json to ${hash}`,
  ).toContain(hash);
  expect(configured['content-security-policy']).not.toContain("script-src 'self' 'unsafe-inline'");
});

for (const path of ['/', '/privacy', '/404', '/og.png']) {
  test(`${path} is served with the security headers`, async ({ request }) => {
    const res = await request.get(path);
    const h = res.headers();
    expect(h['strict-transport-security']).toBe('max-age=31536000; includeSubDomains');
    expect(h['x-content-type-options']).toBe('nosniff');
    expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(h['permissions-policy']).toBe('camera=(), microphone=(), geolocation=()');
    expect(h['content-security-policy']).toBe(configured['content-security-policy']);
  });
}

async function collectViolations(page: Page): Promise<string[]> {
  const violations: string[] = [];
  page.on('console', (m) => {
    if (/Content Security Policy|Refused to/i.test(m.text())) violations.push(m.text());
  });
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (e) => {
      console.error(`Refused to load (CSP ${e.violatedDirective}): ${e.blockedURI}`);
    });
  });
  return violations;
}

for (const path of ['/', '/privacy', '/404']) {
  test(`${path}: no CSP violations, scripts and fonts load`, async ({ page }) => {
    const violations = await collectViolations(page);
    await page.goto(path);
    await settle(page);
    await scrollThrough(page);
    await expect(page.locator('html')).toHaveClass(/\bjs-ready\b/); // bundled module ran
    await expect(page.locator('html')).toHaveClass(/\bjs\b/); // inline boot script ran
    const fonts = await page.evaluate(() =>
      [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family),
    );
    expect(fonts).toEqual(expect.arrayContaining(['Bricolage Grotesque', 'Manrope']));
    expect(violations).toEqual([]);
  });
}

test('form submission works under the CSP', async ({ page }) => {
  const violations = await collectViolations(page);
  await page.route('**/api/lead', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }),
  );
  await page.goto('/#demo');
  await settle(page);
  await page.getByLabel('Your name').fill('Test');
  await page.getByLabel('Phone').fill('9876543210');
  await page.getByLabel('Kitchen name').fill('Test Kitchen');
  await page.getByLabel('City').fill('Coimbatore');
  await page.getByLabel('Meals a day').selectOption('under-50');
  await page.getByLabel('I agree to be contacted about Firro.').check();
  await page.getByRole('button', { name: 'Book my demo' }).click();
  await expect(page.getByRole('heading', { name: 'Got it.' })).toBeVisible();
  expect(violations).toEqual([]);
});
