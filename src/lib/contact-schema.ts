import { z } from 'zod';
import { TOPICS } from '@/lib/contact-topics';

// Control characters (except tab/newline/carriage return, handled per field below) are stripped from every field.
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/** Single-line fields can never carry a line break into an email header. */
export const singleLine = (s: string): string =>
  s.replace(CONTROL_CHARS, '').replace(/[\r\n\t]+/g, ' ').replace(/ {2,}/g, ' ').trim();

export const multiLine = (s: string): string => s.replace(CONTROL_CHARS, '').replace(/\r\n?/g, '\n').trim();

export const contactSchema = z.object({
  name: z
    .string()
    .transform(singleLine)
    .pipe(
      z
        .string()
        .min(1, 'Please add your name.')
        .max(100, 'Please keep your name under 100 characters.'),
    ),
  email: z
    .string()
    .transform(singleLine)
    .pipe(z.email('Please enter a valid email address.').max(254, 'That email address is too long.')),
  topic: z.enum(TOPICS, { error: 'Please choose a topic.' }),
  message: z
    .string()
    .transform(multiLine)
    .pipe(
      z
        .string()
        .min(10, 'Please write a few words so I know how to help.')
        .max(5000, 'Please keep your message under 5,000 characters.'),
    ),
  /** Honeypot: real visitors never see or fill this field. */
  company: z.string().max(500).optional().default(''),
  /** Client timestamp (ms) from when the form was rendered; used for a minimum-time check. */
  startedAt: z.number().int().positive().optional(),
});

export type ContactInput = z.input<typeof contactSchema>;
export type ContactData = z.output<typeof contactSchema>;

export type ValidationResult =
  | { success: true; data: ContactData }
  | { success: false; fieldErrors: Record<string, string> };

export function validateContact(body: unknown): ValidationResult {
  const parsed = contactSchema.safeParse(body);
  if (parsed.success) return { success: true, data: parsed.data };
  const fieldErrors: Record<string, string> = {};
  for (const issue of parsed.error.issues) {
    const key = String(issue.path[0] ?? 'form');
    if (!(key in fieldErrors)) fieldErrors[key] = issue.message;
  }
  return { success: false, fieldErrors };
}

export type SpamVerdict =
  | { spam: false }
  | { spam: true; reason: 'honeypot' | 'missing-timestamp' | 'too-fast' | 'too-old' };

export const MIN_FILL_MS = 2500;
export const MAX_FORM_AGE_MS = 24 * 60 * 60 * 1000;

export function checkSpam(
  data: Pick<ContactData, 'company' | 'startedAt'>,
  now: number = Date.now(),
): SpamVerdict {
  if (data.company && data.company.trim() !== '') return { spam: true, reason: 'honeypot' };
  if (!data.startedAt) return { spam: true, reason: 'missing-timestamp' };
  const elapsed = now - data.startedAt;
  if (elapsed < MIN_FILL_MS) return { spam: true, reason: 'too-fast' };
  if (elapsed > MAX_FORM_AGE_MS) return { spam: true, reason: 'too-old' };
  return { spam: false };
}
