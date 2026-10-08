'use client';

/**
 * HomeHeader.tsx — floating glass navigation pill (design.md §3.1).
 * Desktop: hover-intent dropdowns. Mobile (< lg): drop-in menu sheet.
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  Car,
  ChevronDown,
  Crown,
  Headphones,
  HelpCircle,
  Hourglass,
  Info,
  LayoutGrid,
  Map,
  Menu,
  Mountain,
  Phone,
  PlaneLanding,
  PlaneTakeoff,
  Route as RouteIcon,
  Sparkles,
  X,
  type LucideIcon,
} from 'lucide-react';
import { siteConfig } from '@/lib/siteConfig';
import { cn } from '@/lib/cn';
import { scrollToBook, scrollToId } from '@/components/home/scrollToBook';

interface NavItem {
  label: string;
  hint: string;
  href: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Airport',
    items: [
      { label: 'Airport Pickup', hint: 'BLR arrivals → your doorstep', href: '/airport-taxi', icon: PlaneLanding },
      { label: 'Airport Drop', hint: 'Your doorstep → BLR departures', href: '/airport-taxi', icon: PlaneTakeoff },
      { label: 'Airport ↔ City Route', hint: 'Kempegowda Airport to city hubs', href: '/routes/bangalore-airport-to-city', icon: RouteIcon },
    ],
  },
  {
    label: 'Outstation',
    items: [
      { label: 'Outstation Cabs', hint: 'Round trips from Bangalore, up to 3 stops', href: '/outstation-cabs', icon: Mountain },
      { label: 'Popular Routes', hint: 'Mysore, Coorg, Ooty, Wayanad & more', href: '/routes', icon: Map },
      { label: 'Tour Packages', hint: 'Custom multi-day itineraries', href: '/tour-packages', icon: Sparkles },
    ],
  },
  {
    label: 'Fleet',
    items: [
      { label: 'Toyota Innova', hint: 'Standard 7-seater', href: '/innova-rental-bangalore', icon: Car },
      { label: 'Toyota Innova Crysta', hint: 'Luxury 7-seater', href: '/innova-crysta-rental-bangalore', icon: Crown },
      { label: 'Maruti Suzuki Ertiga', hint: 'Compact 7-seater', href: '/ertiga-rental-bangalore', icon: Car },
      { label: 'Compare Fleet', hint: 'Seats, luggage & comfort side by side', href: '/vehicles#compare', icon: LayoutGrid },
    ],
  },
  {
    label: 'More',
    items: [
      { label: 'Local Hourly Rentals', hint: '8 hr, 12 hr & custom-duration hire', href: '/local-rides', icon: Hourglass },
      { label: 'About Us', hint: `${siteConfig.trustClaims.yearsExperience.value} years of Innova rentals`, href: '/about', icon: Building2 },
      { label: 'FAQ', hint: 'Fares, tolls, payments & more', href: '/faq', icon: HelpCircle },
      { label: 'Contact', hint: siteConfig.contact.hours, href: '/contact', icon: Info },
    ],
  },
];

function LiveDot({ tone = 'bg-live-500' }: { tone?: string }) {
  return (
    <span className="relative flex h-2 w-2">
      <span className={cn('absolute inline-flex h-full w-full animate-pulse-ring rounded-full', tone)} />
      <span className={cn('relative inline-flex h-2 w-2 rounded-full', tone)} />
    </span>
  );
}

function NavDropdown({ group }: { group: NavGroup }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();
  const wrapRef = useRef<HTMLDivElement>(null);

  const show = () => {
    clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hideSoon = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 140);
  };

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onPointer = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative" onMouseEnter={show} onMouseLeave={hideSoon}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors',
          open ? 'bg-slate-100 text-ink' : 'text-slate-600 hover:text-ink'
        )}
      >
        {group.label}
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="glass-strong absolute left-0 top-[calc(100%+10px)] w-80 bg-white/95 animate-drop-in rounded-3xl p-2">
          {group.items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="group flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition-colors hover:bg-slate-50"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-600 group-hover:text-white">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-ink">{item.label}</span>
                  <span className="block truncate text-xs text-slate-500">{item.hint}</span>
                </span>
                <ArrowRight className="h-4 w-4 -translate-x-1 text-slate-300 opacity-0 transition group-hover:translate-x-0 group-hover:text-brand-600 group-hover:opacity-100" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function HomeHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Body scroll lock + Esc while the mobile sheet is open
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const book = () => {
    setMenuOpen(false);
    scrollToBook();
  };

  return (
    <>
      <header className="ds-scope fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4">
        <div
          className={cn(
            'mx-auto flex max-w-7xl items-center gap-3 rounded-full py-2 pl-3 pr-2 transition-all duration-300 ease-premium sm:pl-4',
            scrolled ? 'glass-strong' : 'glass shadow-sm'
          )}
        >
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5" aria-label={`${siteConfig.brand.name} home`}>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-900 text-white shadow-glow">
              <Car className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <span className="leading-none">
              <span className="block text-[15px] font-extrabold tracking-tight text-ink">
                {siteConfig.brand.name}
              </span>
              <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-700">
                <Crown className="h-2.5 w-2.5" /> Premium · Bangalore
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="ml-4 hidden items-center gap-0.5 lg:flex" aria-label="Main">
            {navGroups.map((group) => (
              <NavDropdown key={group.label} group={group} />
            ))}
          </nav>

          {/* Utilities */}
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollToId('fleet')}
              className="hidden items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/80 px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:border-brand-300 hover:text-brand-700 xl:flex"
            >
              Rates <span className="font-extrabold text-ink">Innova · Crysta · Ertiga</span>
            </button>
            <a
              href={siteConfig.contact.phone.tel}
              className="hidden items-center gap-2 rounded-full border border-live-500/20 bg-live-500/10 px-3.5 py-2 text-xs font-bold text-live-600 transition hover:bg-live-500/15 md:flex"
            >
              <LiveDot />
              <Headphones className="h-3.5 w-3.5" />
              24/7 · {siteConfig.contact.phone.display}
            </a>
            <button type="button" onClick={book} className="btn-primary hidden px-5 py-2.5 sm:inline-flex">
              Book a Cab
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="relative z-50 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-ink lg:hidden"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu — compact panel under the header (not full screen) */}
      {menuOpen && (
        <div className="ds-scope lg:hidden">
          <div
            className="fixed inset-0 z-40 animate-fade-in bg-slate-900/20"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="glass-strong fixed inset-x-3 top-[72px] z-50 max-h-[min(70dvh,520px)] animate-drop-in overflow-y-auto rounded-3xl bg-white/95 p-2 sm:left-auto sm:right-4 sm:w-96"
          >
            {navGroups.map((group) => {
              const expanded = openGroup === group.label;
              return (
                <div key={group.label} className="border-b border-slate-100 last:border-b-0">
                  <button
                    type="button"
                    onClick={() => setOpenGroup(expanded ? null : group.label)}
                    aria-expanded={expanded}
                    className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-sm font-bold text-ink hover:bg-slate-50"
                  >
                    {group.label}
                    <ChevronDown className={cn('h-4 w-4 text-slate-400 transition-transform', expanded && 'rotate-180')} />
                  </button>
                  {expanded && (
                    <div className="animate-drop-in pb-2">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => setMenuOpen(false)}
                            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left hover:bg-slate-50"
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-semibold">{item.label}</span>
                              <span className="block truncate text-xs text-slate-500">{item.hint}</span>
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="mt-2 grid grid-cols-2 gap-2 p-1">
              <a href={siteConfig.contact.phone.tel} className="btn-ghost px-3 py-2.5">
                <Phone className="h-4 w-4" /> Call 24/7
              </a>
              <button type="button" onClick={book} className="btn-primary px-3 py-2.5">
                Book a Cab
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
