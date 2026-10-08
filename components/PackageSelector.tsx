'use client';

/**
 * PackageSelector.tsx — local rental packages (design.md §3.2.4 segmented
 * controls + §3.3 cards). Null fares show "Price on request" with a direct
 * WhatsApp quick-quote button (PROJECT_CONTEXT.md §8.3).
 */

import { useState } from 'react';
import { Check, Clock, MessageCircle, Navigation, Phone } from 'lucide-react';
import { LocalPackage, Vehicle } from '@/lib/types';
import { siteConfig } from '@/lib/siteConfig';
import SegmentedControl from '@/components/home/SegmentedControl';

interface PackageSelectorProps {
  packages: LocalPackage[];
  vehicles: Vehicle[];
}

const pointToPointPoints = [
  'Doorstep pickup across all Bangalore localities',
  'Sanitized, air-conditioned Toyota Innova MPV',
  'Transparent distance-based fare confirmed before dispatch',
];

export default function PackageSelector({ packages, vehicles }: PackageSelectorProps) {
  const [activeTab, setActiveTab] = useState<'packages' | 'point-to-point'>('packages');
  const [selectedVehicle, setSelectedVehicle] = useState<string>(vehicles[0]?.id || 'innova');
  const currentVehicle = vehicles.find((v) => v.id === selectedVehicle);

  return (
    <div>
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <SegmentedControl
          ariaLabel="Rental type"
          className="w-full max-w-sm"
          value={activeTab}
          onChange={setActiveTab}
          options={[
            { value: 'packages', label: 'Hourly & Full Day', icon: Clock },
            { value: 'point-to-point', label: 'Point-to-Point', icon: Navigation },
          ]}
        />
        {activeTab === 'packages' && vehicles.length > 1 && (
          <SegmentedControl
            ariaLabel="Vehicle"
            className="w-full max-w-sm"
            value={selectedVehicle}
            onChange={setSelectedVehicle}
            options={vehicles.map((v) => ({ value: v.id, label: v.name.replace('Toyota ', '') }))}
          />
        )}
      </div>

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
                    <MessageCircle className="h-4 w-4" /> WhatsApp Quick Quote
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
              <MessageCircle className="h-4 w-4" /> WhatsApp Instant Booking
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
