import { test, expect, type Page } from '@playwright/test';
import { settle } from './helpers';
import { CONTACT } from '../src/config/site';

test.describe('sequences', () => {
  test('play once when scrolled into view', async ({ page }) => {
    await page.goto('/');
    for (const sel of ['.hseq', '.nseq', '.wseq']) {
      await expect(page.locator(sel)).not.toHaveClass(/\bplay\b/);
    }
    for (const sel of ['.hseq', '.nseq', '.wseq']) {
      await page.locator(sel).scrollIntoViewIfNeeded();
      await expect(page.locator(sel)).toHaveClass(/\bplay\b/);
    }
  });

  test('kcal counter lands on 520 and bars fill', async ({ page }) => {
    await page.goto('/');
    await page.locator('.nseq').scrollIntoViewIfNeeded();
    await expect(page.locator('.nseq')).toHaveClass(/\bplay\b/);
    await page.waitForTimeout(2800);
    // the ::after shows counter(kc); its value is the registered --kc property
    const kc = await page.$eval('.kc', (el) =>
      document.documentElement.classList.contains('prop')
        ? getComputedStyle(el).getPropertyValue('--kc').trim()
        : el.textContent,
    );
    expect(kc).toBe('520');
    const t = await page.$eval('.nbar', (el) => getComputedStyle(el).transform);
    expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(t);
  });
});

test.describe('countdown', () => {
  test('shows HH:MM:SS to 21:00 and ticks', async ({ page }) => {
    await page.goto('/');
    const clock = page.locator('[data-countdown]');
    await expect(clock).toHaveText(/^\d{2}:\d{2}:\d{2}$/);
    const first = await clock.textContent();
    await expect(clock).not.toHaveText(first ?? '', { timeout: 3000 });
    const p = await page.$eval('[data-countdown-ring]', (el) =>
      Number((el as HTMLElement).style.getPropertyValue('--p')),
    );
    expect(p).toBeGreaterThanOrEqual(0);
    expect(p).toBeLessThanOrEqual(100);
  });
});

// The cut-off is 21:00 in Asia/Kolkata (UTC+05:30) for every visitor, whatever their timezone.
for (const timezoneId of [
  'Asia/Kolkata',
  'America/New_York',
  'Europe/London',
  'Pacific/Auckland',
]) {
  test.describe(`countdown in ${timezoneId}`, () => {
    test.use({ timezoneId });

    test('counts to 21:00 IST before the cut-off', async ({ page }) => {
      await page.clock.setFixedTime(new Date('2026-09-30T13:00:05Z')); // 18:30:05 IST
      await page.goto('/');
      await expect(page.locator('[data-countdown]')).toHaveText('02:29:55');
    });

    test("rolls over to tomorrow's 21:00 IST after the cut-off", async ({ page }) => {
      await page.clock.setFixedTime(new Date('2026-09-30T15:45:00Z')); // 21:15:00 IST
      await page.goto('/');
      await expect(page.locator('[data-countdown]')).toHaveText('23:45:00');
    });

    test('exactly 21:00 IST shows a full day', async ({ page }) => {
      await page.clock.setFixedTime(new Date('2026-09-30T15:30:00Z')); // 21:00:00 IST
      await page.goto('/');
      await expect(page.locator('[data-countdown]')).toHaveText('24:00:00');
    });
  });
}

