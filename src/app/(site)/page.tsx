import type { Metadata } from 'next';
import { BookingBand } from '@/components/booking-band';
import { CredentialStrip } from '@/components/credential-strip';
import { FaqTeaser } from '@/components/faq-teaser';
import { Hero } from '@/components/hero';
import { JsonLd } from '@/components/json-ld';
import { Method } from '@/components/method';
import { Mirror } from '@/components/mirror';
import { StoriesTeaser } from '@/components/stories-teaser';
import { Voyage } from '@/components/voyage';
import { HOME_DESCRIPTION, HOME_TITLE } from '@/content/site';
import { getSiteContent } from '@/lib/cms-storage';
import { graph, pageMetadata, personSchema, serviceSchema } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  path: '/',
  absoluteTitle: true,
});

/** The eight-part flow: hero, credentials, Mirror, method, Voyage, client stories, booking band, FAQ. */
export default async function HomePage() {
  const content = await getSiteContent();
  const { settings } = content;

  return (
    <>
      <JsonLd data={graph(serviceSchema(settings), personSchema(settings))} />
      <Hero hero={content.hero} />
      <CredentialStrip items={content.about.strip} />
      <Mirror prompts={content.mirror.prompts} />
      <Method pillars={content.pillars} />
      <Voyage />
      <StoriesTeaser stories={content.testimonials} />
      <BookingBand />
      <FaqTeaser items={content.faq} contact={settings} />
    </>
  );
}
