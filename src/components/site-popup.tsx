'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef } from 'react';
import { CmsImage } from '@/components/cms-image';
import { CmsLink } from '@/components/cms-link';
import type { SiteContent } from '@/lib/cms-schema';
import { track } from '@/lib/analytics';

type Popup = SiteContent['popup'];

const SHOW_DELAY_MS = 2500;
/** Pages where a popup would only get in the way of what the visitor is already doing. */
const QUIET_PATHS = new Set(['/book', '/privacy']);

/** "Every visit" means every full page load; this survives client-side navigation but not a reload. */
let shownThisPageLoad = false;

/** Short stable fingerprint, so editing the popup's wording shows it again to people who dismissed the old one. */
function fingerprint(popup: Popup): string {
  const source = [popup.headline, popup.body, popup.imageUrl, popup.ctaLabel, popup.ctaMode, popup.ctaUrl].join('\u0001');
  let hash = 0x811c9dc5;
  for (let i = 0; i < source.length; i++) {
    hash ^= source.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

function seenThisSession(key: string): boolean {
  try {
    return window.sessionStorage.getItem(key) !== null;
  } catch {
    return false;
  }
}

function markSeen(key: string) {
  try {
    window.sessionStorage.setItem(key, '1');
  } catch {
    // Storage unavailable: the popup may show again on the next page, which is acceptable.
  }
}

/**
 * The optional popup modal (a native <dialog>, so focus is trapped, Escape closes it, and the page behind is inert).
 * It appears a couple of seconds after the page loads, never over the booking page, and never on top of another
 * dialog. "Once per session" remembers it in sessionStorage; "Every visit" shows it on each full page load.
 */
export function SitePopup({ popup }: { popup: Popup }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const pathname = usePathname();

  const { enabled, frequency, headline } = popup;
  const signature = fingerprint(popup);

  useEffect(() => {
    if (!enabled || headline === '' || QUIET_PATHS.has(pathname)) return;
    const key = `mk:popup:${signature}`;
    if (frequency === 'session' ? seenThisSession(key) : shownThisPageLoad) return;

    const timer = window.setTimeout(() => {
      const dialog = ref.current;
      if (!dialog || dialog.open || document.querySelector('dialog[open]')) return;
      dialog.showModal();
      shownThisPageLoad = true;
      if (frequency === 'session') markSeen(key);
      track('popup_view', { frequency });
    }, SHOW_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [enabled, frequency, headline, signature, pathname]);

  if (!enabled || headline === '') return null;

  const close = () => ref.current?.close();
  const hasCta = popup.ctaLabel !== '' && (popup.ctaMode === 'booking' || popup.ctaUrl !== '');

  return (
    <dialog
      ref={ref}
      className="site-popup"
      aria-labelledby={titleId}
      onClick={(event) => {
        if (event.target === ref.current) close();
      }}
    >
      <button type="button" className="site-popup__close" aria-label="Close" onClick={close}>
        <span aria-hidden="true">×</span>
      </button>
      {popup.imageUrl ? (
        <div className="site-popup__media">
          <CmsImage src={popup.imageUrl} alt={popup.imageAlt} sizes="(min-width: 40rem) 32rem, 100vw" />
        </div>
      ) : null}
      <div className="site-popup__body">
        <h2 id={titleId} className="display-3">
          {popup.headline}
        </h2>
        {popup.body ? <p className="mt-4 whitespace-pre-line">{popup.body}</p> : null}
        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
          {hasCta ? (
            popup.ctaMode === 'booking' ? (
              <Link href="/book" className="btn-book" data-cta="popup" onClick={close}>
                {popup.ctaLabel}
              </Link>
            ) : (
              <CmsLink href={popup.ctaUrl} className="btn-book" dataCta="popup" onClick={close}>
                {popup.ctaLabel}
              </CmsLink>
            )
          ) : null}
          <button type="button" className="link-button" onClick={close}>
            {hasCta ? 'Not right now' : 'Close'}
          </button>
        </div>
      </div>
    </dialog>
  );
}
