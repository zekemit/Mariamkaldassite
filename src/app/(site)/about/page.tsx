import type { Metadata } from 'next';
import Image from 'next/image';
import { BookingBand } from '@/components/booking-band';
import { JsonLd } from '@/components/json-ld';
import { CmsLink } from '@/components/cms-link';
import { cornerstones, cornerstonesSource } from '@/content/about';
import { getSiteContent } from '@/lib/cms-storage';
import { safeImageSrc } from '@/lib/safe-url';
import { graph, pageMetadata, personSchema } from '@/lib/seo';
import { typo } from '@/lib/typo';

export const metadata: Metadata = pageMetadata({
  title: 'About: CPCC, PCC and MBTI Coach',
  description:
    'From a university at sea to Zambia, Washington, D.C. and Charleston: the story, credentials and Co-Active approach behind Mariam Kaldas’s leadership coaching.',
  path: '/about',
});

export default async function AboutPage() {
  const { about, settings } = await getSiteContent();
  const [lead, ...rest] = about.paragraphs;

  return (
    <>
      <JsonLd data={graph(personSchema(settings))} />
      <div className="wrap section">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-20">
          <div>
            <h1 className="display-2 max-w-[20ch]">{about.heading}</h1>
            <div className="prose mt-10">
              <p className="prose-lead">{typo(lead)}</p>
              {rest.map((paragraph, index) => (
                <p key={index}>{typo(paragraph)}</p>
              ))}
            </div>
          </div>

          <aside className="lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:self-start">
            <figure className="m-0">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-oyster">
                <Image
                  src="/images/mariam-about.jpg"
                  alt="Mariam Kaldas in a yellow dress, smiling between tall stone columns"
                  fill
                  preload
                  sizes="(min-width: 64rem) 36vw, 100vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mono-note mt-3 text-brass-ink">Charleston, SC</figcaption>
            </figure>
          </aside>
        </div>

        {about.credentials.length > 0 ? (
          <section aria-labelledby="creds-title" className="mt-24 max-w-[44rem]">
            <h2 id="creds-title" className="display-3">
              Credentials
            </h2>
            <ul className="cred-ledger mt-6">
              {about.credentials.map((credential) => {
                const badge = safeImageSrc(credential.badgeSrc);
                return (
                  <li key={credential.id}>
                    {badge ? (
                      // eslint-disable-next-line @next/next/no-img-element -- small editor-supplied badge of unknown size
                      <img src={badge} alt={credential.badgeAlt} loading="lazy" decoding="async" referrerPolicy="no-referrer" className="h-auto w-16" />
                    ) : (
                      <span className="cred-code">{credential.code}</span>
                    )}
                    <div>
                      <p className="m-0 font-semibold">
                        <span className="cred-code mr-2">{credential.code}</span>
                        {credential.title}
                      </p>
                      <p className="soft m-0 text-[1rem]">
                        Issued through{' '}
                        <CmsLink className="link-quiet" href={credential.href}>
                          {credential.issuer}
                        </CmsLink>
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <section aria-labelledby="model-title" className="mt-24 max-w-[44rem]">
          <h2 id="model-title" className="display-3">
            The Co-Active model I coach from
          </h2>
          <p className="soft mt-4">
            Its four cornerstones are the foundation of how I work with you.{' '}
            <a className="link-quiet" href={cornerstonesSource} target="_blank" rel="noopener noreferrer">
              Learn about the model
            </a>
            .
          </p>
          <ul className="mt-6 grid list-none gap-0 p-0">
            {cornerstones.map((cornerstone) => (
              <li key={cornerstone} className="font-display border-t border-[var(--rule)] py-4 text-[1.5rem] leading-snug last:border-b">
                {cornerstone}
              </li>
            ))}
          </ul>
        </section>
      </div>
      <BookingBand location="about" />
    </>
  );
}
