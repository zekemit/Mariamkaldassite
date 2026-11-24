import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { defaultSiteContent } from '@/content/defaults';
import { chapters, stopCoordinates } from '@/content/voyage';
import { WORLD_MAP } from '@/content/world-map.generated';
import { STORY_TAGS, siteContentSchema } from '@/lib/cms-schema';
import { ANSWER_TOKENS, parseAnswer, serializeAnswer } from '@/lib/rich-text-markup';

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const audit = norm(readFileSync(path.resolve(__dirname, '../../../MARIAM_SITE_AUDIT.md'), 'utf8'));

const { testimonials, mirror, faq } = defaultSiteContent;

describe('default content', () => {
  it('is valid against the CMS schema (so Reset to Defaults can always be saved)', () => {
    const result = siteContentSchema.safeParse(defaultSiteContent);
    expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);
  });

  it('seeds the live site with the confirmed contact facts and the hero headline', () => {
    expect(defaultSiteContent.settings.email).toBe('me@mariamkaldas.com');
    expect(defaultSiteContent.settings.phone).toBe('(843) 936-1601');
    expect(defaultSiteContent.settings.location).toBe('Charleston, SC & Worldwide via Zoom');
    expect(defaultSiteContent.settings.calendlyUrl).toBe('https://calendly.com/kaldas/sample');
    expect(defaultSiteContent.hero.headline).toBe('You meet every deadline except your own.');
  });

  it('starts with the announcement and popup switched off', () => {
    expect(defaultSiteContent.announcement.enabled).toBe(false);
    expect(defaultSiteContent.popup.enabled).toBe(false);
  });
});

describe('testimonials', () => {
  it('has all seven published clients, in the order Mariam listed them', () => {
    expect(testimonials.map((s) => s.name)).toEqual(['Kevin C.', 'Reuschal', 'Indy', 'Monica', 'Margarita', 'Dan', 'Josh']);
  });

  it('matches the audit taxonomy counts (5 / 3 / 3 / 1) under the new tag names', () => {
    const counts = STORY_TAGS.map((tag) => testimonials.filter((s) => s.tags.includes(tag)).length);
    expect(STORY_TAGS).toEqual(['Mindset Shift', 'Career Pivot', 'Leadership & Confidence', 'Accountability & Action']);
    expect(counts).toEqual([5, 3, 3, 1]);
    for (const story of testimonials) expect(story.tags.length).toBeGreaterThan(0);
  });

  it('keeps every sentence verbatim against the audit record (no invented or altered words)', () => {
    for (const story of testimonials) {
      for (const paragraph of story.text.split('\n\n')) {
        for (const sentence of paragraph.split(/(?<=[.!?])\s+/)) {
          expect(audit, `${story.name}: "${sentence}"`).toContain(norm(sentence));
        }
      }
      expect(norm(story.text), `${story.name} pull quote`).toContain(norm(story.pullQuote));
    }
  });

  it('features three stories on the home page, one per leading theme', () => {
    expect(testimonials.filter((s) => s.featured).map((s) => s.id)).toEqual(['reuschal', 'indy', 'margarita']);
  });
});

describe('voyage', () => {
  it('has one chapter per stop, in order, with valid coordinates', () => {
    expect(chapters.map((c) => c.id)).toEqual(stopCoordinates.map((s) => s.id));
    for (const stop of stopCoordinates) {
      expect(Math.abs(stop.lat)).toBeLessThanOrEqual(90);
      expect(Math.abs(stop.lon)).toBeLessThanOrEqual(180);
    }
  });

  it('has a generated map covering every stop and one leg between each pair', () => {
    for (const stop of stopCoordinates) {
      expect(WORLD_MAP.stops[stop.id as keyof typeof WORLD_MAP.stops]).toBeDefined();
    }
    expect(WORLD_MAP.legs.length).toBe(chapters.length - 1);
  });

  it('applies the verified-fact corrections', () => {
    const text = chapters.flatMap((c) => c.body).join(' ');
    expect(text).toContain('students from 30+ countries');
    expect(text).toContain('helped to design and establish');
    expect(text).not.toMatch(/30 different countries/);
    expect(text).not.toMatch(/founded/i);
  });
});

describe('mirror and faq', () => {
  it('turns the seven reflection questions into seven unique statements with replies', () => {
    expect(mirror.prompts).toHaveLength(7);
    expect(new Set(mirror.prompts.map((s) => s.text)).size).toBe(7);
    for (const s of mirror.prompts) expect(s.reply.length).toBeGreaterThan(10);
  });

  it('uses only known link tokens, and the home teaser has questions to show', () => {
    const known = new Set<string>(ANSWER_TOKENS);
    for (const item of faq) {
      for (const token of item.answer.match(/\{\{\w+\}\}/g) ?? []) expect(known.has(token)).toBe(true);
    }
    expect(faq.filter((i) => i.showOnHome).map((i) => i.id)).toEqual(['hour', 'who', 'where', 'why']);
  });

  it('round-trips every default answer through the editor markup without changing it', () => {
    for (const item of faq) {
      const blocks = parseAnswer(item.answer);
      expect(blocks.length).toBeGreaterThan(0);
      expect(serializeAnswer(blocks)).toBe(item.answer);
    }
  });

  it('never publishes a hardcoded price', () => {
    expect(JSON.stringify(faq)).not.toMatch(/\$\s?\d/);
  });
});
