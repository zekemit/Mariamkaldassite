'use client';

import { useEffect } from 'react';
import { BookingEmbed } from '@/components/booking-embed';
import { mirrorStatements } from '@/content/mirror';
import { parseQuery } from '@/lib/mirror-state';
import { clearMirrorSelection, setMirrorSelection, useMirrorSelection } from '@/lib/mirror-store';

/**
 * The /book scheduler. Accepts a Mirror selection from ?m=0,3 (indices only), then removes the parameter from
 * the address bar. Shows exactly what will be sent with the booking and lets the visitor remove it.
 */
export function BookingPanel() {
  const selection = useMirrorSelection();

  useEffect(() => {
    const fromUrl = parseQuery(window.location.search);
    if (fromUrl === null) return;
    if (fromUrl.length > 0) setMirrorSelection(fromUrl);
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.hash}`);
  }, []);

  return (
    <div>
      {selection.length > 0 ? (
        <aside aria-label="Shared with your booking" className="mb-6 border border-[var(--rule)] p-5">
          <p className="font-semibold">Going along with your booking</p>
          <ul className="mt-2 list-disc pl-5">
            {selection.map((index) => (
              <li key={index}>{mirrorStatements[index].text}</li>
            ))}
          </ul>
          <button type="button" className="link-button mt-2" onClick={clearMirrorSelection}>
            Don’t send these
          </button>
        </aside>
      ) : null}
      {/* Remount when the selection changes so the widget initialises once per state. */}
      <BookingEmbed key={selection.join(',') || 'none'} source="page" />
    </div>
  );
}
