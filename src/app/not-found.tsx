import Link from 'next/link';
import { BookLink } from '@/components/book-link';
import { SiteChrome } from '@/components/site-chrome';

// The root not-found renders inside the root layout only (not the (site) group), so it wraps itself in the chrome.
export default function NotFound() {
  return (
    <SiteChrome>
      <div className="wrap section">
        <h1 className="display-2 max-w-[18ch]">That page isn’t here.</h1>
        <p className="lede soft mt-5 max-w-[32rem]">
          It may have moved when the site was rebuilt. Start from the home page, or book a session.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <BookLink location="not-found" />
          <Link href="/" className="link-quiet">
            Go to the home page
          </Link>
        </div>
      </div>
    </SiteChrome>
  );
}
