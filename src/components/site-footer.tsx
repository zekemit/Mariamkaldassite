import Link from 'next/link';
import { NAV, SITE } from '@/content/site';
import { BookLink } from '@/components/book-link';
import { CmsLink } from '@/components/cms-link';
import type { SiteSettings } from '@/lib/cms-schema';
import { toTelHref } from '@/lib/safe-url';

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const social = [
    { label: 'LinkedIn', href: settings.linkedin },
    { label: 'Instagram', href: settings.instagram },
    { label: 'Facebook', href: settings.facebook },
  ].filter((item) => item.href !== '');

  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div>
          <p className="font-display text-[1.75rem] leading-tight">{SITE.name}</p>
          <p className="soft mt-3 max-w-[30ch]">
            Leadership coaching for driven leaders and professionals at a turning point.
          </p>
          <p className="soft mt-3 max-w-[34ch] text-[1rem]">Co-Active (CPCC), ICF (PCC) and MBTI certified.</p>
          <div className="mt-6">
            <BookLink location="footer" />
          </div>
        </div>

        <nav aria-label="Footer">
          <h2 className="font-sans text-[1rem] font-semibold">Explore</h2>
          <ul className="footer-links mt-3">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="link-quiet">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/privacy" className="link-quiet">
                Privacy
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="font-sans text-[1rem] font-semibold">Contact</h2>
          <ul className="footer-links mt-3">
            <li>
              <a className="link-quiet" href={`mailto:${settings.email}`}>
                {settings.email}
              </a>
            </li>
            <li>
              <a className="link-quiet" href={`tel:${toTelHref(settings.phone)}`}>
                {settings.phone}
              </a>
            </li>
            <li>{settings.location}</li>
          </ul>
          {social.length > 0 ? (
            <ul className="footer-links mt-3" aria-label="Social media">
              {social.map((item) => (
                <li key={item.label}>
                  <CmsLink href={item.href} className="link-quiet">
                    {item.label}
                  </CmsLink>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="wrap legal pb-10">
        <p>
          © {SITE.copyrightYear} {SITE.legalName}
        </p>
        <p className="mt-1 max-w-[60ch]">
          MBTI®, Myers-Briggs Type Indicator® and Co-Active® are registered trademarks of their respective owners.
        </p>
      </div>
    </footer>
  );
}
