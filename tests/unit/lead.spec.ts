// Unit tests for lead capture: no browser, no database. Run with the rest via `npm run test`.
import { test, expect } from '@playwright/test';
import { normaliseIndianMobile } from '../../src/lib/phone';
import { MEALS_VALUES, MAX_BODY_BYTES, isHoneypot, validateLead } from '../../src/lib/lead-schema';
import {
  RATE_LIMIT_PER_DAY,
  createLeadHandler,
  sha256Hex,
  type LeadDeps,
  type LeadStore,
  type StoredLead,
} from '../../src/server/lead-handler';
import { buildLeadEmail } from '../../src/server/lead-email';
import { neonRegion } from '../../src/server/neon-region';
import { demo } from '../../src/content/site';

const valid = {
  name: '  Meena  ',
  phone: '+91 98765 43210',
  kitchen: 'Meena’s Tiffins',
  city: 'Coimbatore',
  meals: '50-200',
  current_tool: '',
  consent: true,
  website: '',
  page: '/',
  submitted_at: '2026-09-30T10:00:00.000Z',
};

test.describe('normaliseIndianMobile', () => {
  for (const [input, out] of [
    ['9876543210', '9876543210'],
    ['+91 98765 43210', '9876543210'],
    ['+91-98765-43210', '9876543210'],
    ['919876543210', '9876543210'],
    ['09876543210', '9876543210'],
    ['(+91) 6000 000 000', '6000000000'],
  ] as const) {
    test(`accepts ${input}`, () => expect(normaliseIndianMobile(input)).toBe(out));
  }
  for (const input of [
    '5876543210',
    '98765432',
    '98765432101',
    '+1 415 555 0100',
    'abcdefghij',
    '',
  ]) {
    test(`rejects "${input}"`, () => expect(normaliseIndianMobile(input)).toBeNull());
  }
});

test.describe('validateLead', () => {
  test('accepts a valid lead, trims and normalises', () => {
    const r = validateLead(valid);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.lead).toEqual({
      name: 'Meena',
      phone: '+919876543210',
      kitchen: 'Meena’s Tiffins',
      city: 'Coimbatore',
      meals: '50-200',
      current_tool: null,
      consent: true,
    });
  });

  test('keeps an optional current_tool', () => {
    const r = validateLead({ ...valid, current_tool: ' Register ' });
    expect(r.ok && r.lead.current_tool).toBe('Register');
  });

  test('reports every invalid field with the form’s own copy', () => {
    const r = validateLead({
      name: ' ',
      phone: '12345',
      kitchen: '',
      city: '',
      meals: 'lots',
      consent: false,
    });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.errors).toEqual({
      name: demo.errors.name,
      phone: demo.errors.phone,
      kitchen: demo.errors.kitchen,
      city: demo.errors.city,
      meals: demo.errors.meals,
      consent: demo.errors.consent,
    });
  });

  test('consent must be literally true', () => {
    for (const consent of ['true', 1, 'on', undefined]) {
      const r = validateLead({ ...valid, consent });
      expect(r.ok, String(consent)).toBe(false);
    }
  });

  test('rejects over-long fields and non-object bodies', () => {
    expect(validateLead({ ...valid, name: 'x'.repeat(121) }).ok).toBe(false);
    expect(validateLead({ ...valid, current_tool: 'x'.repeat(301) }).ok).toBe(false);
    expect(validateLead(null).ok).toBe(false);
    expect(validateLead('hello').ok).toBe(false);
  });

  test('meals values match the form options', () => {
    const formValues = demo.fields.mealsOptions.map((o) => o.value).filter(Boolean);
    expect([...MEALS_VALUES]).toEqual(formValues);
  });

  test('isHoneypot', () => {
    expect(isHoneypot(valid)).toBe(false);
    expect(isHoneypot({ ...valid, website: ' ' })).toBe(false);
    expect(isHoneypot({ ...valid, website: 'https://spam.example' })).toBe(true);
    expect(isHoneypot(null)).toBe(false);
  });
});

// ---- handler, with an in-memory store ----------------------------------------------------

function setup(
  opts: { recent?: number; notifyFails?: boolean; noStore?: boolean; dbFails?: boolean } = {},
) {
  const inserted: Parameters<LeadStore['insert']>[0][] = [];
  const notified: StoredLead[] = [];
  const logs: string[] = [];
  const store: LeadStore = {
    async countRecentByPhone() {
      if (opts.dbFails) throw new Error('db down');
      return opts.recent ?? 0;
    },
    async insert(l) {
      inserted.push(l);
      return { id: '00000000-0000-4000-8000-000000000001', created_at: '2026-09-30T10:00:00.000Z' };
    },
  };
  const deps: LeadDeps = {
    store: opts.noStore ? null : store,
    async notify(l) {
      if (opts.notifyFails) throw new Error('resend down');
      notified.push(l);
    },
    hashIp: (ip) => sha256Hex(`salt${ip}`),
    log: {
      info: (...a: unknown[]) => logs.push(a.map(String).join(' ')),
      warn: (...a: unknown[]) => logs.push(a.map(String).join(' ')),
      error: (...a: unknown[]) => logs.push(a.map(String).join(' ')),
    },
  };
  return { handle: createLeadHandler(deps), inserted, notified, logs };
}

