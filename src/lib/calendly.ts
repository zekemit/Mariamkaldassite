import { resolveSelection, type PromptRef } from '@/lib/mirror-state';

// Calendly custom answers are numbered a1..a10 in the order of the event's questions
// (https://calendly.com/help/how-to-pre-fill-invitee-information-in-an-embed). The Mirror fills a1, so the
// sample event should have "What brought you here?" as its first question. Without it the value is ignored.

export interface EmbedOptions {
  url: string;
  prefill: { customAnswers?: Record<string, string> };
  utm: { utmSource: string; utmMedium: string; utmCampaign: string; utmContent: string };
}

/** The first custom answer, built from the statements the visitor tapped (in page order). Undefined when none. */
export function composeMirrorAnswer(ids: readonly string[], prompts: readonly PromptRef[]): string | undefined {
  const chosen = resolveSelection(ids, prompts);
  if (chosen.length === 0) return undefined;
  return `What sounded like me:\n${chosen.map((prompt) => `- ${prompt.text}`).join('\n')}`;
}

/** Brand colors for the embedded scheduler (hex without #, as Calendly expects). */
const THEME = 'background_color=f8f5ee&text_color=11263c&primary_color=9e3f2b';

export function themedUrl(baseUrl: string): string {
  return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${THEME}`;
}

interface Args {
  baseUrl: string;
  selection: readonly string[];
  prompts: readonly PromptRef[];
  source: string;
}

export function buildEmbedOptions(args: Args): EmbedOptions {
  const answer = composeMirrorAnswer(args.selection, args.prompts);
  return {
    url: themedUrl(args.baseUrl),
    prefill: answer ? { customAnswers: { a1: answer } } : {},
    utm: {
      utmSource: 'mariamkaldas.com',
      utmMedium: 'website',
      utmCampaign: answer ? 'mirror' : 'direct',
      utmContent: args.source,
    },
  };
}

/** Plain link for the "open in a new tab" fallback; carries the same UTM and prefill. */
export function buildFallbackUrl(args: Args): string {
  const options = buildEmbedOptions(args);
  const url = new URL(args.baseUrl);
  url.searchParams.set('utm_source', options.utm.utmSource);
  url.searchParams.set('utm_medium', options.utm.utmMedium);
  url.searchParams.set('utm_campaign', options.utm.utmCampaign);
  url.searchParams.set('utm_content', options.utm.utmContent);
  const a1 = options.prefill.customAnswers?.a1;
  if (a1) url.searchParams.set('a1', a1);
  return url.toString();
}
