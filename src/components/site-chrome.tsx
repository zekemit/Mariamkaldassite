import Script from 'next/script';
import type { ReactNode } from 'react';
import { AnnouncementBar } from '@/components/announcement-bar';
import { CtaTracker } from '@/components/cta-tracker';
import { JsonLd } from '@/components/json-ld';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { SiteSettingsProvider } from '@/components/site-settings-provider';
import { SitePopup } from '@/components/site-popup';
import { getSiteContent } from '@/lib/cms-storage';
import { graph, websiteSchema } from '@/lib/seo';
import { toTelHref } from '@/lib/safe-url';

const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

/**
 * Everything around a public page: skip link, announcement banner, header, footer, popup, analytics and site-wide
 * structured data. It reads the editable content once (cached; refreshed the moment something is published at
 * /admin) and hands the few values that client components need to them through a context provider.
 */
export async function SiteChrome({ children }: { children: ReactNode }) {
  const content = await getSiteContent();
  const { settings } = content;

  return (
    <SiteSettingsProvider
      value={{
        calendlyUrl: settings.calendlyUrl,
        email: settings.email,
        phone: settings.phone,
        phoneTel: toTelHref(settings.phone),
        prompts: content.mirror.prompts.map(({ id, text }) => ({ id, text })),
      }}
    >
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <AnnouncementBar announcement={content.announcement} />
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter settings={settings} />
      <CtaTracker />
      <SitePopup popup={content.popup} />
      <JsonLd data={graph(websiteSchema())} />
      {plausibleDomain ? (
        <Script defer data-domain={plausibleDomain} src="https://plausible.io/js/script.js" strategy="afterInteractive" />
      ) : null}
    </SiteSettingsProvider>
  );
}
