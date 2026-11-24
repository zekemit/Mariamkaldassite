import type { Metadata } from 'next';
import { BookingBand } from '@/components/booking-band';
import { StoriesExplorer } from '@/components/stories-explorer';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Client Stories',
  description:
    'Seven clients on what changed after coaching with Mariam Kaldas: career pivots, mindset shifts, leadership breakthroughs and accountability.',
  path: '/testimonials',
});

export default function TestimonialsPage() {
  return (
    <>
      <div className="wrap section">
        <h1 className="display-2 max-w-[18ch]">Client stories</h1>
        <p className="lede soft mt-5 max-w-[36rem]">
          In their own words, what changed. Filter by the kind of change that matters to you.
        </p>
        <div className="mt-12">
          <StoriesExplorer />
        </div>
      </div>
      <BookingBand location="stories" />
    </>
  );
}
