import type { Metadata } from 'next';
import { BookingBand } from '@/components/booking-band';
import { FaqList } from '@/components/faq-list';
import { JsonLd } from '@/components/json-ld';
import { faqItems } from '@/content/faq';
import { faqSchema, graph, pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Coaching FAQ',
  description:
    'Who Mariam coaches, where, what the complimentary chemistry session is like, whether you should hire a coach at all, and how team sessions work.',
  path: '/faq',
});

export default function FaqPage() {
  return (
    <>
      <JsonLd data={graph(faqSchema())} />
      <div className="wrap-narrow section">
        <h1 className="display-2">So you have some questions…</h1>
        <div className="mt-12">
          <FaqList items={faqItems} openFirst />
        </div>
      </div>
      <BookingBand location="faq-band" />
    </>
  );
}
