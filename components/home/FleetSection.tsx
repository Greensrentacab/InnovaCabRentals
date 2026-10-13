/**
 * FleetSection.tsx — featured vehicles (design.md §3.3 "Fleet card").
 * Only confirmed models are passed in (Innova, Innova Crysta, Innova Hycross & Ertiga).
 */

import Link from 'next/link';
import { ArrowRight, Check, Luggage, Users } from 'lucide-react';
import Reveal from '@/components/home/Reveal';
import BookButton from '@/components/home/BookButton';
import { rateRows } from '@/components/ds/RateList';
import type { FleetPhoto } from '@/lib/fleetPhotos';
import type { VehicleRates } from '@/lib/types';
import { cn } from '@/lib/cn';

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
  photo?: FleetPhoto;
  rates?: VehicleRates;
}

export default function FleetSection({ vehicles }: { vehicles: FleetCardData[] }) {
  return (
    <section id="fleet" className="section scroll-mt-24 py-16 sm:py-20">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <span className="eyebrow">Our fleet</span>
          <h2 className="text-balance mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {vehicles.length === 4 ? 'Four cars. Pick your comfort.' : vehicles.length === 3 ? 'Three cars. Pick your comfort.' : 'Pick your car.'}
          </h2>
          <p className="mt-3 text-slate-600">
            Every car is sanitised after each trip, GPS-enabled and maintained to the highest safety standards.
          </p>
        </div>
        <Link href="#compare-fleet" className="btn-ghost group shrink-0">
          Compare fleet
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className={cn('mt-10 grid gap-5 md:grid-cols-2', vehicles.length >= 4 ? 'xl:grid-cols-4' : 'xl:grid-cols-3')}>
        {vehicles.map((v, i) => (
          <Reveal key={v.id} delay={i * 0.1} className="h-full">
            <article className="card-float card-float-hover relative flex h-full flex-col overflow-hidden">
              {v.photo && (
                <Link href={v.href} className="group relative block aspect-[16/10] overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={v.photo.src}
                    alt={v.photo.alt}
                    width={v.photo.width}
                    height={v.photo.height}
                    loading="lazy"
                    decoding="async"
                    style={{ objectPosition: v.photo.position }}
                    className="h-full w-full object-cover transition-transform duration-700 ease-premium group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-ink shadow-sm backdrop-blur">
                    {v.seats} + driver
                  </span>
                </Link>
              )}
              <div className="flex flex-1 flex-col p-5 sm:p-6">
              <p className="w-fit rounded-md bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-brand-700">{v.type}</p>
              <h3 className="mt-2 text-xl font-extrabold tracking-tight sm:text-2xl">{v.name}</h3>
              <p className="mt-1 text-sm text-slate-600">{v.tagline}</p>

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <span className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 font-medium text-slate-700">
                  <Users className="h-4 w-4 shrink-0 text-brand-600" /> {v.seats} seats + driver
                </span>
                <span className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 font-medium text-slate-700">
                  <Luggage className="h-4 w-4 shrink-0 text-brand-600" /> {v.luggage} large bags
                </span>
              </div>

              <ul className="mt-5 grid gap-y-2">
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
                  <BookButton className="btn-primary px-3">Book</BookButton>
                </div>
              </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      {vehicles.length > 1 && (
        <Reveal className="mt-12">
          <div id="compare-fleet" className="scroll-mt-24">
            <h3 className="text-xl font-extrabold tracking-tight sm:text-2xl">Compare side by side</h3>
            <p className="mt-1 text-sm text-slate-600">
              Seats, luggage and current rates. Tolls, parking &amp; state permits are paid by the customer.
            </p>
            <div className="card-float mt-5 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/70">
                  <tr>
                    <th className="w-[22%] px-4 py-3 align-bottom text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Feature
                    </th>
                    {vehicles.map((v) => (
                      <th key={v.id} className="px-4 py-3 align-bottom">
                        <Link href={v.href} className="group block">
                          {v.photo && (
                            <span className="mb-2 block aspect-[16/10] w-full max-w-[180px] overflow-hidden rounded-xl bg-slate-100">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={v.photo.src}
                                alt={v.photo.alt}
                                width={v.photo.width}
                                height={v.photo.height}
                                loading="lazy"
                                decoding="async"
                                style={{ objectPosition: v.photo.position }}
                                className="h-full w-full object-cover"
                              />
                            </span>
                          )}
                          <span className="text-sm font-extrabold tracking-tight text-ink group-hover:text-brand-700">
                            {v.name}
                          </span>
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <th className="px-4 py-3 font-medium text-slate-500">Type</th>
                    {vehicles.map((v) => (
                      <td key={v.id} className="px-4 py-3 font-semibold">{v.type}</td>
                    ))}
                  </tr>
                  <tr>
                    <th className="px-4 py-3 font-medium text-slate-500">Passengers</th>
                    {vehicles.map((v) => (
                      <td key={v.id} className="px-4 py-3 font-semibold tabular-nums">{v.seats} + driver</td>
                    ))}
                  </tr>
                  <tr>
                    <th className="px-4 py-3 font-medium text-slate-500">Luggage</th>
                    {vehicles.map((v) => (
                      <td key={v.id} className="px-4 py-3 font-semibold tabular-nums">{v.luggage} bags</td>
                    ))}
                  </tr>
                  {rateRows().map((row, i) => (
                    <tr key={row.label}>
                      <th className="px-4 py-3 font-medium text-slate-500">{row.label}</th>
                      {vehicles.map((v) => (
                        <td key={v.id} className="px-4 py-3 font-extrabold tabular-nums">{rateRows(v.rates)[i].value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      )}
    </section>
  );
}
