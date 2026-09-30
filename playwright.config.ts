import { defineConfig, devices } from '@playwright/test';

// `npm run test` expects a fresh `npm run build` (CI does this first).
// Two servers: the built site (astro preview) and the approved design reference.
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
      command: 'npm run preview -- --port 4321',
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
