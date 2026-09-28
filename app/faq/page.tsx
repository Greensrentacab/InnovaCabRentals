import { HelpCircle, Phone, MessageCircle, ShieldCheck, CheckCircle2, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { siteConfig } from '@/lib/siteConfig';

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
    category: 'Booking & Confirmation (Core FAQs)',
    items: [
      {
        q: 'How do I book an Innova cab with Innova Cabs Bangalore?',
        a: 'You can call us directly or click our WhatsApp button to get an instant quote and booking confirmation. You can also submit the booking request form on our contact page, and our dispatch team will confirm your vehicle via a pre-filled WhatsApp link or call.',
      },
      {
        q: 'Are tolls, driver allowance, and parking charges included?',
        a: 'Toll fees, state entry taxes, and parking charges are billed transparently at actuals, or can be bundled into custom all-inclusive outstation tour quotes upon request with zero hidden surprises.',
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
    <div className="flex flex-col min-h-screen bg-brand-offwhite">
      {/* Header Banner */}
      <section className="bg-brand-navy text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-xs font-semibold text-brand-orange border border-white/10">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Customer Knowledge Base</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Frequently Asked Questions
          </h1>

          <p className="text-lg text-brand-orange font-medium">
            Clear, Honest &amp; Transparent Answers
          </p>

          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about our Toyota Innova car rentals in Bangalore — from booking procedures and luggage limits to toll policies and outstation terms.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={siteConfig.contact.phone.tel}
              className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-sm shadow-md transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>Call {siteConfig.contact.phone.display}</span>
            </a>

            <a
              href={siteConfig.contact.phone.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* Categorized FAQs Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-12">
        {categorizedFaqs.map((cat, catIdx) => (
          <div key={catIdx} className="space-y-4">
            <div className="border-b border-gray-200 pb-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-brand-navy flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-orange" />
                <span>{cat.category}</span>
              </h2>
            </div>

            <div className="space-y-3.5">
              {cat.items.map((item, itemIdx) => (
                <div
                  key={itemIdx}
                  className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm hover:shadow-md transition-all"
                >
                  <h3 className="text-base font-bold text-brand-navy mb-2 flex items-start gap-2.5">
                    <HelpCircle className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                    <span>{item.q}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pl-7.5">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Still have questions CTA card */}
        <div className="bg-brand-navy text-white rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-orange bg-white/10 px-3.5 py-1 rounded-full inline-block">
            24/7 Live Assistance
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Still Have Questions?
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
            Our team is available round the clock to calculate custom itineraries, explain driver allowances, and confirm vehicle availability.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={siteConfig.contact.phone.tel}
              className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-sm shadow-md transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>Call Us Now</span>
            </a>

            <a
              href={siteConfig.contact.phone.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Message on WhatsApp</span>
            </a>

            <Link
              href="/contact"
              className="min-h-[48px] w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-all"
            >
              <span>Submit Request</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
