import { describe, expect, it } from 'vitest';
import { defaultSiteContent } from '@/content/defaults';
import { issuesToFieldErrors, newId, parseStoredContent, siteContentSchema, type SiteContent } from '@/lib/cms-schema';
import { isSafeUrl, safeHref, toTelHref } from '@/lib/safe-url';
import { parseAnswer, unknownTokens } from '@/lib/rich-text-markup';

const clone = (): SiteContent => structuredClone(defaultSiteContent);

describe('isSafeUrl (links)', () => {
  it.each([
    'https://example.com',
    'http://example.com/a?b=c#d',
    'mailto:me@mariamkaldas.com',
    'mailto:me@mariamkaldas.com?subject=Hello%20there',
    'tel:+18439361601',
    'tel:(843)936-1601',
    '/book',
    '/faq#teams',
    '/',
  ])('accepts %s', (url) => {
    expect(isSafeUrl(url)).toBe(true);
  });

  it.each([
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    ' javascript:alert(1)',
    'java\nscript:alert(1)',
    'java\tscript:alert(1)',
    '\u0001javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
    'file:///etc/passwd',
    'ftp://example.com',
    '//evil.example.com',
    '/\\evil.example.com',
    'https://',
    'https://user:pass@example.com',
    'example.com',
    'mailto:',
    'mailto:not an email',
    'tel:',
    'tel:javascript',
    '',
    'https://example.com/with space',
    'x'.repeat(3000),
  ])('rejects %j', (url) => {
    expect(isSafeUrl(url)).toBe(false);
  });

  it('accepts only http(s) and site paths for images', () => {
    expect(isSafeUrl('/images/mariam-hero.jpg', 'image')).toBe(true);
    expect(isSafeUrl('https://cdn.example.com/a.jpg', 'image')).toBe(true);
    expect(isSafeUrl('mailto:me@mariamkaldas.com', 'image')).toBe(false);
    expect(isSafeUrl('tel:+18439361601', 'image')).toBe(false);
    expect(isSafeUrl('data:image/svg+xml,<svg onload=alert(1)>', 'image')).toBe(false);
  });

  it('safeHref never lets an unsafe value through at render time', () => {
    expect(safeHref('javascript:alert(1)')).toBe('#');
    expect(safeHref('/book')).toBe('/book');
  });
});

describe('toTelHref', () => {
  it('turns a display number into a dialable one', () => {
    expect(toTelHref('(843) 936-1601')).toBe('+18439361601');
    expect(toTelHref('1-843-936-1601')).toBe('+18439361601');
    expect(toTelHref('+44 20 7946 0958')).toBe('+442079460958');
    expect(toTelHref('call me')).toBe('');
  });
});

