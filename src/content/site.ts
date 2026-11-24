// Single source of truth for facts that appear in more than one place.
// Facts here were verified against mariamkaldas.com in the Phase 1 audit (see MARIAM_SITE_AUDIT.md).

export const SITE = {
  name: 'Mariam Kaldas',
  legalName: 'Kaldas Consulting, LLC',
  /** Canonical production origin. The *.vercel.app deployment sends X-Robots-Tag: noindex. */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.mariamkaldas.com').replace(/\/+$/, ''),
  email: 'me@mariamkaldas.com',
  phoneDisplay: '(843) 936-1601',
  phoneTel: '+18439361601',
  locality: 'Charleston',
  region: 'SC',
  regionName: 'South Carolina',
  country: 'US',
  coordsLabel: '32.78°N 79.93°W',
  /**
   * Verified Phase 1/2: calendly.com/kaldas and /kaldas/sample return 200;
   * calendly.com/mariamkaldas returns 404.
   */
  calendlyUrl: process.env.NEXT_PUBLIC_CALENDLY_URL ?? 'https://calendly.com/kaldas/sample',
  /** Public token already present on the live Wix home page; keeps Search Console ownership across the cutover. */
  googleSiteVerification: '2mIo1Lcscvff19HE__8IOyg48tuqogS0EFs8uLBYeYo',
  /** Bump when content changes meaningfully (used for sitemap lastModified; avoids runtime dates). */
  contentUpdated: '2026-11-24',
  copyrightYear: 2026,
} as const;

export const NAV = [
  { label: 'How we work', href: '/#how-we-work' },
  { label: 'About', href: '/about' },
  { label: 'Client stories', href: '/testimonials' },
  { label: 'FAQ', href: '/faq' },
] as const;

export const BOOK_PATH = '/book';
export const BOOK_LABEL = 'Book a complimentary chemistry session';
export const BOOK_LABEL_SHORT = 'Book a chemistry session';
export const BOOK_LABEL_XS = 'Book a session';

export const HOME_TITLE = 'Mariam Kaldas | Leadership Coach in Charleston, SC and Worldwide';
export const HOME_DESCRIPTION =
  'Co-Active (CPCC), ICF (PCC) and MBTI coaching for driven leaders and professionals at a turning point. Book a complimentary chemistry session with Mariam Kaldas, in Charleston or over Zoom.';
