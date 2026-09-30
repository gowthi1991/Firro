// Analytics placeholder: no provider is installed. Wire a provider inside `track()` later.
export type EventName = 'book_demo_click' | 'whatsapp_click' | 'form_submit' | (string & {});

export function track(event: EventName, props: Record<string, unknown> = {}): void {
  // TODO(analytics): forward to the chosen provider (e.g. Plausible / GA4) once one is picked.
  if (import.meta.env.DEV) console.debug('[track]', event, props);
}

/** Fires `track()` for clicks on any element carrying `data-event`. */
export function wireDataEvents(root: Document = document): void {
  root.addEventListener('click', (e) => {
    const el = (e.target as Element | null)?.closest<HTMLElement>('[data-event]');
    if (el?.dataset.event) track(el.dataset.event, { href: el.getAttribute('href') ?? undefined });
  });
}
