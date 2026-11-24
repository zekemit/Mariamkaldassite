'use client';

import { useEffect } from 'react';
import { track } from '@/lib/analytics';

/** One delegated listener for every booking link (data-cta="location") instead of a handler per link. */
export function CtaTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest('[data-cta]');
      if (link) track('cta_click', { location: link.getAttribute('data-cta') ?? 'unknown' });
    };
    document.addEventListener('click', onClick, { passive: true });
    return () => document.removeEventListener('click', onClick);
  }, []);
  return null;
}
