'use client';

/**
 * BookingTimeline.tsx — "How booking works" pipeline + urgent banner
 * (design.md §3.4). The active step auto-advances every 2.6s while the
 * section is in view (disabled under reduced motion); hovering a step
 * activates it.
 */

import { useEffect, useRef, useState } from 'react';
import { Car, IndianRupee, MessageCircle, Phone, Route as RouteIcon, Siren, Wallet, type LucideIcon } from 'lucide-react';
import { siteConfig } from '@/lib/siteConfig';
import { cn } from '@/lib/cn';

const STEPS: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: RouteIcon,
    title: 'Select Trip & Vehicle',
    desc: 'Pick your service, route, date and car — Innova, Innova Crysta or Ertiga.',
  },
  {
    icon: IndianRupee,
    title: 'Instant Transparent Fare',
    desc: 'See the fare upfront, or get a quick quote on WhatsApp. Zero hidden charges, zero surge.',
  },
  {
    icon: Car,
    title: 'Driver & Cab Assigned',
    desc: 'Vehicle number and chauffeur contact shared on WhatsApp well before pickup.',
  },
  {
    icon: Wallet,
    title: 'Travel & Pay',
    desc: 'No advance payment and no card details. Pay after the trip.',
  },
];

const CYCLE_MS = 2600;

export default function BookingTimeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setRevealed(true);
      }, { threshold: 0.25 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || hovering || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => setActive((i) => (i + 1) % STEPS.length), CYCLE_MS);
    return () => clearInterval(timer);
  }, [inView, hovering]);

  return (
    <section ref={sectionRef} id="how-it-works" className="relative scroll-mt-24 overflow-hidden bg-white py-16 sm:py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      <div className="section">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">How booking works</span>
          <h2 className="text-balance mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">From quote to doorstep in four steps</h2>
          <p className="mt-3 text-slate-600">No app, no login, no advance payment — booking takes about a minute.</p>
        </div>

        <ol
          className="relative mt-14 grid gap-8 md:grid-cols-4 md:gap-6"
          onMouseLeave={() => setHovering(false)}
        >
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isActive = i === active;
            const isDone = i < active;
            const isLast = i === STEPS.length - 1;
            return (
              <li
                key={step.title}
                className="relative flex gap-4 md:flex-col md:items-center md:text-center"
                onMouseEnter={() => {
                  setHovering(true);
                  setActive(i);
                }}
              >
                {!isLast && (
                  <>
                    {/* Mobile connector (vertical) */}
                    <div className="absolute left-[27px] top-14 h-[calc(100%-8px)] w-0.5 bg-slate-200 md:hidden">
                      <div
                        className="h-full w-full origin-top bg-brand-600 transition-transform duration-700 ease-premium"
                        style={{ transform: `scaleY(${revealed ? 1 : 0})`, transitionDelay: `${0.3 + i * 0.25}s` }}
                      />
                    </div>
                    {/* Desktop connector (horizontal) */}
                    <div className="absolute left-[calc(50%+36px)] top-7 hidden h-0.5 w-[calc(100%-72px+24px)] overflow-hidden rounded-full bg-slate-200 md:block">
                      <div
                        className="h-full w-full origin-left bg-gradient-to-r from-brand-600 to-brand-400 transition-transform duration-700 ease-premium"
                        style={{ transform: `scaleX(${revealed ? 1 : 0})`, transitionDelay: `${i * 0.3}s` }}
                      />
                    </div>
                  </>
                )}

                <div className="relative z-10 shrink-0">
                  {isActive && <span className="absolute inset-0 animate-pulse-ring rounded-full bg-brand-500/40" />}
                  <div
                    className={cn(
                      'relative flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all duration-500',
                      isActive
                        ? 'border-brand-600 bg-brand-600 text-white shadow-glow'
                        : isDone
                          ? 'border-brand-200 bg-brand-50 text-brand-700'
                          : 'border-slate-200 bg-white text-slate-500'
                    )}
                  >
                    <Icon className="h-6 w-6" />
                    <span
                      className={cn(
                        'absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold ring-2 ring-white',
                        isActive ? 'bg-ink text-white' : 'bg-slate-100 text-slate-600'
                      )}
                    >
                      {i + 1}
                    </span>
                  </div>
                </div>

                <div className="pb-2 md:mt-5">
                  <h3 className={cn('text-base font-extrabold transition-colors', isActive ? 'text-brand-700' : 'text-ink')}>
                    {step.title}
                  </h3>
                  <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-slate-600 md:mx-auto">{step.desc}</p>
                </div>
              </li>
            );
          })}
        </ol>

        {/* Urgent banner */}
        <div className="relative mt-16 overflow-hidden rounded-4xl bg-gradient-to-br from-brand-800 via-brand-700 to-indigo-700 p-6 text-white shadow-float-lg sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute inset-0 bg-grid-slate opacity-20 [background-size:32px_32px]" />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
                <span className="absolute inset-0 animate-pulse-ring rounded-2xl bg-rose-400/40" />
                <Siren className="relative h-6 w-6" />
              </span>
              <div>
                <p className="text-xl font-extrabold tracking-tight sm:text-2xl">Need a cab in under 2 hours?</p>
                <p className="mt-1 text-sm text-brand-100 sm:text-base">
                  Call our 24/7 hotline directly for immediate dispatch from our Bangalore fleet.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <a href={siteConfig.contact.phone.tel} className="btn bg-white text-brand-800 shadow-float hover:-translate-y-0.5">
                <Phone className="h-4 w-4" /> {siteConfig.contact.phone.display}
              </a>
              <a
                href={siteConfig.contact.phone.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
