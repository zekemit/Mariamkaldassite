// Credentials as text first (the old site showed them only as small unlabeled images).
// CPCC / PCC are confirmed by the badge images on the live About page (alt text CCT_CPCC_Badge.png,
// CredentialBadges_PCC.jpg). Verification-specific URLs are still to be supplied by Mariam.

export interface Credential {
  code: string;
  title: string;
  issuer: string;
  href: string;
  badge?: { src: string; width: number; height: number; alt: string };
}

export const credentials: readonly Credential[] = [
  {
    code: 'CPCC',
    title: 'Certified Co-Active® Professional Coach',
    issuer: 'Coaches Training Institute (CTI)',
    href: 'https://coactive.com/',
    badge: {
      src: '/images/badge-cpcc.png',
      width: 240,
      height: 240,
      alt: 'CPCC badge, Certified Co-Active Professional Coach',
    },
  },
  {
    code: 'PCC',
    title: 'Professional Certified Coach',
    issuer: 'International Coaching Federation (ICF)',
    href: 'https://coachingfederation.org/',
    badge: {
      src: '/images/badge-pcc.jpg',
      width: 189,
      height: 128,
      alt: 'PCC badge, Professional Certified Coach, International Coaching Federation',
    },
  },
  {
    code: 'MBTI®',
    title: 'Certified Myers-Briggs Type Indicator® Practitioner',
    issuer: 'Myers-Briggs Type Indicator (MBTI)',
    href: 'https://www.myersbriggs.org/',
  },
];

/** Items shown in the credential strip under the hero. */
export const credentialStrip = [
  { code: 'CPCC', text: 'Certified Co-Active® Professional Coach' },
  { code: 'PCC', text: 'ICF Professional Certified Coach' },
  { code: 'MBTI®', text: 'Certified Practitioner' },
  { code: '45+', text: 'countries worked, lived and traveled' },
  { code: 'Formerly', text: 'U.S. Department of State' },
] as const;
