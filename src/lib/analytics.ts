// Vercel Web Analytics + Speed Insights (cookie-free). Page views are automatic once injected;
// custom events (book_demo_click, whatsapp_click, form_submit) go through track().
// Both scripts are served from this origin (/_vercel/...), which the CSP in vercel.json allows.
import { inject, track as vercelTrack } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';

export type EventName = 'book_demo_click' | 'whatsapp_click' | 'form_submit' | (string & {});
type Props = Record<string, string | number | boolean | null | undefined>;

const LOCAL_HOST = /^(localhost|127\.0\.0\.1|\[::1\])$/;

/** Only on real Vercel deployments: local dev, tests and `npm run preview` have no /_vercel routes. */
export function initAnalytics(): void {
  if (!import.meta.env.PROD || LOCAL_HOST.test(location.hostname)) return;
  inject({ mode: 'production', framework: 'astro' });
  injectSpeedInsights({ framework: 'astro' });
}

export function track(event: EventName, props: Props = {}): void {
  if (import.meta.env.DEV) console.debug('[track]', event, props);
  // Vercel accepts flat primitive properties only; drop undefined values.
  const clean = Object.fromEntries(Object.entries(props).filter(([, v]) => v !== undefined));
  vercelTrack(event, clean);
}

/** Fires `track()` for clicks on any element carrying `data-event`. */
export function wireDataEvents(root: Document = document): void {
  root.addEventListener('click', (e) => {
    const el = (e.target as Element | null)?.closest<HTMLElement>('[data-event]');
    if (!el?.dataset.event) return;
    const href = el.getAttribute('href') ?? undefined;
    // Keep the destination but not the prefilled WhatsApp text.
    track(el.dataset.event, { href: href?.split('?')[0] });
  });
}
