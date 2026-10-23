'use client';

/**
 * CardGallery.tsx — compact photo slider for listing cards. Swipe or scroll
 * by hand (scroll-snap); it auto-advances while on screen and stops for good
 * as soon as the visitor touches, drags, hovers or taps a dot.
 */

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { type FleetPhoto } from '@/lib/fleetPhotos';

export default function CardGallery({
  photos,
  label,
  href,
  delay = 0,
  interval = 4000,
  className,
  children,
}: {
  photos: Pick<FleetPhoto, 'src' | 'alt' | 'width' | 'height' | 'position'>[];
  label: string;
  /** Makes every photo a link (swiping still scrolls; a tap follows the link) */
  href?: string;
  /** Stagger start so neighbouring cards don't change together */
  delay?: number;
  interval?: number;
  className?: string;
  /** Overlay content (badges) drawn above the photos */
  children?: React.ReactNode;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const [stopped, setStopped] = useState(false);
  const count = photos.length;

  const goTo = (i: number) => {
    const stage = stageRef.current;
    if (!stage) return;
    const next = ((i % count) + count) % count;
    stage.scrollTo({ left: next * stage.clientWidth, behavior: 'smooth' });
  };

  const onScroll = () => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const stage = stageRef.current;
      if (!stage || !stage.clientWidth) return;
      const i = Math.min(Math.max(Math.round(stage.scrollLeft / stage.clientWidth), 0), count - 1);
      activeRef.current = i;
      setActive(i);
    });
  };

  // Only run while the card is on screen
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (count < 2 || stopped || !visible) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let timer: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      goTo(activeRef.current + 1);
      timer = setInterval(() => goTo(activeRef.current + 1), interval);
    }, interval + delay);
    return () => {
      clearTimeout(start);
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, stopped, visible, interval, delay]);

  useEffect(() => () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
  }, []);

  // Keep the active slide aligned if the card width changes
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let width = stage.clientWidth;
    const ro = new ResizeObserver(() => {
      if (stage.clientWidth !== width) {
        width = stage.clientWidth;
        stage.scrollTo({ left: activeRef.current * width, behavior: 'auto' });
      }
    });
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  const stop = () => setStopped(true);

  return (
    <div
      className={cn('relative overflow-hidden bg-slate-100', className)}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <div
        ref={stageRef}
        onScroll={onScroll}
        onTouchStart={stop}
        onPointerDown={stop}
        onMouseEnter={stop}
        onWheel={stop}
        className="flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {photos.map((p, i) => {
          const img = (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.src}
              alt={i === active ? p.alt : ''}
              width={p.width}
              height={p.height}
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              draggable={false}
              style={{ objectPosition: p.position }}
              className="h-full w-full select-none object-cover"
            />
          );
          const slide = 'block h-full w-full shrink-0 snap-center snap-always';
          return href ? (
            <Link key={p.src} href={href} draggable={false} aria-label={`Open ${label.replace(/ photos$/, '')}`} tabIndex={i === active ? 0 : -1} className={slide}>
              {img}
            </Link>
          ) : (
            <div key={p.src} className={slide}>
              {img}
            </div>
          );
        })}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-slate-950/35 to-transparent" />
      {children}

      {count > 1 && (
        <div className="absolute inset-x-0 bottom-2.5 z-10 flex items-center justify-center gap-1.5">
          {photos.map((p, i) => (
            <button
              key={p.src}
              type="button"
              aria-label={`Show photo ${i + 1} of ${count}`}
              aria-current={i === active}
              onClick={() => {
                stop();
                goTo(i);
              }}
              className={cn(
                // Bigger invisible tap area than the dot itself
                "relative h-1.5 rounded-full shadow-sm transition-all duration-300 after:absolute after:-inset-x-1 after:-inset-y-3 after:content-['']",
                i === active ? 'w-5 bg-white' : 'w-1.5 bg-white/60 hover:bg-white/90'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
