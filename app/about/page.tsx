import Link from 'next/link';
import { ArrowUpRight, Clock, HeartHandshake, MapPin, MessageCircle, Mountain, Phone, ShieldCheck, Users } from 'lucide-react';
import { siteConfig } from '@/lib/siteConfig';
import PageHero from '@/components/ds/PageHero';
import SectionHeading, { Hairline } from '@/components/ds/SectionHeading';
import CtaBand from '@/components/ds/CtaBand';
import Reveal from '@/components/home/Reveal';

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
      desc: 'We reject arbitrary surge multipliers and hidden fees. All driver allowances and night charges are confirmed upfront; tolls and parking are paid by the customer.',
    },
    {
      icon: Clock,
      title: '24/7 Dedicated Dispatch',
      desc: 'Round-the-clock operations ensure you never have to worry about missing an early 3:00 AM flight or an unexpected midnight arrival at BLR Airport.',
    },
  ];

  const stats = [
    { value: `${siteConfig.trustClaims.yearsExperience.value} yrs`, label: 'Industry legacy' },
    { value: String(siteConfig.trustClaims.happyCustomers.value), label: 'Satisfied travelers' },
    { value: `${siteConfig.trustClaims.googleRating.value}★`, label: 'Customer rating' },
    { value: '24/7', label: 'Always dispatched' },
  ];

  return (
    <div className="bg-porcelain">
      <PageHero
        breadcrumbs={[{ label: 'About Us' }]}
        eyebrow={siteConfig.trustClaims.yearsExperience.label}
        title={`About ${siteConfig.brand.name}`}
        lead={
          <>
            <p className="font-bold text-brand-700">&ldquo;{siteConfig.brand.closingLine}&rdquo;</p>
            <p className="mt-3">
              Headquartered in Bengaluru, Karnataka, we specialize in premium chauffeur-driven Toyota Innova and Innova
              Crysta rentals for families, corporate teams, and vacation travelers.
            </p>
          </>
        }
        aside={
          <div className="card-float grid grid-cols-2 gap-3 p-4 shadow-float-lg sm:p-6">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5">
                <p className="text-3xl font-extrabold tracking-tight text-brand-700">{stat.value}</p>
                <p className="mt-1 text-sm font-medium text-slate-600">{stat.label}</p>
              </div>
            ))}
          </div>
        }
      />

      {/* Our story */}
      <section className="section py-16 sm:py-20">
        <Reveal>
          <div className="card-float grid gap-8 p-6 sm:p-10 lg:grid-cols-[0.8fr_1.2fr]">
            <SectionHeading eyebrow="Our journey" title="15 Years of Punctuality, Safety & Comfort" centered={false} />
            <div className="space-y-4 text-[15px] leading-relaxed text-slate-600">
              <p>
                Founded 15 years ago in Bengaluru, <strong className="text-ink">{siteConfig.brand.name}</strong> was born from a
                clear realization: when families and business executives travel long distances or head to the airport, they
                deserve absolute peace of mind. App-based cab aggregators often suffer from abrupt cancellations, hidden surge
                rates, and uncertain vehicle cleanliness.
              </p>
              <p>
                We decided to focus exclusively on Toyota MPVs — notably the iconic <strong className="text-ink">Toyota Innova</strong>{' '}
                and <strong className="text-ink">Innova Crysta</strong>. Renowned for their heavy-duty ladder-frame chassis, plush
                suspension, and ample 7 &amp; 8 passenger configurations, these vehicles allow passengers of all ages to journey
                across Karnataka, Tamil Nadu, and Kerala with zero fatigue.
              </p>
              <p>
                Over the past 15 years, our team has served more than 5,000 satisfied corporate executives, leisure
                holidaymakers, and international tourists. Today, we maintain 24/7 dispatch operations with doorstep pickup
                across every neighborhood in Bengaluru.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Pillars */}
      <section className="relative bg-white py-16 sm:py-20">
        <Hairline />
        <div className="section">
          <SectionHeading eyebrow="Core principles" title="What Sets Our Chauffeur Service Apart" />
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {pillars.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <Reveal key={pillar.title} delay={i * 0.1} className="h-full">
                  <article className="card-float card-float-hover flex h-full items-start gap-4 p-6">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-lg font-extrabold tracking-tight">{pillar.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{pillar.desc}</p>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Coverage */}
      <section className="section py-16 sm:py-20">
        <div className="grid gap-5 lg:grid-cols-2">
          <Reveal className="h-full">
            <div className="card-float h-full p-6 sm:p-8">
              <span className="eyebrow">
                <MapPin className="h-3.5 w-3.5" /> Bangalore hubs
              </span>
              <h2 className="mt-4 text-2xl font-extrabold tracking-tight">Local City &amp; Airport Coverage</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Instant chauffeur dispatch to your doorstep across all premier technology corridors and residential layouts:
              </p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {siteConfig.localAreas.map((area) => (
                  <li key={area} className="pill">
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="h-full">
            <div className="card-float h-full p-6 sm:p-8">
              <span className="eyebrow">
                <Mountain className="h-3.5 w-3.5" /> Outstation destinations
              </span>
              <h2 className="mt-4 text-2xl font-extrabold tracking-tight">South India Highway Network</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Chauffeurs trained for ghat highways, national forest checkpoints, and inter-state permits:
              </p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {siteConfig.outstationDestinations.map((dest) => (
                  <li key={dest}>
                    <Link
                      href={`/routes/bangalore-to-${dest.toLowerCase()}`}
                      className="pill group transition hover:border-brand-300 hover:text-brand-700"
                    >
                      Bangalore to {dest}
                      <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 transition group-hover:text-brand-600" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row">
          <a href={siteConfig.contact.phone.tel} className="btn-primary">
            <Phone className="h-4 w-4" /> {siteConfig.cta.instantBooking}
          </a>
          <a href={siteConfig.contact.phone.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
            <MessageCircle className="h-4 w-4" /> {siteConfig.cta.quickQuote}
          </a>
        </div>
      </section>

      <CtaBand
        title={siteConfig.cta.advanceBooking}
        subtitle="Book your next airport transfer, full-day city rental, or outstation holiday with Bangalore's most reliable Innova fleet."
      />
    </div>
  );
}
