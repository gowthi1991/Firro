// Server-side validation for demo-form leads. Pure module: used by the API route and unit tests.
// Error messages are the same copy the form shows (src/content/site.ts), so they can go straight inline.
import { z } from 'zod';
import { demo } from '../content/site';
import { normaliseIndianMobile } from './phone';

/** Allowed "Meals a day" values — the form's options minus the "Pick a range" placeholder. */
export const MEALS_VALUES = ['under-50', '50-200', '200-500', '500-plus'] as const;

/** Max request body, in bytes. */
export const MAX_BODY_BYTES = 5 * 1024;

const text = (max: number, message: string) =>
  z.string({ error: message }).trim().min(1, { error: message }).max(max, { error: message });

export const leadSchema = z.object({
  name: text(120, demo.errors.name),
  phone: z.string({ error: demo.errors.phone }).transform((v, ctx) => {
    const d = normaliseIndianMobile(v);
    if (!d) {
      ctx.addIssue({ code: 'custom', message: demo.errors.phone });
      return z.NEVER;
    }
    return `+91${d}`;
  }),
  kitchen: text(160, demo.errors.kitchen),
  city: text(80, demo.errors.city),
  meals: z.enum(MEALS_VALUES, { error: demo.errors.meals }),
  current_tool: z
    .string()
    .trim()
    .max(300)
    .optional()
    .transform((v) => (v ? v : null)),
  consent: z.literal(true, { error: demo.errors.consent }),
});

export type LeadInput = z.input<typeof leadSchema>;
export type Lead = z.output<typeof leadSchema>;
export type FieldErrors = Partial<Record<keyof LeadInput | 'form', string>>;

export type ValidationResult = { ok: true; lead: Lead } | { ok: false; errors: FieldErrors };

export function validateLead(input: unknown): ValidationResult {
  const r = leadSchema.safeParse(input);
  if (r.success) return { ok: true, lead: r.data };
  const errors: FieldErrors = {};
  for (const issue of r.error.issues) {
    const key = (issue.path[0] as keyof FieldErrors | undefined) ?? 'form';
    errors[key] ??= issue.message;
  }
  if (Object.keys(errors).length === 0) errors.form = demo.badRequest;
  return { ok: false, errors };
}

/** The form's hidden "website" field: humans never fill it. */
export function isHoneypot(input: unknown): boolean {
  if (!input || typeof input !== 'object') return false;
  const v = (input as Record<string, unknown>).website;
  return typeof v === 'string' && v.trim() !== '';
}
