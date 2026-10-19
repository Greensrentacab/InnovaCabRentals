'use client';

/**
 * RouteSlider.tsx — Netflix-style featured-routes slider (design.md §3.3).
 * Card widths (78% / 44% / 29% / 23%) always leave the next card cut off at
 * the viewport edge; arrows scroll 85% of the track and disable at the ends.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import RouteCard, { type SliderRoute } from '@/components/home/RouteCard';

export type { SliderRoute };

const arrowClass =
  'flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white text-ink shadow-float transition hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700 disabled:pointer-events-none disabled:opacity-35';

export default function RouteSlider({ routes }: { routes: SliderRoute[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = trackRef.current;
    el?.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [update]);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <div className="relative">
      <div className="mb-3 hidden justify-end gap-2 md:flex">
        <button type="button" aria-label="Scroll routes left" disabled={!canPrev} onClick={() => scrollBy(-1)} className={arrowClass}>
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button type="button" aria-label="Scroll routes right" disabled={!canNext} onClick={() => scrollBy(1)} className={arrowClass}>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile: two compact rows, two cards visible with the next one peeking in */}
      <div className="space-y-2 md:hidden">
        {[routes.slice(0, Math.ceil(routes.length / 2)), routes.slice(Math.ceil(routes.length / 2))]
          .filter((row) => row.length > 0)
          .map((row, i) => (
            <div
              key={i}
              role="region"
              tabIndex={0}
              aria-label={`Featured routes, row ${i + 1} — scroll horizontally`}
              className="no-scrollbar -mr-4 flex snap-x snap-mandatory gap-2.5 overflow-x-auto overflow-y-hidden overscroll-x-contain [touch-action:pan-x_pan-y] py-1 pr-4"
            >
              {row.map((route) => (
                <div key={route.slug} className="w-[42%] shrink-0 snap-start">
                  <RouteCard route={route} />
                </div>
              ))}
            </div>
          ))}
      </div>

      <div
        ref={trackRef}
        role="region"
        tabIndex={0}
        aria-label="Featured routes — scroll horizontally"
        className="no-scrollbar -mr-4 hidden snap-x snap-mandatory scroll-pl-0 gap-4 overflow-x-auto overscroll-x-contain py-3 pr-4 focus-visible:rounded-2xl sm:-mr-6 sm:pr-6 md:flex lg:-mr-8 lg:pr-8"
      >
        {routes.map((route) => (
          <div key={route.slug} className="w-[44%] shrink-0 snap-start lg:w-[29%] xl:w-[23%]">
            <RouteCard route={route} />
          </div>
        ))}
      </div>
    </div>
  );
}
