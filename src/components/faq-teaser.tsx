import Link from 'next/link';
import { FaqList } from '@/components/faq-list';
import { faqItems, homeFaqIds } from '@/content/faq';

export function FaqTeaser() {
  const items = homeFaqIds
    .map((id) => faqItems.find((item) => item.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <section id="faq" aria-labelledby="faq-title" className="section">
      <div className="wrap-narrow">
        <h2 id="faq-title" className="display-2">
          Questions people ask first
        </h2>
        <div className="mt-10">
          <FaqList items={items} />
        </div>
        <p className="mt-10">
          <Link href="/faq" className="link-quiet">
            See every question
          </Link>
        </p>
      </div>
    </section>
  );
}
