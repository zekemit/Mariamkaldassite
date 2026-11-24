import { HashOpen } from '@/components/hash-open';
import { RichText, type ContactDetails } from '@/components/rich-text';
import type { FaqEntry } from '@/lib/cms-schema';
import { parseAnswer } from '@/lib/rich-text-markup';

/** Native <details> accordion: works without JavaScript; <HashOpen> opens the item a #hash points at. */
export function FaqList({
  items,
  contact,
  openFirst = false,
}: {
  items: readonly FaqEntry[];
  contact: ContactDetails;
  openFirst?: boolean;
}) {
  return (
    <div>
      {items.map((item, index) => (
        <details key={item.id} id={item.id} className="faq-item" open={openFirst && index === 0}>
          <summary>{item.question}</summary>
          <div className="faq-answer">
            {parseAnswer(item.answer).map((block, i) =>
              'p' in block ? (
                <p key={i}>
                  <RichText text={block.p} contact={contact} />
                </p>
              ) : (
                <ul key={i}>
                  {block.ul.map((li, j) => (
                    <li key={j}>
                      <RichText text={li} contact={contact} />
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
