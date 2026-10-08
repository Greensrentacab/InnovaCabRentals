'use client';

/**
 * Reveal.tsx — scroll-reveal wrapper (design.md §4.3 `reveal(i)`):
 * fade-up 28px over 0.6s, once, viewport margin −60px, staggered delay.
 * Content renders visible on the server; only elements still below the fold
 * after hydration are hidden and revealed, so nothing depends on JS to show.
 */

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: 'div' | 'li' | 'article';
}

export default function Reveal({ children, className, delay = 0, y = 28, as: Tag = 'div' }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<'idle' | 'hidden' | 'shown'>('idle');

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight - 60) return;

    setState('hidden');
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState('shown');
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -60px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={cn(state !== 'idle' && 'transition-[opacity,transform] duration-[600ms] ease-premium', className)}
      style={
        state === 'hidden'
          ? { opacity: 0, transform: `translateY(${y}px)` }
          : state === 'shown'
            ? { transitionDelay: `${delay}s` }
            : undefined
      }
    >
      {children}
    </Tag>
  );
}
