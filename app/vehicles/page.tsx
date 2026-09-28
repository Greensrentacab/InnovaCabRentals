import Link from 'next/link';
import { Car, Users, Luggage, CheckCircle2, MessageCircle, Phone, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { getVehicles } from '@/lib/dataService';
import { siteConfig } from '@/lib/siteConfig';

export const metadata = {
  title: `Toyota Innova Car Rental Fleet Bangalore | Innova & Crysta Cabs | ${siteConfig.brand.name}`,
  description:
    'Explore our Toyota Innova and Innova Crysta rental fleet in Bangalore. Clean, sanitized 7 and 8 seater AC MPVs with experienced drivers for outstation, local, and airport rides.',
  keywords: [
    'Innova Cabs Bangalore',
    'Innova Rental Bangalore',
    'Innova Crysta Rental Bangalore',
    'Innova Taxi Bangalore',
    'Innova with Driver Bangalore',
    'Book Innova Cab Bangalore',
  ],
};

export default async function VehiclesPage() {
  const allVehicles = await getVehicles();
  // CRITICAL RULE: If a vehicle has confirmed:false, hide its page and card.
  const confirmedVehicles = allVehicles.filter((v) => v.confirmed !== false);

  const vehicleIdealForMap: Record<string, string[]> = {
    innova: [
      'Family Holiday Vacations',
      'Outstation Road Trips',
      'Bangalore Airport Pickup & Drop',
      'Group Sightseeing Tours',
      'Wedding Entourage Transit',
    ],
    'innova-crysta': [
      'Executive Corporate Delegations',
      'VIP Airport Transfers',
      'Luxury Long-Distance Travel',
      'Hill Station Ghat Tours (Coorg, Ooty)',
      'Premium Family Journeys',
    ],
    'innova-hycross': [
      'Top-Tier Corporate Executives',
      'Eco-Friendly Hybrid City Travel',
      'VIP Guest Protocol',
      'Whisper-Quiet Highway Cruising',
    ],
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-offwhite">
      {/* Header Banner */}
      <section className="bg-brand-navy text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-xs font-semibold text-brand-orange border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chauffeur-Driven Toyota MPV Fleet</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Toyota Innova Rental Fleet in Bangalore
          </h1>

          <p className="text-lg text-brand-orange font-medium">
            {siteConfig.brand.closingLine}
          </p>

          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Choose from our premium lineup of Toyota Innova and Innova Crysta cabs. Every car is thoroughly sanitized, air-conditioned, and driven by an experienced highway-tested chauffeur.
          </p>

          {/* Quick Direct Actions */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={siteConfig.contact.phone.tel}
              className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-sm shadow-md transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>{siteConfig.cta.instantBooking}</span>
            </a>

            <a
              href={siteConfig.contact.phone.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{siteConfig.cta.quickQuote}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Fleet Cards Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {confirmedVehicles.map((vehicle) => {
            const idealForList = vehicleIdealForMap[vehicle.id] || ['Family Travel', 'Outstation', 'Airport Transfers'];
            const whatsappVehicleUrl = `${siteConfig.contact.phone.whatsappUrl}?text=${encodeURIComponent(
              `Hello ${siteConfig.brand.name}, I would like to get a quote and check availability for ${vehicle.name}.`
            )}`;

            return (
              <div
                key={vehicle.id}
                className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Gallery Placeholder */}
                  <div className="bg-brand-navy/5 h-60 flex flex-col items-center justify-center p-6 border-b border-gray-100 text-center relative">
                    <Car className="w-16 h-16 text-brand-navy/35 mb-2" />
                    <span className="text-sm uppercase tracking-wider font-extrabold text-brand-navy">
                      {vehicle.name}
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      (Client fleet vehicle photo placeholder)
                    </span>
                    <span className="absolute top-4 left-4 bg-brand-navy text-white text-[11px] font-bold px-3 py-1 rounded-full">
                      {vehicle.type}
                    </span>
                  </div>

                  <div className="p-6 sm:p-8 space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <div>
                        <h2 className="text-2xl font-bold text-brand-navy">
                          {vehicle.name}
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Chauffeur-Driven • Sanitized Daily
                        </p>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span className="flex items-center gap-1 font-semibold text-brand-navy">
                          <Users className="w-4 h-4 text-brand-orange" />
                          <span>{vehicle.seats} Seats</span>
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-brand-navy">
                          <Luggage className="w-4 h-4 text-emerald-600" />
                          <span>{vehicle.luggage} Bags</span>
                        </span>
                      </div>
                    </div>

                    {/* Features List */}
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                        Key Features &amp; Comfort
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {vehicle.features.map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-gray-700">
                            <CheckCircle2 className="w-4 h-4 text-brand-orange shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Ideal For */}
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                        Recommended For
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {idealForList.map((tag, i) => (
                          <span
                            key={i}
                            className="text-[11px] font-medium bg-brand-offwhite text-gray-700 px-3 py-1 rounded-lg border border-gray-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Bottom: Tariff & Action Buttons */}
                <div className="p-6 sm:p-8 pt-0 border-t border-gray-100 mt-auto bg-gray-50/50">
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <span className="text-xs text-gray-500 font-medium block">Rental Tariff</span>
                      <span className="text-xl font-black text-brand-navy">
                        {vehicle.baseFare !== null && vehicle.baseFare !== undefined
                          ? `₹${vehicle.baseFare}`
                          : 'Price on request'}
                      </span>
                    </div>

                    <a
                      href={whatsappVehicleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp Quick Quote</span>
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href={`/${vehicle.id}-rental-bangalore`}
                      className="min-h-[44px] flex items-center justify-center px-4 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-brand-navy text-xs font-bold transition-all border border-gray-300 shadow-sm"
                    >
                      <span>Full Vehicle Details</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Link>

                    <Link
                      href="/contact"
                      className="min-h-[44px] flex items-center justify-center px-4 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover active:scale-[0.99] text-white text-xs font-bold transition-all shadow-md"
                    >
                      <span>Reserve Now</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
