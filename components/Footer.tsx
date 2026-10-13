/**
 * Footer.tsx — design.md §3.6 footer: dark ink band, brand column + four link
 * columns, contact list with brand-400 / WhatsApp icons, bottom bar.
 * Bottom padding (pb-28) clears the mobile dock below lg.
 */

import Link from 'next/link';
import { Car, ChevronDown, Clock, Crown, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { siteConfig } from '@/lib/siteConfig';
import { catalogRoutes } from '@/lib/routeCatalog';

// Outstation routes in three groups (every catalogue route exactly once)
const ROUTE_GROUPS: { title: string; slugs: string[] }[] = [
  {
    title: 'Popular Hill Stations & Weekend Trips',
    slugs: ['coorg', 'ooty', 'mysore', 'wayanad', 'kodaikanal', 'chikmagalur', 'pondicherry', 'nandi-hills', 'yercaud', 'munnar', 'bandipur-kabini', 'adiyogi-chikkaballapur'],
  },
  {
    title: 'Karnataka Destinations',
    slugs: ['gokarna', 'hampi', 'dandeli', 'udupi', 'murudeshwar', 'kukke-subramanya', 'dharmasthala', 'shivanasamudra', 'srirangapatna', 'sringeri', 'horanadu'],
  },
  {
    title: 'South India Pilgrimage & Long Trips',
    slugs: ['tirupati', 'guruvayur', 'kochi', 'mangalore', 'rameshwaram', 'alleppey', 'srirangam', 'kanyakumari', 'srikalahasti', 'mantralayam'],
  },
];

const routeBySlug = new Map(catalogRoutes.map((r) => [r.slug, r]));
const groupedSlugs = new Set(ROUTE_GROUPS.flatMap((g) => g.slugs.map((s) => `bangalore-to-${s}`)));
// Any route added to the catalogue later still appears (in the first group)
const ungrouped = catalogRoutes.filter((r) => r.category !== 'airport' && !groupedSlugs.has(r.slug)).map((r) => r.slug);

const routeGroups = ROUTE_GROUPS.map((g, i) => ({
  title: g.title,
  routes: [...g.slugs.map((s) => `bangalore-to-${s}`), ...(i === 0 ? ungrouped : [])]
    .map((slug) => routeBySlug.get(slug))
    .filter((r): r is NonNullable<typeof r> => Boolean(r))
    .map((r) => ({ label: r.name, href: `/routes/${r.slug}` })),
}));

const linkClass = 'transition-colors hover:text-white';

// Service names (SEO) — each points to the existing page that covers it
const columns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'Services',
    links: [
      { label: 'Bangalore Airport Taxi', href: '/airport-taxi' },
      { label: 'Outstation Cab Service', href: '/outstation-cabs' },
      { label: 'Round-Trip Cab Rental', href: '/outstation-cabs#routes' },
      { label: 'Local City Taxi', href: '/local-rides' },
      { label: 'Hourly Cab Rental (8 / 12 hr)', href: '/local-rides#packages' },
      { label: 'Custom Tour Packages', href: '/tour-packages' },
      { label: 'Corporate & Family Travel', href: '/contact' },
    ],
  },
  {
    title: 'Our fleet',
    links: [
      { label: 'Toyota Innova Rental', href: '/innova-rental-bangalore' },
      { label: 'Innova Crysta Rental', href: '/innova-crysta-rental-bangalore' },
      { label: 'Innova Hycross Rental', href: '/innova-hycross-rental-bangalore' },
      { label: 'Maruti Ertiga Rental', href: '/ertiga-rental-bangalore' },
      { label: 'Compare All Cars', href: '/vehicles#compare' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'All Outstation Routes', href: '/routes' },
      { label: 'Frequently Asked Questions', href: '/faq' },
      { label: 'Contact & Booking', href: '/contact' },
    ],
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="ds-scope bg-ink pb-[calc(8rem+env(safe-area-inset-bottom))] pt-14 text-slate-300 lg:pb-14">
      <div className="section grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-[1.4fr_repeat(3,1fr)_1.4fr]">
        {/* Brand */}
        <div className="col-span-2 md:col-span-3 lg:col-span-1">
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
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2 pb-4 text-sm text-slate-400">
                {g.routes.map((r) => (
                  <li key={r.href} className="min-w-0">
                    <Link href={r.href} className={linkClass}>
                      {r.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
        <div className="mt-5 hidden gap-8 md:grid md:grid-cols-3">
          {routeGroups.map((g) => (
            <div key={g.title}>
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

      <div className="section mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:justify-between">
        <p>
          © {currentYear} {siteConfig.brand.name}. All rights reserved.
        </p>
        <p>Payments: {siteConfig.payments.methods.join(' · ')}</p>
      </div>
    </footer>
  );
}
