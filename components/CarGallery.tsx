'use client';

/**
 * CarGallery.tsx — car page photo gallery (mobile first).
 * Main viewer scrolls sideways (swipe / arrows, CSS scroll-snap); thumbnails
 * underneath show what's next and jump the viewer to that photo when tapped.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { FleetPhoto } from '@/lib/fleetPhotos';
import { cn } from '@/lib/cn';

export default function CarGallery({
  photos,
  title,
  badge,
  className,
}: {
  photos: FleetPhoto[];
  title: string;
  badge?: string;
  className?: string;
}) {
  const [active, setActive] = useState(0);
  const viewerRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const count = photos.length;

  const goTo = useCallback(
    (i: number) => {
      const el = viewerRef.current;
      if (!el) return;
      const next = Math.max(0, Math.min(count - 1, i));
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollTo({ left: next * el.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
    },
    [count]
  );

  // Active photo follows the viewer's scroll position (swipe or arrows)
  useEffect(() => {
    const el = viewerRef.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setActive(Math.round(el.scrollLeft / Math.max(1, el.clientWidth))));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Keep the active thumbnail in view
  useEffect(() => {
    const strip = thumbsRef.current;
    const thumb = strip?.children[active] as HTMLElement | undefined;
    if (!strip || !thumb) return;
    const left = thumb.offsetLeft - (strip.clientWidth - thumb.clientWidth) / 2;
    strip.scrollTo({ left, behavior: 'smooth' });
  }, [active]);

  if (count === 0) return null;
  const current = photos[active] ?? photos[0];

  return (
    <figure className={cn('card-float overflow-hidden rounded-4xl', className)} aria-roledescription="carousel" aria-label={`${title} photos`}>
      <div className="relative bg-slate-100">
        <div
          ref={viewerRef}
          className="no-scrollbar flex aspect-[4/3] snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') goTo(active + 1);
            if (e.key === 'ArrowLeft') goTo(active - 1);
          }}
        >
          {photos.map((p, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={p.src}
              src={p.src}
              alt={p.alt}
              width={p.width}
              height={p.height}
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchPriority={i === 0 ? 'high' : 'auto'}
              decoding="async"
              draggable={false}
              style={{ objectPosition: p.position }}
              className="h-full w-full shrink-0 snap-center object-cover"
            />
          ))}
        </div>

        {badge && (
          <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-ink shadow-sm backdrop-blur">
            {badge}
          </span>
        )}
        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-ink/70 px-2.5 py-1 text-[11px] font-bold tabular-nums text-white backdrop-blur">
          {active + 1} / {count}
        </span>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              disabled={active === 0}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-float transition hover:bg-white disabled:opacity-0 sm:flex"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              disabled={active === count - 1}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-float transition hover:bg-white disabled:opacity-0 sm:flex"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/60 to-transparent px-4 pb-3 pt-10 text-white">
          <p className="text-sm font-extrabold">{title}</p>
          <p className="text-[11px] font-medium text-white/80">{current.label}</p>
        </div>
      </div>

      {count > 1 && (
        <div ref={thumbsRef} className="no-scrollbar flex gap-2 overflow-x-auto bg-white p-2.5" role="tablist" aria-label="Choose photo">
          {photos.map((p, i) => (
            <button
              key={p.src}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Show photo ${i + 1}: ${p.label}`}
              onClick={() => goTo(i)}
              className={cn(
                'relative h-14 w-20 shrink-0 overflow-hidden rounded-xl ring-2 transition sm:h-16 sm:w-24',
                i === active ? 'ring-brand-600' : 'ring-transparent opacity-70 hover:opacity-100'
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt="" loading="lazy" decoding="async" style={{ objectPosition: p.position }} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <figcaption className="border-t border-slate-100 px-4 py-2 text-[11px] text-slate-500">
        {current.own
          ? 'Actual photos from our fleet. The car assigned to your trip may differ in colour and model year.'
          : 'Representative photos. The car assigned to your trip may differ in colour, model year, trim and features.'}
      </figcaption>
    </figure>
  );
}
