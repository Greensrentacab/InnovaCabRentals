/**
 * Footer.tsx — design.md §3.6 footer: dark ink band, brand column + four link
 * columns, contact list with brand-400 / WhatsApp icons, bottom bar.
 * Bottom padding (pb-28) clears the mobile dock below lg.
 *
 * The route columns show the built-in routes, then the destinations published
 * from Admin → Footer destinations (`destinationLinks`, in the admin's order).
 */

import Link from 'next/link';
import Logo from '@/components/Logo';
import { Banknote, Car, ChevronDown, Clock, Mail, MapPin, Phone, QrCode } from 'lucide-react';
import WhatsAppIcon from '@/components/ds/WhatsAppIcon';
import { siteConfig } from '@/lib/siteConfig';
import { BUILT_IN_FOOTER_COLUMNS, type FooterDestinationLink } from '@/lib/footerColumns';

const PAYMENT_ICONS = [QrCode, Banknote];

// overflow-wrap:anywhere: long names wrap inside their column instead of overflowing it
// (break-word would not, since it leaves the min-content width of flex/grid items unchanged)
const linkClass = '[overflow-wrap:anywhere] transition-colors hover:text-white';

// Service names (SEO) — each points to the existing page that covers it
const columns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'Services',
    links: [
      { label: 'Bangalore Airport Taxi', href: '/bangalore-airport-taxi' },
      { label: 'Outstation Cab Service', href: '/bangalore-outstation-cab-service' },
      { label: 'Round-Trip Cab Rental', href: '/bangalore-round-trip-cab-rental' },
      { label: 'Local City Taxi', href: '/bangalore-local-city-taxi' },
      { label: 'Hourly Cab Rental (8 / 12 hr)', href: '/bangalore-hourly-cab-rental' },
      { label: 'Custom Tour Packages', href: '/bangalore-tour-packages' },
      { label: 'Corporate & Family Travel', href: '/contact-and-booking' },
    ],
  },
  {
    title: 'Our fleet',
    links: [
      { label: 'Maruti Ertiga Rental', href: '/ertiga-rental-bangalore' },
      { label: 'Toyota Innova Rental', href: '/innova-rental-bangalore' },
      { label: 'Innova Crysta Rental', href: '/innova-crysta-rental-bangalore' },
      { label: 'Innova Hycross Rental', href: '/innova-hycross-rental-bangalore' },
      { label: 'Compare All Cars', href: '/vehicles#compare' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about-us' },
      { label: 'All Outstation Routes', href: '/routes' },
      { label: 'Frequently Asked Questions', href: '/frequently-asked-questions' },
      { label: 'Terms & Conditions', href: '/terms-and-conditions' },
      { label: 'Contact & Booking', href: '/contact-and-booking' },
    ],
  },
];

