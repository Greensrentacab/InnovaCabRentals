'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, MessageCircle, Menu, X, ArrowRight } from 'lucide-react';
import { siteConfig } from '@/lib/siteConfig';
import Logo from '@/components/Logo';

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
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const closeMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-brand-navy text-white transition-shadow duration-300 ${
        scrolled ? 'shadow-[0_8px_24px_-12px_rgba(0,0,0,0.55)]' : 'shadow-none'
      }`}
    >
      {/* Top micro-bar for phone & quick status */}
      <div className="hidden lg:block border-b border-white/[0.08] bg-brand-navy-dark text-xs py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-gray-400">
          <div className="flex items-center gap-3.5">
            <span className="font-medium text-gray-300">{siteConfig.contact.hours}</span>
            <span className="text-white/15">|</span>
            <span>{siteConfig.brand.closingLine}</span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href={siteConfig.contact.phone.tel}
              className="group flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-brand-orange" />
              <span className="tabular-nums tracking-wide group-hover:tracking-wider transition-[letter-spacing]">
                {siteConfig.contact.phone.display}
              </span>
            </a>
            <span className="h-3 w-px bg-white/15" aria-hidden="true" />
            <a
              href={siteConfig.contact.phone.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-gray-300 hover:text-emerald-400 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span>WhatsApp Quick Quote</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px] md:h-20 gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center shrink-0 py-2" onClick={closeMenu}>
            <Logo variant="mark" className="h-10 md:h-11 w-auto" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative px-3 py-2 mx-0.5 text-[13px] font-semibold tracking-wide uppercase transition-colors ${
                    active ? 'text-white' : 'text-gray-400 hover:text-white'
                  } after:content-[''] after:absolute after:left-3 after:right-3 after:-bottom-[3px] after:h-[2px] after:rounded-full after:bg-brand-orange after:origin-center after:transition-transform after:duration-300 ${
                    active
                      ? 'after:scale-x-100'
                      : 'after:scale-x-0 hover:after:scale-x-100'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTAs: Call, WhatsApp, Book Now */}
          <div className="hidden lg:flex items-center gap-2 pl-4 ml-1 border-l border-white/[0.08]">
            <a
              href={siteConfig.contact.phone.tel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-white/90 text-xs font-semibold border border-white/15 hover:border-white/30 hover:bg-white/[0.06] transition-colors"
              title="Call Now"
            >
              <Phone className="w-3.5 h-3.5 text-brand-orange" />
              <span>Call</span>
            </a>

            <a
              href={siteConfig.contact.phone.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-[0_4px_14px_-4px_rgba(5,150,105,0.55)] hover:shadow-[0_6px_18px_-4px_rgba(5,150,105,0.65)] transition-all"
              title="WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>

            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold tracking-wide shadow-[0_4px_16px_-4px_rgba(240,86,43,0.6)] hover:shadow-[0_8px_22px_-4px_rgba(240,86,43,0.75)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all"
            >
              <span>Book Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Button (min 44x44 target) */}
          <div className="flex lg:hidden items-center gap-2">
            <a
              href={siteConfig.contact.phone.tel}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full border border-white/15 text-brand-orange hover:bg-white/[0.06] transition-colors"
              aria-label="Call Now"
            >
              <Phone className="w-5 h-5" />
            </a>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-gray-200 hover:text-white hover:bg-white/[0.06] transition-colors"
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Full-Screen Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-50 bg-brand-navy flex flex-col justify-between overflow-y-auto px-6 py-8 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-4">
            <div className="border-b border-white/10 pb-4">
              <span className="text-xs uppercase tracking-[0.2em] text-gray-500 font-semibold">
                Navigation
              </span>
            </div>

            <nav className="flex flex-col">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    aria-current={active ? 'page' : undefined}
                    className={`min-h-[44px] flex items-center justify-between text-lg font-medium border-b border-white/5 py-2.5 transition-colors ${
                      active ? 'text-brand-orange' : 'text-gray-100 hover:text-brand-orange'
                    }`}
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="w-4 h-4 text-gray-500" />
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Mobile Menu Bottom Contact & Actions */}
          <div className="pt-8 pb-12 flex flex-col gap-3">
            <a
              href={siteConfig.contact.phone.tel}
              onClick={closeMenu}
              className="min-h-[44px] w-full flex items-center justify-center gap-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white font-semibold text-base py-3 border border-white/15"
            >
              <Phone className="w-5 h-5 text-brand-orange" />
              <span>Call {siteConfig.contact.phone.display}</span>
            </a>

            <a
              href={siteConfig.contact.phone.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
              className="min-h-[44px] w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-base py-3 shadow-[0_4px_14px_-4px_rgba(5,150,105,0.55)]"
            >
              <MessageCircle className="w-5 h-5" />
              <span>WhatsApp Us</span>
            </a>

            <Link
              href="/contact"
              onClick={closeMenu}
              className="min-h-[44px] w-full flex items-center justify-center gap-2 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-base py-3 shadow-[0_6px_20px_-4px_rgba(240,86,43,0.65)]"
            >
              <span>Book Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <div className="mt-4 text-center text-xs text-gray-500 space-y-1">
              <p>{siteConfig.contact.address.full}</p>
              <p className="text-gray-400 font-medium">{siteConfig.contact.hours}</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
