/**
 * FleetSection.tsx — featured vehicles (design.md §3.3 "Fleet card").
 * Only confirmed models are passed in (Toyota Innova, Innova Crysta & Ertiga).
 */

import Link from 'next/link';
import { ArrowRight, Check, Luggage, Users } from 'lucide-react';
import Reveal from '@/components/home/Reveal';
import BookButton from '@/components/home/BookButton';

export interface FleetCardData {
  id: string;
  name: string;
  shortName: string;
  type: string;
  tagline: string;
  seats: number;
  luggage: number;
  features: string[];
  fares: { label: string; value: string }[];
  href: string;
}

export default function FleetSection({ vehicles }: { vehicles: FleetCardData[] }) {
  return (
    <section id="fleet" className="section scroll-mt-24 py-16 sm:py-20">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <span className="eyebrow">Our fleet</span>
          <h2 className="text-balance mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {vehicles.length === 3 ? 'Three cars. Pick your comfort.' : 'Pick your car.'}
          </h2>
          <p className="mt-3 text-slate-600">
            Every car is sanitised after each trip, GPS-enabled and maintained to the highest safety standards.
          </p>
        </div>
        <Link href="/vehicles#compare" className="btn-ghost group shrink-0">
          Compare fleet
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {vehicles.map((v, i) => (
          <Reveal key={v.id} delay={i * 0.1} className="h-full">
            <article className="card-float card-float-hover relative flex h-full flex-col p-6 sm:p-7">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">{v.type}</p>
              <h3 className="mt-1 text-2xl font-extrabold tracking-tight">{v.name}</h3>
              <p className="mt-1 text-sm text-slate-600">{v.tagline}</p>

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <span className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 font-medium text-slate-700">
                  <Users className="h-4 w-4 shrink-0 text-brand-600" /> {v.seats} seats + driver
                </span>
                <span className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 font-medium text-slate-700">
                  <Luggage className="h-4 w-4 shrink-0 text-brand-600" /> {v.luggage} large bags
                </span>
              </div>

              <ul className="mt-5 grid gap-x-4 gap-y-2 sm:grid-cols-2">
                {v.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm font-medium text-slate-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-live-600" strokeWidth={2.5} />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-6">
                <div className="grid grid-cols-3 divide-x divide-slate-200/80 rounded-2xl border border-slate-200/80 text-center">
                  {v.fares.map((fare) => (
                    <div key={fare.label} className="p-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{fare.label}</p>
                      <p className="text-sm font-extrabold tabular-nums">{fare.value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <Link href={v.href} className="btn-ghost group px-3">
                    View details
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <BookButton className="btn-primary px-3">Book {v.shortName}</BookButton>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
