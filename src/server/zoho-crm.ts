// Optional Zoho CRM hook (India data centre). Off unless ZOHO_CRM_CLIENT_ID, ZOHO_CRM_CLIENT_SECRET
// and ZOHO_CRM_REFRESH_TOKEN are all set. Creates one Lead per stored demo request.
// See README → "Zoho CRM (optional)" for creating the self-client and refresh token.
import { demo } from '../content/site';
import type { StoredLead } from './lead-handler';

export const ZOHO_ACCOUNTS_URL = 'https://accounts.zoho.in/oauth/v2/token';
export const ZOHO_LEADS_URL = 'https://www.zohoapis.in/crm/v8/Leads';

export interface ZohoConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

const mealsLabel = (v: string) => demo.fields.mealsOptions.find((o) => o.value === v)?.label ?? v;

/** Zoho requires Last_Name; split "Priya Raman" → First "Priya", Last "Raman"; one word → Last only. */
export function splitName(name: string): { First_Name?: string; Last_Name: string } {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return { Last_Name: parts[0] ?? name };
  return { First_Name: parts.slice(0, -1).join(' '), Last_Name: parts[parts.length - 1]! };
}

export function toZohoLead(lead: StoredLead): Record<string, string> {
  const description = [
    `Meals a day: ${mealsLabel(lead.meals)}`,
    `Uses today: ${lead.current_tool ?? '—'}`,
    `Firro lead id: ${lead.id}`,
  ].join('\n');
  return {
    ...splitName(lead.name),
    Company: lead.kitchen,
    Phone: lead.phone,
    Mobile: lead.phone,
    City: lead.city,
    Lead_Source: 'Website',
    Description: description,
  };
}

/** Returns a notifier that creates a Zoho CRM Lead. Access tokens are cached until shortly before expiry. */
export function createZohoCrm(config: ZohoConfig, fetchImpl: FetchLike = fetch) {
  let token: { value: string; expiresAt: number } | null = null;

  async function accessToken(): Promise<string> {
    if (token && Date.now() < token.expiresAt) return token.value;
    const body = new URLSearchParams({
      refresh_token: config.refreshToken,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: 'refresh_token',
    });
    const res = await fetchImpl(ZOHO_ACCOUNTS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: AbortSignal.timeout(8000),
    });
    const json = (await res.json().catch(() => ({}))) as {
      access_token?: string;
      expires_in?: number;
      error?: string;
    };
    if (!res.ok || !json.access_token) {
      throw new Error(`Zoho token ${res.status}: ${json.error ?? 'no access_token'}`);
    }
    // refresh a minute early
    token = {
      value: json.access_token,
      expiresAt: Date.now() + ((json.expires_in ?? 3600) - 60) * 1000,
    };
    return token.value;
  }

  return async function createLead(lead: StoredLead): Promise<void> {
    const res = await fetchImpl(ZOHO_LEADS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Zoho-oauthtoken ${await accessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: [toZohoLead(lead)], trigger: [] }),
      signal: AbortSignal.timeout(8000),
    });
    const json = (await res.json().catch(() => ({}))) as {
      data?: { code?: string; message?: string }[];
    };
    const result = json.data?.[0];
    if (!res.ok || result?.code !== 'SUCCESS') {
      if (res.status === 401) token = null; // token revoked or expired early: refetch next time
      throw new Error(
        `Zoho lead ${res.status}: ${result?.code ?? ''} ${result?.message ?? ''}`.trim(),
      );
    }
  };
}
