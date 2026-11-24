import type { Metadata } from 'next';
import { SITE } from '@/content/site';
import { faqItems, type FaqItem } from '@/content/faq';

const OG_IMAGE = {
  url: '/og.jpg',
  width: 1200,
  height: 630,
  alt: 'Mariam Kaldas, leadership coach: “You meet every deadline except your own.”',
};

/** Per-page metadata. Re-states openGraph/twitter because Next replaces (not merges) those objects. */
export function pageMetadata(args: {
  title: string;
  description: string;
  path: string;
  /** Use the title as-is (home page) instead of adding the "| Mariam Kaldas" template suffix. */
  absoluteTitle?: boolean;
}): Metadata {
  const fullTitle = args.absoluteTitle ? args.title : `${args.title} | ${SITE.name}`;
  return {
    title: args.absoluteTitle ? { absolute: args.title } : args.title,
    description: args.description,
    alternates: { canonical: args.path },
    openGraph: {
      type: 'website',
      siteName: SITE.name,
      locale: 'en_US',
      title: fullTitle,
      description: args.description,
      url: args.path,
      images: [OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: args.description,
      images: [OG_IMAGE.url],
    },
  };
}

const personId = `${SITE.url}/#mariam`;
const serviceId = `${SITE.url}/#service`;

function credential(name: string, issuer?: string) {
  return {
    '@type': 'EducationalOccupationalCredential',
    name,
    credentialCategory: 'certification',
    ...(issuer ? { recognizedBy: { '@type': 'Organization', name: issuer } } : {}),
  };
}

export function personSchema() {
  return {
    '@type': 'Person',
    '@id': personId,
    name: SITE.name,
    jobTitle: 'Leadership Coach',
    description:
      'Co-Active (CPCC), ICF (PCC) and MBTI coach for driven leaders and professionals at a turning point. Formerly External Engagement Advisor at the U.S. Department of State.',
    url: SITE.url,
    image: `${SITE.url}/images/mariam-hero.jpg`,
    email: SITE.email,
    telephone: SITE.phoneTel,
    address: {
      '@type': 'PostalAddress',
      addressLocality: SITE.locality,
      addressRegion: SITE.region,
      addressCountry: SITE.country,
    },
    alumniOf: [
      { '@type': 'CollegeOrUniversity', name: 'University of Virginia' },
      { '@type': 'CollegeOrUniversity', name: 'University of Maryland' },
    ],
    hasCredential: [
      credential('Certified Co-Active Professional Coach (CPCC)', 'Coaches Training Institute'),
      credential('Professional Certified Coach (PCC)', 'International Coaching Federation'),
      credential('Myers-Briggs Type Indicator (MBTI) Certified Practitioner'),
    ],
    knowsAbout: [
      'Leadership coaching',
      'Co-Active coaching',
      'Career transitions',
      'Myers-Briggs Type Indicator',
      'Intercultural communication',
    ],
    worksFor: { '@id': serviceId },
  };
}

export function serviceSchema() {
  return {
    '@type': 'ProfessionalService',
    '@id': serviceId,
    name: 'Mariam Kaldas Coaching',
    legalName: SITE.legalName,
    url: SITE.url,
    image: `${SITE.url}/images/mariam-hero.jpg`,
    telephone: SITE.phoneTel,
    email: SITE.email,
    serviceType: 'Leadership coaching',
    address: {
      '@type': 'PostalAddress',
      addressLocality: SITE.locality,
      addressRegion: SITE.region,
      addressCountry: SITE.country,
    },
    areaServed: [`${SITE.locality}, ${SITE.region}`, 'Worldwide (online)'],
    founder: { '@id': personId },
    potentialAction: {
      '@type': 'ReserveAction',
      name: 'Book a complimentary chemistry session',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE.url}/book` },
    },
  };
}

export function websiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': `${SITE.url}/#website`,
    name: SITE.name,
    url: SITE.url,
    publisher: { '@id': serviceId },
    inLanguage: 'en-US',
  };
}

export function graph(...nodes: object[]) {
  return { '@context': 'https://schema.org', '@graph': nodes };
}

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Plain-text/HTML answer for FAQPage markup (link tokens resolved to words and URLs). */
function answerHtml(item: FaqItem): string {
  const resolve = (s: string) =>
    s
      .replaceAll('{{email}}', SITE.email)
      .replaceAll('{{phone}}', SITE.phoneDisplay)
      .replaceAll('{{book}}', `Book a complimentary chemistry session at ${SITE.url}/book.`)
      .replaceAll('{{contact}}', `Send a note at ${SITE.url}/book#contact.`);
  return item.a
    .map((block) =>
      'p' in block
        ? `<p>${escapeHtml(resolve(block.p))}</p>`
        : `<ul>${block.ul.map((li) => `<li>${escapeHtml(resolve(li))}</li>`).join('')}</ul>`,
    )
    .join('');
}

export function faqSchema(items: readonly FaqItem[] = faqItems) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: answerHtml(item) },
    })),
  };
}
