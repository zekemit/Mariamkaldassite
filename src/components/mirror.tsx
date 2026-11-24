'use client';

import Link from 'next/link';
import { useId } from 'react';
import { mirrorNotForYou, mirrorStatements, mirrorStatus } from '@/content/mirror';
import { BOOK_LABEL } from '@/content/site';
import { track } from '@/lib/analytics';
import { bookHref } from '@/lib/mirror-state';
import { setMirrorSelection, useMirrorSelection } from '@/lib/mirror-store';

/**
 * "The Mirror": the seven reflection questions from the old home page as tap-to-select statements.
 * Replies reveal with CSS alone (:has(:checked)), so the section reads fine without JavaScript.
 * The selection is remembered for the tab and travels to /book as indices, where it pre-fills Calendly.
 */
export function Mirror() {
  const selected = useMirrorSelection();
  const baseId = useId();

  const toggle = (index: number) => {
    const next = selected.includes(index) ? selected.filter((i) => i !== index) : [...selected, index];
    setMirrorSelection(next);
    track('mirror_select', { index, count: next.length });
  };

  const status =
    selected.length === 0 ? mirrorStatus.none : selected.length < 3 ? mirrorStatus.some : mirrorStatus.many;

  return (
    <section id="mirror" aria-labelledby="mirror-title" className="section">
      <div className="wrap-narrow">
        <h2 id="mirror-title" className="display-2">
          Does any of this sound like you?
        </h2>
        <p className="lede soft mt-4">Tap the ones that do.</p>

        <fieldset className="m-0 mt-10 border-0 p-0">
          <legend className="sr-only">Statements that might sound like you</legend>
          <ul className="mirror-list">
            {mirrorStatements.map((statement, index) => {
              const id = `${baseId}-${index}`;
              const checked = selected.includes(index);
              return (
                <li key={statement.id} className="mirror-item">
                  <label className="mirror-label" htmlFor={id}>
                    <input
                      id={id}
                      className="mirror-input"
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(index)}
                      aria-describedby={checked ? `${id}-reply` : undefined}
                    />
                    <span className="mirror-box" aria-hidden="true" />
                    <span className="mirror-text">{statement.text}</span>
                  </label>
                  <div className="mirror-reply" id={`${id}-reply`}>
                    <div>
                      <p>{statement.reply}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </fieldset>

        <p role="status" className="font-display mt-8 text-[1.5rem] leading-snug">
          {status}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Link href={bookHref(selected)} className="btn-book" data-cta="mirror">
            {BOOK_LABEL}
          </Link>
          {selected.length > 0 ? (
            <p className="soft max-w-[26rem] text-[1rem]">
              Your selections go along with your booking so we can start where you are. You can remove them on the
              next page.
            </p>
          ) : null}
        </div>

        <p className="soft mt-10 max-w-[38rem]">{mirrorNotForYou}</p>
      </div>
    </section>
  );
}
