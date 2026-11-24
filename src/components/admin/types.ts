import type { SiteContent } from '@/lib/cms-schema';
import type { KnownImage } from '@/components/admin/fields';

export type Recipe = (draft: SiteContent) => void;

/** What every tab panel receives: the draft, a way to change it, and the current validation messages by field path. */
export interface PanelProps {
  content: SiteContent;
  update: (recipe: Recipe) => void;
  errors: Record<string, string>;
}

/** Images that already ship with the site (optimized at build time), offered as one-click defaults. */
export const KNOWN_IMAGES: KnownImage[] = [
  { label: 'Hero portrait', src: '/images/mariam-hero.jpg' },
  { label: 'About portrait', src: '/images/mariam-about.jpg' },
];

export const KNOWN_BADGES: KnownImage[] = [
  { label: 'CPCC badge', src: '/images/badge-cpcc.png' },
  { label: 'PCC badge', src: '/images/badge-pcc.jpg' },
];

/** Which list items (by index) have a validation error under `prefix`, e.g. "testimonials". */
export function errorIndexes(errors: Record<string, string>, prefix: string): Set<number> {
  const out = new Set<number>();
  for (const key of Object.keys(errors)) {
    if (!key.startsWith(`${prefix}.`)) continue;
    const index = Number(key.slice(prefix.length + 1).split('.')[0]);
    if (Number.isInteger(index)) out.add(index);
  }
  return out;
}

/** Tab each top-level section lives on, so an error on another tab can be flagged and jumped to. */
export const TAB_OF_SECTION: Record<string, number> = {
  announcement: 0,
  popup: 0,
  hero: 1,
  mirror: 1,
  testimonials: 2,
  pillars: 3,
  about: 3,
  faq: 3,
  settings: 4,
};
