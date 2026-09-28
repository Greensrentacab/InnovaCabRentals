'use client';

import { useState } from 'react';
import { Clock, Navigation, CheckCircle, MessageCircle, Phone, ArrowRight } from 'lucide-react';
import { LocalPackage, Vehicle } from '@/lib/types';
import { siteConfig } from '@/lib/siteConfig';

interface PackageSelectorProps {
  packages: LocalPackage[];
  vehicles: Vehicle[];
}

export default function PackageSelector({ packages, vehicles }: PackageSelectorProps) {
  const [activeTab, setActiveTab] = useState<'packages' | 'point-to-point'>('packages');
  const [selectedVehicle, setSelectedVehicle] = useState<string>(vehicles[0]?.id || 'innova');

  return (
    <div className="w-full bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm">
      {/* Tab Switcher: Packages vs Point-to-Point */}
      <div className="flex justify-center mb-8">
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-gray-100 rounded-2xl max-w-md w-full">
          <button
            type="button"
            onClick={() => setActiveTab('packages')}
            className={`min-h-[44px] text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'packages'
                ? 'bg-brand-navy text-white shadow-sm'
                : 'text-gray-600 hover:text-brand-navy'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Hourly &amp; Full Day</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('point-to-point')}
            className={`min-h-[44px] text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'point-to-point'
                ? 'bg-brand-navy text-white shadow-sm'
                : 'text-gray-600 hover:text-brand-navy'
            }`}
          >
            <Navigation className="w-4 h-4" />
            <span>Point-to-Point City</span>
          </button>
        </div>
      </div>

      {/* Vehicle Model Selector Filter */}
      <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
        <span className="text-xs font-semibold text-gray-500 mr-2">Select Vehicle:</span>
        {vehicles.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setSelectedVehicle(v.id)}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              selectedVehicle === v.id
                ? 'bg-brand-orange text-white border-brand-orange shadow-md'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
            }`}
          >
            {v.name}
          </button>
        ))}
      </div>

      {/* Content based on Active Tab */}
      {activeTab === 'packages' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            const rawPrice = pkg.fares?.[selectedVehicle] ?? null;
            const currentVehicle = vehicles.find((v) => v.id === selectedVehicle);

            return (
              <div
                key={pkg.id}
                className="rounded-2xl p-6 border border-gray-200 bg-brand-offwhite/50 hover:border-brand-orange/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-brand-orange mb-2">
                    <span>{pkg.durationHours} Hours</span>
                    <span>{pkg.distanceKm} Km Included</span>
                  </div>

                  <h3 className="text-lg font-bold text-brand-navy mb-2">
                    {pkg.name}
                  </h3>

                  <p className="text-xs text-gray-600 leading-relaxed mb-4">
                    {pkg.description}
                  </p>

                  <div className="p-3 rounded-xl bg-white border border-gray-100 mb-4 space-y-1">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase">
                      Vehicle: {currentVehicle?.name || 'Innova'}
                    </p>
                    <p className="text-sm font-extrabold text-brand-navy">
                      {rawPrice !== null ? `₹${rawPrice}` : 'Price on request'}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200/60 mt-auto">
                  <a
                    href={`${siteConfig.contact.phone.whatsappUrl}?text=${encodeURIComponent(
                      `Hello, I would like to get a quote for "${pkg.name}" with ${currentVehicle?.name || 'Innova'}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] w-full flex items-center justify-center gap-2 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold transition-all shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Quick Quote</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Point to Point Info */
        <div className="max-w-2xl mx-auto text-center py-6 px-4 space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Navigation className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-brand-navy">
            Point-to-Point Bangalore City Transfers
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Need a one-way trip from Whitefield to Electronic City, or Indiranagar to Kengeri? We offer door-to-door direct transfers with zero surge pricing.
          </p>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 inline-block text-left text-xs text-gray-700 space-y-1.5 max-w-md mx-auto">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Doorstep pickup across all Bangalore localities</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Sanitized, air-conditioned Toyota Innova MPV</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Transparent distance-based fare confirmed before dispatch</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={siteConfig.contact.phone.tel}
              className="min-h-[44px] w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-brand-navy hover:bg-brand-navy-light text-white text-xs font-bold transition-all"
            >
              <Phone className="w-4 h-4 text-brand-orange" />
              <span>Call {siteConfig.contact.phone.display}</span>
            </a>
            <a
              href={`${siteConfig.contact.phone.whatsappUrl}?text=${encodeURIComponent(
                'Hello, I would like to book a point-to-point local Innova ride in Bangalore.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Instant Booking</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
