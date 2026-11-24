'use client';

import { useEffect, useRef, useState } from 'react';
import { SITE } from '@/content/site';
import { track } from '@/lib/analytics';
import { buildEmbedOptions, buildFallbackUrl } from '@/lib/calendly';
import { useMirrorSelection } from '@/lib/mirror-store';

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement;
        prefill?: object;
        utm?: object;
      }) => void;
    };
  }
}

const SCRIPT_SRC = 'https://assets.calendly.com/assets/external/widget.js';
const CSS_HREF = 'https://assets.calendly.com/assets/external/widget.css';
const CALENDLY_ORIGIN = 'https://calendly.com';

let loader: Promise<void> | null = null;

/** Loads Calendly's widget once, only when a booking surface is actually shown (never on the home page load). */
function loadCalendly(): Promise<void> {
  if (window.Calendly) return Promise.resolve();
  loader ??= new Promise<void>((resolve, reject) => {
    if (!document.querySelector(`link[href="${CSS_HREF}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = CSS_HREF;
      document.head.appendChild(link);
    }
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loader = null;
      script.remove();
      reject(new Error('calendly-script-failed'));
    };
    document.head.appendChild(script);
  });
  return loader;
}

type Status = 'loading' | 'ready' | 'error' | 'scheduled';

/**
 * Calendly's inline widget, themed to the site and pre-filled from The Mirror. The parent remounts it (via key)
 * when the selection changes, so each mount initialises exactly once.
 */
export function BookingEmbed({ source }: { source: string }) {
  const selection = useMirrorSelection();
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>('loading');

  const fallbackUrl = buildFallbackUrl({ baseUrl: SITE.calendlyUrl, selection, source });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;

    const timeout = window.setTimeout(() => {
      if (!cancelled) setStatus((current) => (current === 'loading' ? 'error' : current));
    }, 12000);

    loadCalendly()
      .then(() => {
        if (cancelled || !window.Calendly) return;
        host.innerHTML = '';
        window.Calendly.initInlineWidget({
          ...buildEmbedOptions({ baseUrl: SITE.calendlyUrl, selection, source }),
          parentElement: host,
        });
        setStatus((current) => (current === 'scheduled' ? current : 'ready'));
        track('book_view', { source });
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      host.innerHTML = '';
    };
  }, [selection, source]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== CALENDLY_ORIGIN) return;
      const data = event.data as { event?: string } | null;
      if (data?.event === 'calendly.event_scheduled') {
        setStatus('scheduled');
        track('book_scheduled', { source, prefilled: selection.length > 0 });
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [source, selection.length]);

  return (
    <div>
      {status === 'scheduled' ? (
        <div role="status" className="mb-6 border-l-2 border-brass pl-5">
          <p className="display-3">You’re booked.</p>
          <p className="mt-2 max-w-[34rem]">
            Here’s how to get the most from our hour: bring one real topic, and come ready to be asked something you
            haven’t been asked.
          </p>
        </div>
      ) : null}

      <div className="calendly-slot">
        {/* Deliberately NOT class="calendly-inline-widget": Calendly's script auto-initialises that class from a
            data-url attribute and throws when it is missing. We initialise programmatically instead. */}
        <div ref={hostRef} className="calendly-host" />
        {status === 'loading' ? (
          <div className="calendly-slot__status" aria-live="polite">
            <p>Loading open times…</p>
          </div>
        ) : null}
        {status === 'error' ? (
          <div className="calendly-slot__status" role="alert">
            <p className="display-3">The calendar didn’t load.</p>
            <p>You can open it in a new tab, or reach me directly.</p>
            <p>
              <a className="btn-book" href={fallbackUrl} target="_blank" rel="noopener noreferrer">
                Open the calendar
              </a>
            </p>
            <p className="text-[1rem]">
              Or call or text{' '}
              <a className="link-quiet" href={`tel:${SITE.phoneTel}`}>
                {SITE.phoneDisplay}
              </a>
              , or email{' '}
              <a className="link-quiet" href={`mailto:${SITE.email}`}>
                {SITE.email}
              </a>
              .
            </p>
          </div>
        ) : null}
      </div>

      <p className="soft mt-4 text-[1rem]">
        Trouble with the calendar?{' '}
        <a className="link-quiet" href={fallbackUrl} target="_blank" rel="noopener noreferrer">
          Open it in a new tab
        </a>
        , or reach me at{' '}
        <a className="link-quiet" href={`tel:${SITE.phoneTel}`}>
          {SITE.phoneDisplay}
        </a>{' '}
        or{' '}
        <a className="link-quiet" href={`mailto:${SITE.email}`}>
          {SITE.email}
        </a>
        .
      </p>
    </div>
  );
}
