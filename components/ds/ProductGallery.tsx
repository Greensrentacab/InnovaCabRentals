'use client';

/**
 * ProductGallery.tsx — product-page image gallery: swipe/scroll-snap main
 * stage, prev/next arrows, counter, keyboard support and a thumbnail strip
 * kept in sync with the stage.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { cn } from '@/lib/cn';
import { type FleetPhoto } from '@/lib/fleetPhotos';

interface ProductGalleryProps {
  photos: FleetPhoto[];
  className?: string;
}

export default function ProductGallery({ photos, className }: ProductGalleryProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const [active, setActive] = useState(0);
  const count = photos.length;

  const goTo = useCallback(
    (index: number, smooth = true) => {
      const stage = stageRef.current;
      if (!stage || count === 0) return;
      const next = Math.min(Math.max(index, 0), count - 1);
      stage.scrollTo({ left: next * stage.clientWidth, behavior: smooth ? 'smooth' : 'auto' });
      setActive(next);
    },
    [count]
  );

  // Stage scrolled (swipe, trackpad, arrows) -> update active index.
  const onScroll = () => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const stage = stageRef.current;
      if (!stage || !stage.clientWidth) return;
      const index = Math.round(stage.scrollLeft / stage.clientWidth);
      setActive((prev) => (prev === index ? prev : Math.min(Math.max(index, 0), count - 1)));
    });
  };

  // Keep the active thumbnail visible by scrolling only the strip (never the page).
  useEffect(() => {
    const strip = thumbsRef.current;
    const thumb = strip?.children[active] as HTMLElement | undefined;
    if (!strip || !thumb) return;
    const left = thumb.offsetLeft - (strip.clientWidth - thumb.clientWidth) / 2;
    strip.scrollTo({ left, behavior: 'smooth' });
  }, [active]);

  // Re-align the stage to the active slide when the width changes.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let lastWidth = stage.clientWidth;
    const observer = new ResizeObserver(() => {
      if (stage.clientWidth !== lastWidth) {
        lastWidth = stage.clientWidth;
        stage.scrollTo({ left: active * lastWidth, behavior: 'auto' });
      }
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, [active]);

  useEffect(() => () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goTo(active + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goTo(active - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      goTo(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      goTo(count - 1);
    }
  };

  if (count === 0) return null;

  const arrow =
    'absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-float backdrop-blur transition hover:bg-white disabled:pointer-events-none disabled:opacity-0 sm:flex';

  return (
    <div className={cn('min-w-0', className)}>
      <div
        className="group relative overflow-hidden rounded-xl bg-slate-100 shadow-float outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
        role="region"
        aria-roledescription="carousel"
        aria-label="Vehicle photo gallery"
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        <div
          ref={stageRef}
          onScroll={onScroll}
          className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {photos.map((photo, i) => (
            <div
              key={photo.src}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              className="relative aspect-[4/3] w-full shrink-0 snap-center snap-always bg-slate-200"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding="async"
                draggable={false}
                style={{ objectPosition: photo.position }}
                className="h-full w-full select-none object-cover"
              />
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/50 to-transparent" />
        <p className="pointer-events-none absolute bottom-3 left-4 text-sm font-bold text-white drop-shadow">
          {photos[active].label}
        </p>
        <span className="pointer-events-none absolute bottom-3 right-4 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-bold tabular-nums text-white backdrop-blur-md">
          {active + 1} / {count}
        </span>

        {count > 1 && (
          <>
            <button type="button" aria-label="Previous photo" onClick={() => goTo(active - 1)} disabled={active === 0} className={cn(arrow, 'left-3')}>
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" aria-label="Next photo" onClick={() => goTo(active + 1)} disabled={active === count - 1} className={cn(arrow, 'right-3')}>
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div
          ref={thumbsRef}
          className="mt-2 flex gap-2 overflow-x-auto p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {photos.map((photo, i) => (
            <button
              key={photo.src}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show photo ${i + 1}: ${photo.label}`}
              aria-current={i === active}
              className={cn(
                'relative aspect-[4/3] min-w-[64px] flex-1 basis-0 overflow-hidden rounded-md bg-slate-200 ring-2 ring-inset transition sm:min-w-[88px]',
                i === active ? 'ring-brand-600' : 'opacity-60 ring-transparent hover:opacity-100'
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.src}
                alt=""
                loading="lazy"
                decoding="async"
                draggable={false}
                style={{ objectPosition: photo.position }}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-slate-500">
        <Info className="mt-px h-3.5 w-3.5 shrink-0 text-slate-400" />
        {photos[active].own
          ? 'Actual photo from our fleet. The car assigned to your trip may differ in colour and model year.'
          : 'Representative photo. The car assigned to your trip may differ in colour, model year, trim and features.'}
      </p>
    </div>
  );
}
