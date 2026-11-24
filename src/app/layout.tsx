import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import type { ReactNode } from 'react';
import './globals.css';
import { dmMono, newsreader, newsreaderItalic, sourceSans } from './fonts';
import { HOME_DESCRIPTION, SITE } from '@/content/site';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { CtaTracker } from '@/components/cta-tracker';
import { JsonLd } from '@/components/json-ld';
import { graph, websiteSchema } from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: 'Mariam Kaldas | Leadership Coach', template: '%s | Mariam Kaldas' },
  description: HOME_DESCRIPTION,
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  formatDetection: { telephone: false, email: false, address: false },
  verification: { google: SITE.googleSiteVerification },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#f8f5ee',
  colorScheme: 'light',
};

const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${newsreaderItalic.variable} ${sourceSans.variable} ${dmMono.variable}`}
    >
      <body className="flex min-h-dvh flex-col">
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <CtaTracker />
        <JsonLd data={graph(websiteSchema())} />
        {plausibleDomain ? (
          <Script
            defer
            data-domain={plausibleDomain}
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        ) : null}
      </body>
    </html>
  );
}
