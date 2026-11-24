import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { dmMono, newsreader, newsreaderItalic, sourceSans } from './fonts';
import { HOME_DESCRIPTION, SITE } from '@/content/site';

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

/**
 * The bare document shell shared by the public site and /admin. The public chrome (header, footer, banner, popup,
 * analytics) lives in <SiteChrome>, used by the (site) route group, so the admin portal never loads any of it.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${newsreaderItalic.variable} ${sourceSans.variable} ${dmMono.variable}`}
    >
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