export default function Footer({ destinationLinks = [] }: { destinationLinks?: FooterDestinationLink[] }) {
  const currentYear = new Date().getFullYear();
  const routeGroups = BUILT_IN_FOOTER_COLUMNS.map((c) => ({
    title: c.title,
    routes: [...c.links, ...destinationLinks.filter((l) => l.column === c.id)],
  }));

  return (
    <footer className="ds-scope bg-ink pb-[calc(7.5rem+env(safe-area-inset-bottom))] pt-14 text-slate-300 lg:pb-14">
      <div className="section grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-[1.4fr_repeat(3,1fr)_1.4fr]">
        {/* Brand */}
        <div className="col-span-2 md:col-span-3 lg:col-span-1">
          <Link href="/" className="flex items-center gap-2.5" aria-label={`${siteConfig.brand.name} home`}>
            <Logo tone="dark" className="h-12 w-auto" />
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-400">{siteConfig.brand.tagline}</p>
          <p className="mt-3 max-w-sm text-sm font-semibold text-slate-200">&ldquo;{siteConfig.brand.closingLine}&rdquo;</p>
          <a href={siteConfig.contact.phone.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mt-6">
            <WhatsAppIcon className="h-4 w-4" /> WhatsApp Quick Quote
          </a>
        </div>

        {columns.map((col) => (
          <div key={col.title} className="min-w-0">
            <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{col.title}</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Contact & NAP — must match Google Business Profile exactly */}
        <div className="col-span-2 md:col-span-3 lg:col-span-1">
          <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">
            <li>
              <a href={siteConfig.contact.phone.tel} className="flex items-center gap-2 font-semibold text-slate-200 hover:text-white">
                <Phone className="h-4 w-4 shrink-0 text-brand-400" /> {siteConfig.contact.phone.display}
              </a>
            </li>
            <li>
              <a
                href={siteConfig.contact.phone.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white"
              >
                <WhatsAppIcon className="h-4 w-4 shrink-0 text-whatsapp" /> WhatsApp
              </a>
            </li>
            <li>
              <a href={`mailto:${siteConfig.contact.email}`} className="flex items-center gap-2 [overflow-wrap:anywhere] hover:text-white">
                <Mail className="h-4 w-4 shrink-0 text-brand-400" /> {siteConfig.contact.email}
              </a>
            </li>
            <li className="flex items-center gap-2 text-live-400">
              <Clock className="h-4 w-4 shrink-0" /> {siteConfig.contact.hours}
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
              <address className="not-italic leading-relaxed">{siteConfig.contact.address.full}</address>
            </li>
          </ul>
        </div>
      </div>

      {/* All outstation routes, grouped (expandable on mobile, open columns from md) */}
      <nav aria-label="Popular routes from Bangalore" className="section mt-10 border-t border-white/10 pt-8">
        <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Popular routes from Bangalore</h3>
        <div className="mt-4 divide-y divide-white/10 md:hidden">
          {routeGroups.map((g, i) => (
            <details key={g.title} className="group py-1" open={i === 0}>
              <summary className="flex min-h-touch cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-slate-200 [&::-webkit-details-marker]:hidden">
                {g.title}
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-500 transition-transform group-open:rotate-180" />
              </summary>
              <ul className="grid grid-cols-2 gap-x-4 pb-3 text-sm text-slate-400">
                {g.routes.map((r) => (
                  <li key={r.href} className="min-w-0">
                    <Link href={r.href} className={`${linkClass} flex min-h-touch items-center py-1 leading-snug`}>
                      {r.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
        <div className="mt-5 hidden items-start gap-8 md:grid md:grid-cols-3">
          {routeGroups.map((g) => (
            <div key={g.title} className="min-w-0">
              <h4 className="text-sm font-bold text-slate-200">{g.title}</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                {g.routes.map((r) => (
                  <li key={r.href}>
                    <Link href={r.href} className={linkClass}>
                      {r.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      <div className="section mt-3 border-t border-white/10 pt-5 text-xs text-slate-500 md:mt-10 md:pt-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          <p>
            © {currentYear} {siteConfig.brand.name}. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-1.5" aria-label="Accepted payments">
            {siteConfig.payments.methods.map((method, i) => {
              if (method === 'UPI') {
                // Official UPI logo on a white chip so its dark lettering reads on the dark footer
                return (
                  <li key={method} className="inline-flex items-center rounded-full bg-white px-3 py-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/upi.svg" alt="UPI" width={1024} height={466} className="h-5 w-auto" />
                  </li>
                );
              }
              const Icon = PAYMENT_ICONS[i] ?? Banknote;
              return (
                <li key={method} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-medium text-slate-300">
                  <Icon className="h-3.5 w-3.5 text-sky-300" aria-hidden="true" /> {method}
                </li>
              );
            })}
          </ul>
        </div>
        <p className="mt-4 border-t border-white/5 pt-4 text-slate-400">
          Website maintained by <span className="font-bold text-white">Greens Rent A Cab</span>
        </p>
      </div>
    </footer>
  );
}
