import type { Metadata } from 'next';
import { SITE } from '@/content/site';
import { getSiteContent } from '@/lib/cms-storage';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Privacy',
  description: 'What this site collects when you book a session or send a message, and who handles it.',
  path: '/privacy',
});

export default async function PrivacyPage() {
  const { settings } = await getSiteContent();
  return (
    <div className="wrap section">
      <h1 className="display-2">Privacy</h1>
      <div className="prose mt-10">
        <p>
          This site is run by {SITE.legalName} ({SITE.locality}, {SITE.regionName}). It is built to collect as little
          as possible. Questions or requests about your information: email{' '}
          <a className="link-quiet" href={`mailto:${settings.email}`}>
            {settings.email}
          </a>
          .
        </p>

        <h2>If you send a message</h2>
        <p>
          The contact form collects your name, email address, topic and message. It is sent to Mariam by email through
          a delivery service (Resend, or an SMTP mail server). The site does not store it in a database. Email you
          send stays in Mariam’s inbox until she deletes it. Ask and she will delete it.
        </p>

        <h2>If you book a session</h2>
        <p>
          Booking is handled by Calendly, which collects the details you enter there (name, email and any answers) and
          is governed by its own privacy policy. If you tap statements in “Does any of this sound like you?” before
          booking, those statements are sent to Calendly with your booking so the conversation can start where you
          are. You can remove them on the booking page before you choose a time.
        </p>

        <h2>Cookies and analytics</h2>
        <p>
          This site sets no cookies of its own and uses no advertising trackers. Your tapped statements are kept in
          your browser tab only (session storage) and disappear when you close it. If privacy-friendly analytics is
          switched on, it counts visits and clicks without cookies. Calendly may set its own cookies when its
          scheduler loads on the booking page.
        </p>

        <h2>Hosting</h2>
        <p>
          The site is hosted on Vercel, which keeps standard server logs (such as IP address and browser type) for
          security and reliability.
        </p>

        <h2>Your choices</h2>
        <p>
          You can ask to see, correct or delete anything you have sent by emailing the address above. Last updated
          November 2026.
        </p>
      </div>
    </div>
  );
}
