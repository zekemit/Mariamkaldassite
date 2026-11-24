import Image from 'next/image';
import { safeImageSrc } from '@/lib/safe-url';

/**
 * Fills its (positioned, sized) parent with an image whose address came from the admin portal.
 * Site paths such as /images/mariam-hero.jpg go through the Next.js image optimizer; an off-site https:// address
 * is shown as-is (the optimizer only serves hosts that are configured at build time, and an editor's URL is not).
 * An address that fails the safe-URL check renders nothing.
 */
export function CmsImage({
  src,
  alt,
  sizes,
  priority = false,
  className = 'object-cover',
}: {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  const safe = safeImageSrc(src);
  if (!safe) return null;
  if (safe.startsWith('/')) {
    return <Image src={safe} alt={alt} fill sizes={sizes} preload={priority} className={className} />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- editor-supplied remote URL; cannot be allow-listed for next/image
    <img
      src={safe}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy="no-referrer"
      className={`absolute inset-0 h-full w-full ${className}`}
    />
  );
}
