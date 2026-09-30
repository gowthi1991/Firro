import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import type { Page } from '@playwright/test';

const require = createRequire(import.meta.url);
export const REFERENCE_URL = 'http://localhost:4400/firro-home-v3.html';

const FONT_FILES: Record<string, string> = {
  'bricolage.woff2':
    '@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-opsz-normal.woff2',
  'manrope.woff2': '@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2',
  'mono-500.woff2': '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2',
  'mono-700.woff2': '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff2',
};

/**
 * The reference loads Google Fonts. Serve the same families from the local @fontsource files
 * instead, so the comparison is hermetic (no network) and both pages use identical font binaries.
 */
export async function useLocalFontsForReference(page: Page): Promise<void> {
  const css = `
@font-face{font-family:'Bricolage Grotesque';font-weight:200 800;src:url(https://fonts.gstatic.com/local/bricolage.woff2) format('woff2')}
@font-face{font-family:'Manrope';font-weight:200 800;src:url(https://fonts.gstatic.com/local/manrope.woff2) format('woff2')}
@font-face{font-family:'JetBrains Mono';font-weight:500;src:url(https://fonts.gstatic.com/local/mono-500.woff2) format('woff2')}
@font-face{font-family:'JetBrains Mono';font-weight:700;src:url(https://fonts.gstatic.com/local/mono-700.woff2) format('woff2')}`;
  await page.route('https://fonts.googleapis.com/**', (r) =>
    r.fulfill({ contentType: 'text/css', body: css }),
  );
  await page.route('https://fonts.gstatic.com/local/*', (r) => {
    const name = r.request().url().split('/').pop() ?? '';
    const file = FONT_FILES[name];
    if (!file) return r.abort();
    return r.fulfill({
      contentType: 'font/woff2',
      body: readFileSync(require.resolve(file)),
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  });
}

export async function settle(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
}

/** Scroll through the whole page so every one-time sequence gets triggered. */
export async function scrollThrough(page: Page): Promise<void> {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 300) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
  });
}
