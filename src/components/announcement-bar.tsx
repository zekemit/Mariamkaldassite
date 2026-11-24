import { CmsLink } from '@/components/cms-link';
import type { SiteContent } from '@/lib/cms-schema';

/** The optional site-wide banner above the header. Editable (and switchable off) at /admin. */
export function AnnouncementBar({ announcement }: { announcement: SiteContent['announcement'] }) {
  if (!announcement.enabled || !announcement.text) return null;
  const hasLink = announcement.linkUrl !== '' && announcement.linkLabel !== '';
  return (
    <div className="announce" role="region" aria-label="Announcement">
      <p className="wrap announce__inner">
        <span>{announcement.text}</span>
        {hasLink ? (
          <CmsLink href={announcement.linkUrl} className="announce__link">
            {announcement.linkLabel}
          </CmsLink>
        ) : null}
      </p>
    </div>
  );
}
