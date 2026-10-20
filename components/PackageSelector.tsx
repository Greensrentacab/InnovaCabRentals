'use client';

/**
 * PackageSelector.tsx — local rental packages (design.md §3.2.4 segmented
 * controls + §3.3 cards). Null fares show "Price on request" with a direct
 * WhatsApp quick-quote button (PROJECT_CONTEXT.md §8.3).
 */

import { useState } from 'react';
import { Check, Clock, Navigation, Phone } from 'lucide-react';
import WhatsAppIcon from '@/components/ds/WhatsAppIcon';
import { LocalPackage, Vehicle } from '@/lib/types';
import { siteConfig } from '@/lib/siteConfig';
import { cn } from '@/lib/cn';
import { primaryPhoto, type FleetPhoto } from '@/lib/fleetPhotos';
import { vehicleShortName } from '@/lib/storefrontData';

interface PackageSelectorProps {
  packages: LocalPackage[];
  vehicles: Vehicle[];
  /** Each car's main photo (published set); built-in photo when absent */
  vehiclePhotos?: Record<string, Pick<FleetPhoto, 'src' | 'alt' | 'width' | 'height' | 'position'> | undefined>;
}

const pointToPointPoints = [
  'Doorstep pickup across all Bangalore localities',
  'Sanitized, air-conditioned Toyota Innova MPV',
  'Transparent distance-based fare confirmed before dispatch',
];

export default function PackageSelector({ packages, vehicles, vehiclePhotos }: PackageSelectorProps) {
  const [activeTab, setActiveTab] = useState<'packages' | 'point-to-point'>('packages');
  const [selectedVehicle, setSelectedVehicle] = useState<string>(vehicles[0]?.id || 'innova');
  const currentVehicle = vehicles.find((v) => v.id === selectedVehicle);

  return (
    <div>
      {/* 1. What kind of rental */}
      <div role="tablist" aria-label="Rental type" className="mx-auto grid max-w-2xl grid-cols-2 gap-2.5 sm:gap-3">
        {[
          { value: 'packages' as const, icon: Clock, title: '8 Hr & 12 Hr', hint: 'Hourly city packages' },
          { value: 'point-to-point' as const, icon: Navigation, title: 'Point-to-Point', hint: 'One-way city rides' },
        ].map(({ value, icon: Icon, title, hint }) => {
          const on = activeTab === value;
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setActiveTab(value)}
              className={cn(
                'flex flex-col items-start gap-2 rounded-2xl border-2 p-3.5 text-left transition-all sm:flex-row sm:items-center sm:gap-3 sm:p-4',
                on ? 'border-brand-600 bg-brand-50 shadow-sm' : 'border-slate-200 bg-white hover:border-brand-300'
              )}
            >
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors sm:h-10 sm:w-10',
                  on ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'
                )}
              >
                <Icon className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-extrabold leading-tight text-ink sm:text-[15px]">{title}</span>
                <span className="mt-0.5 block text-xs leading-snug text-slate-500">{hint}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Which car (packages only) */}
      {activeTab === 'packages' && vehicles.length > 1 && (
        <div className="mx-auto mt-6 max-w-2xl">
          <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">Choose your car</p>
          <div role="radiogroup" aria-label="Vehicle" className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
            {vehicles.map((v) => {
              const on = v.id === selectedVehicle;
              const photo = vehiclePhotos?.[v.id] ?? primaryPhoto(v.id);
              return (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setSelectedVehicle(v.id)}
                  className={cn(
                    'relative flex flex-col overflow-hidden rounded-xl border-2 bg-white text-left transition-all',
                    on ? 'border-brand-600 shadow-sm' : 'border-slate-200 hover:border-brand-300'
                  )}
                >
                  <span className="relative block aspect-[16/10] w-full bg-slate-100">
                    {photo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photo.src}
                        alt=""
                        width={photo.width}
                        height={photo.height}
                        loading="lazy"
                        decoding="async"
                        style={{ objectPosition: photo.position }}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    )}
                    {on && (
                      <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white ring-2 ring-white">
                        <Check className="h-3 w-3" strokeWidth={3.5} />
                      </span>
                    )}
                  </span>
                  <span className="block px-2.5 py-2">
                    <span className="block truncate text-[13px] font-extrabold leading-tight text-ink">{vehicleShortName(v)}</span>
                    <span className="mt-0.5 block text-[11px] font-medium text-slate-500">{v.seats} + driver</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'packages' ? (
        <div key="packages" className="mt-10 grid animate-panel-in gap-5 md:grid-cols-3">
          {packages.map((pkg) => {
            const rawPrice = pkg.fares?.[selectedVehicle] ?? null;
            const priceLabel =
              typeof rawPrice === 'number' && rawPrice > 0 ? `₹${rawPrice.toLocaleString('en-IN')}` : 'Price on request';
            return (
              <article key={pkg.id} className="card-float card-float-hover flex flex-col p-6">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-700">
                  {pkg.durationHours ? `${pkg.durationHours} hr · ${pkg.distanceKm} km included` : "Any duration · quoted on request"}
                </p>
                <h3 className="mt-2 text-lg font-extrabold tracking-tight">{pkg.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{pkg.description}</p>

                <div className="mt-auto pt-6">
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      {currentVehicle?.name || 'Toyota Innova'}
                    </p>
                    <p className="mt-0.5 text-xl font-extrabold tabular-nums text-ink">
                      {priceLabel}
                    </p>
                  </div>
                  <a
                    href={`${siteConfig.contact.phone.whatsappUrl}?text=${encodeURIComponent(
                      `Hello, I would like to get a quote for "${pkg.name}" with ${currentVehicle?.name || 'Innova'}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp mt-4 w-full"
                  >
                    <WhatsAppIcon className="h-4 w-4" /> WhatsApp Quick Quote
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div key="p2p" className="card-float mx-auto mt-10 max-w-2xl animate-panel-in p-6 text-center sm:p-10">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-live-500/10 text-live-600">
            <Navigation className="h-6 w-6" />
          </span>
          <h3 className="mt-4 text-xl font-extrabold tracking-tight">Point-to-Point Bangalore City Transfers</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Need a one-way trip from Whitefield to Electronic City, or Indiranagar to Kengeri? We offer door-to-door
            direct transfers with zero surge pricing.
          </p>
          <ul className="mx-auto mt-6 max-w-md space-y-2.5 text-left">
            {pointToPointPoints.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm font-medium text-slate-700">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-live-500/10 text-live-600">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {point}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row">
            <a href={siteConfig.contact.phone.tel} className="btn-primary">
              <Phone className="h-4 w-4" /> Call {siteConfig.contact.phone.display}
            </a>
            <a
              href={`${siteConfig.contact.phone.whatsappUrl}?text=${encodeURIComponent(
                'Hello, I would like to book a point-to-point local Innova ride in Bangalore.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
            >
              <WhatsAppIcon className="h-4 w-4" /> WhatsApp Instant Booking
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
