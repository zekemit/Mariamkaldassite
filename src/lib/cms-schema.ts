import { z } from 'zod';
import { IMAGE_RULE_MESSAGE, URL_RULE_MESSAGE, isSafeUrl, toTelHref } from '@/lib/safe-url';

// The shape of everything Mariam can edit at /admin. One zod schema is the single definition: the admin API
// validates every save against it, the storage layer re-validates what it reads back, and the admin editor
// reuses it for inline field errors. Unknown keys are rejected (z.strictObject), lengths are capped, and every
// link or image URL goes through the safe-URL allow-list.

export const STORY_TAGS = ['Mindset Shift', 'Career Pivot', 'Leadership & Confidence', 'Accountability & Action'] as const;
export type StoryTag = (typeof STORY_TAGS)[number];

const ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,39}$/;
const id = z.string().regex(ID_PATTERN, 'Internal id must be lowercase letters, numbers or dashes');

const text = (max: number) => z.string().trim().max(max, `Keep this under ${max} characters`);
const required = (max: number) => text(max).min(1, 'This is required');

const link = z.string().trim().refine((v) => isSafeUrl(v, 'link'), URL_RULE_MESSAGE);
const optionalLink = z.string().trim().refine((v) => v === '' || isSafeUrl(v, 'link'), URL_RULE_MESSAGE);
const image = z.string().trim().refine((v) => isSafeUrl(v, 'image'), IMAGE_RULE_MESSAGE);
const optionalImage = z.string().trim().refine((v) => v === '' || isSafeUrl(v, 'image'), IMAGE_RULE_MESSAGE);
const optionalWebLink = z
  .string()
  .trim()
  .refine((v) => v === '' || (/^https?:\/\//i.test(v) && isSafeUrl(v, 'link')), 'Paste the full address, starting with https://');

const uniqueIds = (items: readonly { id: string }[]) => new Set(items.map((item) => item.id)).size === items.length;
const UNIQUE = 'Each item needs its own id';

function isCalendlyUrl(value: string): boolean {
  if (!isSafeUrl(value, 'link')) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'calendly.com' && url.pathname.length > 1;
  } catch {
    return false;
  }
}

const announcementSchema = z
  .strictObject({
    enabled: z.boolean(),
    text: text(300),
    linkLabel: text(60),
    linkUrl: optionalLink,
  })
  .refine((a) => !a.enabled || a.text !== '', { path: ['text'], message: 'Add the announcement text, or switch it off.' })
  .refine((a) => a.linkLabel === '' || a.linkUrl !== '', { path: ['linkUrl'], message: 'Add the link address for this label.' })
  .refine((a) => a.linkUrl === '' || a.linkLabel !== '', { path: ['linkLabel'], message: 'Add a label for the link, or clear the address.' });

const popupSchema = z
  .strictObject({
    enabled: z.boolean(),
    headline: text(120),
    body: text(600),
    imageUrl: optionalImage,
    imageAlt: text(160),
    ctaLabel: text(60),
    ctaMode: z.enum(['booking', 'url']),
    ctaUrl: optionalLink,
    frequency: z.enum(['session', 'visit']),
  })
  .refine((p) => !p.enabled || p.headline !== '', { path: ['headline'], message: 'Add a headline, or switch the popup off.' })
  .refine((p) => p.ctaLabel === '' || p.ctaMode === 'booking' || p.ctaUrl !== '', {
    path: ['ctaUrl'],
    message: 'Add the button’s link address, or choose “Open the booking page”.',
  });

const heroSchema = z.strictObject({
  headline: required(200),
  subheadline: required(500),
  ctaLabel: required(80),
  portraitSrc: image,
  portraitAlt: required(200),
});

const mirrorSchema = z.strictObject({
  prompts: z
    .array(z.strictObject({ id, text: required(240), reply: text(400) }))
    .min(1, 'Keep at least one statement')
    .max(12, 'Twelve statements is the most the page can hold')
    .refine(uniqueIds, UNIQUE),
});

const testimonialsSchema = z
  .array(
    z.strictObject({
      id,
      name: required(60),
      role: text(100),
      pullQuote: required(400),
      text: required(4000),
      tags: z.array(z.enum(STORY_TAGS)).max(STORY_TAGS.length).refine((tags) => new Set(tags).size === tags.length, 'Pick each tag once'),
      featured: z.boolean(),
    }),
  )
  .min(1, 'Keep at least one client story')
  .max(40, 'Forty stories is the most the page can hold')
  .refine(uniqueIds, UNIQUE);

const pillarsSchema = z
  .array(
    z.strictObject({
      id,
      title: required(100),
      body: required(600),
      sampleQuestion: text(200),
      proofQuote: text(300),
      proofBy: text(100),
    }),
  )
  .length(4, 'There are exactly four pillars')
  .refine(uniqueIds, UNIQUE);

const aboutSchema = z.strictObject({
  heading: required(160),
  paragraphs: z.array(required(2000)).min(1, 'Keep at least one paragraph').max(12, 'Twelve paragraphs is the most the page can hold'),
  credentials: z
    .array(
      z.strictObject({
        id,
        code: required(20),
        title: required(120),
        issuer: required(120),
        href: link,
        badgeSrc: optionalImage,
        badgeAlt: text(160),
      }),
    )
    .max(8)
    .refine(uniqueIds, UNIQUE),
  strip: z
    .array(z.strictObject({ id, code: required(20), text: required(80) }))
    .max(8)
    .refine(uniqueIds, UNIQUE),
});

const faqSchema = z
  .array(
    z.strictObject({
      id,
      question: required(200),
      answer: required(6000),
      showOnHome: z.boolean(),
    }),
  )
  .min(1, 'Keep at least one question')
  .max(40, 'Forty questions is the most the page can hold')
  .refine(uniqueIds, UNIQUE);

const settingsSchema = z.strictObject({
  calendlyUrl: z
    .string()
    .trim()
    .refine(isCalendlyUrl, 'Paste your Calendly link. It starts with https://calendly.com/'),
  email: z
    .string()
    .trim()
    .max(120)
    .regex(/^[^\s@<>"'()[\]\\,;:]+@[^\s@<>"'()[\]\\,;:]+\.[^\s@<>"'()[\]\\,;:]+$/, 'Enter a valid email address'),
  phone: required(30).refine((v) => {
    const digits = v.replace(/\D/g, '');
    return /^[0-9 ()+.\-x]+$/.test(v) && digits.length >= 7 && digits.length <= 15 && toTelHref(v) !== '';
  }, 'Enter a valid phone number'),
  location: required(100),
  linkedin: optionalWebLink,
  instagram: optionalWebLink,
  facebook: optionalWebLink,
});

export const siteContentSchema = z.strictObject({
  announcement: announcementSchema,
  popup: popupSchema,
  hero: heroSchema,
  mirror: mirrorSchema,
  testimonials: testimonialsSchema,
  pillars: pillarsSchema,
  about: aboutSchema,
  faq: faqSchema,
  settings: settingsSchema,
});

export type SiteContent = z.infer<typeof siteContentSchema>;
export type SectionKey = keyof SiteContent;
export type Testimonial = SiteContent['testimonials'][number];
export type FaqEntry = SiteContent['faq'][number];
export type MirrorPrompt = SiteContent['mirror']['prompts'][number];
export type Pillar = SiteContent['pillars'][number];
export type SiteSettings = SiteContent['settings'];

export const SECTION_KEYS = Object.keys(siteContentSchema.shape) as SectionKey[];

/**
 * Reads whatever storage returned and keeps every section that is still valid. A section that is missing (an older
 * save from before a field existed) or no longer valid falls back to the defaults for that section only, so one
 * bad field can never blank the whole site or throw away the rest of Mariam's edits.
 */
export function parseStoredContent(raw: unknown, defaults: SiteContent): SiteContent {
  const source = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const out: Record<string, unknown> = { ...defaults };
  for (const key of SECTION_KEYS) {
    if (!(key in source)) continue;
    const result = siteContentSchema.shape[key].safeParse(source[key]);
    if (result.success) out[key] = result.data;
  }
  return out as SiteContent;
}

/** Flattens zod issues to { "testimonials.2.pullQuote": "This is required" } (first message per field). */
export function issuesToFieldErrors(issues: readonly { path: readonly PropertyKey[]; message: string }[]): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.map(String).join('.') || '_';
    errors[key] ??= issue.message;
  }
  return errors;
}

/** A fresh internal id for a new list item, for example "story-k3x9a1bq". Never shown to visitors. */
export function newId(prefix: string): string {
  const bytes = new Uint8Array(5);
  globalThis.crypto.getRandomValues(bytes);
  const suffix = Array.from(bytes, (b) => (b % 36).toString(36)).join('');
  return `${prefix}-${suffix}`;
}
