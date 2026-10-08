'use client';

/**
 * BookingWidget.tsx
 * 
 * Reusable booking estimate widget.
 * Features Google Places Autocomplete for Pickup & Drop locations:
 *  - Restricted to India
 *  - Biased to Bengaluru
 *  - Uses session tokens
 *  - Debounced by 300ms
 *  - Offers "Use my current location" (GPS)
 *  - Displays up to 3 recent locations from localStorage
 *  - Stores name, address, lat, lng
 *  - Error state with "We couldn't find that location" and retry
 *  - Opens as a full-screen sheet on mobile
 * 
 * ==============================================================================
 * SECURITY & COST NOTICE:
 * Restrict NEXT_PUBLIC_GOOGLE_PLACES_API_KEY by HTTP referrer (e.g.
 * https://yourdomain.com/*, http://localhost:3000/*) and set a daily quota cap
 * in Google Cloud to prevent runaway billing and unauthorized API usage.
 * ==============================================================================
 */

import { useState } from 'react';
import {
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  X,
} from 'lucide-react';
import LocationAutocompleteModal from '@/components/LocationAutocompleteModal';
import { LocationData } from '@/lib/googlePlaces';
import { siteConfig } from '@/lib/siteConfig';
import { useBookingFlow } from '@/context/BookingFlowContext';
import { ServiceType } from '@/lib/types';

export interface BookingWidgetProps {
  initialPickup?: LocationData | null;
  initialDrop?: LocationData | null;
  serviceType?: ServiceType;
  routeSlug?: string;
}

export default function BookingWidget({
  initialPickup = null,
  initialDrop = null,
  serviceType = 'outstation',
  routeSlug,
}: BookingWidgetProps) {
  const { searchFares: openBookingFlow } = useBookingFlow(); // legacy widget (unused)
  const [tripType, setTripType] = useState<'oneway' | 'round'>('oneway');
  
  // Stored location data: { name, address, lat, lng }
  const [pickupLocation, setPickupLocation] = useState<LocationData | null>(initialPickup);
  const [dropLocation, setDropLocation] = useState<LocationData | null>(initialDrop);

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  // Modal sheet state: 'pickup' | 'drop' | null
  const [activeModal, setActiveModal] = useState<'pickup' | 'drop' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pickupLocation) {
      setActiveModal('pickup');
      return;
    }
    if (!dropLocation) {
      setActiveModal('drop');
      return;
    }

    // Default to today if date is blank, and 09:00 if time is blank
    const travelDate = date || new Date().toISOString().split('T')[0];
    const travelTime = time || '09:00';

    await openBookingFlow({
      serviceType: serviceType || 'outstation',
      tripType,
      pickup: pickupLocation,
      drop: dropLocation,
      date: travelDate,
      time: travelTime,
      routeSlug,
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 text-brand-navy">
      <div className="flex items-center justify-between pb-5 border-b border-gray-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-brand-navy">
            Quick Fare Estimate
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Transparent pricing • No hidden booking charges
          </p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5" /> 24/7 Dispatched
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {/* Trip Type Selector: One Way (default) vs Round Trip */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
          <button
            type="button"
            onClick={() => setTripType('oneway')}
            className={`min-h-[44px] text-xs font-bold rounded-lg transition-all flex items-center justify-center ${
              tripType === 'oneway'
                ? 'bg-brand-navy text-white shadow-sm'
                : 'text-gray-600 hover:text-brand-navy'
            }`}
          >
            One Way
          </button>
          <button
            type="button"
            onClick={() => setTripType('round')}
            className={`min-h-[44px] text-xs font-bold rounded-lg transition-all flex items-center justify-center ${
              tripType === 'round'
                ? 'bg-brand-navy text-white shadow-sm'
                : 'text-gray-600 hover:text-brand-navy'
            }`}
          >
            Round Trip
          </button>
        </div>

        {/* Pickup Location Trigger */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Pickup Location
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveModal('pickup')}
              className="min-h-[48px] w-full pl-10 pr-10 py-2.5 text-left text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 bg-white hover:border-gray-400 transition-colors flex items-center justify-between"
            >
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-orange" />
              
              <div className="truncate pr-2">
                {pickupLocation ? (
                  <div>
                    <span className="font-semibold text-brand-navy block truncate">
                      {pickupLocation.name}
                    </span>
                    <span className="text-[11px] text-gray-500 block truncate">
                      {pickupLocation.address}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-400">
                    Tap to search Bengaluru pickup point...
                  </span>
                )}
              </div>

              {pickupLocation ? (
                <div
                  role="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPickupLocation(null);
                  }}
                  className="min-h-[36px] min-w-[36px] flex items-center justify-center text-gray-400 hover:text-gray-600"
                  title="Clear pickup"
                >
                  <X className="w-4 h-4" />
                </div>
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
              )}
            </button>
          </div>
        </div>

        {/* Drop Location Trigger */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Drop Location
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveModal('drop')}
              className="min-h-[48px] w-full pl-10 pr-10 py-2.5 text-left text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 bg-white hover:border-gray-400 transition-colors flex items-center justify-between"
            >
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
              
              <div className="truncate pr-2">
                {dropLocation ? (
                  <div>
                    <span className="font-semibold text-brand-navy block truncate">
                      {dropLocation.name}
                    </span>
                    <span className="text-[11px] text-gray-500 block truncate">
                      {dropLocation.address}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-400">
                    Tap to search drop point (City / Outstation)...
                  </span>
                )}
              </div>

              {dropLocation ? (
                <div
                  role="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropLocation(null);
                  }}
                  className="min-h-[36px] min-w-[36px] flex items-center justify-center text-gray-400 hover:text-gray-600"
                  title="Clear drop"
                >
                  <X className="w-4 h-4" />
                </div>
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
              )}
            </button>
          </div>
        </div>

        {/* Date and Time Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Pickup Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="min-h-[44px] w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 bg-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Pickup Time
            </label>
            <div className="relative">
              <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="min-h-[44px] w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 bg-white"
                required
              />
            </div>
          </div>
        </div>

        {/* Check Fare CTA */}
        <div className="pt-2">
          <button
            type="submit"
            className="min-h-[48px] w-full flex items-center justify-center gap-2 rounded-xl bg-brand-orange hover:bg-brand-orange-hover active:scale-[0.99] text-white font-bold text-sm sm:text-base shadow-lg shadow-brand-orange/20 transition-all"
          >
            <span>Check Fare</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[11px] text-center text-gray-400">
          Instant WhatsApp quote • No advance booking payment required
        </p>
      </form>

      {/* Full-Screen Sheet on Mobile / Modal on Desktop for Pickup */}
      <LocationAutocompleteModal
        isOpen={activeModal === 'pickup'}
        onClose={() => setActiveModal(null)}
        title="Select Pickup Location"
        placeholder="Search airport, area, hotel, or street in Bangalore..."
        initialValue={pickupLocation?.name || ''}
        onSelect={(loc) => setPickupLocation(loc)}
      />

      {/* Full-Screen Sheet on Mobile / Modal on Desktop for Drop */}
      <LocationAutocompleteModal
        isOpen={activeModal === 'drop'}
        onClose={() => setActiveModal(null)}
        title="Select Drop Location"
        placeholder="Search Mysore, Coorg, Ooty, Airport, or City area..."
        initialValue={dropLocation?.name || ''}
        onSelect={(loc) => setDropLocation(loc)}
      />
    </div>
  );
}
