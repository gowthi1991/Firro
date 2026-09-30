// POST /api/lead — framework-free handler with injected dependencies (DB, email, hashing),
// so it can be unit-tested without a database. Wired up in src/pages/api/lead.ts.
import { demo } from '../content/site';
import {
  MAX_BODY_BYTES,
  isHoneypot,
  validateLead,
  type FieldErrors,
  type Lead,
} from '../lib/lead-schema';

/** Max submissions per phone number in a rolling 24h window. */
export const RATE_LIMIT_PER_DAY = 3;

export interface StoredLead extends Lead {
  id: string;
  created_at: string;
  user_agent: string | null;
}

export interface LeadStore {
  countRecentByPhone(phone: string): Promise<number>;
  insert(
    lead: Lead & { user_agent: string | null; ip_hash: string | null },
  ): Promise<{ id: string; created_at: string }>;
}

export interface LeadDeps {
  /** null when DATABASE_URL isn't configured. */
  store: LeadStore | null;
  notify(lead: StoredLead): Promise<void>;
  /** Optional CRM sync (Zoho); undefined when not configured. */
  crm?: (lead: StoredLead) => Promise<void>;
  hashIp(ip: string): Promise<string>;
  log: Pick<Console, 'info' | 'warn' | 'error'>;
}

export type LeadResponseBody =
  | { ok: true }
  | { ok: false; errors: FieldErrors }
  | { ok: false; message: string; errors?: FieldErrors };

const json = (status: number, body: LeadResponseBody) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

/** SHA-256 of salt + IP, hex. The raw IP is never stored. */
export async function sha256Hex(value: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function createLeadHandler(deps: LeadDeps) {
  return async function handle(request: Request, clientAddress?: string): Promise<Response> {
    const declared = Number(request.headers.get('content-length') ?? 0);
    if (declared > MAX_BODY_BYTES) return json(413, { ok: false, errors: { form: demo.tooLarge } });

    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
      return json(413, { ok: false, errors: { form: demo.tooLarge } });
    }

    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return json(400, { ok: false, errors: { form: demo.badRequest } });
    }

    if (isHoneypot(body)) {
      deps.log.info('[lead] honeypot filled; dropped');
      return json(200, { ok: true });
    }

    const result = validateLead(body);
    if (!result.ok) return json(400, { ok: false, errors: result.errors });
    const lead = result.lead;

    if (!deps.store) {
      deps.log.error('[lead] DATABASE_URL is not set; lead not stored');
      return json(503, { ok: false, message: demo.failure.body });
    }

    try {
      if ((await deps.store.countRecentByPhone(lead.phone)) >= RATE_LIMIT_PER_DAY) {
        return json(429, {
          ok: false,
          message: `${demo.rateLimited.title} ${demo.rateLimited.body}`,
        });
      }
      const user_agent = request.headers.get('user-agent')?.slice(0, 400) ?? null;
      const ip_hash = clientAddress ? await deps.hashIp(clientAddress) : null;
      const saved = await deps.store.insert({ ...lead, user_agent, ip_hash });
      deps.log.info('[lead] stored', saved.id); // id only — no personal data in logs

      // The lead is stored; a failed email or CRM sync must never fail the request.
      const stored: StoredLead = { ...lead, ...saved, user_agent };
      const [mail, crm] = await Promise.allSettled([
        deps.notify(stored),
        deps.crm ? deps.crm(stored) : Promise.resolve(),
      ]);
      if (mail.status === 'rejected') {
        deps.log.error('[lead] notification failed', { id: saved.id, err: String(mail.reason) });
      }
      if (crm.status === 'rejected') {
        deps.log.error('[lead] CRM sync failed', { id: saved.id, err: String(crm.reason) });
      } else if (deps.crm) {
        deps.log.info('[lead] CRM synced', saved.id);
      }
      return json(200, { ok: true });
    } catch (err) {
      deps.log.error('[lead] storage failed', String(err));
      return json(500, { ok: false, message: demo.failure.body });
    }
  };
}
