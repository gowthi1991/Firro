// Demo form: validates on blur and submit, shows inline errors, then posts via submitLead().
// States: form → loading ("Booking…") → sent ("Got it."), inline server errors (400),
// or a failure panel (429 rate limit / anything else) with retry + WhatsApp fallback.

import { submitLead, type LeadPayload, type LeadResult } from '../lib/lead';
import { normaliseIndianMobile } from '../lib/phone';
import { track } from '../lib/analytics';

type Field = HTMLInputElement | HTMLSelectElement;

function isValid(el: Field): boolean {
  if (el instanceof HTMLInputElement && el.type === 'checkbox') return el.checked;
  const v = el.value.trim();
  if (el.name === 'phone') return normaliseIndianMobile(v) !== null;
  return v.length > 0;
}

function setError(el: Field, show: boolean, message?: string): void {
  const err = document.getElementById(`${el.id}-err`);
  if (show) {
    el.setAttribute('aria-invalid', 'true');
    if (err) {
      err.textContent = message ?? el.dataset.error ?? '';
      err.hidden = false;
    }
  } else {
    el.removeAttribute('aria-invalid');
    if (err) {
      err.textContent = '';
      err.hidden = true;
    }
  }
}

export function initForm(): void {
  const form = document.querySelector<HTMLFormElement>('[data-lead-form]');
  if (!form) return;
  const fields = [...form.querySelectorAll<Field>('[data-error]')];
  const submit = form.querySelector<HTMLButtonElement>('[data-submit]')!;
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  const failure = form.querySelector<HTMLElement>('[data-form-error]');
  const formState = form.querySelector<HTMLElement>('[data-form-state="form"]');
  const sentState = form.querySelector<HTMLElement>('[data-form-state="sent"]');
  const submitLabel = submit.textContent ?? '';

  for (const el of fields) {
    // blur: validate once the user has typed something (or left a required field they touched)
    el.addEventListener('blur', () => {
      if (el instanceof HTMLInputElement && el.type === 'checkbox') return;
      if (el.value.trim() !== '' || el.hasAttribute('aria-invalid')) setError(el, !isValid(el));
    });
    // clear the error as soon as the value becomes valid
    el.addEventListener(
      el.tagName === 'SELECT' || el.type === 'checkbox' ? 'change' : 'input',
      () => {
        if (el.hasAttribute('aria-invalid') && isValid(el)) setError(el, false);
      },
    );
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const invalid = fields.filter((el) => !isValid(el));
    fields.forEach((el) => setError(el, invalid.includes(el)));
    if (invalid.length) {
      invalid[0]?.focus();
      if (status) status.textContent = form.dataset.summaryError ?? '';
      return;
    }

    const data = new FormData(form);
    const val = (k: string) => String(data.get(k) ?? '').trim();

    // Honeypot filled → a bot. Pretend success, send nothing.
    const bot = val('website') !== '';

    submit.disabled = true;
    submit.setAttribute('aria-busy', 'true');
    submit.textContent = form.dataset.loadingLabel ?? submitLabel;
    if (failure) failure.hidden = true;

    let result: LeadResult = { ok: true, status: 200 };
    if (!bot) {
      const payload: LeadPayload = {
        name: val('name'),
        phone: `+91${normaliseIndianMobile(val('phone'))}`,
        kitchen: val('kitchen'),
        city: val('city'),
        meals: val('meals'),
        current_tool: val('current_tool'),
        consent: data.get('consent') !== null,
        website: '',
        page: location.pathname,
        submitted_at: new Date().toISOString(),
      };
      try {
        result = await submitLead(payload);
      } catch {
        result = { ok: false, status: 0 };
      }
      track('form_submit', { ok: result.ok, status: result.status, meals: payload.meals });
    }

    submit.disabled = false;
    submit.removeAttribute('aria-busy');

    if (result.ok) {
      if (formState) formState.hidden = true;
      if (sentState) sentState.hidden = false;
      const title = form.querySelector<HTMLElement>('[data-sent-title]');
      if (status)
        status.textContent = `${title?.textContent ?? ''} ${sentState?.querySelector('p')?.textContent ?? ''}`;
      title?.focus();
      return;
    }

    submit.textContent = submit.dataset.retryLabel ?? submitLabel;

    // 400 with per-field errors: show the server's messages inline, like client-side validation.
    const fieldErrors = Object.entries(result.errors ?? {}).filter(([k]) => k !== 'form');
    const shown = fieldErrors
      .map(([k, msg]) => {
        const el = fields.find((f) => f.name === k);
        if (el) setError(el, true, msg);
        return el;
      })
      .filter((el): el is Field => !!el);
    if (result.status === 400 && shown.length) {
      shown[0]?.focus();
      if (status) status.textContent = form.dataset.summaryError ?? '';
      return;
    }

    if (failure) {
      const t = failure.querySelector<HTMLElement>('[data-failure-title]');
      const b = failure.querySelector<HTMLElement>('[data-failure-body]');
      t?.setAttribute('data-default', t.getAttribute('data-default') ?? t.textContent ?? '');
      b?.setAttribute('data-default', b.getAttribute('data-default') ?? b.textContent ?? '');
      if (result.status === 429) {
        if (t) t.textContent = failure.dataset.limitTitle ?? '';
        if (b) b.textContent = failure.dataset.limitBody ?? '';
      } else {
        if (t) t.textContent = t.dataset.default ?? '';
        if (b) b.textContent = result.errors?.form ?? b.dataset.default ?? '';
      }
      failure.hidden = false;
      if (status) status.textContent = failure.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    }
  });
}
