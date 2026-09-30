// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://getfirro.com',
  // Pages are prerendered; only src/pages/api/lead.ts (prerender = false) runs as a Vercel function.
  output: 'static',
  adapter: vercel(),
  trailingSlash: 'ignore',
  integrations: [sitemap({ filter: (page) => !page.includes('/404') })],
  build: { inlineStylesheets: 'auto' },
});