test.describe('WhatsApp FAB', () => {
  test('collapses after 480px of scroll and hides over the form', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const fab = page.locator('[data-fab]');
    await expect(fab).not.toHaveClass(/\bmini\b/);
    await page.evaluate(() => window.scrollTo(0, 600));
    await expect(fab).toHaveClass(/\bmini\b/);
    await page.locator('[data-lead-form]').scrollIntoViewIfNeeded();
    await expect(fab).toHaveClass(/\baway\b/);
    await expect(fab).toBeHidden();
  });

  test('mobile: stays out of the way of the hero CTAs, then shows as a 56px icon', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const fab = page.locator('[data-fab]');
    await expect(fab).toBeHidden();
    await page.evaluate(() => window.scrollTo(0, 1100));
    await expect(fab).toBeVisible();
    await expect(fab).toHaveClass(/\bmini\b/);
    // wait for the pop-in animation (scale .94 → 1) to finish
    await expect
      .poll(async () => {
        const b = await fab.boundingBox();
        return [Math.round(b!.width), Math.round(b!.height)];
      })
      .toEqual([56, 56]);
  });

  test('links to WhatsApp', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-fab]')).toHaveAttribute(
      'href',
      /^https:\/\/wa\.me\/\d+\?text=/,
    );
  });
});

test('FAQ: first item open, items toggle', async ({ page }) => {
  await page.goto('/');
  const items = page.locator('#faq details');
  await expect(items).toHaveCount(6);
  await expect(items.first()).toHaveAttribute('open', '');
  await items.nth(1).locator('summary').click();
  await expect(items.nth(1)).toHaveAttribute('open', '');
  await items.nth(1).locator('summary').click();
  await expect(items.nth(1)).not.toHaveAttribute('open', '');
});

