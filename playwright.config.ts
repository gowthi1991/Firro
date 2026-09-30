import { defineConfig, devices } from '@playwright/test';

// `npm run test` expects a fresh `npm run build` (CI does this first).
// Two servers: the built site (static output) and the approved design reference.
export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      // The Vercel adapter has no `astro preview`; serve the prerendered output statically.
      // /api/lead isn't served here — tests that submit the form mock it with page.route().
      command: 'npx http-server .vercel/output/static -p 4321 -s -c-1',
      url: 'http://localhost:4321',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: 'npx http-server handoff/design/reference -p 4400 -s -c-1',
      url: 'http://localhost:4400/firro-home-v3.html',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
});
