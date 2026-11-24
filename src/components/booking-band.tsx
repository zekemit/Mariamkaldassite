import { BookingDialog } from '@/components/booking-dialog';
import { BookLink } from '@/components/book-link';
import { SITE } from '@/content/site';

/** Closing conversion band (dark chapter). `location` tags the CTA for analytics. */
export function BookingBand({ location = 'band' }: { location?: string }) {
  return (
    <section id="book-band" aria-labelledby="band-title" className="section on-dark">
      <div className="wrap-narrow">
        <h2 id="band-title" className="display-2">
          Let’s find out if we’re a fit.
        </h2>
        <p className="lede soft mt-6 max-w-[34rem]">
          You bring the topic and we’ll go from there. One hour, no obligation, and an honest answer about whether
          coaching is right for you.
        </p>
        <div className="band-actions mt-10">
          <BookLink location={location} />
          <BookingDialog />
        </div>
        <p className="soft mt-8 text-[1.0625rem]">
          Prefer to talk first? Call or text{' '}
          <a className="link-quiet" href={`tel:${SITE.phoneTel}`}>
            {SITE.phoneDisplay}
          </a>{' '}
          or write to{' '}
          <a className="link-quiet" href={`mailto:${SITE.email}`}>
            {SITE.email}
          </a>
          .
        </p>
      </div>
    </section>
  );
}
