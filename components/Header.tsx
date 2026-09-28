'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Phone, MessageCircle, Menu, X, ArrowRight } from 'lucide-react';
import { siteConfig } from '@/lib/siteConfig';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Airport Taxi', href: '/airport-taxi' },
  { label: 'Outstation', href: '/outstation-cabs' },
  { label: 'Local Rides', href: '/local-rides' },
  { label: 'Tour Packages', href: '/tour-packages' },
  { label: 'Vehicles', href: '/vehicles' },
  { label: 'Routes', href: '/routes' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-brand-navy text-white shadow-md transition-all">
      {/* Top micro-bar for phone & quick status */}
      <div className="hidden lg:block border-b border-white/10 bg-brand-navy-dark text-xs py-1.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-gray-300">
          <div className="flex items-center gap-4">
            <span>{siteConfig.contact.hours}</span>
            <span>•</span>
            <span>{siteConfig.brand.closingLine}</span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href={siteConfig.contact.phone.tel}
              className="hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-brand-orange" />
              <span>{siteConfig.contact.phone.display}</span>
            </a>
            <a
              href={siteConfig.contact.phone.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 flex items-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp Quick Quote</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Brand Wordmark Placeholder */}
          <Link href="/" className="flex flex-col group py-2" onClick={closeMenu}>
            <span className="text-xl md:text-2xl font-bold tracking-tight text-white group-hover:text-gray-100 transition-colors">
              INNOVA <span className="text-brand-orange font-extrabold">CABS</span>
            </span>
            <span className="text-[10px] md:text-xs font-medium tracking-wider uppercase text-gray-300">
              Bangalore
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1 lg:space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-200 hover:text-white hover:bg-white/5 px-2.5 py-1.5 rounded-md transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTAs: Call, WhatsApp, Book Now */}
          <div className="hidden lg:flex items-center gap-2.5">
            <a
              href={siteConfig.contact.phone.tel}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/10"
              title="Call Now"
            >
              <Phone className="w-3.5 h-3.5 text-brand-orange" />
              <span>Call</span>
            </a>

            <a
              href={siteConfig.contact.phone.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all"
              title="WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>

            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
            >
              <span>Book Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Button (min 44x44 target) */}
          <div className="flex lg:hidden items-center gap-2">
            <a
              href={siteConfig.contact.phone.tel}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-lg bg-white/10 text-brand-orange hover:bg-white/20"
              aria-label="Call Now"
            >
              <Phone className="w-5 h-5" />
            </a>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-lg text-gray-200 hover:text-white hover:bg-white/10 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Full-Screen Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-50 bg-brand-navy flex flex-col justify-between overflow-y-auto px-6 py-8 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-4">
            <div className="border-b border-white/10 pb-4">
              <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                Navigation
              </span>
            </div>

            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="min-h-[44px] flex items-center justify-between text-lg font-medium text-gray-100 hover:text-brand-orange border-b border-white/5 py-2"
                >
                  <span>{link.label}</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </Link>
              ))}
            </nav>
          </div>

          {/* Mobile Menu Bottom Contact & Actions */}
          <div className="pt-8 pb-12 flex flex-col gap-3">
            <a
              href={siteConfig.contact.phone.tel}
              onClick={closeMenu}
              className="min-h-[44px] w-full flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-base py-3 border border-white/15"
            >
              <Phone className="w-5 h-5 text-brand-orange" />
              <span>Call {siteConfig.contact.phone.display}</span>
            </a>

            <a
              href={siteConfig.contact.phone.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
              className="min-h-[44px] w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-base py-3"
            >
              <MessageCircle className="w-5 h-5" />
              <span>WhatsApp Us</span>
            </a>

            <Link
              href="/contact"
              onClick={closeMenu}
              className="min-h-[44px] w-full flex items-center justify-center gap-2 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-base py-3 shadow-lg"
            >
              <span>Book Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <div className="mt-4 text-center text-xs text-gray-400 space-y-1">
              <p>{siteConfig.contact.address.full}</p>
              <p className="text-gray-300 font-medium">{siteConfig.contact.hours}</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
