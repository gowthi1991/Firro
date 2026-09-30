export interface LeadPayload {
  name: string;
  phone: string;
  kitchen: string;
  city: string;
  meals: string;
  current_tool: string;
  consent: boolean;
  page: string;
  submitted_at: string;
}

// TODO(backend): replace with real endpoint (Supabase/edge function + email/WhatsApp notify)
export async function submitLead(p: LeadPayload): Promise<{ ok: boolean }> {
  const url = import.meta.env.PUBLIC_LEAD_ENDPOINT;
  if (url) {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p),
    });
    return { ok: r.ok };
  }
  console.info('[lead:stub]', p);
  await new Promise((r) => setTimeout(r, 600));
  return { ok: true };
}
