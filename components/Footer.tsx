import Link from 'next/link';
import { Phone, Mail, MapPin, Clock, MessageCircle, ShieldCheck } from 'lucide-react';
import { siteConfig } from '@/lib/siteConfig';
import Logo from '@/components/Logo';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-navy text-gray-300 pt-16 pb-24 md:pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-white/10">
          
          {/* Column 1: Brand & Identity */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Logo variant="mark" className="h-12 w-auto" />
            </Link>
            
            <p className="text-sm text-gray-300 leading-relaxed">
              {siteConfig.brand.tagline}
            </p>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300 space-y-1.5">
              <div className="flex items-center gap-2 text-brand-orange font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Our Promise</span>
              </div>
              <p className="italic text-gray-200">
                &ldquo;{siteConfig.brand.closingLine}&rdquo;
              </p>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
              Quick Navigation
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/airport-taxi" className="hover:text-brand-orange transition-colors">
                  Airport Pickup & Drop
                </Link>
              </li>
              <li>
                <Link href="/outstation-cabs" className="hover:text-brand-orange transition-colors">
                  Outstation Cabs
                </Link>
              </li>
              <li>
                <Link href="/local-rides" className="hover:text-brand-orange transition-colors">
                  Local City Rental
                </Link>
              </li>
              <li>
                <Link href="/tour-packages" className="hover:text-brand-orange transition-colors">
                  Custom Tour Packages
                </Link>
              </li>
              <li>
                <Link href="/vehicles" className="hover:text-brand-orange transition-colors">
                  Our Innova Fleet
                </Link>
              </li>
              <li>
                <Link href="/routes" className="hover:text-brand-orange transition-colors">
                  Popular Travel Routes
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-brand-orange transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-brand-orange transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-orange transition-colors">
                  Contact & Booking
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Fleet & Top Routes */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
              Vehicle Models
            </h3>
            <ul className="space-y-2.5 text-sm mb-6">
              <li>
                <Link href="/innova-rental-bangalore" className="hover:text-brand-orange transition-colors">
                  Innova Cab Rental
                </Link>
              </li>
              <li>
                <Link href="/innova-crysta-rental-bangalore" className="hover:text-brand-orange transition-colors">
                  Innova Crysta Rental
                </Link>
              </li>
              <li>
                <Link href="/innova-hycross-rental-bangalore" className="hover:text-brand-orange transition-colors">
                  Innova Hycross Rental
                </Link>
              </li>
            </ul>

            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-3">
              Popular Outstations
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {siteConfig.outstationDestinations.map((dest) => (
                <span
                  key={dest}
                  className="text-xs bg-white/5 text-gray-300 px-2.5 py-1 rounded-md border border-white/5"
                >
                  {dest}
                </span>
              ))}
            </div>
          </div>

          {/* Column 4: Contact & Exact NAP */}
          <div className="space-y-4">
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
              Contact & Location
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                <address className="not-italic text-gray-300 text-xs leading-relaxed">
                  {siteConfig.contact.address.full}
                </address>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-brand-orange shrink-0" />
                <a
                  href={siteConfig.contact.phone.tel}
                  className="hover:text-brand-orange font-medium text-white transition-colors"
                >
                  {siteConfig.contact.phone.display}
                </a>
              </div>

              <div className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href={siteConfig.contact.phone.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors"
                >
                  WhatsApp Quick Support
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-brand-orange shrink-0" />
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="hover:text-brand-orange text-xs transition-colors"
                >
                  {siteConfig.contact.email}
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-brand-orange shrink-0" />
                <span className="text-xs font-semibold text-emerald-400">
                  {siteConfig.contact.hours}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright & attribution */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400 gap-4">
          <p>© {currentYear} {siteConfig.brand.name}. All rights reserved.</p>
          <p className="text-center sm:text-right">
            Verified Innova, Crysta & Hycross Rental in Bangalore.
          </p>
        </div>
      </div>
    </footer>
  );
}
