import { describe, expect, it } from 'vitest';
import { bookHref, parseQuery, resolveSelection, sanitizeIds, toQuery } from '@/lib/mirror-state';
import { buildEmbedOptions, buildFallbackUrl, composeMirrorAnswer, themedUrl } from '@/lib/calendly';
import { defaultSiteContent } from '@/content/defaults';
import { legacyRedirects } from '../../../config/redirects.mjs';

const prompts = defaultSiteContent.mirror.prompts;
const text = (id: string) => prompts.find((p) => p.id === id)!.text;

describe('mirror selection state', () => {
  it('keeps only unique, well-formed ids, in the order given', () => {
    expect(sanitizeIds(['talent', 'impact', 'talent', 'Not Valid', '<b>', 42, '', 'a'.repeat(60)])).toEqual(['talent', 'impact']);
    expect(sanitizeIds('nope')).toEqual([]);
  });

  it('drops ids that no longer exist when given the current prompt ids', () => {
    expect(sanitizeIds(['impact', 'deleted-one'], prompts.map((p) => p.id))).toEqual(['impact']);
  });

  it('round-trips through the query string and builds /book links', () => {
    expect(toQuery(['talent', 'impact'])).toBe('m=talent,impact');
    expect(parseQuery('?m=talent,impact')).toEqual(['talent', 'impact']);
    expect(parseQuery('?m=')).toEqual([]);
    expect(parseQuery('?other=1')).toBeNull();
    expect(bookHref([])).toBe('/book');
    expect(bookHref(['deadlines', 'scared'])).toBe('/book?m=deadlines,scared');
  });

  it('drops tampered query values instead of trusting them', () => {
    expect(parseQuery('?m=impact,<script>,%3Cimg%20src=x%3E,../etc,talent')).toEqual(['impact', 'talent']);
  });

  it('resolves a selection to the current prompts in page order, ignoring ids that were deleted', () => {
    expect(resolveSelection(['scared', 'impact', 'gone'], prompts).map((p) => p.id)).toEqual(['impact', 'scared']);
  });

  it('keeps pointing at the same statements after the prompts are reordered (the reason ids are used)', () => {
    const reordered = [...prompts].reverse();
    expect(resolveSelection(['deadlines'], reordered).map((p) => p.text)).toEqual([text('deadlines')]);
  });
});

describe('Calendly prefill', () => {
  it('composes the first custom answer (a1) from the selected statements, in page order', () => {
    expect(composeMirrorAnswer(['deadlines', 'impact'], prompts)).toBe(`What sounded like me:\n- ${text('impact')}\n- ${text('deadlines')}`);
    expect(composeMirrorAnswer([], prompts)).toBeUndefined();
    expect(composeMirrorAnswer(['deleted'], prompts)).toBeUndefined();
  });

  it('sends the statement’s current (edited) wording', () => {
    const edited = prompts.map((p) => (p.id === 'impact' ? { ...p, text: 'Edited in the admin.' } : p));
    expect(composeMirrorAnswer(['impact'], edited)).toBe('What sounded like me:\n- Edited in the admin.');
  });

  it('sends a1 and UTM data only when something was selected', () => {
    const base = 'https://calendly.com/kaldas/sample';
    const withSelection = buildEmbedOptions({ baseUrl: base, selection: ['humor'], prompts, source: 'page' });
    expect(withSelection.prefill.customAnswers?.a1).toContain(text('humor'));
    expect(withSelection.utm).toEqual({
      utmSource: 'mariamkaldas.com',
      utmMedium: 'website',
      utmCampaign: 'mirror',
      utmContent: 'page',
    });

    const without = buildEmbedOptions({ baseUrl: base, selection: [], prompts, source: 'dialog' });
    expect(without.prefill).toEqual({});
    expect(without.utm.utmCampaign).toBe('direct');
  });

  it('themes the embed with the brand colors and builds a tagged fallback link', () => {
    expect(themedUrl('https://calendly.com/kaldas/sample')).toBe(
      'https://calendly.com/kaldas/sample?background_color=f8f5ee&text_color=11263c&primary_color=9e3f2b',
    );
    const url = new URL(buildFallbackUrl({ baseUrl: 'https://calendly.com/kaldas/sample', selection: ['impact'], prompts, source: 'page' }));
    expect(url.origin + url.pathname).toBe('https://calendly.com/kaldas/sample');
    expect(url.searchParams.get('utm_source')).toBe('mariamkaldas.com');
    expect(url.searchParams.get('a1')).toContain(text('impact'));
  });
});

describe('legacy Wix redirects', () => {
  const routes = new Set(['/', '/about', '/testimonials', '/faq', '/book', '/privacy']);

  it('are permanent, absolute-path rules whose destinations are real routes', () => {
    expect(legacyRedirects.length).toBeGreaterThan(0);
    for (const rule of legacyRedirects) {
      expect(rule.permanent).toBe(true);
      expect(rule.source.startsWith('/')).toBe(true);
      const destinationPath = rule.destination.split('#')[0] || '/';
      expect(routes.has(destinationPath)).toBe(true);
      expect(rule.source).not.toBe(rule.destination);
    }
  });

  it('cover every orphaned URL found in the Phase 1 audit', () => {
    const sources = legacyRedirects.map((r) => r.source);
    for (const url of [
      '/more-about-me',
      '/services',
      '/service-page/free-sample-coaching-session',
      '/service-page/myers-briggs-team-facilitation',
      '/booking-calendar/:path*',
      '/events-page',
      '/events-1/:path*',
    ]) {
      expect(sources).toContain(url);
    }
  });
});
