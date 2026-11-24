// Optional, cookieless analytics. If Plausible is configured (NEXT_PUBLIC_PLAUSIBLE_DOMAIN) its script defines
// window.plausible; otherwise events are dropped. Event names follow MILLION_DOLLAR_BLUEPRINT.md Appendix E.

type Props = Record<string, string | number | boolean>;

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Props }) => void;
  }
}

export function track(event: string, props?: Props): void {
  if (typeof window === 'undefined') return;
  try {
    window.plausible?.(event, props ? { props } : undefined);
  } catch {
    // Analytics must never break the page.
  }
  if (process.env.NODE_ENV !== 'production') console.debug('[track]', event, props ?? {});
}
