/**
 * TrustInfoSection.tsx — trust, booking and payment information merged into
 * one compact card (payment strip + icon tiles). Every statement comes from
 * siteConfig (claims, payments, policies) so the wording stays consistent
 * across the site.
 */

import Link from 'next/link';
import {
  Banknote,
  CalendarClock,
  ChevronRight,
  MapPin,
  PhoneCall,
  QrCode,
  Radar,
  Tag,
  UserCheck,
  type LucideIcon,
} from 'lucide-react';
import Reveal from '@/components/home/Reveal';
import { siteConfig } from '@/lib/siteConfig';

type Item = { icon: LucideIcon; tone: string; title: string; text: string; href?: string };

const items: Item[] = [
  {
    icon: UserCheck,
    tone: 'bg-live-500/10 text-live-600',
    title: 'Verified chauffeurs',
    text: 'Experienced drivers who know Bangalore and the highways',
  },
  {
    icon: Tag,
    tone: 'bg-brand-50 text-brand-700',
    title: 'No surge, no hidden fees',
    text: 'Transparent pricing, shared before you book',
  },
  {
    icon: Radar,
    tone: 'bg-brand-50 text-brand-700',
    title: 'Flight tracking',
    text: 'Airport pickups wait for you. Delays never cost extra',
  },
  {
    icon: CalendarClock,
    tone: 'bg-live-500/10 text-live-600',
    title: 'Cancellation policy',
    text: 'See our Terms & Conditions for cancellation',
    href: '/terms',
  },
  {
    icon: PhoneCall,
    tone: 'bg-amber-50 text-amber-600',
    title: 'Confirmed by our team',
    text: 'On call or WhatsApp before the car is dispatched',
  },
  {
    icon: MapPin,
    tone: 'bg-brand-50 text-brand-700',
    title: 'Registered business',
    text: siteConfig.contact.address.full,
  },
];

const paymentMethods: { icon: LucideIcon; label: string }[] = [
  { icon: QrCode, label: 'UPI' },
  { icon: Banknote, label: 'Cash' },
];

export default function TrustInfoSection() {
  return (
    <section id="trust" className="section scroll-mt-24 py-10 sm:py-20">
      <div className="max-w-2xl">
        <span className="eyebrow">Why book with us</span>
        <h2 className="section-title mt-3 sm:mt-4">Clear terms. Reliable rides.</h2>
      </div>

      <Reveal className="mt-5 sm:mt-10">
        <div className="card-float overflow-hidden">
          {/* Payment strip */}
          <div className="relative flex flex-col gap-3 overflow-hidden bg-brand-600 p-4 text-white sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-7">
            <div className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full bg-white/10" aria-hidden="true" />
            <div className="relative flex items-center gap-3.5 sm:gap-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 sm:h-16 sm:w-16">
                <QrCode className="h-6 w-6 sm:h-8 sm:w-8" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-sky-100 sm:text-[11px]">Payment</p>
                <p className="text-sm font-bold leading-snug sm:text-lg">Pay by UPI or cash. {siteConfig.payments.prebook}</p>
              </div>
            </div>
            <ul className="relative flex flex-wrap gap-1.5 sm:justify-end sm:gap-2">
              {paymentMethods.map((m) => (
                <li key={m.label} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold backdrop-blur sm:px-3 sm:py-1.5 sm:text-xs">
                  <m.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> {m.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Trust + policy tiles */}
          <ul className="grid grid-cols-2 gap-px bg-slate-100 lg:grid-cols-3">
            {items.map((t) => {
              const body = (
                <>
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 sm:rounded-2xl ${t.tone}`}>
                    <t.icon className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-[13px] font-extrabold leading-snug tracking-tight text-ink sm:text-base">{t.title}</h4>
                    <p className={`mt-1 text-[11.5px] leading-snug sm:text-sm sm:leading-relaxed ${t.href ? 'font-semibold text-brand-700' : 'text-slate-600'}`}>
                      {t.text}
                      {t.href && <ChevronRight className="ml-0.5 inline h-3.5 w-3.5 align-[-2px]" />}
                    </p>
                  </div>
                </>
              );
              const cls = 'flex flex-col items-start gap-2 bg-white p-3.5 sm:flex-row sm:gap-4 sm:p-6';
              return (
                <li key={t.title} className="bg-white">
                  {t.href ? (
                    <Link href={t.href} className={`${cls} h-full transition hover:bg-brand-50/40`}>
                      {body}
                    </Link>
                  ) : (
                    <div className={`${cls} h-full`}>{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}
