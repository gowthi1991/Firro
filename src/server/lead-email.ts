// Notification email for a new lead: every field plus a one-tap WhatsApp link to the lead.
import { demo } from '../content/site';
import type { StoredLead } from './lead-handler';

const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );

const mealsLabel = (v: string) => demo.fields.mealsOptions.find((o) => o.value === v)?.label ?? v;

export function buildLeadEmail(lead: StoredLead): { subject: string; text: string; html: string } {
  const wa = `https://wa.me/${lead.phone.replace(/^\+/, '')}`;
  const rows: [string, string][] = [
    ['Name', lead.name],
    ['Phone', lead.phone],
    ['Kitchen', lead.kitchen],
    ['City', lead.city],
    ['Meals a day', mealsLabel(lead.meals)],
    ['Uses today', lead.current_tool ?? '—'],
    ['Consent to contact', lead.consent ? 'Yes' : 'No'],
    ['Received', lead.created_at],
    ['Lead ID', lead.id],
  ];
  const subject = `New demo request: ${lead.kitchen} (${lead.city})`;
  const text = [
    `New demo request from the website.`,
    '',
    ...rows.map(([k, v]) => `${k}: ${v}`),
    '',
    `WhatsApp: ${wa}`,
  ].join('\n');
  const html = `<!doctype html><html><body style="font-family:system-ui,sans-serif;color:#0E3320">
<h2 style="margin:0 0 12px">New demo request</h2>
<p style="margin:0 0 16px"><a href="${esc(wa)}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:#1F4A33;color:#FBF1D2;text-decoration:none;font-weight:700">Message ${esc(lead.name)} on WhatsApp</a></p>
<table cellpadding="6" style="border-collapse:collapse">
${rows.map(([k, v]) => `<tr><td style="color:#6F6957">${esc(k)}</td><td><strong>${esc(v)}</strong></td></tr>`).join('\n')}
</table>
</body></html>`;
  return { subject, text, html };
}
