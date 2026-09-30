import { test, expect } from '@playwright/test';
import { settle } from './helpers';

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

  test('matches a fixed clock', async ({ page }) => {
    await page.clock.setFixedTime(new Date(2026, 8, 30, 18, 30, 5));
    await page.goto('/');
    await expect(page.locator('[data-countdown]')).toHaveText('02:29:55');
  });
});

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

  test('links to WhatsApp', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-fab]')).toHaveAttribute('href', /^https:\/\/wa\.me\/\d+$/);
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
  test.beforeEach(async ({ page }) => {
    await page.goto('/#demo');
    await settle(page);
  });

  test('shows inline errors on empty submit and focuses the first one', async ({ page }) => {
    await page.getByRole('button', { name: 'Book my demo' }).click();
    for (const id of ['f-name', 'f-phone', 'f-kitchen', 'f-city', 'f-meals', 'f-consent']) {
      await expect(page.locator(`#${id}`)).toHaveAttribute('aria-invalid', 'true');
      await expect(page.locator(`#${id}-err`)).toBeVisible();
    }
    await expect(page.locator('#f-name')).toBeFocused();
    await expect(page.locator('#f-tool')).not.toHaveAttribute('aria-invalid', 'true');
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

  test('valid submit shows loading then the success state', async ({ page }) => {
    const leads: string[] = [];
    page.on('console', (m) => {
      if (m.text().startsWith('[lead:stub]')) leads.push(m.text());
    });
    await page.getByLabel('Your name').fill('Test Kitchen Owner');
    await page.getByLabel('Phone').fill('98765 43210');
    await page.getByLabel('Kitchen name').fill('Test Kitchen');
    await page.getByLabel('City').fill('Coimbatore');
    await page.getByLabel('Meals a day').selectOption('50-200');
    await page.getByLabel('I agree to be contacted about Firro.').check();
    const submit = page.getByRole('button', { name: 'Book my demo' });
    await submit.click();
    await expect(page.getByRole('button', { name: 'Booking…' })).toBeDisabled();
    await expect(page.getByRole('heading', { name: 'Got it.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Got it.' })).toBeFocused();
    await expect(page.locator('[data-form-status]')).toContainText('Got it.');
    expect(leads.length).toBe(1);
  });

  test('failed submit shows retry and WhatsApp fallback', async ({ page }) => {
    // make the stub throw by breaking the console.info it logs through
    await page.evaluate(() => {
      const orig = console.info;
      console.info = (...a: unknown[]) => {
        if (a[0] === '[lead:stub]') throw new Error('offline');
        orig(...a);
      };
    });
    await page.getByLabel('Your name').fill('Test');
    await page.getByLabel('Phone').fill('+919876543210');
    await page.getByLabel('Kitchen name').fill('Test Kitchen');
    await page.getByLabel('City').fill('Coimbatore');
    await page.getByLabel('Meals a day').selectOption('under-50');
    await page.getByLabel('I agree to be contacted about Firro.').check();
    await page.getByRole('button', { name: 'Book my demo' }).click();
    await expect(page.locator('[data-form-error]')).toBeVisible();
    await expect(page.locator('[data-form-error] a')).toHaveAttribute('href', /wa\.me/);
    await expect(page.getByRole('button', { name: 'Try again' })).toBeEnabled();
  });

  test('honeypot submissions are not sent', async ({ page }) => {
    const leads: string[] = [];
    page.on('console', (m) => {
      if (m.text().startsWith('[lead:stub]')) leads.push(m.text());
    });
    await page.locator('#f-website').fill('spam', { force: true });
    await page.getByLabel('Your name').fill('Bot');
    await page.getByLabel('Phone').fill('9876543210');
    await page.getByLabel('Kitchen name').fill('Bot');
    await page.getByLabel('City').fill('Bot');
    await page.getByLabel('Meals a day').selectOption('under-50');
    await page.getByLabel('I agree to be contacted about Firro.').check();
    await page.getByRole('button', { name: 'Book my demo' }).click();
    await expect(page.getByRole('heading', { name: 'Got it.' })).toBeVisible();
    expect(leads).toEqual([]);
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

test('analytics hooks are present', async ({ page }) => {
  await page.goto('/');
  expect(await page.locator('[data-event="book_demo_click"]').count()).toBeGreaterThan(2);
  expect(await page.locator('[data-event="whatsapp_click"]').count()).toBeGreaterThan(2);
});
