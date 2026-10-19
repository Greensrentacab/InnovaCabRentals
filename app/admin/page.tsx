'use client';

/**
 * app/admin/page.tsx
 *
 * Master Operations & Dispatch Console for Innova Cab Rentals.
 * Layout: fixed dark sidebar on desktop, top bar + slide-in drawer on mobile.
 * Handles:
 * - Real-time Booking Approval & Chauffeur Assignment
 * - Direct WhatsApp (wa.me) & Phone Customer Communication
 * - Pricing & Tariff Management (nullable per client policy)
 * - Fleet Activation (Innova, Crysta, Hycross toggle)
 * - Tour & Contact Enquiries Lead Management
 * - Homepage images and Terms & policies (published without a deployment)
 * - New booking / new user alerts: live toast + chime while open, device push
 *   notifications (Firebase Cloud Messaging) when the site is closed
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import {
  Car,
  Users,
  Calendar,
  MapPin,
  Phone,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
  ExternalLink,
  Search,
  UserCheck,
  Tag,
  Compass,
  X,
  Send,
  Menu,
  ChevronRight,
  ArrowRight,
  Clock,
  Briefcase,
  UserRound,
  Save,
  Undo2,
  Image as ImageIcon,
  FileText,
  Bell,
  BellRing,
} from 'lucide-react';
import WhatsAppIcon from '@/components/ds/WhatsAppIcon';
import {
  verifyAdminSession,
  getAdminDashboardData,
  updateBookingStatus,
  assignDriverToBooking,
  toggleVehicleActive,
  updateEnquiryStatus,
  updateVehicleRates,
  adminLogout,
  getAdminActivity,
  sendTestAdminAlert,
  AdminDashboardData,
  AdminUserRow,
} from '@/app/actions/admin';
import { Booking, BookingStatus, Enquiry } from '@/lib/types';
import { siteConfig } from '@/lib/siteConfig';
import { formatTime12 } from '@/lib/time';
import VehicleRatesEditor, {
  RateInputs,
  toInputs,
  inputsToRates,
  ratesProblem,
  ratesSetCount,
} from '@/components/admin/VehicleRatesEditor';
import HomepageImagesPanel from '@/components/admin/HomepageImagesPanel';
import PoliciesPanel from '@/components/admin/PoliciesPanel';
import { PushState, getPushState, enablePush, disablePush, refreshPushToken } from '@/lib/adminPushClient';

type AdminTab = 'overview' | 'bookings' | 'users' | 'pricing' | 'fleet' | 'enquiries' | 'images' | 'policies';

const ADMIN_TABS: AdminTab[] = ['overview', 'bookings', 'users', 'pricing', 'fleet', 'enquiries', 'images', 'policies'];

/** How often the open console checks for new bookings and sign-ups. */
const ACTIVITY_POLL_MS = 30_000;

/** Tabs that keep their own unpublished work, so they stay mounted once opened. */
const PERSISTENT_TABS: AdminTab[] = ['images', 'policies'];

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  DRIVER_ASSIGNED: 'Assigned',
  TRIP_STARTED: 'On trip',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

/** Pickup timing hint for open bookings: 'passed' | 'today' | 'tomorrow' | null */
function pickupHint(b: Booking, now: Date | null): 'passed' | 'today' | 'tomorrow' | null {
  if (!now || (b.bookingStatus !== 'PENDING' && b.bookingStatus !== 'CONFIRMED')) return null;
  const [y, m, d] = (b.pickupDate || '').split('-').map(Number);
  if (!y || !m || !d) return null;
  const [hh, mm] = (b.pickupTime || '0:0').split(':').map(Number);
  const at = new Date(y, m - 1, d, hh || 0, mm || 0);
  if (Number.isNaN(at.getTime())) return null;
  if (at.getTime() < now.getTime()) return 'passed';
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayDiff = Math.round((new Date(y, m - 1, d).getTime() - startToday.getTime()) / 86400000);
  return dayDiff === 0 ? 'today' : dayDiff === 1 ? 'tomorrow' : null;
}

