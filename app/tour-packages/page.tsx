import { Compass, Phone, MessageCircle, MapPin, ShieldCheck, HeartHandshake, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import TourEnquiryForm from '@/components/TourEnquiryForm';
import { siteConfig } from '@/lib/siteConfig';

export const metadata = {
  title: `Custom Tour Packages from Bangalore | Innova Cab Hire | ${siteConfig.brand.name}`,
  description:
    'Customised enquiry-based tour packages from Bangalore to Coorg, Ooty, Mysore, Wayanad, Chikmagalur, and Kodaikanal with Toyota Innova Crysta. Experienced chauffeurs and flexible itineraries.',
};

export default function TourPackagesPage() {
  const tourDestinations = [
    {
      name: 'Coorg (Madikeri)',
      duration: '2N / 3D & 3N / 4D',
      highlights: 'Abbey Falls, Raja Seat, Dubare Elephant Camp, Coffee Plantations, Talacauvery',
      routeSlug: 'bangalore-to-coorg',
    },
    {
      name: 'Ooty & Coonoor',
      duration: '2N / 3D & 3N / 4D',
      highlights: 'Botanical Gardens, Ooty Lake, Doddabetta Peak, Pykara Falls, Nilgiri Tea Estates',
      routeSlug: 'bangalore-to-ooty',
    },
    {
      name: 'Mysore Heritage',
      duration: '1N / 2D & 2N / 3D',
      highlights: 'Mysore Palace, Chamundi Hills, Brindavan Gardens, Ranganathittu Bird Sanctuary',
      routeSlug: 'bangalore-to-mysore',
    },
    {
      name: 'Wayanad Rainforest',
      duration: '2N / 3D & 3N / 4D',
      highlights: 'Banasura Sagar Dam, Edakkal Caves, Chembra Peak, Pookode Lake, Tea Museums',
      routeSlug: 'bangalore-to-wayanad',
    },
    {
      name: 'Chikmagalur Coffee Retreat',
      duration: '2N / 3D',
      highlights: 'Mullayanagiri, Baba Budangiri, Hebbe Falls, Coffee Museum, Belur & Halebeedu',
      routeSlug: 'bangalore-to-chikmagalur',
    },
    {
      name: 'Kodaikanal Lake & Pine',
      duration: '3N / 4D',
      highlights: 'Kodai Lake, Coaker Walk, Pillar Rocks, Bryant Park, Silver Cascade Falls',
      routeSlug: 'bangalore-to-kodaikanal',
    },
    {
      name: 'Pondicherry French Quarter',
      duration: '2N / 3D',
      highlights: 'Promenade Beach, Auroville, French Colony, Paradise Beach, Gingee Fort en route',
      routeSlug: 'bangalore-to-pondicherry',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-brand-offwhite">
      {/* Header Banner */}
      <section className="bg-brand-navy text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-xs font-semibold text-brand-orange border border-white/10">
            <Compass className="w-3.5 h-3.5" />
            <span>Enquiry-Based Custom Itineraries</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Custom Innova Tour Packages from Bangalore
          </h1>

          <p className="text-lg text-brand-orange font-medium">
            {siteConfig.brand.closingLine}
          </p>

          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Every vacation is unique. Tell us your travel dates, passenger group size, and preferred destination. Our team creates a personalized schedule with transparent pricing and seasoned chauffeurs.
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
              href={`${siteConfig.contact.phone.whatsappUrl}?text=${encodeURIComponent(
                'Hello, I would like to enquire about a custom holiday tour package from Bangalore.'
              )}`}
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

      {/* Main Content: Enquiry Form + Destinations */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Interactive Enquiry Form saved to Firestore */}
          <div className="lg:col-span-7">
            <TourEnquiryForm />
          </div>

          {/* Right Column: Why Book Custom Tours & Trust Highlights */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-xl font-bold text-brand-navy">
                The Innova Cabs Tour Advantage
              </h3>

              <div className="space-y-3.5 text-xs sm:text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-brand-navy">100% Tailored Schedule:</strong> Stop whenever you wish for photographs, meals, and viewpoint exploration.
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-brand-navy">Hill Station Chauffeurs:</strong> Experienced in navigating Western Ghats, hairpin bends, and misty morning conditions.
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-brand-navy">Family Comfort:</strong> Spacious captain seats in Toyota Innova Crysta allow senior citizens and children to travel with zero fatigue.
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-brand-navy">Zero Hidden Fees:</strong> Driver allowance, tolls, and inter-state permits are detailed clearly before booking.
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Contact Card */}
            <div className="bg-brand-navy text-white rounded-3xl p-6 sm:p-8 shadow-md space-y-4">
              <h3 className="text-lg font-bold">Prefer Direct Consultation?</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Speak directly with our senior tour manager to plan custom temple circuits, corporate offsites, or multi-week holiday itineraries.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <a
                  href={siteConfig.contact.phone.tel}
                  className="min-h-[44px] w-full flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-all"
                >
                  <Phone className="w-4 h-4 text-brand-orange" />
                  <span>Call {siteConfig.contact.phone.display}</span>
                </a>
                <a
                  href={siteConfig.contact.phone.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Travel Desk</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Curated Tour Itineraries Section */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
              South India Getaways
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy mt-1">
              Popular Tour Packages
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Select any package below to inspect highway route details and get custom quotes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tourDestinations.map((tour, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-brand-orange mb-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{tour.name}</span>
                    </span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-semibold">
                      {tour.duration}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-brand-navy mb-2">
                    Bangalore to {tour.name} Tour
                  </h3>

                  <p className="text-xs text-gray-600 leading-relaxed mb-4">
                    <strong className="text-gray-700">Sightseeing:</strong> {tour.highlights}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-500">Price on request</span>
                  <Link
                    href={`/routes/${tour.routeSlug}`}
                    className="font-bold text-brand-orange hover:text-brand-orange-hover inline-flex items-center gap-1"
                  >
                    <span>Route Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
