import type { FieldErrors } from './lead-schema';

export interface LeadPayload {
  name: string;
  phone: string;
  kitchen: string;
  city: string;
  meals: string;
  current_tool: string;
  consent: boolean;
  /** Honeypot. Always empty from a real browser; the server drops anything that fills it. */
  website: string;
  page: string;
  submitted_at: string;
}

export interface LeadResult {
  ok: boolean;
  /** HTTP status; 0 for a network failure. */
  status: number;
  errors?: FieldErrors;
  message?: string;
}

/**
 * Sends a demo request. Defaults to the Vercel function at /api/lead (src/pages/api/lead.ts).
 * Set PUBLIC_LEAD_ENDPOINT to another URL to post elsewhere, or to "stub" to only log locally.
 */
export async function submitLead(p: LeadPayload): Promise<LeadResult> {
  const url = import.meta.env.PUBLIC_LEAD_ENDPOINT || '/api/lead';
  if (url === 'stub') {
    console.info('[lead:stub]', p);
    await new Promise((r) => setTimeout(r, 600));
    return { ok: true, status: 200 };
  }
  let r: Response;
  try {
    r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p),
    });
  } catch {
    return { ok: false, status: 0 };
  }
  let body: { ok?: boolean; errors?: FieldErrors; message?: string } = {};
  try {
    body = await r.json();
  } catch {
    // non-JSON reply (e.g. a proxy error page)
  }
  return {
    ok: r.ok && body.ok !== false,
    status: r.status,
    errors: body.errors,
    message: body.message,
  };
}
