import type { Metadata } from 'next';
import { BookingBand } from '@/components/booking-band';
import { StoriesExplorer } from '@/components/stories-explorer';
import { getSiteContent } from '@/lib/cms-storage';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Client Stories',
  description:
    'Clients on what changed after coaching with Mariam Kaldas: career pivots, mindset shifts, leadership breakthroughs and accountability.',
  path: '/testimonials',
});

export default async function TestimonialsPage() {
  const { testimonials } = await getSiteContent();
  return (
    <>
      <div className="wrap section">
        <h1 className="display-2 max-w-[18ch]">Client stories</h1>
        <p className="lede soft mt-5 max-w-[36rem]">
          In their own words, what changed. Filter by the kind of change that matters to you.
        </p>
        <div className="mt-12">
          <StoriesExplorer stories={testimonials} />
        </div>
      </div>
      <BookingBand location="stories" />
    </>
  );
}