test.describe('demo form', () => {
  // /api/lead is a Vercel function; the static test server doesn't run it, so every test mocks it.
  const fillValid = async (page: Page) => {
    await page.getByLabel('Your name').fill('Test Kitchen Owner');
    await page.getByLabel('Phone').fill('98765 43210');
    await page.getByLabel('Kitchen name').fill('Test Kitchen');
    await page.getByLabel('City').fill('Coimbatore');
    await page.getByLabel('Meals a day').selectOption('50-200');
    await page.getByLabel('I agree to be contacted about Firro.').check();
  };
  const mockLead = (page: Page, status: number, body: unknown, seen: unknown[] = []) =>
    page.route('**/api/lead', async (route) => {
      seen.push(route.request().postDataJSON());
      await new Promise((r) => setTimeout(r, 300)); // long enough to observe the loading state
      await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
    });

  test.beforeEach(async ({ page }) => {
    await page.goto('/#demo');
    await settle(page);
  });

  test('shows inline errors on empty submit and focuses the first one', async ({ page }) => {
    const seen: unknown[] = [];
    await mockLead(page, 200, { ok: true }, seen);
    await page.getByRole('button', { name: 'Book my demo' }).click();
    for (const id of ['f-name', 'f-phone', 'f-kitchen', 'f-city', 'f-meals', 'f-consent']) {
      await expect(page.locator(`#${id}`)).toHaveAttribute('aria-invalid', 'true');
      await expect(page.locator(`#${id}-err`)).toBeVisible();
    }
    await expect(page.locator('#f-name')).toBeFocused();
    await expect(page.locator('#f-tool')).not.toHaveAttribute('aria-invalid', 'true');
    expect(seen).toEqual([]);
  });

  test('validates the phone on blur', async ({ page }) => {
    const phone = page.getByLabel('Phone');
    await phone.fill('12345');
    await phone.blur();
    await expect(page.locator('#f-phone-err')).toBeVisible();
    await phone.fill('+91 98765 43210');
    await expect(page.locator('#f-phone-err')).toBeHidden();
    await phone.fill('5876543210');
    await phone.blur();
    await expect(page.locator('#f-phone-err')).toBeVisible();
  });

  test('valid submit posts to /api/lead, shows loading, then the success state', async ({
    page,
  }) => {
    const seen: Record<string, unknown>[] = [];
    await mockLead(page, 200, { ok: true }, seen);
    await fillValid(page);
    await page.getByRole('button', { name: 'Book my demo' }).click();
    await expect(page.getByRole('button', { name: 'Booking…' })).toBeDisabled();
    await expect(page.getByRole('heading', { name: 'Got it.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Got it.' })).toBeFocused();
    await expect(page.locator('[data-form-status]')).toContainText('Got it.');
    expect(seen).toHaveLength(1);
    expect(seen[0]).toMatchObject({
      name: 'Test Kitchen Owner',
      phone: '+919876543210',
      kitchen: 'Test Kitchen',
      city: 'Coimbatore',
      meals: '50-200',
      consent: true,
      website: '',
    });
  });

  test('server validation errors show inline on the right fields', async ({ page }) => {
    await mockLead(page, 400, {
      ok: false,
      errors: {
        phone: 'Enter a 10-digit Indian mobile number, like +91 98765 43210.',
        city: 'Please enter your city.',
      },
    });
    await fillValid(page);
    await page.getByRole('button', { name: 'Book my demo' }).click();
    await expect(page.locator('#f-phone')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#f-phone-err')).toHaveText(/10-digit Indian mobile/);
    await expect(page.locator('#f-city-err')).toHaveText('Please enter your city.');
    await expect(page.locator('#f-phone')).toBeFocused();
    await expect(page.locator('[data-form-error]')).toBeHidden();
    await expect(page.getByRole('heading', { name: 'Got it.' })).toBeHidden();
  });

  test('rate limit (429) shows a friendly message with WhatsApp fallback', async ({ page }) => {
    await mockLead(page, 429, { ok: false, message: 'rate limited' });
    await fillValid(page);
    await page.getByRole('button', { name: 'Book my demo' }).click();
    const panel = page.locator('[data-form-error]');
    await expect(panel).toBeVisible();
    await expect(panel).toContainText('We already have your request.');
    await expect(panel.locator('a')).toHaveAttribute('href', /wa\.me/);
    await expect(page.locator('[data-form-status]')).toContainText('We already have your request.');
  });

  for (const [label, setup] of [
    ['server error', (page: Page) => mockLead(page, 500, { ok: false, message: 'x' })],
    ['network failure', (page: Page) => page.route('**/api/lead', (r) => r.abort())],
  ] as const) {
    test(`${label} shows retry and WhatsApp fallback`, async ({ page }) => {
      await setup(page);
      await fillValid(page);
      await page.getByRole('button', { name: 'Book my demo' }).click();
      await expect(page.locator('[data-form-error]')).toBeVisible();
      await expect(page.locator('[data-form-error]')).toContainText('That didn’t go through.');
      await expect(page.locator('[data-form-error] a')).toHaveAttribute('href', /wa\.me/);
      await expect(page.getByRole('button', { name: 'Try again' })).toBeEnabled();
    });
  }

  test('honeypot submissions are not sent', async ({ page }) => {
    const seen: unknown[] = [];
    await mockLead(page, 200, { ok: true }, seen);
    await page.locator('#f-website').fill('spam', { force: true });
    await fillValid(page);
    await page.getByRole('button', { name: 'Book my demo' }).click();
    await expect(page.getByRole('heading', { name: 'Got it.' })).toBeVisible();
    expect(seen).toEqual([]);
  });

  test('consent links to the privacy page', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Privacy policy' })).toHaveAttribute(
      'href',
      '/privacy',
    );
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('sequences render in their final state', async ({ page }) => {
    await page.goto('/');
    await settle(page);
    const s = await page.evaluate(() => {
      const cs = (sel: string, pseudo?: string) =>
        getComputedStyle(document.querySelector(sel)!, pseudo);
      return {
        hfill: cs('.hfill').transform,
        hmark: cs('.hmark').display,
        node: cs('.hnode').backgroundColor,
        old: cs('.old').display,
        feedFirst: cs('.feed > span:first-child').opacity,
        card: cs('.card.prep').opacity,
        plate: cs('.plate').opacity,
        orbit: cs('.orbit').animationName,
        nbar: cs('.nbar').transform,
      };
    });
    expect(s.hfill).toBe('none');
    expect(s.hmark).toBe('none');
    expect(s.node).toBe('rgb(240, 215, 138)');
    expect(s.old).toBe('none');
    expect(s.feedFirst).toBe('1');
    expect(s.card).toBe('1');
    expect(s.plate).toBe('1');
    expect(s.orbit).toBe('none');
    expect(s.nbar).toBe('none');
    // countdown still ticks
    await expect(page.locator('[data-countdown]')).toHaveText(/^\d{2}:\d{2}:\d{2}$/);
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('content is visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2600); // let load-time CSS animations finish
    await expect(page.locator('html')).not.toHaveClass(/\bjs\b/);
    for (const sel of ['h1', '.card.pause', '.card.prep', '.card.delivery', '#faq details']) {
      const o = await page
        .locator(sel)
        .first()
        .evaluate((e) => getComputedStyle(e).opacity);
      expect(o, sel).toBe('1');
    }
    await expect(page.locator('.kc-static')).toHaveText('520');
  });
});

test('track() forwards custom events to Vercel Analytics', async ({ page }) => {
  // Analytics isn't injected on localhost, so stand in for its window.va queue.
  await page.addInitScript(() => {
    const w = window as unknown as { va: (...a: unknown[]) => void; __va: unknown[][] };
    w.__va = [];
    w.va = (...a: unknown[]) => w.__va.push(a);
  });
  await page.route('**/api/lead', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }),
  );
  await page.goto('/');
  await settle(page);
  await page.locator('#top').getByRole('link', { name: 'Book a demo' }).click();
  await page.getByLabel('Your name').fill('Test');
  await page.getByLabel('Phone').fill('9876543210');
  await page.getByLabel('Kitchen name').fill('Test Kitchen');
  await page.getByLabel('City').fill('Coimbatore');
  await page.getByLabel('Meals a day').selectOption('under-50');
  await page.getByLabel('I agree to be contacted about Firro.').check();
  await page.getByRole('button', { name: 'Book my demo' }).click();
  await expect(page.getByRole('heading', { name: 'Got it.' })).toBeVisible();
  const events = await page.evaluate(() =>
    (
      window as unknown as { __va: [string, { name: string; data?: Record<string, unknown> }][] }
    ).__va
      .filter(([type]) => type === 'event')
      .map(([, e]) => ({ name: e.name, data: e.data })),
  );
  expect(events).toEqual([
    { name: 'book_demo_click', data: { href: '#demo' } },
    { name: 'form_submit', data: { ok: true, status: 200, meals: 'under-50' } },
  ]);
});

