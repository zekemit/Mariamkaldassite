import Link from 'next/link';
import type { MouseEventHandler, ReactNode } from 'react';
import { isExternalUrl, safeHref } from '@/lib/safe-url';

/**
 * A link whose address came from the admin portal. The address is checked again here (defense in depth), so a
 * value that somehow bypassed validation can only ever render as "#", never as a script URL. Site paths use the
 * Next.js router; off-site links open in a new tab; mailto: and tel: stay in place.
 */
export function CmsLink({
  href,
  className,
  children,
  dataCta,
  onClick,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  dataCta?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}) {
  const safe = safeHref(href);
  if (safe.startsWith('/')) {
    return (
      <Link href={safe} className={className} data-cta={dataCta} onClick={onClick}>
        {children}
      </Link>
    );
  }
  const external = isExternalUrl(safe);
  return (
    <a
      href={safe}
      className={className}
      data-cta={dataCta}
      onClick={onClick}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </a>
  );
}
