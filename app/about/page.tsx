import Link from 'next/link';
import {
  Award,
  ShieldCheck,
  HeartHandshake,
  MapPin,
  Phone,
  MessageCircle,
  Car,
  Clock,
  Star,
  Users,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { siteConfig } from '@/lib/siteConfig';

export const metadata = {
  title: `About Us | 15 Years of Premium Innova Car Rental | ${siteConfig.brand.name}`,
  description: `Learn about ${siteConfig.brand.name} - ${siteConfig.trustClaims.yearsExperience.label} providing reliable, premium Toyota Innova and Crysta car rentals with professional chauffeurs in Bangalore.`,
  keywords: [
    'About Innova Cabs Bangalore',
    'Innova Car Rental Bangalore Experience',
    'Reliable Innova Taxi Bangalore',
    'Chauffeur Driven Innova Bangalore',
  ],
};

export default function AboutPage() {
  const pillars = [
    {
      icon: Users,
      title: 'Professional Chauffeurs',
      desc: 'Our drivers are commercially licensed, background-verified, and seasoned veterans of South Indian highways, ghat hairpin curves, and Bangalore city transit.',
    },
    {
      icon: ShieldCheck,
      title: 'Rigorous Fleet Hygiene',
      desc: 'Every Toyota Innova is deep-cleaned and sanitized prior to dispatch. Air conditioning filters, brakes, and tires undergo strict preventive maintenance.',
    },
    {
      icon: HeartHandshake,
      title: '100% Transparent Terms',
      desc: 'We reject arbitrary surge multipliers and hidden fees. All driver allowances, night charges, and toll policies are confirmed upfront before travel.',
    },
    {
      icon: Clock,
      title: '24/7 Dedicated Dispatch',
      desc: 'Round-the-clock operations ensure you never have to worry about missing an early 3:00 AM flight or an unexpected midnight arrival at BLR Airport.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-brand-offwhite">
      {/* Header Banner */}
      <section className="bg-brand-navy text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-xs font-semibold text-brand-orange border border-white/10">
            <Award className="w-3.5 h-3.5" />
            {/* 15 Years claim from config */}
            <span>{siteConfig.trustClaims.yearsExperience.label}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            About {siteConfig.brand.name}
          </h1>

          <p className="text-lg text-brand-orange font-medium">
            &ldquo;{siteConfig.brand.closingLine}&rdquo;
          </p>

          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Headquartered in Bengaluru, Karnataka, we specialize in premium chauffeur-driven Toyota Innova and Innova Crysta rentals for families, corporate teams, and vacation travelers.
          </p>
        </div>
      </section>

      {/* Trust Stats Bar */}
      <section className="bg-brand-navy-light text-white py-8 border-y border-white/10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-3">
            <Award className="w-6 h-6 text-brand-orange mx-auto mb-1" />
            <p className="text-2xl sm:text-3xl font-black text-white">
              {String(siteConfig.trustClaims.yearsExperience.value)} Years
            </p>
            <p className="text-xs text-gray-300 font-medium">Industry Legacy</p>
          </div>

          <div className="p-3">
            <Users className="w-6 h-6 text-brand-orange mx-auto mb-1" />
            <p className="text-2xl sm:text-3xl font-black text-white">
              {String(siteConfig.trustClaims.happyCustomers.value)}
            </p>
            <p className="text-xs text-gray-300 font-medium">Satisfied Travelers</p>
          </div>

          <div className="p-3">
            <Star className="w-6 h-6 text-yellow-400 fill-yellow-400 mx-auto mb-1" />
            <p className="text-2xl sm:text-3xl font-black text-white">
              {String(siteConfig.trustClaims.googleRating.value)} Star
            </p>
            <p className="text-xs text-gray-300 font-medium">Customer Rating</p>
          </div>

          <div className="p-3">
            <Clock className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
            <p className="text-2xl sm:text-3xl font-black text-white">
              {siteConfig.contact.hours}
            </p>
            <p className="text-xs text-gray-300 font-medium">Always Dispatched</p>
          </div>
        </div>
      </section>

      {/* Detailed Story & Mission */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-16">
        
        {/* Our Story */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-sm space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
              Our Journey
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy mt-1">
              15 Years of Punctuality, Safety &amp; Comfort
            </h2>
          </div>

          <div className="space-y-4 text-sm sm:text-base text-gray-600 leading-relaxed">
            <p>
              Founded 15 years ago in Bengaluru, <strong>{siteConfig.brand.name}</strong> was born from a clear realization: when families and business executives travel long distances or head to the airport, they deserve absolute peace of mind. App-based cab aggregators often suffer from abrupt cancellations, hidden surge rates, and uncertain vehicle cleanliness.
            </p>
            <p>
              We decided to focus exclusively on Toyota MPVs — notably the iconic <strong>Toyota Innova</strong> and <strong>Innova Crysta</strong>. Renowned for their heavy-duty ladder-frame chassis, plush suspension, and ample 7 &amp; 8 passenger configurations, these vehicles allow passengers of all ages to journey across Karnataka, Tamil Nadu, and Kerala with zero fatigue.
            </p>
            <p>
              Over the past 15 years, our team has served more than 5,000 satisfied corporate executives, leisure holidaymakers, and international tourists. Today, we maintain 24/7 dispatch operations with doorstep pickup across every neighborhood in Bengaluru.
            </p>
          </div>
        </div>

        {/* 4 Pillars of Excellence */}
        <div>
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
              Core Principles
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy mt-1">
              What Sets Our Chauffeur Service Apart
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pillars.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={i}
                  className="bg-white rounded-3xl p-7 border border-gray-200/80 shadow-sm hover:shadow-md transition-all flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-brand-orange-light text-brand-orange flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-brand-navy mb-1.5">{pillar.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{pillar.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Coverage Map Highlights */}
        <div className="bg-brand-navy text-white rounded-3xl p-8 sm:p-12 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-brand-orange">
                Bangalore Hubs
              </span>
              <h3 className="text-xl sm:text-2xl font-bold mt-1 mb-4">
                Local City &amp; Airport Coverage
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-4">
                Instant chauffeur dispatch to your doorstep across all premier technology corridors and residential layouts:
              </p>
              <div className="flex flex-wrap gap-2">
                {siteConfig.localAreas.map((area) => (
                  <span
                    key={area}
                    className="text-xs bg-white/10 text-gray-200 px-3 py-1.5 rounded-lg border border-white/10"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">
                Outstation Destinations
              </span>
              <h3 className="text-xl sm:text-2xl font-bold mt-1 mb-4">
                South India Highway Network
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-4">
                Chauffeurs trained for ghat highways, national forest checkpoints, and inter-state permits:
              </p>
              <div className="flex flex-wrap gap-2">
                {siteConfig.outstationDestinations.map((dest) => (
                  <Link
                    key={dest}
                    href={`/routes/bangalore-to-${dest.toLowerCase()}`}
                    className="text-xs bg-white/10 text-gray-200 hover:text-white hover:bg-white/20 px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
                  >
                    Bangalore to {dest}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-sm text-center space-y-4 max-w-4xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
            Experience the Difference
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
            {siteConfig.cta.advanceBooking}
          </h2>
          <p className="text-sm text-gray-600 max-w-xl mx-auto">
            Book your next airport transfer, full-day city rental, or outstation holiday with Bangalore&apos;s most reliable Innova fleet.
          </p>

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

            <Link
              href="/contact"
              className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-navy hover:bg-brand-navy-light text-white font-bold text-sm transition-all"
            >
              <span>Book Online</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </section>
    </div>
  );
}
