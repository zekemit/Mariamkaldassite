'use client';

import { useEffect } from 'react';

/** Opens the <details> that a URL hash (for example /faq#teams) points at, on load and on hash change. */
export function HashOpen() {
  useEffect(() => {
    const openTarget = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      const element = document.getElementById(id);
      if (element instanceof HTMLDetailsElement) {
        element.open = true;
        element.scrollIntoView();
      }
    };
    openTarget();
    window.addEventListener('hashchange', openTarget);
    return () => window.removeEventListener('hashchange', openTarget);
  }, []);
  return null;
}
