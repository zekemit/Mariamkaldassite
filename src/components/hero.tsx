import Image from 'next/image';
import type { CSSProperties } from 'react';
import { BookLink } from '@/components/book-link';
import { SITE } from '@/content/site';

const line = (i: number) => ({ '--i': i }) as CSSProperties;

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="wrap">
      <div className="hero-grid">
        <div>
          <h1 id="hero-title" className="display-1">
            <span className="hero-line" style={line(0)}>
              <span>You meet every deadline</span>
            </span>
            <span className="hero-line" style={line(1)}>
              <span>except your own.</span>
            </span>
          </h1>

          <p className="lede mt-7 max-w-[34rem]">
            Co-Active (CPCC), ICF (PCC) and MBTI coaching for driven leaders and professionals at a turning point.
            Honest straight talk, in Charleston and over Zoom, wherever you are.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
            <BookLink location="hero" />
            <a href="#mirror" className="link-quiet">
              See if this is for you
            </a>
          </div>

          <p className="soft mt-5 text-[1rem]">One hour. No obligation. An honest answer about fit.</p>
        </div>

        <figure className="hero-figure">
          <div className="hero-figure__frame">
            <Image
              src="/images/mariam-hero.jpg"
              alt="Mariam Kaldas smiling over a cup of tea at a stone table above a wide blue lake"
              fill
              preload
              sizes="(min-width: 64rem) 40vw, 100vw"
              className="object-cover"
            />
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
