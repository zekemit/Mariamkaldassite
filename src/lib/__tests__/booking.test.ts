import { describe, expect, it } from 'vitest';
import { bookHref, parseQuery, sanitizeIndices, toQuery } from '@/lib/mirror-state';
import { buildEmbedOptions, buildFallbackUrl, composeMirrorAnswer, themedUrl } from '@/lib/calendly';
import { mirrorStatements } from '@/content/mirror';
import { legacyRedirects } from '../../../config/redirects.mjs';

describe('mirror selection state', () => {
  it('keeps only unique, in-range integers, sorted', () => {
    expect(sanitizeIndices([3, 1, 1, 99, -1, 'x', 2.5, '2'])).toEqual([1, 2, 3]);
    expect(sanitizeIndices('nope')).toEqual([]);
  });

  it('round-trips through the query string and builds /book links', () => {
    expect(toQuery([4, 1])).toBe('m=1,4');
    expect(parseQuery('?m=1,4')).toEqual([1, 4]);
    expect(parseQuery('?m=')).toEqual([]);
    expect(parseQuery('?other=1')).toBeNull();
    expect(bookHref([])).toBe('/book');
    expect(bookHref([2, 0])).toBe('/book?m=0,2');
  });

  it('drops tampered query values instead of trusting them', () => {
    expect(parseQuery('?m=0,<script>,8,3')).toEqual([0, 3]);
  });
});

describe('Calendly prefill', () => {
  it('composes the first custom answer (a1) from the selected statements, in order', () => {
    const answer = composeMirrorAnswer([1, 0]);
    expect(answer).toBe(
      `What sounded like me:\n- ${mirrorStatements[0].text}\n- ${mirrorStatements[1].text}`,
    );
    expect(composeMirrorAnswer([])).toBeUndefined();
  });

  it('sends a1 and UTM data only when something was selected', () => {
    const withSelection = buildEmbedOptions({ baseUrl: 'https://calendly.com/kaldas/sample', selection: [2], source: 'page' });
    expect(withSelection.prefill.customAnswers?.a1).toContain(mirrorStatements[2].text);
    expect(withSelection.utm).toEqual({
      utmSource: 'mariamkaldas.com',
      utmMedium: 'website',
      utmCampaign: 'mirror',
      utmContent: 'page',
    });

    const without = buildEmbedOptions({ baseUrl: 'https://calendly.com/kaldas/sample', selection: [], source: 'dialog' });
    expect(without.prefill).toEqual({});
    expect(without.utm.utmCampaign).toBe('direct');
  });

  it('themes the embed with the brand colors and builds a tagged fallback link', () => {
    expect(themedUrl('https://calendly.com/kaldas/sample')).toBe(
      'https://calendly.com/kaldas/sample?background_color=f8f5ee&text_color=11263c&primary_color=9e3f2b',
    );
    const url = new URL(
      buildFallbackUrl({ baseUrl: 'https://calendly.com/kaldas/sample', selection: [0], source: 'page' }),
    );
    expect(url.origin + url.pathname).toBe('https://calendly.com/kaldas/sample');
    expect(url.searchParams.get('utm_source')).toBe('mariamkaldas.com');
    expect(url.searchParams.get('a1')).toContain(mirrorStatements[0].text);
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
