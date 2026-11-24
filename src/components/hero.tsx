import type { CSSProperties } from 'react';
import { BookLink } from '@/components/book-link';
import { CmsImage } from '@/components/cms-image';
import { SITE } from '@/content/site';
import type { SiteContent } from '@/lib/cms-schema';
import { splitHeadline } from '@/lib/headline';

const line = (i: number) => ({ '--i': i }) as CSSProperties;

export function Hero({ hero }: { hero: SiteContent['hero'] }) {
  return (
    <section aria-labelledby="hero-title" className="wrap">
      <div className="hero-grid">
        <div>
          <h1 id="hero-title" className="display-1">
            {splitHeadline(hero.headline).map((text, index) => (
              <span key={index} className="hero-line" style={line(index)}>
                <span>{text}</span>
              </span>
            ))}
          </h1>

          <p className="lede mt-7 max-w-[34rem]">{hero.subheadline}</p>

          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
            <BookLink location="hero">{hero.ctaLabel}</BookLink>
            <a href="#mirror" className="link-quiet">
              See if this is for you
            </a>
          </div>

          <p className="soft mt-5 text-[1rem]">One hour. No obligation. An honest answer about fit.</p>
        </div>

        <figure className="hero-figure">
          <div className="hero-figure__frame">
            <CmsImage src={hero.portraitSrc} alt={hero.portraitAlt} sizes="(min-width: 64rem) 40vw, 100vw" priority />
          </div>
          <figcaption className="mono-note">
            <span>
              {SITE.locality}, {SITE.region}
            </span>
            <span>{SITE.coordsLabel}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
