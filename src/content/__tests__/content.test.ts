import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { countByTag, featuredStoryIds, stories, storyTags } from '@/content/testimonials';
import { chapters, stopCoordinates } from '@/content/voyage';
import { mirrorStatements } from '@/content/mirror';
import { faqItems, homeFaqIds } from '@/content/faq';
import { WORLD_MAP } from '@/content/world-map.generated';

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const audit = norm(readFileSync(path.resolve(__dirname, '../../../MARIAM_SITE_AUDIT.md'), 'utf8'));

describe('testimonials', () => {
  it('has all seven published clients', () => {
    expect(stories.map((s) => s.name)).toEqual(['Kevin C.', 'Indy', 'Reuschal', 'Monica', 'Dan', 'Josh', 'Margarita']);
  });

  it('matches the audit taxonomy counts (5 / 3 / 3 / 1)', () => {
    expect(storyTags.map((tag) => countByTag(tag))).toEqual([5, 3, 3, 1]);
    for (const story of stories) {
      expect(story.tags.length).toBeGreaterThan(0);
      for (const tag of story.tags) expect(storyTags).toContain(tag);
    }
  });

  it('keeps every sentence verbatim against the audit record (no invented or altered words)', () => {
    for (const story of stories) {
      for (const paragraph of story.paragraphs) {
        for (const sentence of paragraph.split(/(?<=[.!?])\s+/)) {
          expect(audit, `${story.name}: "${sentence}"`).toContain(norm(sentence));
        }
      }
      expect(norm(story.paragraphs.join(' ')), `${story.name} pull quote`).toContain(norm(story.pullQuote));
    }
  });

  it('features existing stories', () => {
    for (const id of featuredStoryIds) expect(stories.some((s) => s.id === id)).toBe(true);
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
    expect(mirrorStatements).toHaveLength(7);
    expect(new Set(mirrorStatements.map((s) => s.text)).size).toBe(7);
    for (const s of mirrorStatements) expect(s.reply.length).toBeGreaterThan(10);
  });

  it('uses only known link tokens and the home teaser ids exist', () => {
    const known = new Set(['{{email}}', '{{phone}}', '{{book}}', '{{contact}}']);
    for (const item of faqItems) {
      for (const block of item.a) {
        const texts = 'p' in block ? [block.p] : block.ul;
        for (const text of texts) for (const token of text.match(/\{\{\w+\}\}/g) ?? []) expect(known.has(token)).toBe(true);
      }
    }
    for (const id of homeFaqIds) expect(faqItems.some((i) => i.id === id)).toBe(true);
  });

  it('never publishes a hardcoded price', () => {
    const copy = JSON.stringify(faqItems);
    expect(copy).not.toMatch(/\$\s?\d/);
  });
});
