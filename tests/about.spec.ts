import { test, expect } from '@playwright/test';

test.describe('about page', () => {
  test('names the founder and shows the company registration details', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByRole('heading', { level: 1, name: 'About Firro' })).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: 'Gowtham Venkatesh R' }),
    ).toBeVisible();
    await expect(page.getByText('Founder & CEO', { exact: true })).toBeVisible();

    const main = page.locator('main');
    await expect(main).toContainText('Uyir AI Labs Private Limited');
    await expect(main).toContainText('18 September 2025');
    await expect(main).toContainText('U62011TZ2025PTC036108');
    await expect(main).toContainText('DIPP240204');
    await expect(main).toContainText('UDYAM-TN-03-0340943');
    await expect(main.getByRole('link', { name: 'gowtham@getfirro.com' })).toHaveAttribute(
      'href',
      'mailto:gowtham@getfirro.com',
    );
  });

  test('keeps words apart around inline links', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('main')).toContainText('Certificate no. DIPP240204');
    await expect(page.locator('main')).toContainText(
      'checked on the Ministry of Corporate Affairs and Startup India portals.',
    );
  });

  test('has no photo and never prints the PAN, TAN or street address', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('main img')).toHaveCount(0);
    const text = await page.locator('body').innerText();
    expect(text).not.toMatch(/AADCU9491P|CMBU04331F/);
    expect(text).not.toMatch(/KKR|Perumal|Vadavalli|641041/i);
  });

  test('structured data names the organisation, its founder and its CIN', async ({ page }) => {
    await page.goto('/about');
    const blocks = await page.$$eval('script[type="application/ld+json"]', (s) =>
      s.map((e) => JSON.parse(e.textContent ?? '{}')),
    );
    const org = blocks.find((b) => b['@type'] === 'Organization');
    expect(org.legalName).toBe('Uyir AI Labs Private Limited');
    expect(org.foundingDate).toBe('2025-09-18');
    expect(org.founder).toMatchObject({ name: 'Gowtham Venkatesh R', jobTitle: 'Founder & CEO' });
    expect(org.identifier).toMatchObject({ propertyID: 'CIN', value: 'U62011TZ2025PTC036108' });
    expect(blocks.some((b) => b['@type'] === 'AboutPage')).toBe(true);
  });

  test('is listed in the sitemap', async ({ request }) => {
    const index = await (await request.get('/sitemap-0.xml')).text();
    expect(index).toContain('https://getfirro.com/about');
  });
});

test.describe('about links', () => {
  for (const from of ['/', '/privacy', '/about']) {
    test(`header and footer link to About from ${from}`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(from);
      await expect(
        page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'About' }),
      ).toHaveAttribute('href', '/about');
      await expect(page.locator('footer').getByRole('link', { name: 'About' })).toHaveAttribute(
        'href',
        '/about',
      );
    });
  }

  test('the mobile menu lists About', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.getByRole('button', { name: 'Menu' }).click();
    await expect(page.locator('#nav-sheet').getByRole('link', { name: 'About' })).toHaveAttribute(
      'href',
      '/about',
    );
  });

  test('section links on /about point back to the home page, not to a protocol-relative URL', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/about');
    const hrefs = await page.$$eval('header a, footer a', (as) =>
      as.map((a) => a.getAttribute('href') ?? ''),
    );
    expect(hrefs.filter((h) => h.startsWith('//'))).toEqual([]);
    expect(hrefs).toContain('/#how');
    expect(hrefs).toContain('/#faq');
  });
});
