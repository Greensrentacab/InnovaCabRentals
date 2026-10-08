import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import ContactEnquiryForm from '@/components/ContactEnquiryForm';
import PageHero from '@/components/ds/PageHero';
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

const iconTile = 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl';

export default function ContactPage() {
  const rows = [
    {
      icon: Phone,
      tile: 'bg-brand-50 text-brand-700',
      label: 'Phone (24/7)',
      value: (
        <a href={siteConfig.contact.phone.tel} className="text-base font-extrabold text-ink hover:text-brand-700">
          {siteConfig.contact.phone.display}
        </a>
      ),
      hint: 'Direct line to dispatch manager',
    },
    {
      icon: MessageCircle,
      tile: 'bg-whatsapp/15 text-[#128C4A]',
      label: 'WhatsApp',
      value: (
        <a
          href={siteConfig.contact.phone.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-bold text-live-600 hover:text-live-500"
        >
          Click to Chat ({siteConfig.contact.phone.display})
        </a>
      ),
      hint: 'Average response time: < 2 minutes',
    },
    {
      icon: Mail,
      tile: 'bg-brand-50 text-brand-700',
      label: 'Email',
      value: (
        <a href={`mailto:${siteConfig.contact.email}`} className="break-all text-sm font-semibold text-ink hover:text-brand-700">
          {siteConfig.contact.email}
        </a>
      ),
      hint: 'For corporate contracts & invoices',
    },
    {
      icon: Clock,
      tile: 'bg-live-500/10 text-live-600',
      label: 'Hours of Operation',
      value: <p className="text-sm font-bold text-live-600">{siteConfig.contact.hours}</p>,
      hint: 'Round-the-clock service every day',
    },
  ];

  return (
    <div className="bg-porcelain">
      <PageHero
        breadcrumbs={[{ label: 'Contact' }]}
        eyebrow="24/7 Customer Care & Cab Dispatch Desk"
        title="Contact Us & Booking Request"
        lead={
          <>
            <p className="font-bold text-brand-700">{siteConfig.brand.closingLine}</p>
            <p className="mt-3">
              Need an instant quote or immediate cab assignment? Call or message our dispatch team directly on WhatsApp, or
              submit your trip request below.
            </p>
          </>
        }
        aside={<ContactEnquiryForm />}
      >
        <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <a href={siteConfig.contact.phone.tel} className="btn-primary">
            <Phone className="h-4 w-4" /> Call {siteConfig.contact.phone.display}
          </a>
          <a href={siteConfig.contact.phone.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
            <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
          </a>
        </div>

        {/* Official business details — NAP must match Google Business Profile */}
        <div className="card-float mt-8 p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">Official business details</p>
          <h2 className="mt-1 text-lg font-extrabold tracking-tight">Direct Communication</h2>
          <ul className="mt-4 space-y-4">
            {rows.map(({ icon: Icon, tile, label, value, hint }) => (
              <li key={label} className="flex items-start gap-3.5">
                <span className={`${iconTile} ${tile}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
                  {value}
                  <p className="text-xs text-slate-500">{hint}</p>
                </div>
              </li>
            ))}
            <li className="flex items-start gap-3.5 border-t border-slate-100 pt-4">
              <span className={`${iconTile} bg-brand-50 text-brand-700`}>
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Dispatch &amp; Garage Address</p>
                <address className="mt-0.5 text-sm not-italic leading-relaxed text-slate-700">
                  {siteConfig.contact.address.full}
                </address>
              </div>
            </li>
          </ul>
        </div>
      </PageHero>

      {/* Google Business location placeholder (required label) */}
      <section className="section pb-20 pt-4">
        <div className="card-float overflow-hidden p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-sm font-extrabold">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <MapPin className="h-4 w-4" />
              </span>
              Google Business Location
            </p>
            <span className="pill">Bangalore, KA 560077</span>
          </div>
          <div className="relative mt-4 flex h-56 flex-col items-center justify-center overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50 p-6 text-center">
            <div className="pointer-events-none absolute inset-0 bg-grid-slate [background-size:32px_32px]" />
            <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white shadow-glow">
              <MapPin className="h-6 w-6" />
            </span>
            <p className="relative mt-3 text-sm font-bold text-ink">Add map link once the Google Business Profile exists</p>
            <p className="relative mt-1 max-w-sm text-xs text-slate-500">{siteConfig.contact.address.full}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
