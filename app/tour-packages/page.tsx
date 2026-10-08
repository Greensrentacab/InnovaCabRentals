import Link from 'next/link';
import { ArrowRight, Check, MapPin, MessageCircle, Phone } from 'lucide-react';
import TourEnquiryForm from '@/components/TourEnquiryForm';
import PageHero from '@/components/ds/PageHero';
import SectionHeading, { Hairline } from '@/components/ds/SectionHeading';
import CtaBand from '@/components/ds/CtaBand';
import Reveal from '@/components/home/Reveal';
import { siteConfig } from '@/lib/siteConfig';

export const metadata = {
  title: `Custom Tour Packages from Bangalore | Innova Cab Hire | ${siteConfig.brand.name}`,
  description:
    'Customised enquiry-based tour packages from Bangalore to Coorg, Ooty, Mysore, Wayanad, Chikmagalur, and Kodaikanal with Toyota Innova Crysta. Experienced chauffeurs and flexible itineraries.',
};

const advantages = [
  { title: '100% Tailored Schedule:', text: 'Stop whenever you wish for photographs, meals, and viewpoint exploration.' },
  { title: 'Hill Station Chauffeurs:', text: 'Experienced in navigating Western Ghats, hairpin bends, and misty morning conditions.' },
  {
    title: 'Family Comfort:',
    text: 'Spacious captain seats in Toyota Innova Crysta allow senior citizens and children to travel with zero fatigue.',
  },
  { title: 'Zero Hidden Fees:', text: 'Driver allowance is shared upfront; tolls and inter-state permits are paid by the customer.' },
];

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

  const tourWhatsApp = `${siteConfig.contact.phone.whatsappUrl}?text=${encodeURIComponent(
    'Hello, I would like to enquire about a custom holiday tour package from Bangalore.'
  )}`;

  return (
    <div className="bg-porcelain">
      <PageHero
        breadcrumbs={[{ label: 'Tour Packages' }]}
        eyebrow="Enquiry-Based Custom Itineraries"
        title="Custom Innova Tour Packages from Bangalore"
        lead={
          <>
            <p className="font-bold text-brand-700">{siteConfig.brand.closingLine}</p>
            <p className="mt-3">
              Every vacation is unique. Tell us your travel dates, passenger group size, and preferred destination. Our team
              creates a personalized schedule with transparent pricing and seasoned chauffeurs.
            </p>
          </>
        }
        aside={<TourEnquiryForm />}
      >
        <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <a href={siteConfig.contact.phone.tel} className="btn-primary">
            <Phone className="h-4 w-4" /> {siteConfig.cta.instantBooking}
          </a>
          <a href={tourWhatsApp} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
            <MessageCircle className="h-4 w-4" /> {siteConfig.cta.quickQuote}
          </a>
        </div>

        <div className="card-float mt-8 p-6">
          <h2 className="text-lg font-extrabold tracking-tight">The Innova Cabs Tour Advantage</h2>
          <ul className="mt-4 space-y-3">
            {advantages.map((item) => (
              <li key={item.title} className="flex items-start gap-2.5 text-sm text-slate-600">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-live-500/10 text-live-600">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                <span>
                  <strong className="font-bold text-ink">{item.title}</strong> {item.text}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-5 border-t border-slate-100 pt-5">
            <p className="text-sm font-bold text-ink">Prefer Direct Consultation?</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Speak directly with our senior tour manager to plan custom temple circuits, corporate offsites, or multi-week
              holiday itineraries.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <a href={siteConfig.contact.phone.tel} className="btn-ghost px-3">
                <Phone className="h-4 w-4" /> Call {siteConfig.contact.phone.display}
              </a>
              <a href={siteConfig.contact.phone.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp px-3">
                <MessageCircle className="h-4 w-4" /> WhatsApp Travel Desk
              </a>
            </div>
          </div>
        </div>
      </PageHero>

      {/* Curated itineraries */}
      <section className="relative bg-white py-16 sm:py-20">
        <Hairline />
        <div className="section">
          <SectionHeading
            eyebrow="South India getaways"
            title="Popular Tour Packages"
            subtitle="Select any package below to inspect highway route details and get custom quotes."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {tourDestinations.map((tour, i) => (
              <Reveal key={tour.routeSlug} delay={(i % 3) * 0.1} className="h-full">
                <article className="card-float card-float-hover group flex h-full flex-col p-6">
                  <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-500">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-600" />
                      <span className="truncate">{tour.name}</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-bold text-brand-700">
                      {tour.duration}
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-extrabold tracking-tight">Bangalore to {tour.name} Tour</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    <strong className="font-semibold text-slate-700">Sightseeing:</strong> {tour.highlights}
                  </p>
                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <span className="text-sm font-extrabold text-ink">Price on request</span>
                    <Link href={`/routes/${tour.routeSlug}`} className="btn-ghost group/btn px-4 py-2.5">
                      Route Details
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <div className="pt-16 sm:pt-20">
        <CtaBand title="Plan your South India getaway" whatsappUrl={tourWhatsApp} service="outstation" />
      </div>
    </div>
  );
}
