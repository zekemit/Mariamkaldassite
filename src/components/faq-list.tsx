import { HashOpen } from '@/components/hash-open';
import { RichText } from '@/components/rich-text';
import type { FaqItem } from '@/content/faq';

/** Native <details> accordion: works without JavaScript; <HashOpen> opens the item a #hash points at. */
export function FaqList({ items, openFirst = false }: { items: readonly FaqItem[]; openFirst?: boolean }) {
  return (
    <div>
      {items.map((item, index) => (
        <details key={item.id} id={item.id} className="faq-item" open={openFirst && index === 0}>
          <summary>{item.q}</summary>
          <div className="faq-answer">
            {item.a.map((block, i) =>
              'p' in block ? (
                <p key={i}>
                  <RichText text={block.p} />
                </p>
              ) : (
                <ul key={i}>
                  {block.ul.map((li) => (
                    <li key={li}>
                      <RichText text={li} />
                    </li>
                  ))}
                </ul>
              ),
            )}
          </div>
        </details>
      ))}
      <HashOpen />
    </div>
  );
}
