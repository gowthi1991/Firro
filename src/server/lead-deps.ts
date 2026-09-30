// Production dependencies for the lead handler: Neon Postgres, Resend email, salted IP hashing.
// Reads DATABASE_URL, RESEND_API_KEY, LEAD_NOTIFY_EMAIL, LEAD_FROM_EMAIL, IP_HASH_SALT at runtime.
import { neon } from '@neondatabase/serverless';
import migration from '../../migrations/001_leads.sql?raw';
import { buildLeadEmail } from './lead-email';
import { sha256Hex, type LeadDeps, type LeadStore, type StoredLead } from './lead-handler';

const env = (k: string) => process.env[k]?.trim() || undefined;

function createStore(url: string): LeadStore {
  const sql = neon(url);
  let ready: Promise<void> | null = null;
  // Create the table on first use (idempotent); migrations/001_leads.sql is the single source.
  const ensureTable = () =>
    (ready ??= (async () => {
      const statements = migration
        .split(/;\s*$/m)
        .map((s) => s.replace(/^\s*--.*$/gm, '').trim())
        .filter(Boolean);
      for (const s of statements) await sql.query(s);
    })().catch((err) => {
      ready = null; // retry on the next request
      throw err;
    }));

  return {
    async countRecentByPhone(phone) {
      await ensureTable();
      const rows = await sql.query(
        `SELECT count(*)::int AS n FROM leads WHERE phone = $1 AND created_at > now() - interval '24 hours'`,
        [phone],
      );
      return Number((rows[0] as { n: number } | undefined)?.n ?? 0);
    },
    async insert(l) {
      await ensureTable();
      const rows = await sql.query(
        `INSERT INTO leads (name, phone, kitchen, city, meals, current_tool, consent, user_agent, ip_hash)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, created_at`,
        [
          l.name,
          l.phone,
          l.kitchen,
          l.city,
          l.meals,
          l.current_tool,
          l.consent,
          l.user_agent,
          l.ip_hash,
        ],
      );
      const r = rows[0] as { id: string; created_at: string | Date };
      return { id: r.id, created_at: new Date(r.created_at).toISOString() };
    },
  };
}

async function sendEmail(lead: StoredLead): Promise<void> {
  const key = env('RESEND_API_KEY');
  const to = env('LEAD_NOTIFY_EMAIL');
  if (!key || !to) {
    console.warn(
      '[lead] RESEND_API_KEY or LEAD_NOTIFY_EMAIL not set; skipping notification',
      lead.id,
    );
    return;
  }
  const { subject, text, html } = buildLeadEmail(lead);
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env('LEAD_FROM_EMAIL') ?? 'Firro leads <onboarding@resend.dev>',
      to: to.split(',').map((s) => s.trim()),
      subject,
      text,
      html,
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 300)}`);
}

let deps: LeadDeps | null = null;
export function leadDeps(): LeadDeps {
  if (deps) return deps;
  const url = env('DATABASE_URL');
  const salt = env('IP_HASH_SALT') ?? '';
  return (deps = {
    store: url ? createStore(url) : null,
    notify: sendEmail,
    hashIp: (ip) => sha256Hex(`${salt}${ip}`),
    log: console,
  });
}
