import Link from 'next/link';
import {
  Phone,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  Award,
  Clock,
  Star,
  Users,
  Car,
  CheckCircle2,
  Luggage,
  CalendarCheck,
  ChevronRight,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import BookingWidget from '@/components/BookingWidget';
import { siteConfig } from '@/lib/siteConfig';
import { getVehicles, getRoutes } from '@/lib/dataService';

export const revalidate = 60; // Revalidate dynamic Firestore data every minute

export default async function HomePage() {
  const vehicles = await getVehicles();
  const routes = await getRoutes();

  // Exactly 5 points for "Why Choose Us"
  const whyChooseUsPoints = [
    {
      icon: Users,
      title: 'Experienced Chauffeurs',
      desc: 'Courteous, background-verified drivers seasoned with South Indian highways, ghat roads, and Bangalore city traffic.',
    },
    {
      icon: Luggage,
      title: 'Spacious Luggage Capacity',
      desc: 'Ample boot space accommodating large family suitcases, strollers, and backpacks with optional roof carriers.',
    },
    {
      icon: CalendarCheck,
      title: 'Flexible Rental Options',
      desc: 'Hourly city packages (4hr/40km, 8hr/80km), one-way outstation drops, and custom multi-day holiday packages.',
    },
    {
      icon: ShieldCheck,
      title: 'Transparent Pricing',
      desc: 'Zero hidden fees. Clear driver allowance, night charges, and toll policies shared upfront with no surge pricing.',
    },
    {
      icon: MessageCircle,
      title: 'Easy Booking by Call or WhatsApp',
      desc: 'No complicated apps or logins. Connect directly with our dispatch manager in seconds for instant cab reservation.',
    },
  ];

  // Exactly 6 steps for "Booking Process"
  const bookingSteps = [
    {
      step: '01',
      title: 'Choose Service & Route',
      desc: 'Select whether you need an Airport transfer, Local city rental, or an Outstation road trip.',
    },
    {
      step: '02',
      title: 'Pick Your Innova',
      desc: 'Choose between the reliable Toyota Innova, premium Innova Crysta, or hybrid Innova Hycross.',
    },
    {
      step: '03',
      title: 'Share Trip Details',
      desc: 'Submit your pickup point, destination, date, and preferred departure time via Call or WhatsApp.',
    },
    {
      step: '04',
      title: 'Get Instant Quote',
      desc: 'Receive a clear, all-inclusive fare estimate directly on WhatsApp with zero hidden costs.',
    },
    {
      step: '05',
      title: 'Cab & Driver Assigned',
      desc: 'Vehicle number and chauffeur contact details are shared well in advance of your scheduled departure.',
    },
    {
      step: '06',
      title: 'Enjoy Your Journey',
      desc: 'Travel comfortably in a clean, air-conditioned vehicle with a courteous, experienced driver.',
    },
  ];

  // Exactly 5 FAQs
  const homeFaqs = [
    {
      q: 'How do I book an Innova cab with Innova Cabs Bangalore?',
      a: 'You can call us directly or message us on WhatsApp for instant confirmation. You can also submit the booking request widget above, and our dispatch team will reach out with transparent quotes and driver details.',
    },
    {
      q: 'Are tolls, driver allowance, and parking charges included?',
      a: 'Toll fees, state entry taxes, and parking are billed at actuals with full transparency, or can be bundled into custom all-inclusive outstation packages upon request.',
    },
    {
      q: 'Can I choose between a 7-seater and 8-seater Innova?',
      a: 'Yes, both 7-seater (with executive captain chairs in the middle row) and 8-seater bench options are available. Let us know your seating preference when requesting a quote.',
    },
    {
      q: 'Is advance payment required to book a cab?',
      a: 'No upfront payment or card details are required. Your booking is placed as a request (Status: PENDING) and confirmed directly with our team via a WhatsApp link or phone call.',
    },
    {
      q: 'Are your vehicles and drivers available 24/7 for late-night airport drops?',
      a: 'Yes, our fleet operates around the clock 24/7. We recommend booking a few hours in advance for early morning or late-night airport transfers to ensure priority vehicle dispatch.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-brand-offwhite">
      {/* ==================================================================== */}
      {/* 1. HERO SECTION                                                     */}
      {/* ==================================================================== */}
      <section className="relative bg-brand-navy text-white py-12 md:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F0562B_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left: Client H1, short supporting line, primary CTA buttons */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-xs font-semibold text-brand-orange border border-white/10">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Premier Chauffeur Car Rental in Bengaluru</span>
              </div>

              {/* Exact Client H1 */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-white">
                {siteConfig.seo.h1}
              </h1>

              {/* Short Supporting Line */}
              <p className="text-lg sm:text-xl font-medium text-brand-orange">
                {siteConfig.brand.closingLine}
              </p>

              <p className="text-sm sm:text-base text-gray-300 max-w-2xl leading-relaxed">
                Premium 7 &amp; 8 seater Toyota Innova, Crysta, and Hycross car rentals for airport transfers, Bangalore city local use, and South Indian outstation holiday trips.
              </p>

              {/* Primary Buttons */}
              <div className="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-3.5 pt-2">
                <a
                  href={siteConfig.contact.phone.tel}
                  className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover active:scale-[0.99] text-white text-base font-bold shadow-lg shadow-brand-orange/25 transition-all"
                >
                  <Phone className="w-5 h-5" />
                  <span>{siteConfig.cta.instantBooking}</span>
                </a>

                <a
                  href={siteConfig.contact.phone.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white text-base font-semibold shadow-lg transition-all"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>{siteConfig.cta.quickQuote}</span>
                </a>
              </div>
            </div>

            {/* Right: BookingWidget (Stacked below on mobile) */}
            <div className="lg:col-span-5 w-full mt-6 lg:mt-0">
              <BookingWidget />
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 2. TRUST BAR FROM SITECONFIG                                         */}
      {/* (15 years, 24/7, 5000+ happy customers, 5 Star Google rating)        */}
      {/* ==================================================================== */}
      <section className="bg-brand-navy-light text-white py-6 border-y border-white/10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {/* 15 Years */}
          <div className="flex flex-col items-center justify-center p-2">
            <Award className="w-6 h-6 text-brand-orange mb-1.5" />
            <p className="text-xl sm:text-2xl font-black text-white">
              {String(siteConfig.trustClaims.yearsExperience.value)} Years
            </p>
            <p className="text-xs text-gray-300 font-medium">Industry Experience</p>
          </div>

          {/* 24/7 */}
          <div className="flex flex-col items-center justify-center p-2">
            <Clock className="w-6 h-6 text-emerald-400 mb-1.5" />
            <p className="text-xl sm:text-2xl font-black text-white">
              {siteConfig.contact.hours}
            </p>
            <p className="text-xs text-gray-300 font-medium">Always Open &amp; Dispatched</p>
          </div>

          {/* 5000+ Happy Customers */}
          <div className="flex flex-col items-center justify-center p-2">
            <Users className="w-6 h-6 text-brand-orange mb-1.5" />
            <p className="text-xl sm:text-2xl font-black text-white">
              {String(siteConfig.trustClaims.happyCustomers.value)}
            </p>
            <p className="text-xs text-gray-300 font-medium">Satisfied Travelers</p>
          </div>

          {/* 5 Star Google Rating */}
          <div className="flex flex-col items-center justify-center p-2">
            <Star className="w-6 h-6 text-yellow-400 fill-yellow-400 mb-1.5" />
            <p className="text-xl sm:text-2xl font-black text-white">
              {String(siteConfig.trustClaims.googleRating.value)} Star
            </p>
            <p className="text-xs text-gray-300 font-medium">Google Rating</p>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 3. WHY CHOOSE US                                                     */}
      {/* (5 specific features)                                                */}
      {/* ==================================================================== */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
            The Innova Cabs Difference
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand-navy mt-1">
            Why Choose Us for Your Innova Rental
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            We prioritize passenger safety, luxury comfort, and transparent dealings on every single kilometer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {whyChooseUsPoints.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-3xl p-7 border border-gray-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-brand-orange-light text-brand-orange flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-brand-navy mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 4. SERVICES (Airport, Local, Outstation, Tour Packages)              */}
      {/* ==================================================================== */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white border-y border-gray-200/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
              Tailored Travel Solutions
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand-navy mt-1">
              Our Core Services
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              Select the service that fits your journey and book with zero advance payment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Airport Taxi */}
            <Link
              href="/airport-taxi"
              className="group p-6 rounded-3xl bg-brand-offwhite border border-gray-200 hover:border-brand-orange transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <span className="text-xs uppercase tracking-wider text-brand-orange font-bold">
                  24/7 BLR Transfers
                </span>
                <h3 className="text-xl font-bold text-brand-navy group-hover:text-brand-orange transition-colors mt-2 mb-2">
                  Airport Pickup &amp; Drop
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-6">
                  On-time Kempegowda Airport pickup and drop with flight tracking and ample luggage space.
                </p>
              </div>
              <div className="flex items-center text-xs font-bold text-brand-orange gap-1 group-hover:translate-x-1 transition-transform">
                <span>View Airport Taxi</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Local Rides */}
            <Link
              href="/local-rides"
              className="group p-6 rounded-3xl bg-brand-offwhite border border-gray-200 hover:border-brand-orange transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <span className="text-xs uppercase tracking-wider text-brand-orange font-bold">
                  Hourly City Rental
                </span>
                <h3 className="text-xl font-bold text-brand-navy group-hover:text-brand-orange transition-colors mt-2 mb-2">
                  Local City Rental
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-6">
                  Half-day (4hr/40km) and full-day (8hr/80km) city packages for shopping, meetings, and family visits.
                </p>
              </div>
              <div className="flex items-center text-xs font-bold text-brand-orange gap-1 group-hover:translate-x-1 transition-transform">
                <span>View Local Rides</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Outstation Cabs */}
            <Link
              href="/outstation-cabs"
              className="group p-6 rounded-3xl bg-brand-offwhite border border-gray-200 hover:border-brand-orange transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <span className="text-xs uppercase tracking-wider text-brand-orange font-bold">
                  One-Way &amp; Round-Trip
                </span>
                <h3 className="text-xl font-bold text-brand-navy group-hover:text-brand-orange transition-colors mt-2 mb-2">
                  Outstation Trips
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-6">
                  Intercity highway travel to Mysore, Coorg, Ooty, Wayanad, and across South India with seasoned drivers.
                </p>
              </div>
              <div className="flex items-center text-xs font-bold text-brand-orange gap-1 group-hover:translate-x-1 transition-transform">
                <span>View Outstation</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Tour Packages */}
            <Link
              href="/tour-packages"
              className="group p-6 rounded-3xl bg-brand-offwhite border border-gray-200 hover:border-brand-orange transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <span className="text-xs uppercase tracking-wider text-brand-orange font-bold">
                  Custom Itineraries
                </span>
                <h3 className="text-xl font-bold text-brand-navy group-hover:text-brand-orange transition-colors mt-2 mb-2">
                  Tour Packages
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-6">
                  Enquiry-based vacation itineraries curated for family holidays, corporate retreats, and hill station getaways.
                </p>
              </div>
              <div className="flex items-center text-xs font-bold text-brand-orange gap-1 group-hover:translate-x-1 transition-transform">
                <span>View Packages</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 5. POPULAR ROUTES AS CARDS LINKING TO /routes/[slug]                 */}
      {/* ==================================================================== */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
              South India Highway Network
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand-navy mt-1">
              Popular Outstation Cab Routes
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-2 max-w-xl">
              Reliable chauffeur-driven round trips and one-way drops connecting Bangalore to prime hill stations and tourist centers.
            </p>
          </div>

          <Link
            href="/routes"
            className="mt-4 md:mt-0 text-sm font-bold text-brand-orange hover:text-brand-orange-hover inline-flex items-center gap-1.5"
          >
            <span>View All Routes</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {routes.map((route) => (
            <Link
              key={route.id}
              href={`/routes/${route.slug}`}
              className="group bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm hover:shadow-lg hover:border-brand-orange/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span className="font-semibold text-brand-orange">{route.distanceKm} km</span>
                  <span>{route.durationText}</span>
                </div>

                <h3 className="text-lg font-bold text-brand-navy group-hover:text-brand-orange transition-colors mb-2">
                  {route.name}
                </h3>

                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-4">
                  {route.description || `Direct chauffeur-driven Innova cab service from ${route.origin} to ${route.destination}.`}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="font-medium text-gray-500">Price on request</span>
                <span className="font-bold text-brand-orange flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Details <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 6. VEHICLES FROM FIRESTORE                                           */}
      {/* ==================================================================== */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-brand-navy text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
              Our Premium Fleet
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mt-1">
              Toyota Innova Rental Fleet in Bangalore
            </h2>
            <p className="text-sm sm:text-base text-gray-300 mt-2">
              All vehicles are thoroughly sanitized, GPS-enabled, and maintained to the highest safety standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vehicles.filter((v) => v.confirmed !== false).map((vehicle) => (
              <div
                key={vehicle.id}
                className="bg-brand-navy-light rounded-3xl border border-white/10 overflow-hidden shadow-xl flex flex-col justify-between"
              >
                <div>
                  {/* Vehicle Image Placeholder */}
                  <div className="bg-brand-navy/80 h-52 flex flex-col items-center justify-center p-6 border-b border-white/10 text-center relative">
                    <Car className="w-14 h-14 text-white/40 mb-2" />
                    <span className="text-xs uppercase tracking-wider font-bold text-gray-300">
                      {vehicle.name}
                    </span>
                    <span className="text-[11px] text-gray-400 mt-0.5">
                      (Client fleet photo placeholder)
                    </span>

                    {!vehicle.confirmed && (
                      <span className="absolute top-4 right-4 bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-400/30">
                        Unconfirmed / Enquiry
                      </span>
                    )}
                  </div>

                  <div className="p-6 sm:p-7">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-brand-orange font-bold">
                        {vehicle.type}
                      </span>
                      <span className="text-xs text-gray-300">
                        {vehicle.seats} Seater
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-4">
                      {vehicle.name}
                    </h3>

                    <ul className="space-y-2 mb-6">
                      {vehicle.features.map((feature, idx) => (
                        <li key={idx} className="text-xs text-gray-300 flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-6 sm:p-7 pt-0 border-t border-white/10 mt-auto">
                  <div className="flex items-center justify-between py-3 mb-4">
                    <span className="text-xs text-gray-400">Tariff</span>
                    <span className="text-sm font-bold text-brand-orange">
                      {vehicle.baseFare !== null && vehicle.baseFare !== undefined
                        ? `₹${vehicle.baseFare}`
                        : 'Price on request'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/${vehicle.id}-rental-bangalore`}
                      className="min-h-[44px] flex items-center justify-center px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/10"
                    >
                      Vehicle Info
                    </Link>
                    <a
                      href={siteConfig.contact.phone.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[44px] flex items-center justify-center px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
                    >
                      Quick Quote
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 7. BOOKING PROCESS IN EXACTLY 6 STEPS                                */}
      {/* ==================================================================== */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
            Simple &amp; Hassle-Free
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand-navy mt-1">
            Our 6-Step Booking Process
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            From enquiry to departure, enjoy a seamless booking experience without complex signups or payment gates.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookingSteps.map((stepItem, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-7 border border-gray-200/80 shadow-sm relative overflow-hidden"
            >
              <span className="text-3xl font-black text-brand-orange/20 absolute top-5 right-6 select-none">
                {stepItem.step}
              </span>
              <div className="w-10 h-10 rounded-xl bg-brand-navy text-white text-sm font-bold flex items-center justify-center mb-4">
                {stepItem.step}
              </div>
              <h3 className="text-lg font-bold text-brand-navy mb-2">
                {stepItem.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {stepItem.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 8. CALL TO ACTION WITH "Reserve Your Innova in Advance"              */}
      {/* ==================================================================== */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="bg-brand-navy text-white rounded-3xl p-8 sm:p-14 shadow-2xl relative overflow-hidden text-center">
          <div className="max-w-2xl mx-auto space-y-4">
            <span className="text-xs uppercase font-bold tracking-wider text-brand-orange bg-white/10 px-3.5 py-1.5 rounded-full inline-block">
              Priority Vehicle Dispatch
            </span>

            {/* Required exact CTA line */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              {siteConfig.cta.advanceBooking}
            </h2>

            <p className="text-base sm:text-lg text-gray-200 leading-relaxed pt-1">
              &ldquo;{siteConfig.brand.closingLine}&rdquo;
            </p>
            <p className="text-xs sm:text-sm text-gray-400">
              Enjoy verified drivers, sanitized premium vehicles, and transparent billing. Connect with us on Call or WhatsApp now.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-6">
              <a
                href={siteConfig.contact.phone.tel}
                className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover active:scale-[0.99] text-white text-base font-bold shadow-lg transition-all"
              >
                <Phone className="w-5 h-5" />
                <span>{siteConfig.cta.instantBooking}</span>
              </a>

              <a
                href={siteConfig.contact.phone.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white text-base font-semibold shadow-lg transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{siteConfig.cta.quickQuote}</span>
              </a>

              <Link
                href="/contact"
                className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold border border-white/15 transition-all"
              >
                <span>Online Request</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 9. FAQ: EXACTLY 5 QUESTIONS                                         */}
      {/* ==================================================================== */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
            Helpful Information
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy mt-1">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Clear answers to common questions about tariffs, booking steps, and travel terms.
          </p>
        </div>

        <div className="space-y-4">
          {homeFaqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm"
            >
              <h3 className="text-base sm:text-lg font-bold text-brand-navy mb-2 flex items-start gap-2.5">
                <HelpCircle className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pl-7.5">
                {faq.a}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/faq"
            className="text-xs font-bold text-brand-orange hover:text-brand-orange-hover inline-flex items-center gap-1"
          >
            <span>Have more questions? Read full FAQ</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
