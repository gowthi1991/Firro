// Zoho CRM hook, with a mocked HTTP client — no network.
import { test, expect } from '@playwright/test';
import {
  ZOHO_ACCOUNTS_URL,
  ZOHO_LEADS_URL,
  createZohoCrm,
  splitName,
  toZohoLead,
} from '../../src/server/zoho-crm';
import { createLeadHandler, type LeadDeps, type StoredLead } from '../../src/server/lead-handler';

const lead: StoredLead = {
  id: 'lead-1',
  created_at: '2026-09-30T10:00:00.000Z',
  name: 'Priya Raman',
  phone: '+919876543210',
  kitchen: 'Priya’s Tiffins',
  city: 'Coimbatore',
  meals: '50-200',
  current_tool: 'Register',
  consent: true,
  user_agent: 'x',
};
const config = { clientId: 'cid', clientSecret: 'csecret', refreshToken: 'rtoken' };

type Call = { url: string; init?: RequestInit };
function mockFetch(responses: { status: number; body: unknown }[]) {
  const calls: Call[] = [];
  const impl = async (url: string, init?: RequestInit) => {
    calls.push({ url, init });
    const r = responses.shift() ?? { status: 500, body: {} };
    return new Response(JSON.stringify(r.body), {
      status: r.status,
      headers: { 'Content-Type': 'application/json' },
    });
  };
  return { impl, calls };
}
const tokenOk = { status: 200, body: { access_token: 'at-1', expires_in: 3600 } };
const leadOk = { status: 201, body: { data: [{ code: 'SUCCESS', details: { id: 'z1' } }] } };

test('maps a stored lead to Zoho fields', () => {
  expect(toZohoLead(lead)).toEqual({
    First_Name: 'Priya',
    Last_Name: 'Raman',
    Company: 'Priya’s Tiffins',
    Phone: '+919876543210',
    Mobile: '+919876543210',
    City: 'Coimbatore',
    Lead_Source: 'Website',
    Description: 'Meals a day: 50 to 200\nUses today: Register\nFirro lead id: lead-1',
  });
  expect(toZohoLead({ ...lead, current_tool: null }).Description).toContain('Uses today: —');
});

test('splitName: Zoho needs Last_Name', () => {
  expect(splitName('Meena')).toEqual({ Last_Name: 'Meena' });
  expect(splitName('  S  K  Ravi ')).toEqual({ First_Name: 'S K', Last_Name: 'Ravi' });
});

test('refreshes a token on the India data centre, then creates the lead', async () => {
  const { impl, calls } = mockFetch([tokenOk, leadOk]);
  await createZohoCrm(config, impl)(lead);
  expect(calls).toHaveLength(2);

  expect(calls[0]!.url).toBe(ZOHO_ACCOUNTS_URL);
  expect(ZOHO_ACCOUNTS_URL).toBe('https://accounts.zoho.in/oauth/v2/token');
  const form = new URLSearchParams(String(calls[0]!.init?.body));
  expect(Object.fromEntries(form)).toEqual({
    refresh_token: 'rtoken',
    client_id: 'cid',
    client_secret: 'csecret',
    grant_type: 'refresh_token',
  });

  expect(calls[1]!.url).toBe(ZOHO_LEADS_URL);
  expect(ZOHO_LEADS_URL.startsWith('https://www.zohoapis.in/crm/')).toBe(true);
  expect((calls[1]!.init?.headers as Record<string, string>).Authorization).toBe(
    'Zoho-oauthtoken at-1',
  );
  const body = JSON.parse(String(calls[1]!.init?.body));
  expect(body.data).toEqual([toZohoLead(lead)]);
});

test('reuses the access token until it expires', async () => {
  const { impl, calls } = mockFetch([tokenOk, leadOk, leadOk]);
  const create = createZohoCrm(config, impl);
  await create(lead);
  await create(lead);
  expect(calls.map((c) => c.url)).toEqual([ZOHO_ACCOUNTS_URL, ZOHO_LEADS_URL, ZOHO_LEADS_URL]);
});

test('throws on a token error or a rejected lead, and refetches the token after a 401', async () => {
  await expect(
    createZohoCrm(config, mockFetch([{ status: 400, body: { error: 'invalid_code' } }]).impl)(lead),
  ).rejects.toThrow(/Zoho token 400: invalid_code/);

  await expect(
    createZohoCrm(
      config,
      mockFetch([
        tokenOk,
        { status: 202, body: { data: [{ code: 'DUPLICATE_DATA', message: 'dup' }] } },
      ]).impl,
    )(lead),
  ).rejects.toThrow(/DUPLICATE_DATA/);

  const { impl, calls } = mockFetch([tokenOk, { status: 401, body: {} }, tokenOk, leadOk]);
  const create = createZohoCrm(config, impl);
  await expect(create(lead)).rejects.toThrow(/Zoho lead 401/);
  await create(lead);
  expect(calls.map((c) => c.url)).toEqual([
    ZOHO_ACCOUNTS_URL,
    ZOHO_LEADS_URL,
    ZOHO_ACCOUNTS_URL,
    ZOHO_LEADS_URL,
  ]);
});

// ---- handler integration ---------------------------------------------------------------

function handlerWith(crm: LeadDeps['crm']) {
  const logs: string[] = [];
  const log = (...a: unknown[]) => logs.push(a.map((x) => JSON.stringify(x)).join(' '));
  const handle = createLeadHandler({
    store: {
      countRecentByPhone: async () => 0,
      insert: async () => ({ id: 'lead-1', created_at: '2026-09-30T10:00:00.000Z' }),
    },
    notify: async () => {},
    crm,
    hashIp: async () => 'h',
    log: { info: log, warn: log, error: log },
  });
  return { handle, logs };
}
const valid = {
  name: 'Priya Raman',
  phone: '9876543210',
  kitchen: 'K',
  city: 'Coimbatore',
  meals: '50-200',
  consent: true,
};
const post = (b: unknown) =>
  new Request('https://x/api/lead', { method: 'POST', body: JSON.stringify(b) });

test('handler syncs a stored lead to the CRM', async () => {
  const synced: StoredLead[] = [];
  const { handle, logs } = handlerWith(async (l) => void synced.push(l));
  expect((await handle(post(valid))).status).toBe(200);
  expect(synced.map((l) => [l.id, l.phone])).toEqual([['lead-1', '+919876543210']]);
  expect(logs.join('\n')).toContain('CRM synced');
});

test('a CRM failure never fails the request', async () => {
  const { handle, logs } = handlerWith(async () => {
    throw new Error('zoho down');
  });
  const res = await handle(post(valid));
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ ok: true });
  expect(logs.join('\n')).toContain('CRM sync failed');
});

test('CRM is not called for invalid leads or honeypot hits', async () => {
  let calls = 0;
  const { handle } = handlerWith(async () => void calls++);
  expect((await handle(post({ ...valid, phone: '1' }))).status).toBe(400);
  expect((await handle(post({ ...valid, website: 'spam' }))).status).toBe(200);
  expect(calls).toBe(0);
});
