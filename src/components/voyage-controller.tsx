'use client';

import { useEffect } from 'react';

const clamp = (n: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));

/**
 * Drives the Voyage from scroll position: it reads each chapter's place against a focus line and sets
 * stroke-dashoffset on the route legs, lights the visited stops and moves the cursor. No animation library.
 * Listeners are attached only while the section is near the viewport. With reduced motion it simply
 * shows the finished route.
 */
export function VoyageController() {
  useEffect(() => {
    const root = document.getElementById('voyage');
    if (!root) return;

    const chapters = Array.from(root.querySelectorAll<HTMLElement>('[data-chapter]'));
    const legs = Array.from(root.querySelectorAll<SVGPathElement>('[data-leg]'));
    const dots = Array.from(root.querySelectorAll<SVGCircleElement>('[data-dot]'));
    const lane = root.querySelector<SVGPathElement>('[data-lane]');
    const laneAt = Number(lane?.dataset.laneAt ?? 2);
    const cursor = root.querySelector<SVGGElement>('[data-cursor]');
    const place = root.querySelector<HTMLElement>('[data-readout-place]');
    const coords = root.querySelector<HTMLElement>('[data-readout-coords]');
    if (chapters.length === 0) return;

    let active = -1;

    const setActive = (index: number) => {
      if (index === active) return;
      active = index;
      const chapter = chapters[index];
      chapters.forEach((c, i) => c.classList.toggle('is-active', i === index));
      dots.forEach((d, i) => d.classList.toggle('is-lit', i <= index));
      lane?.classList.toggle('is-on', index >= laneAt);
      if (cursor) {
        cursor.style.transform = `translate(${chapter.dataset.x}px, ${chapter.dataset.y}px)`;
        cursor.classList.remove('is-pulsing');
        void cursor.getBoundingClientRect(); // restart the one-shot pulse
        cursor.classList.add('is-pulsing');
      }
      if (place) place.textContent = chapter.dataset.place ?? '';
      if (coords) coords.textContent = chapter.dataset.coords ?? '';
    };

    const showFinished = () => {
      legs.forEach((leg) => (leg.style.strokeDashoffset = '0'));
      lane?.classList.add('is-on');
      chapters.forEach((c) => c.classList.add('is-active'));
      dots.forEach((d) => d.classList.add('is-lit'));
      const last = chapters[chapters.length - 1];
      if (cursor) cursor.style.transform = `translate(${last.dataset.x}px, ${last.dataset.y}px)`;
      if (place) place.textContent = last.dataset.place ?? '';
      if (coords) coords.textContent = last.dataset.coords ?? '';
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      showFinished();
      return;
    }

    const update = () => {
      const desktop = window.matchMedia('(min-width: 64rem)').matches;
      const focusY = window.innerHeight * (desktop ? 0.5 : 0.68);

      let index = 0;
      let fraction = 0;
      for (let i = 0; i < chapters.length; i++) {
        const rect = chapters[i].getBoundingClientRect();
        if (rect.top <= focusY) {
          index = i;
          fraction = clamp((focusY - rect.top) / Math.max(1, rect.height));
        }
      }

      legs.forEach((leg, i) => {
        // Leg i runs from stop i to stop i+1 during the second half of chapter i.
        const progress = i < index ? 1 : i === index ? clamp((fraction - 0.35) / 0.6) : 0;
        leg.style.strokeDashoffset = String(1 - progress);
      });
      setActive(index);
    };

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };

    let listening = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !listening) {
          window.addEventListener('scroll', onScroll, { passive: true });
          window.addEventListener('resize', onScroll);
          listening = true;
          onScroll();
        } else if (!entry.isIntersecting && listening) {
          window.removeEventListener('scroll', onScroll);
          window.removeEventListener('resize', onScroll);
          listening = false;
        }
      },
      { rootMargin: '240px 0px' },
    );
    observer.observe(root);
    update();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
