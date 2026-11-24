'use client';

import dynamic from 'next/dynamic';
import { useId, useRef, useState } from 'react';
import { track } from '@/lib/analytics';

// Loaded on first open, so the Calendly integration is not part of the page's initial JavaScript.
const BookingEmbed = dynamic(() => import('@/components/booking-embed').then((m) => m.BookingEmbed), {
  ssr: false,
});

/**
 * "See open times right here": the same embedded Calendly experience in a native <dialog>, so visitors who are
 * ready can book without leaving the page. The scheduler loads only when the dialog is opened.
 */
export function BookingDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const titleId = useId();

  const show = () => {
    setOpen(true);
    dialogRef.current?.showModal();
    track('cta_click', { location: 'dialog' });
  };
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button type="button" className="link-button" onClick={show}>
        Or see open times right here
      </button>
      <dialog
        ref={dialogRef}
        className="book-dialog"
        aria-labelledby={titleId}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === dialogRef.current) close();
        }}
      >
        <div className="p-5 sm:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <h2 id={titleId} className="display-3">
              Pick a time
            </h2>
            <button type="button" className="link-button" onClick={close}>
              Close
            </button>
          </div>
          {open ? <BookingEmbed source="dialog" /> : null}
        </div>
      </dialog>
    </>
  );
}
