/**
 * Footer.tsx — design.md §3.6 footer: dark ink band, brand column + four link
 * columns, contact list with brand-400 / WhatsApp icons, bottom bar.
 * Bottom padding (pb-28) clears the mobile dock below lg.
 */

import Link from 'next/link';
import { Car, Clock, Crown, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { siteConfig } from '@/lib/siteConfig';
import { catalogRoutes } from '@/lib/routeCatalog';

// Every outstation route once (deduplicated by slug)
const footerRoutes = catalogRoutes
  .filter((r, i, all) => !r.slug.includes('airport') && all.findIndex((x) => x.slug === r.slug) === i)
  .map((r) => ({ label: r.destination, href: `/routes/${r.slug}` }));

const linkClass = 'transition-colors hover:text-white';

const columns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'Services',
    links: [
      { label: 'Airport Pickup & Drop', href: '/airport-taxi' },
      { label: 'Outstation Cabs', href: '/outstation-cabs' },
      { label: 'Local City Rental', href: '/local-rides' },
      { label: 'Custom Tour Packages', href: '/tour-packages' },
      { label: 'Popular Travel Routes', href: '/routes' },
    ],
  },
  {
    title: 'Fleet & company',
    links: [
      { label: 'Innova Cab Rental', href: '/innova-rental-bangalore' },
      { label: 'Innova Crysta Rental', href: '/innova-crysta-rental-bangalore' },
      { label: 'Ertiga Rental', href: '/ertiga-rental-bangalore' },
      { label: 'Innova Hycross Rental', href: '/innova-hycross-rental-bangalore' },
      { label: 'Our Innova Fleet', href: '/vehicles' },
      { label: 'About Us', href: '/about' },
      { label: 'Frequently Asked Questions', href: '/faq' },
      { label: 'Contact & Booking', href: '/contact' },
    ],
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="ds-scope bg-ink pb-28 pt-14 text-slate-300 lg:pb-14">
      <div className="section grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(2,1fr)_1.3fr]">
        {/* Brand */}
        <div className="sm:col-span-2 lg:col-span-1">
          <Link href="/" className="flex items-center gap-2.5" aria-label={`${siteConfig.brand.name} home`}>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-900 text-white shadow-glow">
              <Car className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <span className="leading-none">
              <span className="block text-[15px] font-extrabold tracking-tight text-white">{siteConfig.brand.name}</span>
              <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-400">
                <Crown className="h-2.5 w-2.5" /> Premium · Bangalore
              </span>
            </span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-400">{siteConfig.brand.tagline}</p>
          <p className="mt-3 max-w-sm text-sm font-semibold text-slate-200">&ldquo;{siteConfig.brand.closingLine}&rdquo;</p>
          <a href={siteConfig.contact.phone.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mt-6">
            <MessageCircle className="h-4 w-4" /> WhatsApp Quick Quote
          </a>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
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
        <div>
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
                <MessageCircle className="h-4 w-4 shrink-0 text-whatsapp" /> WhatsApp
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

      {/* All outstation routes (no duplicates) */}
      <nav aria-label="Outstation routes" className="section mt-10 border-t border-white/10 pt-8">
        <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Outstation cabs from Bangalore</h3>
        <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-slate-400 sm:grid-cols-3 lg:grid-cols-5">
          {footerRoutes.map((r) => (
            <li key={r.href} className="min-w-0 truncate">
              <Link href={r.href} className={linkClass}>
                Bangalore to {r.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="section mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:justify-between">
        <p>
          © {currentYear} {siteConfig.brand.name}. All rights reserved.
        </p>
        <p>Verified Innova, Crysta, Ertiga &amp; Hycross Rental in Bangalore.</p>
      </div>
    </footer>
  );
}