const post = (body: unknown, headers: Record<string, string> = {}) =>
  new Request('https://getfirro.com/api/lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': 'unit-test', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

test.describe('POST /api/lead handler', () => {
  test('stores a valid lead, hashes the IP, notifies, returns {ok:true}', async () => {
    const { handle, inserted, notified } = setup();
    const res = await handle(post(valid), '203.0.113.7');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(inserted).toHaveLength(1);
    expect(inserted[0]).toMatchObject({ phone: '+919876543210', user_agent: 'unit-test' });
    expect(inserted[0]!.ip_hash).toBe(await sha256Hex('salt203.0.113.7'));
    expect(inserted[0]!.ip_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.stringify(inserted[0])).not.toContain('203.0.113.7');
    expect(notified).toHaveLength(1);
    expect(notified[0]!.id).toBe('00000000-0000-4000-8000-000000000001');
  });

  test('400 with field errors for an invalid lead', async () => {
    const { handle, inserted } = setup();
    const res = await handle(post({ ...valid, phone: '123', meals: 'x' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(Object.keys(body.errors).sort()).toEqual(['meals', 'phone']);
    expect(inserted).toHaveLength(0);
  });

  test('400 for malformed JSON', async () => {
    const { handle } = setup();
    const res = await handle(post('{not json'));
    expect(res.status).toBe(400);
    expect((await res.json()).errors.form).toBe(demo.badRequest);
  });

  test('413 for bodies over 5 KB (actual size and declared length)', async () => {
    const { handle, inserted } = setup();
    const big = { ...valid, current_tool: 'x'.repeat(MAX_BODY_BYTES) };
    expect((await handle(post(big))).status).toBe(413);
    expect(
      (await handle(post(valid, { 'Content-Length': String(MAX_BODY_BYTES + 1) }))).status,
    ).toBe(413);
    expect(inserted).toHaveLength(0);
  });

  test('honeypot: 200 and nothing stored or sent', async () => {
    const { handle, inserted, notified } = setup();
    const res = await handle(post({ ...valid, website: 'http://spam' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(inserted).toHaveLength(0);
    expect(notified).toHaveLength(0);
  });

  test(`429 after ${RATE_LIMIT_PER_DAY} submissions for the same phone in 24h`, async () => {
    const { handle, inserted } = setup({ recent: RATE_LIMIT_PER_DAY });
    const res = await handle(post(valid));
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.message).toContain(demo.rateLimited.title);
    expect(inserted).toHaveLength(0);
    expect((await setup({ recent: RATE_LIMIT_PER_DAY - 1 }).handle(post(valid))).status).toBe(200);
  });

  test('a failed email does not fail the request, and is logged', async () => {
    const { handle, inserted, logs } = setup({ notifyFails: true });
    const res = await handle(post(valid));
    expect(res.status).toBe(200);
    expect(inserted).toHaveLength(1);
    expect(logs.join('\n')).toContain('notification failed');
  });

  test('503 when DATABASE_URL is missing; 500 when the database errors', async () => {
    expect((await setup({ noStore: true }).handle(post(valid))).status).toBe(503);
    expect((await setup({ dbFails: true }).handle(post(valid))).status).toBe(500);
  });

  test('responses are JSON and never cached', async () => {
    const res = await setup().handle(post(valid));
    expect(res.headers.get('content-type')).toContain('application/json');
    expect(res.headers.get('cache-control')).toBe('no-store');
  });
});

test.describe('notification email', () => {
  const lead: StoredLead = {
    id: 'abc',
    created_at: '2026-09-30T10:00:00.000Z',
    name: '<script>alert(1)</script>',
    phone: '+919876543210',
    kitchen: 'Tiffin & Co',
    city: 'Coimbatore',
    meals: '200-500',
    current_tool: null,
    consent: true,
    user_agent: 'x',
  };

  test('includes every field and a one-tap wa.me link', () => {
    const { subject, text, html } = buildLeadEmail(lead);
    expect(subject).toBe('New demo request: Tiffin & Co (Coimbatore)');
    expect(text).toContain('https://wa.me/919876543210');
    expect(html).toContain('href="https://wa.me/919876543210"');
    for (const v of ['+919876543210', 'Coimbatore', '200 to 500', 'abc']) expect(text).toContain(v);
  });

  test('escapes user input in HTML', () => {
    const { html } = buildLeadEmail(lead);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('Tiffin &amp; Co');
  });
});

test.describe('neonRegion', () => {
  test('reads the region from a Neon host, never returning credentials', () => {
    expect(
      neonRegion(
        'postgresql://user:pw@ep-cool-name-a1b2c3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
      ),
    ).toBe('ap-southeast-1');
    expect(neonRegion('postgres://u:p@ep-x.us-east-2.aws.neon.tech:5432/db')).toBe('us-east-2');
    expect(neonRegion('postgres://u:p@localhost:5432/db')).toBe('unknown');
    expect(neonRegion('')).toBe('unknown');
  });
});
