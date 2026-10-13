'use client';

/**
 * PhotoCarousel.tsx — auto-advancing cross-fade carousel for card headers
 * (homepage "Our services"). Pauses on hover/focus and while off-screen,
 * supports swipe and dot navigation, and stays still for reduced motion.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

export interface CarouselPhoto {
  src: string;
  alt: string;
  width: number;
  height: number;
  position?: string;
}

export default function PhotoCarousel({
  photos,
  label,
  interval = 4000,
  delay = 0,
  className,
  children,
}: {
  photos: CarouselPhoto[];
  /** Accessible name, e.g. "Airport transfers photos" */
  label: string;
  interval?: number;
  /** Stagger start so neighbouring cards don't change together */
  delay?: number;
  className?: string;
  /** Overlay content (badges, title) drawn above the photos */
  children?: React.ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const count = photos.length;

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  // Only run while the card is on screen
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (count < 2 || paused || !visible) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let timer: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      setIndex((i) => (i + 1) % count);
      timer = setInterval(() => setIndex((i) => (i + 1) % count), interval);
    }, interval + delay);
    return () => {
      clearTimeout(start);
      clearInterval(timer);
    };
  }, [count, paused, visible, interval, delay]);

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      className={cn('relative overflow-hidden bg-slate-100', className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
    >
      {photos.map((p, i) => {
        const on = i === index;
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={p.src}
            src={p.src}
            alt={on ? p.alt : ''}
            aria-hidden={!on}
            width={p.width}
            height={p.height}
            loading="lazy"
            decoding="async"
            style={{ objectPosition: p.position }}
            className={cn(
              'absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-[1200ms] ease-premium motion-reduce:transition-none',
              on ? 'scale-105 opacity-100' : 'scale-100 opacity-0'
            )}
          />
        );
      })}

      {children}

      {count > 1 && (
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5">
          {photos.map((p, i) => (
            <button
              key={p.src}
              type="button"
              aria-label={`Show photo ${i + 1} of ${count}`}
              aria-current={i === index}
              onClick={() => go(i)}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/55 hover:bg-white/80'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
