import Link from 'next/link';
import { BOOK_LABEL_SHORT, BOOK_LABEL_XS, BOOK_PATH, NAV, SITE } from '@/content/site';
import { MobileNav } from '@/components/mobile-nav';

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="wrap site-header__inner">
        <Link href="/" className="wordmark" aria-label={`${SITE.name}, home`}>
          {SITE.name}
        </Link>

        <nav aria-label="Primary" className="site-nav">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="site-header__actions">
          {/* Same action, shortened labels so it fits beside the menu on a phone. */}
          <Link href={BOOK_PATH} className="btn-book btn-book--sm" data-cta="header">
            <span className="pill-label-sm">{BOOK_LABEL_XS}</span>
            <span className="pill-label-md">{BOOK_LABEL_SHORT}</span>
          </Link>
          <MobileNav items={NAV} />
        </div>
      </div>
    </header>
  );
}
