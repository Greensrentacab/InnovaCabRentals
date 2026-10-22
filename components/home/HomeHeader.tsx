'use client';

/**
 * HomeHeader.tsx — floating glass navigation pill (design.md §3.1).
 * Desktop: hover-intent dropdowns + account pill (UserMenu). Mobile (< lg):
 * drop-in menu sheet with the account block at the top.
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import {
  ArrowRight,
  Building2,
  CalendarClock,
  Car,
  ChevronDown,
  Crown,
  Headphones,
  HelpCircle,
  Hourglass,
  Info,
  LayoutGrid,
  LogOut,
  Map,
  Menu,
  Mountain,
  Phone,
  PlaneLanding,
  PlaneTakeoff,
  Route as RouteIcon,
  Sparkles,
  UserRound,
  X,
  type LucideIcon,
} from 'lucide-react';
import { siteConfig } from '@/lib/siteConfig';
import { cn } from '@/lib/cn';
import { scrollToBook, scrollToId } from '@/components/home/scrollToBook';
import { useAuth } from '@/context/AuthContext';
import UserMenu from '@/components/auth/UserMenu';
import UserAvatar from '@/components/auth/UserAvatar';

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
      { label: 'Airport Pickup', hint: 'BLR arrivals → your doorstep', href: '/bangalore-airport-taxi', icon: PlaneLanding },
      { label: 'Airport Drop', hint: 'Your doorstep → BLR departures', href: '/bangalore-airport-taxi', icon: PlaneTakeoff },
      { label: 'Airport ↔ City Route', hint: 'Kempegowda Airport to city hubs', href: '/routes/bangalore-airport-to-city', icon: RouteIcon },
    ],
  },
  {
    label: 'Outstation',
    items: [
      { label: 'Outstation Cabs', hint: 'Round trips from Bangalore, up to 3 stops', href: '/bangalore-outstation-cab-service', icon: Mountain },
      { label: 'Popular Routes', hint: 'Mysore, Coorg, Ooty, Wayanad & more', href: '/routes', icon: Map },
      { label: 'Tour Packages', hint: 'Custom multi-day itineraries', href: '/bangalore-tour-packages', icon: Sparkles },
    ],
  },
  {
    label: 'Fleet',
    items: [
      { label: 'Maruti Suzuki Ertiga', hint: 'Compact 7-seater', href: '/ertiga-rental-bangalore', icon: Car },
      { label: 'Toyota Innova', hint: 'Standard 7-seater', href: '/innova-rental-bangalore', icon: Car },
      { label: 'Toyota Innova Crysta', hint: 'Luxury 7-seater', href: '/innova-crysta-rental-bangalore', icon: Crown },
      { label: 'Toyota Innova Hycross', hint: 'Premium hybrid 7-seater', href: '/innova-hycross-rental-bangalore', icon: Sparkles },
      { label: 'Compare Fleet', hint: 'Seats, luggage & comfort side by side', href: '/vehicles#compare', icon: LayoutGrid },
    ],
  },
  {
    label: 'More',
    items: [
      { label: 'Local & Hourly Rentals', hint: '8 hr, 12 hr & custom-duration hire', href: '/bangalore-local-city-taxi', icon: Hourglass },
      { label: 'About Us', hint: `${siteConfig.trustClaims.yearsExperience.value}+ years of trusted travel`, href: '/about-us', icon: Building2 },
      { label: 'FAQ', hint: 'Fares, tolls, payments & more', href: '/frequently-asked-questions', icon: HelpCircle },
      { label: 'Contact', hint: siteConfig.contact.hours, href: '/contact-and-booking', icon: Info },
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

/** Desktop nav: one dropdown open at a time (hover-intent, click, Esc, outside tap). */
function DesktopNav() {
  const [openLabel, setOpenLabel] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();
  const navRef = useRef<HTMLElement>(null);

  const show = (label: string) => {
    clearTimeout(closeTimer.current);
    setOpenLabel(label);
  };
  const hideSoon = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenLabel(null), 160);
  };

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  useEffect(() => {
    if (!openLabel) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenLabel(null);
    const onPointer = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpenLabel(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [openLabel]);

  return (
    <nav ref={navRef} className="ml-4 hidden items-center gap-0.5 lg:flex" aria-label="Main" onMouseLeave={hideSoon}>
      {navGroups.map((group) => (
        <NavDropdown
          key={group.label}
          group={group}
          open={openLabel === group.label}
          onEnter={() => show(group.label)}
          onToggle={() => setOpenLabel((cur) => (cur === group.label ? null : group.label))}
          onClose={() => setOpenLabel(null)}
        />
      ))}
    </nav>
  );
}

function NavDropdown({
  group,
  open,
  onEnter,
  onToggle,
  onClose,
}: {
  group: NavGroup;
  open: boolean;
  onEnter: () => void;
  onToggle: () => void;
  onClose: () => void;
}) {
  return (
    <div className="relative" onMouseEnter={onEnter}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={onToggle}
        className={cn(
          'flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors',
          open ? 'bg-slate-100 text-ink' : 'text-slate-600 hover:text-ink'
        )}
      >
        {group.label}
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-80 animate-drop-in rounded-3xl border border-slate-200/80 bg-white p-2 shadow-float-lg">
          {group.items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
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
  const { user, profile, signOut } = useAuth();

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
        {/* Blurred strip across the top edge once the page scrolls, fading out downwards */}
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-x-0 top-0 -z-10 h-24 bg-white/40 backdrop-blur-lg transition-opacity duration-300 [-webkit-mask-image:linear-gradient(to_bottom,#000_50%,transparent)] [mask-image:linear-gradient(to_bottom,#000_50%,transparent)]',
            scrolled ? 'opacity-100' : 'opacity-0'
          )}
        />
        <div
          className={cn(
            'mx-auto flex max-w-7xl items-center gap-3 rounded-full py-2 pl-3 pr-2 transition-all duration-300 ease-premium sm:pl-4',
            scrolled ? 'glass-strong' : 'glass shadow-sm'
          )}
        >
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5" aria-label={`${siteConfig.brand.name} home`}>
            <Logo halo={!scrolled} className="h-11 w-auto sm:h-[3.25rem]" />
          </Link>

          {/* Desktop nav */}
          <DesktopNav />

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
            <UserMenu />
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
            className="glass-strong fixed inset-x-3 top-[72px] z-50 max-h-[min(76dvh,600px)] animate-drop-in overflow-y-auto rounded-3xl bg-white/95 p-2 sm:left-auto sm:right-4 sm:w-96"
          >
            {/* Account */}
            {(user ? (
                <div className="mb-1 rounded-2xl bg-slate-50 p-2">
                  <div className="flex items-center gap-3 p-1.5">
                    <UserAvatar
                      name={profile?.displayName || user.displayName}
                      email={user.email}
                      photoURL={profile?.photoURL ?? user.photoURL}
                      size="md"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-extrabold text-ink">
                        {profile?.displayName || user.displayName || 'Your account'}
                      </span>
                      <span className="block truncate text-xs text-slate-500">{user.email}</span>
                    </span>
                  </div>
                  <div className="mt-1 grid grid-cols-3 gap-1.5">
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex flex-col items-center gap-1 rounded-xl bg-white px-2 py-2 text-[11px] font-bold text-ink ring-1 ring-slate-200/80"
                    >
                      <UserRound className="h-4 w-4 text-brand-600" /> Profile
                    </Link>
                    <Link
                      href="/profile?tab=bookings"
                      onClick={() => setMenuOpen(false)}
                      className="flex flex-col items-center gap-1 rounded-xl bg-white px-2 py-2 text-[11px] font-bold text-ink ring-1 ring-slate-200/80"
                    >
                      <CalendarClock className="h-4 w-4 text-brand-600" /> My Bookings
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        void signOut();
                      }}
                      className="flex flex-col items-center gap-1 rounded-xl bg-white px-2 py-2 text-[11px] font-bold text-rose-600 ring-1 ring-slate-200/80"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-1 grid grid-cols-2 gap-2 p-1">
                  <Link href="/signin" onClick={() => setMenuOpen(false)} className="btn-primary px-3 py-2.5">
                    <UserRound className="h-4 w-4" /> Sign In
                  </Link>
                  <Link href="/signup" onClick={() => setMenuOpen(false)} className="btn-ghost px-3 py-2.5">
                    Create Account
                  </Link>
                </div>
              ))}

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
