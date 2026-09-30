// Demo form: validates on blur and submit, shows inline errors, then calls the submitLead() stub.
// States: form → loading ("Booking…") → sent ("Got it.") or error (retry + WhatsApp fallback).

import { submitLead, type LeadPayload } from '../lib/lead';
import { normaliseIndianMobile } from '../lib/phone';
import { track } from '../lib/analytics';

type Field = HTMLInputElement | HTMLSelectElement;

function isValid(el: Field): boolean {
  if (el instanceof HTMLInputElement && el.type === 'checkbox') return el.checked;
  const v = el.value.trim();
  if (el.name === 'phone') return normaliseIndianMobile(v) !== null;
  return v.length > 0;
}

function setError(el: Field, show: boolean): void {
  const err = document.getElementById(`${el.id}-err`);
  if (show) {
    el.setAttribute('aria-invalid', 'true');
    if (err) {
      err.textContent = el.dataset.error ?? '';
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

    let ok = true;
    if (!bot) {
      const payload: LeadPayload = {
        name: val('name'),
        phone: `+91${normaliseIndianMobile(val('phone'))}`,
        kitchen: val('kitchen'),
        city: val('city'),
        meals: val('meals'),
        current_tool: val('current_tool'),
        consent: data.get('consent') !== null,
        page: location.pathname,
        submitted_at: new Date().toISOString(),
      };
      try {
        ok = (await submitLead(payload)).ok;
      } catch {
        ok = false;
      }
      track('form_submit', { ok, meals: payload.meals });
    }

    submit.disabled = false;
    submit.removeAttribute('aria-busy');

    if (ok) {
      if (formState) formState.hidden = true;
      if (sentState) sentState.hidden = false;
      const title = form.querySelector<HTMLElement>('[data-sent-title]');
      if (status)
        status.textContent = `${title?.textContent ?? ''} ${sentState?.querySelector('p')?.textContent ?? ''}`;
      title?.focus();
    } else {
      submit.textContent = submit.dataset.retryLabel ?? submitLabel;
      if (failure) {
        failure.hidden = false;
        if (status) status.textContent = failure.textContent?.replace(/\s+/g, ' ').trim() ?? '';
      }
    }
  });
}
