import { Phone, MessageCircle, Mail, MapPin, Clock, ShieldCheck, Map, ExternalLink } from 'lucide-react';
import ContactEnquiryForm from '@/components/ContactEnquiryForm';
import { siteConfig } from '@/lib/siteConfig';

export const metadata = {
  title: `Contact Us & Booking Request | 24/7 Innova Cab Service | ${siteConfig.brand.name}`,
  description: `Contact ${siteConfig.brand.name} in Bangalore. 24/7 phone ${siteConfig.contact.phone.display}, WhatsApp quick quotes, and instant booking requests for Toyota Innova and Innova Crysta rentals.`,
  keywords: [
    'Innova Cabs Bangalore Contact',
    'Book Innova Cab Bangalore',
    'Innova Taxi Bangalore Phone Number',
    'Innova Cab Bangalore Customer Care',
  ],
};

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-offwhite">
      {/* Header Banner */}
      <section className="bg-brand-navy text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-xs font-semibold text-brand-orange border border-white/10">
            <Clock className="w-3.5 h-3.5" />
            <span>24/7 Customer Care &amp; Cab Dispatch Desk</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Contact Us &amp; Booking Request
          </h1>

          <p className="text-lg text-brand-orange font-medium">
            {siteConfig.brand.closingLine}
          </p>

          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Need an instant quote or immediate cab assignment? Call or message our dispatch team directly on WhatsApp, or submit your trip request below.
          </p>

          {/* Quick Direct Actions */}
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

      {/* Main Contact Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Direct Contact Details & NAP Consistency */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-brand-navy text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="border-b border-white/10 pb-4">
                <span className="text-xs uppercase tracking-wider text-brand-orange font-bold">
                  Official Business Details
                </span>
                <h2 className="text-2xl font-bold mt-1">Direct Communication</h2>
                <p className="text-xs text-gray-300 mt-1">
                  Connect with our Bangalore dispatch center anytime.
                </p>
              </div>

              <div className="space-y-5 text-sm">
                {/* Phone */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/10 text-brand-orange flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase">Phone (24/7)</p>
                    <a
                      href={siteConfig.contact.phone.tel}
                      className="text-base font-bold text-white hover:text-brand-orange transition-colors"
                    >
                      {siteConfig.contact.phone.display}
                    </a>
                    <p className="text-[11px] text-gray-400 mt-0.5">Direct line to dispatch manager</p>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase">WhatsApp</p>
                    <a
                      href={siteConfig.contact.phone.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-emerald-300 hover:text-emerald-200 transition-colors"
                    >
                      Click to Chat (+91 9686025999)
                    </a>
                    <p className="text-[11px] text-gray-400 mt-0.5">Average response time: &lt; 2 minutes</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/10 text-brand-orange flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase">Email</p>
                    <a
                      href={`mailto:${siteConfig.contact.email}`}
                      className="text-sm font-medium text-gray-200 hover:text-white transition-colors"
                    >
                      {siteConfig.contact.email}
                    </a>
                    <p className="text-[11px] text-gray-400 mt-0.5">For corporate contracts &amp; invoices</p>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase">Hours of Operation</p>
                    <p className="text-sm font-bold text-emerald-400">{siteConfig.contact.hours}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Round-the-clock service every day</p>
                  </div>
                </div>

                {/* Full Address */}
                <div className="flex items-start gap-3.5 pt-2 border-t border-white/10">
                  <div className="w-10 h-10 rounded-xl bg-white/10 text-brand-orange flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase">Dispatch &amp; Garage Address</p>
                    <address className="not-italic text-xs text-gray-200 mt-1 leading-relaxed">
                      {siteConfig.contact.address.full}
                    </address>
                  </div>
                </div>
              </div>
            </div>

            {/* Placeholder Google Maps Area (Exact required label) */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="font-bold uppercase tracking-wider text-brand-navy flex items-center gap-1.5">
                  <Map className="w-4 h-4 text-brand-orange" />
                  <span>Google Business Location</span>
                </span>
                <span className="text-[10px] text-gray-400">Bangalore, KA 560077</span>
              </div>

              {/* Required Exact Placeholder Label */}
              <div className="bg-brand-navy/5 rounded-2xl h-48 sm:h-56 flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-gray-300">
                <MapPin className="w-10 h-10 text-brand-orange mb-2 animate-bounce" />
                <p className="text-sm font-bold text-brand-navy">
                  Add map link once the Google Business Profile exists
                </p>
                <p className="text-xs text-gray-500 mt-1 max-w-xs">
                  {siteConfig.contact.address.full}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Form Saving to Firestore 'enquiries' collection */}
          <div className="lg:col-span-7">
            <ContactEnquiryForm />
          </div>

        </div>
      </section>
    </div>
  );
}
