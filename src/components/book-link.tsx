import Link from 'next/link';
import type { ReactNode } from 'react';
import { BOOK_LABEL, BOOK_PATH } from '@/content/site';

/** The one booking action. Brick red is reserved for this component and its siblings. */
export function BookLink({
  location,
  children,
  className = '',
  small = false,
}: {
  /** Where the link sits, for analytics (data-cta): header, hero, mirror, band, footer, about, stories... */
  location: string;
  children?: ReactNode;
  className?: string;
  small?: boolean;
}) {
  return (
    <Link
      href={BOOK_PATH}
      className={`btn-book${small ? ' btn-book--sm' : ''}${className ? ` ${className}` : ''}`}
      data-cta={location}
    >
      {children ?? BOOK_LABEL}
    </Link>
  );
}