describe('siteContentSchema', () => {
  it('accepts the default content untouched', () => {
    expect(siteContentSchema.safeParse(clone()).success).toBe(true);
  });

  it('rejects unknown keys anywhere (strict objects)', () => {
    const extraTop = { ...clone(), __proto_pollution: true };
    expect(siteContentSchema.safeParse(extraTop).success).toBe(false);
    const extraNested = clone() as unknown as { hero: Record<string, unknown> };
    extraNested.hero.onerror = 'alert(1)';
    expect(siteContentSchema.safeParse(extraNested).success).toBe(false);
  });

  it('rejects a javascript: URL in every editable link and image field', () => {
    const bad = 'javascript:alert(1)';
    const mutations: [string, (c: SiteContent) => void][] = [
      ['announcement.linkUrl', (c) => ((c.announcement.linkLabel = 'x'), (c.announcement.linkUrl = bad))],
      ['popup.ctaUrl', (c) => ((c.popup.ctaMode = 'url'), (c.popup.ctaLabel = 'x'), (c.popup.ctaUrl = bad))],
      ['popup.imageUrl', (c) => (c.popup.imageUrl = bad)],
      ['hero.portraitSrc', (c) => (c.hero.portraitSrc = bad)],
      ['about.credentials.0.href', (c) => (c.about.credentials[0].href = bad)],
      ['about.credentials.0.badgeSrc', (c) => (c.about.credentials[0].badgeSrc = bad)],
      ['settings.calendlyUrl', (c) => (c.settings.calendlyUrl = bad)],
      ['settings.linkedin', (c) => (c.settings.linkedin = bad)],
      ['settings.instagram', (c) => (c.settings.instagram = 'data:text/html,hi')],
      ['settings.facebook', (c) => (c.settings.facebook = 'mailto:a@b.co')],
    ];
    for (const [field, mutate] of mutations) {
      const content = clone();
      mutate(content);
      const result = siteContentSchema.safeParse(content);
      expect(result.success, field).toBe(false);
      if (!result.success) expect(Object.keys(issuesToFieldErrors(result.error.issues)), field).toContain(field);
    }
  });

  it('requires the Calendly link to be an https://calendly.com address', () => {
    for (const url of ['https://example.com/x/y', 'http://calendly.com/x/y', 'https://calendly.com', 'https://calendly.com.evil.example/x']) {
      const content = clone();
      content.settings.calendlyUrl = url;
      expect(siteContentSchema.safeParse(content).success, url).toBe(false);
    }
    const ok = clone();
    ok.settings.calendlyUrl = 'https://calendly.com/mariam/intro';
    expect(siteContentSchema.safeParse(ok).success).toBe(true);
  });

  it('only demands announcement text when the banner is on', () => {
    const off = clone();
    expect(siteContentSchema.safeParse(off).success).toBe(true);
    const on = clone();
    on.announcement.enabled = true;
    const result = siteContentSchema.safeParse(on);
    expect(result.success).toBe(false);
    if (!result.success) expect(issuesToFieldErrors(result.error.issues)['announcement.text']).toMatch(/announcement text/i);
    on.announcement.text = 'New cohort opening';
    expect(siteContentSchema.safeParse(on).success).toBe(true);
  });

  it('keeps list sizes and ids sane', () => {
    const noStories = clone();
    noStories.testimonials = [];
    expect(siteContentSchema.safeParse(noStories).success).toBe(false);

    const threePillars = clone();
    threePillars.pillars = threePillars.pillars.slice(0, 3);
    expect(siteContentSchema.safeParse(threePillars).success).toBe(false);

    const dupeIds = clone();
    dupeIds.faq[1].id = dupeIds.faq[0].id;
    expect(siteContentSchema.safeParse(dupeIds).success).toBe(false);

    const badId = clone();
    badId.mirror.prompts[0].id = 'Has Spaces & <b>';
    expect(siteContentSchema.safeParse(badId).success).toBe(false);

    const badTag = clone() as unknown as { testimonials: { tags: string[] }[] };
    badTag.testimonials[0].tags = ['Not A Tag'];
    expect(siteContentSchema.safeParse(badTag).success).toBe(false);
  });

  it('validates email and phone, and trims whitespace', () => {
    const bad = clone();
    bad.settings.email = 'not an email';
    expect(siteContentSchema.safeParse(bad).success).toBe(false);
    bad.settings.email = 'a"b@example.com';
    expect(siteContentSchema.safeParse(bad).success).toBe(false);

    const phone = clone();
    phone.settings.phone = 'call me maybe';
    expect(siteContentSchema.safeParse(phone).success).toBe(false);

    const padded = clone();
    padded.hero.headline = '   A new headline   ';
    const parsed = siteContentSchema.safeParse(padded);
    expect(parsed.success && parsed.data.hero.headline).toBe('A new headline');
  });
});

describe('parseStoredContent', () => {
  it('keeps every valid saved section and replaces only the broken or missing ones', () => {
    const saved = clone() as unknown as Record<string, unknown>;
    (saved.hero as { headline: string }).headline = 'Edited by Mariam';
    (saved.announcement as { linkUrl: string; linkLabel: string }).linkUrl = 'javascript:alert(1)';
    (saved.announcement as { linkUrl: string; linkLabel: string }).linkLabel = 'Click';
    delete saved.popup;
    const result = parseStoredContent(saved, defaultSiteContent);
    expect(result.hero.headline).toBe('Edited by Mariam');
    expect(result.announcement).toEqual(defaultSiteContent.announcement);
    expect(result.popup).toEqual(defaultSiteContent.popup);
    expect(result.faq).toEqual(defaultSiteContent.faq);
  });

  it('returns the defaults for garbage input', () => {
    expect(parseStoredContent(null, defaultSiteContent)).toEqual(defaultSiteContent);
    expect(parseStoredContent('nope', defaultSiteContent)).toEqual(defaultSiteContent);
    expect(parseStoredContent([1, 2], defaultSiteContent)).toEqual(defaultSiteContent);
  });
});

describe('editor helpers', () => {
  it('newId produces ids the schema accepts, and does not repeat', () => {
    const ids = new Set(Array.from({ length: 200 }, () => newId('story')));
    expect(ids.size).toBe(200);
    const content = clone();
    content.testimonials[0].id = [...ids][0];
    expect(siteContentSchema.safeParse(content).success).toBe(true);
  });

  it('parseAnswer handles paragraphs, bullets and mixed blocks', () => {
    expect(parseAnswer('One.\n\nTwo\ncontinues.\n- a\n- b\n\nThree')).toEqual([
      { p: 'One.' },
      { p: 'Two continues.' },
      { ul: ['a', 'b'] },
      { p: 'Three' },
    ]);
    expect(parseAnswer('')).toEqual([]);
    expect(parseAnswer('<script>alert(1)</script>')).toEqual([{ p: '<script>alert(1)</script>' }]);
  });

  it('unknownTokens flags typos in link tokens', () => {
    expect(unknownTokens('{{email}} and {{emial}} and {{book}}')).toEqual(['{{emial}}']);
  });
});
