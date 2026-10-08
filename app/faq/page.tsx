import Link from 'next/link';
import { ArrowRight, MessageCircle, Phone } from 'lucide-react';
import { siteConfig } from '@/lib/siteConfig';
import PageHero from '@/components/ds/PageHero';
import CtaBand from '@/components/ds/CtaBand';
import FaqAccordion from '@/components/home/FaqAccordion';

export const metadata = {
  title: `Frequently Asked Questions | Innova Cabs Bangalore | ${siteConfig.brand.name}`,
  description:
    'Comprehensive answers to questions about booking procedures, toll and driver allowance billing, luggage capacity in 7 & 8 seater Innova, and 24/7 airport and outstation services.',
  keywords: [
    'Innova Cabs Bangalore FAQ',
    'Innova Cab Bangalore Price Questions',
    'How to book Innova Cab Bangalore',
    'Innova luggage capacity Bangalore',
  ],
};

const categorizedFaqs = [
  {
    id: 'booking',
    category: 'Booking & Confirmation (Core FAQs)',
    items: [
      {
        q: 'How do I book an Innova cab with Innova Cabs Bangalore?',
        a: 'You can call us directly or click our WhatsApp button to get an instant quote and booking confirmation. You can also submit the booking request form on our contact page, and our dispatch team will confirm your vehicle via a pre-filled WhatsApp link or call.',
      },
      {
        q: 'Are tolls, driver allowance, and parking charges included?',
        a: 'Driver allowance is included in your fare estimate. Toll fees, parking charges and state entry permits are paid by the customer at actuals.',
      },
      {
        q: 'Can I choose between a 7-seater and 8-seater Innova?',
        a: 'Yes! Both 7-seater models (featuring plush executive captain chairs in the middle row) and 8-seater models (continuous bench seating) are available. Let us know your seating preference when reserving.',
      },
      {
        q: 'Is advance payment required to book a cab?',
        a: 'No upfront payment or credit card details are required. Your booking is placed as a request (Status: PENDING) and confirmed directly with our dispatch manager via WhatsApp or phone.',
      },
      {
        q: 'Are your vehicles and drivers available 24/7 for late-night airport drops?',
        a: 'Yes, our dispatch desk operates 24 hours a day, 365 days a year. We recommend booking a few hours in advance for early morning or late-night airport transfers to ensure priority vehicle dispatch.',
      },
    ],
  },
  {
    id: 'luggage',
    category: 'Luggage & Cabin Comfort',
    items: [
      {
        q: 'How much luggage can a Toyota Innova or Innova Crysta accommodate?',
        a: 'With all 3 rows occupied, an Innova comfortably holds 3 to 4 large international suitcases plus carry-on backpacks. If you have excess baggage, we can arrange vehicles with top roof carriers or fold down the third-row seating.',
      },
      {
        q: 'Is air conditioning provided throughout the trip?',
        a: 'Yes, all our vehicles feature powerful dual-zone air conditioning with individual vents across all three seating rows to keep every passenger cool and refreshed.',
      },
      {
        q: 'Can elderly passengers easily enter and exit the Innova Crysta?',
        a: 'Yes, the Innova Crysta features wide-opening rear doors, low side-step height, and grab handles. The middle captain seats are ergonomic and supportive for senior citizens.',
      },
    ],
  },
  {
    id: 'billing',
    category: 'Billing & Commercial Terms',
    items: [
      {
        q: 'How does outstation per-kilometre billing work?',
        a: 'Outstation trips operate with a standard 300 km/day minimum billing threshold. If the total distance exceeds this threshold, additional kilometres are billed at the agreed per-km rate plus driver daily allowance.',
      },
      {
        q: 'What are driver night driving allowances?',
        a: 'A standard night allowance applies only if driving continues between 10:00 PM and 6:00 AM, allowing chauffeurs to stay compensated and well-rested.',
      },
      {
        q: 'What is your cancellation or rescheduling policy?',
        a: 'We understand travel plans can shift unexpectedly. Please notify us at least 4 hours prior to the scheduled pickup time for free cancellation or rescheduling.',
      },
    ],
  },
  {
    id: 'safety',
    category: 'Chauffeurs & Safety',
    items: [
      {
        q: 'Are your chauffeurs background-verified and experienced?',
        a: 'Yes, 100% of our drivers undergo criminal background checks, hold valid commercial passenger badges, and have at least 5 to 10 years of experience driving on South Indian highways and mountain ghats.',
      },
      {
        q: 'Are vehicles sanitized before each journey?',
        a: 'Every car is thoroughly washed, vacuumed, and sanitized before dispatch. Upholstery, door handles, and air conditioning vents are deep-cleaned.',
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="bg-porcelain">
      <PageHero
        breadcrumbs={[{ label: 'FAQ' }]}
        eyebrow="Customer Knowledge Base"
        title="Frequently Asked Questions"
        lead={
          <>
            <p className="font-bold text-brand-700">Clear, Honest &amp; Transparent Answers</p>
            <p className="mt-3">
              Everything you need to know about our Toyota Innova car rentals in Bangalore — from booking procedures and
              luggage limits to toll policies and outstation terms.
            </p>
          </>
        }
      >
        <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <a href={siteConfig.contact.phone.tel} className="btn-primary">
            <Phone className="h-4 w-4" /> Call {siteConfig.contact.phone.display}
          </a>
          <a href={siteConfig.contact.phone.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
            <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
          </a>
        </div>
      </PageHero>

      <section className="section py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          {/* Category index */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <nav aria-label="FAQ categories" className="card-float p-4">
              <p className="px-2 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">Categories</p>
              <ul className="mt-1">
                {categorizedFaqs.map((cat) => (
                  <li key={cat.id}>
                    <a
                      href={`#${cat.id}`}
                      className="flex items-center justify-between gap-3 rounded-2xl px-2 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-brand-700"
                    >
                      {cat.category}
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">
                        {cat.items.length}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="relative mt-5 overflow-hidden rounded-3xl bg-ink p-6 text-white shadow-float-lg">
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-600/40 blur-3xl" />
              <span className="chip-live relative bg-live-500/15 text-live-400">24/7 Live Assistance</span>
              <h2 className="relative mt-3 text-xl font-extrabold tracking-tight">Still Have Questions?</h2>
              <p className="relative mt-1.5 text-sm leading-relaxed text-slate-300">
                Our team is available round the clock to calculate custom itineraries, explain driver allowances, and confirm
                vehicle availability.
              </p>
              <div className="relative mt-5 grid gap-2">
                <a href={siteConfig.contact.phone.tel} className="btn bg-white text-ink hover:-translate-y-0.5">
                  <Phone className="h-4 w-4" /> Call Us Now
                </a>
                <a href={siteConfig.contact.phone.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
                  <MessageCircle className="h-4 w-4" /> Message on WhatsApp
                </a>
                <Link href="/contact" className="btn border border-white/20 bg-white/10 text-white hover:bg-white/15">
                  Submit Request <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </aside>

          {/* Categorized accordions */}
          <div className="space-y-10">
            {categorizedFaqs.map((cat, i) => (
              <div key={cat.id} id={cat.id} className="scroll-mt-28">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-extrabold tracking-tight">
                  <span className="h-2 w-2 rounded-full bg-brand-600" />
                  {cat.category}
                </h2>
                <FaqAccordion faqs={cat.items} defaultOpen={i === 0 ? 0 : null} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </div>
  );
}
