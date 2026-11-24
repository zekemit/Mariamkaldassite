import type { Metadata } from 'next';
import { BookingPanel } from '@/components/booking-panel';
import { ContactForm } from '@/components/contact-form';
import { getSiteContent } from '@/lib/cms-storage';
import { toTelHref } from '@/lib/safe-url';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Book a Complimentary Chemistry Session',
  description:
    'One hour, no obligation. Bring the topic and Mariam Kaldas will help you decide whether coaching is a good fit. Pick a time here, in Charleston or over Zoom.',
  path: '/book',
});

export default async function BookPage() {
  const { settings } = await getSiteContent();
  return (
    <div className="wrap section">
      <div className="grid gap-14 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-16">
        <div>
          <h1 className="display-2">Let’s find out if we’re a fit.</h1>
          <p className="lede mt-6 max-w-[30rem]">You bring the topic and we’ll go from there.</p>

          <h2 className="font-display mt-12 text-[1.5rem] leading-tight">What happens in the hour</h2>
          <ul className="mt-4 grid list-none gap-3 p-0">
            <li>You bring one real topic.</li>
            <li>I ask questions you haven’t been asked.</li>
            <li>We both decide whether this is a good fit.</li>
          </ul>

          <h2 className="font-display mt-12 text-[1.5rem] leading-tight">Prefer to talk first?</h2>
          <p className="mt-3">
            Call or text{' '}
            <a className="link-quiet" href={`tel:${toTelHref(settings.phone)}`}>
              {settings.phone}
            </a>
            , or email{' '}
            <a className="link-quiet" href={`mailto:${settings.email}`}>
              {settings.email}
            </a>
            .
          </p>
          <p className="soft mt-3 text-[1rem]">
            Sessions are over Zoom worldwide, and in person around Charleston.
          </p>
        </div>

        <BookingPanel />
      </div>

      <section id="contact" aria-labelledby="contact-title" className="rule-top mt-24 pt-14">
        <div className="max-w-[40rem]">
          <h2 id="contact-title" className="display-3">
            Not ready to book?
          </h2>
          <p className="soft mt-3">
            Have a question first, or want to ask about coaching or MBTI for your team? Send a note.
          </p>
          <div className="mt-8">
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