function formatPickup(b: Booking) {
  const [y, m, d] = (b.pickupDate || '').split('-').map(Number);
  const date =
    y && m && d
      ? new Date(y, m - 1, d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : b.pickupDate;
  return `${date} · ${formatTime12(b.pickupTime)}`;
}

export default function AdminDashboardPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [openedTabs, setOpenedTabs] = useState<AdminTab[]>([]);
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [navOpen, setNavOpen] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Bookings filter & search
  const [bookingSearch, setBookingSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [enquiryFilter, setEnquiryFilter] = useState<string>('ALL');
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState<'ALL' | 'BOOKED' | 'NEVER' | 'NO_PHONE'>('ALL');

  // Assign Driver Modal State
  const [assignModalBooking, setAssignModalBooking] = useState<Booking | null>(null);
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [vehicleReg, setVehicleReg] = useState('');
  const [driverSubmitting, setDriverSubmitting] = useState(false);

  // Pricing drafts (one input set per vehicle) + saved baseline
  const [rateDrafts, setRateDrafts] = useState<Record<string, RateInputs>>({});
  const [rateBaseline, setRateBaseline] = useState<Record<string, RateInputs>>({});
  const [savingRates, setSavingRates] = useState(false);
  const [rateError, setRateError] = useState<string | null>(null);

  // Alerts: this device's push status, plus what the live poll has already seen
  const [pushState, setPushState] = useState<PushState | null>(null);
  const [pushBusy, setPushBusy] = useState(false);
  const pushStateRef = useRef<PushState | null>(null);
  pushStateRef.current = pushState;
  const seenRef = useRef<Set<string>>(new Set());
  const cursorRef = useRef<string | null>(null);
  const checkingRef = useRef(false);
  const audioRef = useRef<AudioContext | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await getAdminDashboardData();
      setData(res);
      const next = Object.fromEntries(res.vehicles.map((v) => [v.id, toInputs(v.rates)]));
      setRateBaseline(next);
      setRateDrafts(next);
      setNow(new Date());
    } catch (err) {
      console.error('[Admin] Error loading dashboard data:', err);
      setLoadError(true);
      showToast('Error loading live operations data.');
    } finally {
      setLoading(false);
    }
  };

  /** Refresh the data in place (no spinner, unsaved pricing drafts untouched). */
  const refreshLive = async () => {
    try {
      setData(await getAdminDashboardData());
      setNow(new Date());
    } catch (err) {
      console.error('[Admin] Live refresh failed:', err);
    }
  };

  /** Opens the tab (and search) named in an alert link like /admin?tab=bookings&q=ICB-10482. */
  const applyDeepLink = (href: string) => {
    const params = new URL(href, window.location.origin).searchParams;
    const tab = params.get('tab') as AdminTab | null;
    if (!tab || !ADMIN_TABS.includes(tab)) return;
    const q = params.get('q') ?? '';
    if (tab === 'bookings') {
      setBookingSearch(q);
      setStatusFilter('ALL');
    } else if (tab === 'users') {
      setUserSearch(q);
      setUserFilter('ALL');
    }
    goTab(tab);
  };

  useEffect(() => {
    async function init() {
      const isAuth = await verifyAdminSession();
      if (!isAuth) {
        router.replace('/admin/login');
        return;
      }
      setAuthChecked(true);
      applyDeepLink(window.location.href);
      if (window.location.search) window.history.replaceState(null, '', '/admin');
      loadData();
      getPushState()
        .then((state) => {
          setPushState(state);
          if (state === 'on') refreshPushToken().catch((err) => console.warn('[Admin] Push token refresh failed:', err));
        })
        .catch(() => setPushState('unsupported'));
    }
    init();
  }, []);

  // Everything already on screen counts as seen, so only genuinely new items alert
  useEffect(() => {
    if (!data) return;
    data.bookings.forEach((b) => seenRef.current.add(`b:${b.bookingId}`));
    data.users.forEach((u) => seenRef.current.add(`u:${u.uid}`));
  }, [data]);

  // Browsers only allow sound after a tap on the page, so the chime is unlocked on the first one
  useEffect(() => {
    const unlock = () => {
      if (audioRef.current) return;
      try {
        audioRef.current = new AudioContext();
      } catch {
        // No Web Audio: alerts stay silent
      }
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    return () => window.removeEventListener('pointerdown', unlock);
  }, []);

  const playChime = () => {
    const ctx = audioRef.current;
    if (!ctx) return;
    ctx.resume().catch(() => undefined);
    [880, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + i * 0.18;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.4);
    });
  };

  /** Poll for bookings/sign-ups created since the last check and announce new ones. */
  const checkActivity = useCallback(async () => {
    if (checkingRef.current) return;
    checkingRef.current = true;
    try {
      // Overlap each window by 2 minutes; already-seen items are skipped below
      const since = cursorRef.current
        ? new Date(new Date(cursorRef.current).getTime() - 120_000).toISOString()
        : new Date(Date.now() - 10 * 60_000).toISOString();
      const activity = await getAdminActivity(since);
      cursorRef.current = activity.serverTime;

      const seen = seenRef.current;
      const newBookings = activity.bookings.filter((b) => !seen.has(`b:${b.bookingId}`));
      const newUsers = activity.users.filter((u) => !seen.has(`u:${u.uid}`));
      if (newBookings.length === 0 && newUsers.length === 0) return;
      newBookings.forEach((b) => seen.add(`b:${b.bookingId}`));
      newUsers.forEach((u) => seen.add(`u:${u.uid}`));

      const parts: string[] = [];
      if (newBookings.length === 1) parts.push(`New booking #${newBookings[0].bookingId} from ${newBookings[0].customerName}`);
      else if (newBookings.length > 1) parts.push(`${newBookings.length} new bookings`);
      if (newUsers.length === 1) parts.push(`New user: ${newUsers[0].name || newUsers[0].email}`);
      else if (newUsers.length > 1) parts.push(`${newUsers.length} new users signed up`);
      const message = parts.join(' · ');

      showToast(message);
      playChime();
      // With device push on, the service worker already shows the system notification
      if (
        document.visibilityState === 'hidden' &&
        pushStateRef.current !== 'on' &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        try {
          new Notification(newBookings.length ? 'New booking' : 'New user signed up', { body: message, icon: '/logo-car.png' });
        } catch {
          // Android Chrome only allows notifications from a service worker
        }
      }
      refreshLive();
    } catch (err) {
      console.warn('[Admin] Activity check failed:', err);
    } finally {
      checkingRef.current = false;
    }
  }, []);

  const dataReady = data !== null;
  useEffect(() => {
    if (!authChecked || !dataReady) return;
    checkActivity();
    const timer = window.setInterval(checkActivity, ACTIVITY_POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') checkActivity();
    };
    document.addEventListener('visibilitychange', onVisible);

    // Messages from public/firebase-messaging-sw.js: a push arrived, or a notification was tapped
    const sw = 'serviceWorker' in navigator ? navigator.serviceWorker : null;
    const onSwMessage = (event: MessageEvent) => {
      if (event.data?.type === 'admin-alert') checkActivity();
      if (event.data?.type === 'admin-open' && typeof event.data.url === 'string') {
        applyDeepLink(event.data.url);
        refreshLive();
      }
    };
    sw?.addEventListener('message', onSwMessage);
    sw?.startMessages();

    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
      sw?.removeEventListener('message', onSwMessage);
    };
  }, [authChecked, dataReady, checkActivity]);

  const togglePush = async () => {
    setPushBusy(true);
    try {
      if (pushState === 'on') {
        setPushState(await disablePush());
        showToast('Alerts turned off on this device');
      } else {
        const state = await enablePush();
        setPushState(state);
        showToast(
          state === 'on'
            ? 'Alerts on: this device will be notified of new bookings and sign-ups'
            : state === 'blocked'
              ? 'Notifications are blocked for this site in your browser settings'
              : 'Alerts were not turned on'
        );
      }
    } catch (err: any) {
      console.error('[Admin] Push toggle failed:', err);
      showToast(err?.message || 'Could not change alerts on this device');
    } finally {
      setPushBusy(false);
    }
  };

  const handleTestAlert = async () => {
    setPushBusy(true);
    const res = await sendTestAdminAlert().catch(() => ({ success: false, error: 'Could not send a test alert' }));
    setPushBusy(false);
    showToast(
      res.success
        ? 'Test alert sent. Switch away from this tab to see it as a notification.'
        : res.error || 'Could not send a test alert'
    );
  };

  // Lock page scroll while the mobile drawer or the modal is open
  useEffect(() => {
    const lock = navOpen || !!assignModalBooking;
    document.body.style.overflow = lock ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [navOpen, assignModalBooking]);

  const goTab = (tab: AdminTab) => {
    setActiveTab(tab);
    if (PERSISTENT_TABS.includes(tab)) setOpenedTabs((t) => (t.includes(tab) ? t : [...t, tab]));
    setNavOpen(false);
    window.scrollTo({ top: 0 });
  };

  const handleLogout = async () => {
    await adminLogout();
    router.push('/admin/login');
  };

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    const res = await updateBookingStatus(bookingId, newStatus);
    if (res.success) {
      showToast(`Booking #${bookingId} updated to ${newStatus}`);
      loadData();
    } else {
      showToast(res.error || 'Failed to update status');
    }
  };

  const handleOpenAssignDriver = (booking: Booking) => {
    setAssignModalBooking(booking);
    setDriverName(booking.driverName || '');
    setDriverPhone(booking.driverPhone || '');
    setVehicleReg(booking.vehicleRegistration || '');
  };

  const handleSaveDriverAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalBooking) return;

    setDriverSubmitting(true);
    const res = await assignDriverToBooking(assignModalBooking.bookingId, {
      driverName,
      driverPhone,
      vehicleRegistration: vehicleReg,
    });
    setDriverSubmitting(false);

    if (res.success) {
      showToast(`Chauffeur ${driverName} assigned to #${assignModalBooking.bookingId}`);
      if (res.driverWhatsAppUrl) {
        window.open(res.driverWhatsAppUrl, '_blank');
      }
      setAssignModalBooking(null);
      loadData();
    } else {
      showToast(res.error || 'Failed to assign driver');
    }
  };

  const handleToggleVehicle = async (vehicleId: string, currentConfirmed: boolean) => {
    const res = await toggleVehicleActive(vehicleId, !currentConfirmed);
    if (res.success) {
      showToast(`Vehicle ${vehicleId} status updated!`);
      loadData();
    } else {
      showToast(res.error || 'Failed to toggle vehicle');
    }
  };

  const handleEnquiryStatus = async (id: string, status: Enquiry['status']) => {
    const res = await updateEnquiryStatus(id, status);
    if (res.success) {
      showToast(`Enquiry updated to ${status}`);
      loadData();
    }
  };

  // Pricing: dirty tracking + save all changed cars at once
  const dirtyVehicleIds = useMemo(
    () => Object.keys(rateDrafts).filter((id) => JSON.stringify(rateDrafts[id]) !== JSON.stringify(rateBaseline[id])),
    [rateDrafts, rateBaseline]
  );
  const hasRateChanges = dirtyVehicleIds.length > 0;
  // Incomplete tariffs (e.g. a minimum-km airport fare without its per-km rate) block saving
  const rateProblems = useMemo(
    () =>
      dirtyVehicleIds
        .map((id) => ({ id, problem: rateDrafts[id] ? ratesProblem(rateDrafts[id]) : null }))
        .filter((r): r is { id: string; problem: NonNullable<ReturnType<typeof ratesProblem>> } => r.problem !== null),
    [dirtyVehicleIds, rateDrafts]
  );

  const saveAllRates = async () => {
    if (rateProblems.length > 0) {
      const first = rateProblems[0];
      setRateError(`${data?.vehicles.find((v) => v.id === first.id)?.name || first.id}: ${first.problem.message}`);
      return;
    }
    setSavingRates(true);
    setRateError(null);
    const names: string[] = [];
    for (const id of dirtyVehicleIds) {
      const res = await updateVehicleRates(id, inputsToRates(rateDrafts[id]));
      if (!res.success) {
        setSavingRates(false);
        setRateError(res.error || 'Could not save tariffs');
        return;
      }
      names.push(data?.vehicles.find((v) => v.id === id)?.name || id);
    }
    setSavingRates(false);
    showToast(`Tariffs saved for ${names.join(', ')} — live across the website`);
    loadData();
  };

  const discardRates = () => {
    setRateDrafts(rateBaseline);
    setRateError(null);
  };

  const bookings = data?.bookings || [];
  const vehicles = data?.vehicles || [];
  const enquiries = data?.enquiries || [];
  const users = data?.users || [];
  const stats = data?.stats;

  const userMatches = (u: AdminUserRow, f: typeof userFilter) =>
    f === 'ALL' ? true : f === 'BOOKED' ? u.bookingCount > 0 : f === 'NEVER' ? u.bookingCount === 0 : !u.phone;
  const filteredUsers = users.filter((u) => {
    const q = userSearch.trim().toLowerCase();
    const qDigits = q.replace(/\D/g, '');
    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (qDigits.length > 0 && u.phone.includes(qDigits));
    return matchesSearch && userMatches(u, userFilter);
  });

  const filteredBookings = bookings.filter((b) => {
    const q = bookingSearch.toLowerCase();
    const matchesSearch =
      b.bookingId.toLowerCase().includes(q) ||
      b.customerName.toLowerCase().includes(q) ||
      b.customerPhone.includes(bookingSearch) ||
      (b.customerEmail ?? '').toLowerCase().includes(q) ||
      b.pickupName.toLowerCase().includes(q) ||
      b.dropName.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'ALL' ? true : b.bookingStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts: Record<string, number> = {
    ALL: bookings.length,
    PENDING: stats?.pendingBookings ?? 0,
    CONFIRMED: stats?.confirmedBookings ?? 0,
    DRIVER_ASSIGNED: stats?.activeTrips ?? 0,
    COMPLETED: stats?.completedTrips ?? 0,
  };

  const filteredEnquiries = enquiries.filter((e) => enquiryFilter === 'ALL' || e.status === enquiryFilter);

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-800';
      case 'CONFIRMED':
        return 'bg-brand-100 text-brand-800';
      case 'DRIVER_ASSIGNED':
        return 'bg-indigo-100 text-indigo-800';
      case 'TRIP_STARTED':
        return 'bg-sky-100 text-sky-800';
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-800';
      case 'CANCELLED':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const enquiryBadge = (status: Enquiry['status']) =>
    status === 'PENDING'
      ? 'bg-amber-100 text-amber-800'
      : status === 'CONTACTED'
        ? 'bg-brand-100 text-brand-800'
        : status === 'CONVERTED'
          ? 'bg-emerald-100 text-emerald-800'
          : 'bg-rose-100 text-rose-700';

  const tabs: { id: AdminTab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: Compass },
    { id: 'bookings', label: 'Bookings & Dispatch', icon: Calendar, count: stats?.pendingBookings },
    { id: 'users', label: 'Users', icon: UserRound, count: users.length || undefined },
    { id: 'pricing', label: 'Pricing & Tariffs', icon: Tag },
    { id: 'fleet', label: 'Fleet & Vehicles', icon: Car },
    { id: 'enquiries', label: 'Tour Enquiries', icon: Users, count: stats?.pendingEnquiries },
    { id: 'images', label: 'Homepage Images', icon: ImageIcon },
    { id: 'policies', label: 'Terms & Policies', icon: FileText },
  ];
  const activeLabel = tabs.find((t) => t.id === activeTab)?.label ?? '';

  const kpis = [
    { label: 'Total bookings', value: stats?.totalBookings ?? 0, hint: 'All time', tone: 'text-ink', icon: Calendar, iconBg: 'bg-slate-100 text-slate-600' },
    { label: 'Pending approval', value: stats?.pendingBookings ?? 0, hint: 'Action needed', tone: 'text-amber-700', icon: Clock, iconBg: 'bg-amber-100 text-amber-700' },
    { label: 'Assigned / active', value: stats?.activeTrips ?? 0, hint: 'Chauffeurs on duty', tone: 'text-indigo-700', icon: UserCheck, iconBg: 'bg-indigo-100 text-indigo-700' },
    { label: 'Completed trips', value: stats?.completedTrips ?? 0, hint: 'Finished', tone: 'text-emerald-700', icon: CheckCircle2, iconBg: 'bg-emerald-100 text-emerald-700' },
  ];

  const pipeline = [
    { label: 'Pending', value: stats?.pendingBookings ?? 0, bar: 'bg-amber-400', dot: 'bg-amber-400' },
    { label: 'Confirmed', value: stats?.confirmedBookings ?? 0, bar: 'bg-brand-600', dot: 'bg-brand-600' },
    { label: 'Assigned', value: stats?.activeTrips ?? 0, bar: 'bg-violet-500', dot: 'bg-violet-500' },
    { label: 'Completed', value: stats?.completedTrips ?? 0, bar: 'bg-emerald-500', dot: 'bg-emerald-500' },
  ];
  const pipelineTotal = pipeline.reduce((s, p) => s + p.value, 0);

  const carsWithoutRates = vehicles.filter((v) => ratesSetCount(toInputs(v.rates)) === 0);
  const hiddenVehicles = vehicles.filter((v) => !v.confirmed);
  const worthALook: { tone: string; title: string; text: string; go?: AdminTab }[] = [];
  if (carsWithoutRates.length > 0)
    worthALook.push({
      tone: 'bg-orange-500',
      title: `Set rates for ${carsWithoutRates.length} car${carsWithoutRates.length > 1 ? 's' : ''}`,
      text: 'Customers see “Price on request” until tariffs are filled in.',
      go: 'pricing',
    });
  hiddenVehicles.forEach((v) =>
    worthALook.push({
      tone: 'bg-brand-600',
      title: `${v.name} is hidden`,
      text: 'Activate it on the storefront once it is confirmed.',
      go: 'fleet',
    })
  );
  if (enquiries.length === 0)
    worthALook.push({
      tone: 'bg-slate-400',
      title: 'No tour enquiries yet',
      text: 'Leads from the tour-packages and contact forms will land here.',
      go: 'enquiries',
    });

  const hour = now?.getHours() ?? 12;
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateLabel = now?.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) ?? '';

  const overdueCount = bookings.filter((b) => b.bookingStatus === 'PENDING' && pickupHint(b, now) === 'passed').length;

  const pageTitle = 'text-2xl font-extrabold tracking-tight text-ink sm:text-[28px]';
  const smallBtn = 'inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all active:scale-[0.97] sm:min-h-[38px]';

  const sidebar = (
    <div className="flex h-full flex-col bg-[#0B1120] text-slate-300">
      <div className="flex items-center gap-3 px-5 pb-4 pt-6">
        <Logo tone="dark" className="h-9 w-auto" />
        <div className="sr-only leading-tight">
          <p className="truncate text-[15px] font-extrabold text-white">{siteConfig.brand.name}</p>
          <p className="truncate text-xs text-slate-400">Bangalore dispatch desk</p>
        </div>
        <button
          type="button"
          onClick={() => setNavOpen(false)}
          aria-label="Close menu"
          className="ml-auto flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="px-5">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Operations live
        </span>
      </div>

      <nav role="tablist" aria-label="Admin sections" className="mt-5 flex-1 space-y-1 overflow-y-auto px-3">
        {tabs.map(({ id, label, icon: Icon, count }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => goTab(id)}
              className={`flex min-h-[48px] w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-bold transition-colors ${
                active ? 'bg-brand-800/80 text-white ring-1 ring-white/10' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span className="flex-1 leading-tight">{label}</span>
              {count ? (
                <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-extrabold text-amber-950">{count}</span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-white/10 px-5 pb-6 pt-4">
        {pushState && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="flex items-center gap-2 text-xs font-extrabold text-white">
              {pushState === 'on' ? <BellRing className="h-4 w-4 text-emerald-400" /> : <Bell className="h-4 w-4 text-slate-400" />}
              Booking alerts {pushState === 'on' ? 'on' : 'off'}
            </p>
            <p className="mt-1 text-[11px] leading-snug text-slate-400">
              {pushState === 'on'
                ? 'This device is notified of new bookings and sign-ups, even when the site is closed.'
                : pushState === 'off'
                  ? 'Get a notification on this phone or computer for every new booking and sign-up, even when the site is closed.'
                  : pushState === 'blocked'
                    ? 'Notifications are blocked for this site. Allow them in the browser’s site settings, then reload.'
                    : pushState === 'unconfigured'
                      ? 'Add NEXT_PUBLIC_FIREBASE_VAPID_KEY to the server to switch on device alerts.'
                      : 'This browser can’t receive alerts. Use Chrome on Android or a desktop browser.'}
            </p>
            {(pushState === 'on' || pushState === 'off') && (
              <div className="mt-2.5 flex gap-2">
                <button
                  type="button"
                  onClick={togglePush}
                  disabled={pushBusy}
                  className={`flex min-h-[40px] flex-1 items-center justify-center rounded-lg px-3 text-xs font-bold transition-colors disabled:opacity-60 ${
                    pushState === 'on' ? 'border border-white/15 text-slate-300 hover:bg-white/10' : 'bg-emerald-500 text-emerald-950 hover:bg-emerald-400'
                  }`}
                >
                  {pushState === 'on' ? 'Turn off' : 'Turn on alerts'}
                </button>
                {pushState === 'on' && (
                  <button
                    type="button"
                    onClick={handleTestAlert}
                    disabled={pushBusy}
                    className="flex min-h-[40px] flex-1 items-center justify-center rounded-lg bg-white/10 px-3 text-xs font-bold text-white transition-colors hover:bg-white/15 disabled:opacity-60"
                  >
                    Send test
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        <p className="truncate text-xs text-slate-400">greensrentacab@gmail.com</p>
        <button
          type="button"
          onClick={handleLogout}
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/5 px-4 py-2.5 text-sm font-bold text-rose-300 transition-colors hover:bg-rose-500/15"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  );

  // Render nothing until the session is verified, so signed-out visitors never see the console
  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3F5FA]" aria-busy="true">
        <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-brand-600 border-t-transparent" />
        <span className="sr-only">Checking session…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F5FA] lg:pl-64">
      {/* Toast */}
      {toastMessage && (
        <div
          role="status"
          className="fixed inset-x-4 top-4 z-[80] mx-auto flex max-w-md animate-pop-in items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-xs font-bold text-white shadow-float-lg sm:left-auto sm:right-5 sm:top-5 sm:mx-0"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-live-400" />
          <span className="min-w-0">{toastMessage}</span>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">{sidebar}</aside>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-[60] lg:hidden ${navOpen ? '' : 'pointer-events-none'}`} aria-hidden={!navOpen}>
        <div
          className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-200 ${navOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setNavOpen(false)}
        />
        <aside
          className={`absolute inset-y-0 left-0 w-[85%] max-w-[300px] shadow-float-lg transition-transform duration-300 ease-premium ${
            navOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebar}
        </aside>
      </div>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200/80 bg-white/90 px-4 py-2.5 backdrop-blur-xl lg:hidden">
        <button
          type="button"
          onClick={() => setNavOpen(true)}
          aria-label="Open menu"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-ink"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-extrabold text-ink">{activeLabel}</p>
          <p className="flex items-center gap-1.5 truncate text-[11px] text-slate-500">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" /> {siteConfig.brand.name} · Operations live
          </p>
        </div>
        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          aria-label="Refresh"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-ink disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </header>

      <main className="mx-auto w-full max-w-[1200px] space-y-5 px-4 py-5 sm:px-6 sm:py-8 lg:px-10">
        {loadError && !loading && (
          <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-3 text-sm text-rose-900">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              <span>
                <strong>Could not load live data.</strong> The server could not reach the database. Check the Firebase credentials
                (FIREBASE_PRIVATE_KEY) and try again.
              </span>
            </p>
            <button type="button" onClick={loadData} className="adm-btn-ghost shrink-0">
              <RefreshCw className="h-4 w-4" /> Retry
            </button>
          </div>
        )}
        {data && !data.persistent && (
          <div role="alert" className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="min-w-0">
              <strong>Database not connected.</strong> Bookings, enquiries and price changes are kept in temporary server
              memory and will be lost on restart/redeploy. Add the Firebase environment variables (FIREBASE_PROJECT_ID,
              FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) to save them permanently.
            </p>
          </div>
        )}

        {/* ───────────── OVERVIEW ───────────── */}
        {activeTab === 'overview' && (
          <div className="animate-panel-in space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="min-h-[18px] text-xs font-semibold text-slate-500">{dateLabel}</p>
                <h1 className={`${pageTitle} mt-1`}>{greeting}, Dispatch Desk</h1>
              </div>
              <div className="hidden gap-2 sm:flex">
                <Link href="/" target="_blank" className="adm-btn-ghost">
                  <ExternalLink className="h-4 w-4" /> View live website
                </Link>
                <button type="button" onClick={loadData} disabled={loading} className="adm-btn-ghost">
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                </button>
              </div>
            </div>

            {(stats?.pendingBookings ?? 0) > 0 && (
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 to-indigo-700 p-5 text-white shadow-float sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
                    <AlertCircle className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-extrabold tracking-tight">
                      {stats?.pendingBookings} booking request{stats?.pendingBookings === 1 ? ' is' : 's are'} waiting for you
                    </p>
                    <p className="mt-1 text-sm text-brand-100">
                      {overdueCount > 0
                        ? `${overdueCount === 1 ? 'One has a' : `At least ${overdueCount} have`} pickup date${overdueCount === 1 ? '' : 's'} that ${overdueCount === 1 ? 'has' : 'have'} already passed. Confirm, assign or close them out.`
                        : 'Passengers are waiting for confirmation or chauffeur assignment.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setStatusFilter('PENDING');
                        goTab('bookings');
                      }}
                      className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-extrabold text-brand-800 shadow-sm transition-transform hover:-translate-y-0.5 sm:w-auto"
                    >
                      Review pending requests <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {kpis.map((k) => {
                const Icon = k.icon;
                return (
                  <div key={k.label} className="adm-card p-4 sm:p-5">
                    <div className="flex items-center gap-2.5">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${k.iconBg}`}>
                        <Icon className="h-[18px] w-[18px]" />
                      </span>
                      <p className="min-w-0 text-[10px] font-extrabold uppercase leading-tight tracking-wide text-slate-500">{k.label}</p>
                    </div>
                    <p className={`mt-3 text-3xl font-extrabold tracking-tight tabular-nums sm:text-4xl ${k.tone}`}>
                      {loading && !data ? <span className="shimmer block h-9 w-14 rounded-lg" /> : k.value}
                    </p>
                    <p className="text-xs font-medium text-slate-500">{k.hint}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
              <section className="adm-card p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-extrabold tracking-tight">Recent booking requests</h2>
                  <button type="button" onClick={() => goTab('bookings')} className="min-h-[44px] px-1 text-sm font-bold text-brand-700 hover:text-brand-800">
                    View all
                  </button>
                </div>
                <ul className="mt-1 divide-y divide-slate-100">
                  {bookings.slice(0, 4).map((b) => {
                    const hint = pickupHint(b, now);
                    return (
                      <li key={b.bookingId}>
                        <button
                          type="button"
                          onClick={() => {
                            setBookingSearch(b.bookingId);
                            setStatusFilter('ALL');
                            goTab('bookings');
                          }}
                          className="flex w-full items-center gap-3 py-3.5 text-left"
                        >
                          <div className="min-w-0 flex-1 space-y-1.5">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                              <span className="font-mono text-xs font-bold text-brand-700">{b.bookingId}</span>
                              <span className="truncate text-sm font-semibold text-ink">{b.customerName}</span>
                            </div>
                            <p className="line-clamp-2 text-sm font-bold text-ink">
                              {b.pickupName} → {b.dropName}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                              <span>Pickup {formatPickup(b)}</span>
                              {hint === 'passed' && <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700">Pickup date passed</span>}
                              {hint === 'tomorrow' && <span className="rounded-md bg-brand-100 px-2 py-0.5 text-[11px] font-bold text-brand-800">Tomorrow</span>}
                              {hint === 'today' && <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">Today</span>}
                            </div>
                          </div>
                          <span className={`shrink-0 self-start rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${getStatusBadge(b.bookingStatus)}`}>
                            {STATUS_LABEL[b.bookingStatus] ?? b.bookingStatus}
                          </span>
                          <ChevronRight className="hidden h-4 w-4 shrink-0 text-slate-400 sm:block" />
                        </button>
                      </li>
                    );
                  })}
                  {!loading && bookings.length === 0 && <li className="py-8 text-center text-sm text-slate-400">No booking requests yet.</li>}
                </ul>
              </section>

              <div className="space-y-5">
                <section className="adm-card p-4 sm:p-5">
                  <h2 className="text-lg font-extrabold tracking-tight">Booking pipeline</h2>
                  <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-slate-100">
                    {pipelineTotal > 0 &&
                      pipeline.map((p) => (p.value > 0 ? <div key={p.label} className={p.bar} style={{ width: `${(p.value / pipelineTotal) * 100}%` }} /> : null))}
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    {pipeline.map((p) => (
                      <div key={p.label} className="flex items-center justify-between gap-2">
                        <dt className="flex items-center gap-2 text-slate-600">
                          <span className={`h-2 w-2 rounded-full ${p.dot}`} /> {p.label}
                        </dt>
                        <dd className="font-extrabold tabular-nums text-ink">{p.value}</dd>
                      </div>
                    ))}
                  </dl>
                </section>

                <section className="adm-card p-4 sm:p-5">
                  <h2 className="text-lg font-extrabold tracking-tight">Worth a look</h2>
                  {worthALook.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-500">Everything looks good. Nothing needs attention.</p>
                  ) : (
                    <ul className="mt-2 divide-y divide-slate-100">
                      {worthALook.map((w) => (
                        <li key={w.title}>
                          <button type="button" onClick={() => w.go && goTab(w.go)} className="flex w-full items-start gap-3 py-3 text-left">
                            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${w.tone}`} />
                            <span className="min-w-0">
                              <span className="block text-sm font-extrabold text-ink">{w.title}</span>
                              <span className="block text-xs leading-relaxed text-slate-500">{w.text}</span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>
            </div>
          </div>
        )}

        {/* ───────────── BOOKINGS & DISPATCH ───────────── */}
        {activeTab === 'bookings' && (
          <div className="animate-panel-in space-y-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <h1 className={pageTitle}>Bookings &amp; chauffeur dispatch</h1>
                <p className="mt-1 max-w-xl text-sm text-slate-600">
                  Approve requests, assign chauffeurs and reach passengers by call or WhatsApp, all from one card.
                </p>
              </div>
              <div className="relative w-full lg:w-80">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  placeholder="Search by ID, name or phone"
                  aria-label="Search bookings"
                  className="adm-field bg-white pl-10"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div role="radiogroup" aria-label="Status filter" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
                {['ALL', 'PENDING', 'CONFIRMED', 'DRIVER_ASSIGNED', 'COMPLETED'].map((st) => {
                  const on = statusFilter === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setStatusFilter(st)}
                      className={`flex min-h-[44px] shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-xs font-extrabold uppercase tracking-wide transition-colors sm:min-h-[40px] ${
                        on ? 'border-ink bg-ink text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {STATUS_LABEL[st]?.toUpperCase() ?? st}
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${on ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>{statusCounts[st]}</span>
                    </button>
                  );
                })}
              </div>
              <p className="shrink-0 text-xs text-slate-500">
                Showing {filteredBookings.length} of {bookings.length} bookings
              </p>
            </div>

            <div className="space-y-4">
              {filteredBookings.length === 0 ? (
                <div className="adm-card py-14 text-center text-sm text-slate-500">No bookings found matching your search.</div>
              ) : (
                filteredBookings.map((b) => {
                  const cleanCustomerPhone = b.customerPhone.replace(/\D/g, '');
                  const customerWaNumber = cleanCustomerPhone.length === 10 ? `91${cleanCustomerPhone}` : cleanCustomerPhone;
                  const confirmWaMessage = encodeURIComponent(
                    `Hello ${b.customerName},\n\nThis is ${siteConfig.brand.name}. We are pleased to confirm your Innova booking #${b.bookingId}:\n• Route: ${b.pickupName} ➔ ${b.dropName}\n• Service: ${b.serviceType.toUpperCase()} (${b.tripType === 'round' ? 'Round Trip' : 'One Way'})\n• Date & Time: ${b.pickupDate} at ${b.pickupTime}\n• Vehicle: ${b.vehicleName}\n• Tariff: ${b.fare !== null ? `₹${b.fare}` : 'Price on request'}\n\nOur operations desk will send chauffeur details 2 hours prior to departure.`
                  );
                  const confirmWaUrl = `https://wa.me/${customerWaNumber}?text=${confirmWaMessage}`;
                  const hint = pickupHint(b, now);
                  const isRound = b.serviceType === 'outstation' || b.tripType === 'round';

                  return (
                    <article key={b.bookingId} className="adm-card overflow-hidden">
                      <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                          <span className="font-mono text-sm font-extrabold text-brand-700">#{b.bookingId}</span>
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${getStatusBadge(b.bookingStatus)}`}>
                            {STATUS_LABEL[b.bookingStatus] ?? b.bookingStatus}
                          </span>
                          {hint === 'passed' && <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-bold text-rose-700">Pickup date passed</span>}
                          {hint === 'tomorrow' && <span className="rounded-full bg-brand-100 px-2.5 py-1 text-[10px] font-bold text-brand-800">Pickup tomorrow</span>}
                          {hint === 'today' && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-800">Pickup today</span>}
                          <span className="text-xs text-slate-500">Created {new Date(b.createdAt).toLocaleDateString('en-GB')}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <label htmlFor={`status-${b.bookingId}`} className="text-xs font-semibold text-slate-500">
                            Status
                          </label>
                          <select
                            id={`status-${b.bookingId}`}
                            value={b.bookingStatus}
                            onChange={(e) => handleStatusChange(b.bookingId, e.target.value as BookingStatus)}
                            className="adm-field !w-auto min-w-0 flex-1 py-2.5 text-xs font-bold uppercase sm:flex-none"
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="DRIVER_ASSIGNED">DRIVER_ASSIGNED</option>
                            <option value="TRIP_STARTED">TRIP_STARTED</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid gap-5 px-4 py-4 sm:px-5 md:grid-cols-2 xl:grid-cols-[1fr_1.3fr_1fr]">
                        {/* Passenger */}
                        <div className="min-w-0">
                          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Passenger</p>
                          <p className="mt-1.5 break-words text-lg font-extrabold text-ink">{b.customerName}</p>
                          <p className="font-mono text-sm text-slate-500">+91 {b.customerPhone}</p>
                          {b.customerEmail && (
                            <p className="mt-1 break-all text-xs text-slate-500" title="Account that placed the booking">
                              {b.accountName && b.accountName !== b.customerName ? `${b.accountName} · ` : ''}
                              {b.customerEmail}
                            </p>
                          )}
                          <div className="mt-3 grid grid-cols-2 gap-2 sm:flex">
                            <a href={`tel:+91${cleanCustomerPhone}`} className={`${smallBtn} border border-slate-200 bg-white text-slate-800 hover:border-slate-300`}>
                              <Phone className="h-3.5 w-3.5" /> Call
                            </a>
                            <a href={confirmWaUrl} target="_blank" rel="noopener noreferrer" className={`${smallBtn} bg-[#128C4A] text-white hover:brightness-110`}>
                              <WhatsAppIcon className="h-3.5 w-3.5" /> WhatsApp
                            </a>
                          </div>
                        </div>

                        {/* Journey */}
                        <div className="min-w-0">
                          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Journey · {isRound ? 'Round trip' : 'One way'}</p>
                          <div className="relative mt-2.5 space-y-3 pl-6">
                            <span className="absolute left-[5px] top-2 h-[calc(100%-1rem)] w-px bg-slate-300" />
                            <div className="relative">
                              <span className="absolute -left-6 top-1 h-3 w-3 rounded-full border-2 border-brand-600 bg-white" />
                              <p className="text-[10px] font-bold uppercase text-slate-400">Pickup</p>
                              <p className="break-words text-sm font-bold text-ink">{b.pickupName}</p>
                            </div>
                            <div className="relative">
                              <span className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-brand-600" />
                              <p className="text-[10px] font-bold uppercase text-slate-400">Drop</p>
                              <p className="break-words text-sm font-bold text-ink">{b.dropName}</p>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />
                              {b.pickupDate} at {formatTime12(b.pickupTime)}
                              {b.returnDate && ` · Return ${b.returnDate}`}
                            </span>
                            <span className="capitalize">
                              Service: {b.serviceType}
                              {b.serviceType === 'local' && b.packageHours != null ? (b.packageHours ? ` · ${b.packageHours} hr` : ' · custom') : ''}
                            </span>
                          </div>
                          {b.stops && b.stops.length > 0 && (
                            <p className="mt-1 flex items-start gap-1.5 text-xs text-slate-500">
                              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" /> Stops: {b.stops.join(' → ')}
                            </p>
                          )}
                        </div>

                        {/* Vehicle & chauffeur */}
                        <div className="min-w-0 md:col-span-2 xl:col-span-1">
                          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Vehicle &amp; chauffeur</p>
                          <p className="mt-1.5 flex items-center gap-2 text-lg font-extrabold text-ink">
                            <Car className="h-4 w-4 shrink-0 text-brand-600" />
                            <span className="min-w-0 break-words">{b.vehicleName}</span>
                          </p>
                          <p className="text-sm text-slate-600">
                            Tariff: <strong className="text-brand-700">{b.fare !== null ? `₹${b.fare}` : 'Price on request'}</strong>
                          </p>
                          {b.fare !== null && b.fareBreakdown && b.fareBreakdown.length > 0 && (
                            <ul className="mt-1 space-y-0.5 text-[11px] font-semibold tabular-nums text-slate-500">
                              {b.fareBreakdown.map((line) => (
                                <li key={line}>{line}</li>
                              ))}
                            </ul>
                          )}
                          {b.driverName ? (
                            <div className="mt-2.5 rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-xs text-indigo-800">
                              <p className="break-words font-bold">
                                Chauffeur: {b.driverName} ({b.driverPhone})
                              </p>
                              <p className="text-indigo-700/80">Reg: {b.vehicleRegistration}</p>
                            </div>
                          ) : (
                            <>
                              <p className="mt-1 text-xs font-semibold text-amber-700">No chauffeur assigned yet</p>
                              {b.bookingStatus === 'PENDING' ? (
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(b.bookingId, 'CONFIRMED')}
                                  className="adm-btn-primary mt-3 w-full sm:w-auto"
                                >
                                  Confirm booking <ArrowRight className="h-4 w-4" />
                                </button>
                              ) : b.bookingStatus !== 'CANCELLED' && b.bookingStatus !== 'COMPLETED' ? (
                                <button type="button" onClick={() => handleOpenAssignDriver(b)} className="adm-btn-primary mt-3 w-full sm:w-auto">
                                  Assign chauffeur <ArrowRight className="h-4 w-4" />
                                </button>
                              ) : null}
                            </>
                          )}
                        </div>
                      </div>

                      {b.notes && (
                        <p className="mx-4 mb-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 sm:mx-5">
                          <strong className="text-ink">Passenger notes:</strong> {b.notes}
                        </p>
                      )}
                    </article>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ───────────── PRICING ───────────── */}
        {activeTab === 'pricing' && (
          <div className="animate-panel-in space-y-5 pb-28 sm:pb-24">
            <div className="min-w-0">
              <h1 className={pageTitle}>Car prices &amp; tariffs</h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-600">
                Set each car&apos;s rates once. Fare results, fleet cards, route prices, vehicle pages and the comparison table all update
                automatically.
              </p>
            </div>

            {carsWithoutRates.length > 0 && (
              <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                  <AlertCircle className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-amber-950">
                    {carsWithoutRates.length} of {vehicles.length} cars still show “Price on request” on your website
                  </p>
                  <p className="mt-0.5 text-xs text-amber-900/80">Leave a field empty to keep showing “Price on request”. Fill in a rate and it goes live as soon as you save.</p>
                </div>
              </div>
            )}

            <div className="grid items-start gap-5 xl:grid-cols-2">
              {vehicles.map((v) => (
                <VehicleRatesEditor
                  key={v.id}
                  vehicle={v}
                  values={rateDrafts[v.id] ?? toInputs(v.rates)}
                  dirty={dirtyVehicleIds.includes(v.id)}
                  onChange={(next) => setRateDrafts((d) => ({ ...d, [v.id]: next }))}
                />
              ))}
            </div>

            {/* Sticky save bar */}
            <div className="fixed inset-x-3 bottom-3 z-30 lg:left-[calc(16rem+0.75rem)] lg:right-3">
              <div className="mx-auto flex max-w-[1120px] flex-col gap-3 rounded-2xl bg-[#0B1120] px-4 py-3 text-white shadow-float-lg sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-3.5 pb-safe">
                <p className="flex min-w-0 items-center gap-2.5 text-sm font-bold">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${rateError || rateProblems.length > 0 ? 'bg-rose-400' : hasRateChanges ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                  <span className="min-w-0 truncate">
                    {rateError ??
                      (rateProblems.length > 0
                        ? `Fix ${rateProblems.length} tariff${rateProblems.length > 1 ? 's' : ''} before saving`
                        : hasRateChanges
                          ? `Unsaved changes in ${dirtyVehicleIds.length} car${dirtyVehicleIds.length > 1 ? 's' : ''}`
                          : 'All changes saved')}
                  </span>
                </p>
                <div className="grid grid-cols-2 gap-2 sm:flex">
                  <button
                    type="button"
                    onClick={discardRates}
                    disabled={!hasRateChanges || savingRates}
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-white/10 disabled:opacity-40"
                  >
                    <Undo2 className="h-4 w-4" /> Discard
                  </button>
                  <button
                    type="button"
                    onClick={saveAllRates}
                    disabled={!hasRateChanges || savingRates || rateProblems.length > 0}
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-2 text-sm font-extrabold text-white transition-colors hover:bg-brand-500 disabled:bg-brand-900/70 disabled:text-white/50"
                  >
                    <Save className="h-4 w-4" /> {savingRates ? 'Saving...' : 'Save tariffs'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ───────────── HOMEPAGE IMAGES ───────────── */}
        {openedTabs.includes('images') && (
          <div className={activeTab === 'images' ? 'animate-panel-in' : 'hidden'}>
            <HomepageImagesPanel onToast={showToast} />
          </div>
        )}

        {/* ───────────── TERMS & POLICIES ───────────── */}
        {openedTabs.includes('policies') && (
          <div className={activeTab === 'policies' ? 'animate-panel-in' : 'hidden'}>
            <PoliciesPanel onToast={showToast} />
          </div>
        )}

        {/* ───────────── FLEET ───────────── */}
        {activeTab === 'fleet' && (
          <div className="animate-panel-in space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h1 className={pageTitle}>Fleet &amp; vehicles</h1>
                <p className="mt-1 max-w-xl text-sm text-slate-600">
                  Switch a vehicle on to offer it to customers. Vehicles that are off stay hidden from vehicle selection.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2 text-xs font-extrabold">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3.5 py-2 text-emerald-800">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> {vehicles.length - hiddenVehicles.length} on the website
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3.5 py-2 text-amber-800">
                  <span className="h-2 w-2 rounded-full bg-amber-500" /> {hiddenVehicles.length} hidden
                </span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {vehicles.map((v) => (
                <div key={v.id} className={`adm-card p-4 sm:p-5 ${v.confirmed ? '' : '!border-dashed !border-amber-300 !bg-amber-50/50'}`}>
                  <div className="flex items-start gap-4">
                    <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${v.confirmed ? 'bg-brand-50 text-brand-700' : 'bg-amber-100 text-amber-700'}`}>
                      <Car className="h-6 w-6" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-lg font-extrabold tracking-tight text-ink">{v.name}</h3>
                      <p className="text-sm text-slate-500">{v.type}</p>
                      <span
                        className={`mt-2 inline-block rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          v.confirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {v.confirmed ? 'Active on site' : 'Unconfirmed / hidden'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2.5 text-sm">
                    <span className="flex items-center gap-2 rounded-xl bg-slate-100/80 px-3 py-2.5 font-semibold text-ink">
                      <Users className="h-4 w-4 shrink-0 text-brand-600" /> {v.seats} <span className="font-medium text-slate-600">seats</span>
                    </span>
                    <span className="flex items-center gap-2 rounded-xl bg-slate-100/80 px-3 py-2.5 font-semibold text-ink">
                      <Briefcase className="h-4 w-4 shrink-0 text-brand-600" /> {v.luggage} <span className="truncate font-medium text-slate-600">bags</span>
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={v.confirmed}
                      onClick={() => handleToggleVehicle(v.id, v.confirmed)}
                      className="group flex min-h-[44px] min-w-0 items-center gap-3 text-left"
                    >
                      <span className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${v.confirmed ? 'bg-emerald-600' : 'bg-slate-400'}`}>
                        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${v.confirmed ? 'left-6' : 'left-1'}`} />
                      </span>
                      <span className={`text-sm font-extrabold ${v.confirmed ? 'text-emerald-700' : 'text-amber-800'}`}>
                        {v.confirmed ? 'Visible to customers' : 'Hidden from customers'}
                      </span>
                    </button>
                    <button type="button" onClick={() => goTab('pricing')} className="adm-btn-ghost shrink-0">
                      Edit tariff
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ───────────── USERS ───────────── */}
        {activeTab === 'users' && (
          <div className="animate-panel-in space-y-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <h1 className={pageTitle}>Registered users</h1>
                <p className="mt-1 max-w-xl text-sm text-slate-600">
                  Everyone who has created an account, including people who signed in but never booked. Phone numbers come from the
                  profile, or from their first booking.
                </p>
              </div>
              <div className="relative w-full lg:w-80">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by name, email or phone"
                  aria-label="Search users"
                  className="adm-field bg-white pl-10"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div role="radiogroup" aria-label="User filter" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
                {([
                  ['ALL', 'All'],
                  ['BOOKED', 'Has booked'],
                  ['NEVER', 'Never booked'],
                  ['NO_PHONE', 'No phone'],
                ] as const).map(([id, label]) => {
                  const on = userFilter === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setUserFilter(id)}
                      className={`flex min-h-[44px] shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-xs font-extrabold uppercase tracking-wide transition-colors sm:min-h-[40px] ${
                        on ? 'border-ink bg-ink text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {label}
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${on ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>
                        {users.filter((u) => userMatches(u, id)).length}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="shrink-0 text-xs text-slate-500">
                Showing {filteredUsers.length} of {users.length} users
              </p>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="adm-card px-5 py-12 text-center text-sm text-slate-500">
                {users.length === 0
                  ? 'No users yet. Accounts appear here the first time someone signs in on the website.'
                  : 'No users match your search.'}
              </div>
            ) : (
              <div className="adm-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[820px] text-left text-sm">
                    <thead className="border-b border-slate-100 bg-slate-50 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-4 py-3">User</th>
                        <th className="px-4 py-3">Phone</th>
                        <th className="px-4 py-3 text-center">Bookings</th>
                        <th className="px-4 py-3">Signed up</th>
                        <th className="px-4 py-3">Last sign-in</th>
                        <th className="px-4 py-3">Last booking</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.map((u) => {
                        const digits = u.phone.replace(/\D/g, '');
                        const wa = digits.length === 10 ? `91${digits}` : digits;
                        const fmt = (iso: string | null) =>
                          iso
                            ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '—';
                        return (
                          <tr key={u.uid} className="align-top">
                            <td className="px-4 py-3.5">
                              <p className="font-extrabold text-ink">{u.name || 'Unnamed'}</p>
                              <p className="break-all text-xs text-slate-500">{u.email || '—'}</p>
                            </td>
                            <td className="px-4 py-3.5">
                              {u.phone ? (
                                <>
                                  <p className="font-mono text-xs font-semibold text-ink">+91 {u.phone}</p>
                                  {u.phoneSource === 'booking' && <p className="text-[10px] text-slate-400">from first booking</p>}
                                  <div className="mt-1.5 flex gap-1.5">
                                    <a href={`tel:+91${digits}`} aria-label={`Call ${u.name || u.email}`} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:border-slate-300">
                                      <Phone className="h-3.5 w-3.5" />
                                    </a>
                                    <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${u.name || u.email}`} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-emerald-600 hover:border-slate-300">
                                      <WhatsAppIcon className="h-3.5 w-3.5" />
                                    </a>
                                  </div>
                                </>
                              ) : (
                                <span className="text-xs text-slate-400">Not provided</span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <span
                                className={`inline-block min-w-[2rem] rounded-full px-2.5 py-1 text-xs font-extrabold tabular-nums ${
                                  u.bookingCount > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                {u.bookingCount}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-600">{fmt(u.signedUpAt)}</td>
                            <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-600">{fmt(u.lastLoginAt)}</td>
                            <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-600">{fmt(u.lastBookingAt)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ───────────── ENQUIRIES ───────────── */}
        {activeTab === 'enquiries' && (
          <div className="animate-panel-in space-y-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <h1 className={pageTitle}>Tour package &amp; contact enquiries</h1>
                <p className="mt-1 text-sm text-slate-600">Leads captured from the tour-packages and contact forms on your website.</p>
              </div>
              <div role="radiogroup" aria-label="Enquiry filter" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0">
                {['ALL', 'PENDING', 'CONTACTED', 'CONVERTED'].map((st) => {
                  const on = enquiryFilter === st;
                  const n = st === 'ALL' ? enquiries.length : enquiries.filter((e) => e.status === st).length;
                  return (
                    <button
                      key={st}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setEnquiryFilter(st)}
                      className={`flex min-h-[44px] shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-xs font-extrabold uppercase tracking-wide transition-colors sm:min-h-[40px] ${
                        on ? 'border-ink bg-ink text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {st}
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${on ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>{n}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {filteredEnquiries.length === 0 ? (
              <div className="adm-card px-5 py-12 text-center sm:py-16">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                  <Users className="h-7 w-7" />
                </span>
                <h2 className="mt-5 text-xl font-extrabold tracking-tight">No enquiries yet</h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                  When someone submits the tour-packages or contact form, their details appear here with one-tap call and WhatsApp buttons.
                </p>
                <div className="mt-6 grid gap-2 sm:flex sm:justify-center">
                  <Link href="/tour-packages" target="_blank" className="adm-btn-primary">
                    <ExternalLink className="h-4 w-4" /> Open tour packages page
                  </Link>
                  <button type="button" onClick={loadData} className="adm-btn-ghost">
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEnquiries.map((e, idx) => {
                  const cleanPhone = e.phone.replace(/\D/g, '');
                  const waNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                  const tourWaMessage = encodeURIComponent(
                    `Hello ${e.name},\n\nThank you for reaching out to ${siteConfig.brand.name} regarding your upcoming tour to *${e.destination}* on ${e.travelDate}.\n\nOur team has prepared a custom Toyota Innova itinerary for your party of ${e.passengers} passengers. Are you available for a quick 2-minute call to discuss your preferences?`
                  );
                  const tourWaUrl = `https://wa.me/${waNumber}?text=${tourWaMessage}`;

                  return (
                    <article key={e.id || idx} className="adm-card overflow-hidden">
                      <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <div className="min-w-0">
                          <h3 className="flex flex-wrap items-center gap-x-3 gap-y-1 text-base font-extrabold text-ink">
                            <span className="break-words">{e.name}</span>
                            <span className="font-mono text-xs font-medium text-slate-500">+91 {e.phone}</span>
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${enquiryBadge(e.status)}`}>{e.status}</span>
                          </h3>
                          <p className="mt-0.5 break-words text-xs font-bold text-brand-700">Destination: {e.destination}</p>
                        </div>
                        <select
                          value={e.status}
                          onChange={(ev) => handleEnquiryStatus(e.id || '', ev.target.value as Enquiry['status'])}
                          aria-label={`Status for ${e.name}`}
                          className="adm-field !w-full py-2.5 text-xs font-bold sm:!w-auto"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONTACTED">CONTACTED</option>
                          <option value="CONVERTED">CONVERTED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </div>

                      <div className="grid gap-4 px-4 py-4 text-sm sm:grid-cols-3 sm:px-5">
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Travel schedule</p>
                          <p className="mt-1 font-semibold text-ink">{e.travelDate}</p>
                          {e.duration && <p className="text-xs text-slate-500">Duration: {e.duration}</p>}
                        </div>
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Passengers &amp; car</p>
                          <p className="mt-1 font-semibold text-ink">{e.passengers} passengers</p>
                          <p className="text-xs text-slate-500">{e.vehicleModel || 'Innova Crysta'}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 self-center sm:flex sm:justify-end">
                          <a href={`tel:+91${cleanPhone}`} className={`${smallBtn} border border-slate-200 bg-white text-slate-800 hover:border-slate-300`}>
                            <Phone className="h-3.5 w-3.5" /> Call
                          </a>
                          <a href={tourWaUrl} target="_blank" rel="noopener noreferrer" className={`${smallBtn} bg-[#128C4A] text-white hover:brightness-110`}>
                            <WhatsAppIcon className="h-3.5 w-3.5" /> WhatsApp
                          </a>
                        </div>
                      </div>

                      {e.notes && (
                        <p className="mx-4 mb-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 sm:mx-5">
                          <strong className="text-ink">Requirements:</strong> {e.notes}
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { k: 'From /tour-packages', t: 'Tour package requests', d: 'Destination, dates and group size from people planning a trip with you.' },
                { k: 'From /contact', t: 'Contact messages', d: 'General questions and quote requests sent through the contact form.' },
                { k: 'Reply fast', t: 'Call or WhatsApp', d: 'Every lead gets the same Call and WhatsApp buttons you use on bookings.' },
              ].map((c) => (
                <div key={c.t} className="adm-card p-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-brand-700">{c.k}</p>
                  <p className="mt-1 text-base font-extrabold text-ink">{c.t}</p>
                  <p className="mt-1 text-sm text-slate-600">{c.d}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Assign chauffeur modal — bottom sheet on mobile, centred card on desktop */}
      {assignModalBooking && (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-labelledby="assign-title">
          <div className="absolute inset-0 animate-fade-in bg-slate-900/50 backdrop-blur-sm" onClick={() => setAssignModalBooking(null)} />
          <div className="pointer-events-none absolute inset-0 flex items-end justify-center sm:items-center sm:p-4">
            <div className="pointer-events-auto flex max-h-[92vh] w-full animate-drawer-in flex-col overflow-hidden rounded-t-3xl bg-white shadow-float-lg sm:w-[480px] sm:rounded-3xl">
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 pb-4 pt-5">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-indigo-700">Chauffeur assignment</p>
                  <h3 id="assign-title" className="truncate text-lg font-extrabold tracking-tight">
                    Booking #{assignModalBooking.bookingId}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setAssignModalBooking(null)}
                  aria-label="Close"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-ink hover:bg-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveDriverAssignment} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                <div>
                  <label htmlFor="assign-name" className="adm-label">
                    Chauffeur full name *
                  </label>
                  <input
                    id="assign-name"
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="e.g. Manjunath Gowda"
                    required
                    className="adm-field"
                  />
                </div>
                <div>
                  <label htmlFor="assign-phone" className="adm-label">
                    Chauffeur mobile number *
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">+91</span>
                    <input
                      id="assign-phone"
                      type="tel"
                      inputMode="numeric"
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="9448123456"
                      required
                      maxLength={10}
                      className="adm-field pl-12 tabular-nums"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="assign-reg" className="adm-label">
                    Vehicle registration number *
                  </label>
                  <input
                    id="assign-reg"
                    type="text"
                    value={vehicleReg}
                    onChange={(e) => setVehicleReg(e.target.value.toUpperCase())}
                    placeholder="e.g. KA 04 MP 7821"
                    required
                    className="adm-field font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 pb-safe sm:flex sm:justify-end">
                  <button type="button" onClick={() => setAssignModalBooking(null)} className="adm-btn-ghost">
                    Cancel
                  </button>
                  <button type="submit" disabled={driverSubmitting} className="adm-btn-primary">
                    <Send className="h-4 w-4" />
                    <span className="truncate">{driverSubmitting ? 'Assigning...' : 'Assign & WhatsApp'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
