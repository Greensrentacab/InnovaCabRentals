/**
 * TrustInfoSection.tsx — "Trust and reliability" + "Booking and payment
 * information" as an icon-led visual layout. Every statement comes from
 * siteConfig (claims, payments, policies) so the wording stays consistent
 * across the site.
 */

import {
  Banknote,
  BadgeIndianRupee,
  CalendarClock,
  CreditCard,
  Fuel,
  Landmark,
  MapPin,
  PhoneCall,
  Radar,
  ShieldCheck,
  Smartphone,
  Tag,
  UserCheck,
  type LucideIcon,
} from 'lucide-react';
import Reveal from '@/components/home/Reveal';
import { siteConfig } from '@/lib/siteConfig';

const cancelHours = siteConfig.policies.cancellation.match(/(\d+)\s*hours?/i)?.[1];

const trustTiles: { icon: LucideIcon; tone: string; title: string; text: string }[] = [
  {
    icon: UserCheck,
    tone: 'bg-live-500/10 text-live-600',
    title: 'Verified chauffeurs',
    text: 'Experienced drivers who know Bangalore and the highways',
  },
  {
    icon: Tag,
    tone: 'bg-brand-50 text-brand-700',
    title: 'No surge, no hidden charges',
    text: 'Transparent pricing, shared before you book',
  },
  {
    icon: Radar,
    tone: 'bg-brand-50 text-brand-700',
    title: 'Flight tracking',
    text: 'Airport pickups wait for you. Delays never cost extra',
  },
  {
    icon: MapPin,
    tone: 'bg-live-500/10 text-live-600',
    title: 'Registered business',
    text: siteConfig.contact.address.full,
  },
];

const bookingTiles: { icon: LucideIcon; tone: string; title: string; text: string }[] = [
  {
    icon: PhoneCall,
    tone: 'bg-live-500/10 text-live-600',
    title: 'Confirmed by our team',
    text: siteConfig.policies.confirmation,
  },
  {
    icon: CalendarClock,
    tone: 'bg-brand-50 text-brand-700',
    title: `Free cancellation${cancelHours ? ` up to ${cancelHours} hrs` : ''}`,
    text: siteConfig.policies.cancellation,
  },
  {
    icon: Fuel,
    tone: 'bg-live-500/10 text-live-600',
    title: 'Fuel & chauffeur included',
    text: 'Extra km / hours are billed at the rates shown before you confirm',
  },
  {
    icon: BadgeIndianRupee,
    tone: 'bg-amber-50 text-amber-600',
    title: 'Clear policy',
    text: `${siteConfig.policies.tolls} Outstation driver allowance is shown in your estimate.`,
  },
];

const paymentMethods: { icon: LucideIcon; label: string }[] = [
  { icon: Smartphone, label: 'UPI' },
  { icon: Banknote, label: 'Cash' },
  { icon: CreditCard, label: 'Cards' },
  { icon: Landmark, label: 'NEFT / IMPS' },
];

type Item = { icon: LucideIcon; tone: string; title: string; text: string };

/** 2 × 2 grid of icon rows separated by hairlines (one item per cell). */
function ItemGrid({ items }: { items: Item[] }) {
  return (
    <ul className="grid flex-1 grid-cols-1 sm:grid-cols-2 [&>li]:border-slate-100 sm:[&>li:nth-child(odd)]:border-r [&>li:nth-child(n+3)]:border-t max-sm:[&>li:not(:first-child)]:border-t">
      {items.map((t) => (
        <li key={t.title} className="flex items-start gap-3.5 p-4 sm:gap-4 sm:p-7">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12 sm:rounded-2xl ${t.tone}`}>
            <t.icon className="h-5 w-5 sm:h-6 sm:w-6" />
          </span>
          <div className="min-w-0">
            <h4 className="text-base font-extrabold leading-tight tracking-tight text-ink">{t.title}</h4>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{t.text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function TrustInfoSection() {
  return (
    <section id="trust" className="section scroll-mt-24 py-10 sm:py-20">
      <div className="max-w-2xl">
        <span className="eyebrow">Why book with us</span>
        <h2 className="text-balance mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Clear terms. Reliable rides.</h2>
      </div>

      {/* 1. Trust and reliability */}
      <Reveal className="mt-8 sm:mt-12">
        <div className="card-float flex flex-col overflow-hidden lg:flex-row">
          <div className="relative flex flex-col justify-between gap-5 overflow-hidden bg-live-500/10 p-5 sm:gap-8 sm:p-9 lg:w-[34%] lg:shrink-0">
            <div className="pointer-events-none absolute -bottom-12 -right-12 h-44 w-44 rounded-full bg-live-500/10" aria-hidden="true" />
            <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-live-600 shadow-sm sm:h-14 sm:w-14">
              <ShieldCheck className="h-6 w-6 sm:h-7 sm:w-7" />
            </span>
            <div className="relative">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-live-600">01</p>
              <h3 className="mt-1 text-xl font-extrabold tracking-tight text-ink sm:text-[1.7rem]">Trust and reliability</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">Who you ride with and what you can count on.</p>
            </div>
          </div>
          <ItemGrid items={trustTiles} />
        </div>
      </Reveal>

      {/* 2. Booking and payment information */}
      <Reveal className="mt-12 sm:mt-24">
        <div className="card-float flex flex-col overflow-hidden lg:flex-row-reverse">
          <div className="relative flex flex-col justify-between gap-5 overflow-hidden bg-brand-600 p-5 text-white sm:gap-8 sm:p-9 lg:w-[34%] lg:shrink-0">
            <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10" aria-hidden="true" />
            <div className="relative flex items-center justify-between gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white sm:h-14 sm:w-14">
                <CreditCard className="h-6 w-6 sm:h-7 sm:w-7" />
              </span>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-sky-100">02</p>
            </div>
            <div className="relative">
              <h3 className="text-xl font-extrabold tracking-tight sm:text-[1.7rem]">Booking and payment information</h3>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-sky-100 sm:mt-4">Advance payment</p>
              <p className="text-4xl font-extrabold tracking-tight sm:text-5xl">₹0</p>
              <p className="mt-1 text-sm font-medium text-sky-50">Pay after the trip. Nothing to pay to book.</p>
              <ul className="mt-4 flex flex-wrap gap-2 sm:mt-5">
                {paymentMethods.map((m) => (
                  <li key={m.label} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur">
                    <m.icon className="h-3.5 w-3.5" /> {m.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <ItemGrid items={bookingTiles} />
        </div>
      </Reveal>
    </section>
  );
}
