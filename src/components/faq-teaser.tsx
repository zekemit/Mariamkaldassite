import Link from 'next/link';
import { FaqList } from '@/components/faq-list';
import type { ContactDetails } from '@/components/rich-text';
import type { FaqEntry } from '@/lib/cms-schema';

/** The questions marked "Show on homepage" (the first four if none are). The full list lives on /faq. */
export function FaqTeaser({ items, contact }: { items: readonly FaqEntry[]; contact: ContactDetails }) {
  const flagged = items.filter((item) => item.showOnHome);
  const shown = flagged.length > 0 ? flagged : items.slice(0, 4);
  if (shown.length === 0) return null;

  return (
    <section id="faq" aria-labelledby="faq-title" className="section">
      <div className="wrap-narrow">
        <h2 id="faq-title" className="display-2">
          Questions people ask first
        </h2>
        <div className="mt-10">
          <FaqList items={shown} contact={contact} />
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