test('analytics hooks are present', async ({ page }) => {
  await page.goto('/');
  expect(await page.locator('[data-event="book_demo_click"]').count()).toBeGreaterThan(2);
  expect(await page.locator('[data-event="whatsapp_click"]').count()).toBeGreaterThan(2);
});

test('every WhatsApp link carries the prefilled message', async ({ page }) => {
  const expected = "Hi Firro, I'd like to know more about Firro for my kitchen.";
  for (const path of ['/', '/privacy', '/404']) {
    await page.goto(path);
    const hrefs = await page.$$eval('a[href*="wa.me"]', (as) =>
      as.map((a) => a.getAttribute('href')!),
    );
    expect(hrefs.length, path).toBeGreaterThan(0);
    for (const href of hrefs) {
      const url = new URL(href);
      expect(url.origin + url.pathname, href).toBe('https://wa.me/917845551223');
      expect(url.searchParams.get('text'), href).toBe(expected);
      expect(href, 'URL-encoded').not.toMatch(/[ ',]/);
    }
  }
});

test('contact email (CONTACT.email) is used on /privacy and in the JSON-LD', async ({ page }) => {
  await page.goto('/privacy');
  await expect(page.getByRole('link', { name: CONTACT.email })).toHaveAttribute(
    'href',
    `mailto:${CONTACT.email}`,
  );
  await page.goto('/');
  const org = await page.$$eval('script[type="application/ld+json"]', (els) =>
    els.map((e) => JSON.parse(e.textContent ?? '{}')).find((d) => d['@type'] === 'Organization'),
  );
  expect(org?.email).toBe(CONTACT.email);
});
