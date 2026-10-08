'use client';

/**
 * app/admin/page.tsx
 * 
 * Master Operations & Dispatch Console for Innova Cabs Bangalore.
 * Handles:
 * - Real-time Booking Approval & Chauffeur Assignment
 * - Direct WhatsApp (wa.me) & Phone Customer Communication
 * - Pricing & Tariff Management (nullable per client policy)
 * - Fleet Activation (Innova, Crysta, Hycross toggle)
 * - Tour & Contact Enquiries Lead Management
 */

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Car,
  Users,
  Calendar,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  Shield,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
  ExternalLink,
  Search,
  Filter,
  UserCheck,
  Tag,
  Compass,
  X,
  Send,
  Eye,
  Check,
  ChevronDown,
} from 'lucide-react';
import {
  verifyAdminSession,
  getAdminDashboardData,
  updateBookingStatus,
  assignDriverToBooking,
  toggleVehicleActive,
  updateEnquiryStatus,
  adminLogout,
  AdminDashboardData,
} from '@/app/actions/admin';
import { Booking, BookingStatus, Route, Vehicle, Enquiry } from '@/lib/types';
import { siteConfig } from '@/lib/siteConfig';
import { formatTime12 } from '@/lib/time';
import VehicleRatesEditor from '@/components/admin/VehicleRatesEditor';

type AdminTab = 'overview' | 'bookings' | 'pricing' | 'fleet' | 'enquiries';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Bookings filter & search
  const [bookingSearch, setBookingSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Assign Driver Modal State
  const [assignModalBooking, setAssignModalBooking] = useState<Booking | null>(null);
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [vehicleReg, setVehicleReg] = useState('');
  const [driverSubmitting, setDriverSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getAdminDashboardData();
      setData(res);

    } catch (err) {
      console.error('[Admin] Error loading dashboard data:', err);
      showToast('Error loading live operations data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      const isAuth = await verifyAdminSession();
      if (!isAuth) {
        router.push('/admin/login');
        return;
      }
      loadData();
    }
    init();
  }, []);

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

  // Filter bookings
  const filteredBookings = (data?.bookings || []).filter((b) => {
    const matchesSearch =
      b.bookingId.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.customerName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.customerPhone.includes(bookingSearch) ||
      b.pickupName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.dropName.toLowerCase().includes(bookingSearch.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ? true : b.bookingStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // design.md §1.1 "Status chips (booking pipeline)"
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
        return 'bg-live-500/15 text-live-600';
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
          ? 'bg-live-500/15 text-live-600'
          : 'bg-rose-100 text-rose-700';

  const tabs: { id: AdminTab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: Compass },
    { id: 'bookings', label: 'Bookings & Dispatch', icon: Calendar, count: data?.stats.pendingBookings },
    { id: 'pricing', label: 'Pricing & Tariffs', icon: Tag },
    { id: 'fleet', label: 'Fleet & Vehicles', icon: Car },
    { id: 'enquiries', label: 'Tour Enquiries', icon: Users, count: data?.stats.pendingEnquiries },
  ];

  const kpis = [
    { label: 'Total Bookings', value: data?.stats.totalBookings || 0, hint: 'All time', tone: 'text-ink' },
    { label: 'Pending Approval', value: data?.stats.pendingBookings || 0, hint: 'Action needed', tone: 'text-amber-600' },
    { label: 'Assigned / Active', value: data?.stats.activeTrips || 0, hint: 'Chauffeur on duty', tone: 'text-indigo-600' },
    { label: 'Completed Trips', value: data?.stats.completedTrips || 0, hint: 'Finished', tone: 'text-live-600' },
  ];

  const smallBtn = 'btn px-3 py-1.5 text-xs';
  const panelTitle = 'text-xl font-extrabold tracking-tight';

  return (
    <div className="flex min-h-screen flex-col bg-porcelain">
      {/* Toast */}
      {toastMessage && (
        <div
          role="status"
          className="fixed right-5 top-5 z-[70] flex animate-pop-in items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-xs font-bold text-white shadow-float-lg"
        >
          <CheckCircle2 className="h-4 w-4 text-live-400" />
          {toastMessage}
        </div>
      )}

      {/* Console header */}
      <header className="sticky top-0 z-40 px-3 pt-3 sm:px-4">
        <div className="glass-strong mx-auto max-w-7xl rounded-3xl p-3 sm:p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-900 text-white shadow-glow">
                <Car className="h-5 w-5" strokeWidth={2.2} />
              </span>
              <div className="leading-none">
                <p className="flex items-center gap-2 text-[15px] font-extrabold tracking-tight">
                  {siteConfig.brand.name}
                  <span className="chip-live hidden sm:inline-flex">
                    <span className="h-1.5 w-1.5 rounded-full bg-live-500" /> Operations Live
                  </span>
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Bangalore Dispatch Desk • <code>greensrentacab@gmail.com</code>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/" target="_blank" className="btn-ghost hidden px-3.5 py-2 text-xs sm:inline-flex">
                <ExternalLink className="h-3.5 w-3.5" /> View Live Website
              </Link>
              <button type="button" onClick={loadData} disabled={loading} className="btn-ghost px-3 py-2 text-xs" title="Refresh">
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="btn border border-rose-300 bg-rose-50/50 px-3 py-2 text-xs text-rose-700 hover:bg-rose-50"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div role="tablist" className="no-scrollbar mt-3 flex gap-1 overflow-x-auto rounded-2xl bg-slate-100/80 p-1">
            {tabs.map(({ id, label, icon: Icon, count }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(id)}
                  className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition-all sm:text-[13px] ${
                    active ? 'bg-white text-brand-700 shadow-float ring-1 ring-slate-200/80' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {count ? (
                    <span className="rounded-full bg-amber-400 px-1.5 text-[10px] font-extrabold text-amber-950">{count}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="animate-panel-in space-y-6">
            {(data?.stats.pendingBookings || 0) > 0 && (
              <div className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-brand-800 via-brand-700 to-indigo-700 p-6 text-white shadow-float-lg">
                <div className="pointer-events-none absolute inset-0 bg-grid-slate opacity-20 [background-size:32px_32px]" />
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
                      <span className="absolute inset-0 animate-pulse-ring rounded-2xl bg-amber-400/40" />
                      <AlertCircle className="relative h-6 w-6" />
                    </span>
                    <div>
                      <p className="text-lg font-extrabold tracking-tight">
                        {data?.stats.pendingBookings} Booking Request(s) Awaiting Confirmation
                      </p>
                      <p className="mt-0.5 text-sm text-brand-100">
                        Passengers are waiting for driver assignment or WhatsApp verification.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('bookings');
                      setStatusFilter('PENDING');
                    }}
                    className="btn shrink-0 bg-white text-brand-800 shadow-float hover:-translate-y-0.5"
                  >
                    Review Pending Requests
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {kpis.map((k) => (
                <div key={k.label} className="card-float p-5">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{k.label}</p>
                  <p className={`mt-1 text-3xl font-extrabold tracking-tight tabular-nums ${k.tone}`}>
                    {loading && !data ? <span className="shimmer block h-8 w-16 rounded-lg" /> : k.value}
                  </p>
                  <p className="text-xs font-medium text-slate-500">{k.hint}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="card-float p-5">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-base font-extrabold">
                    <Calendar className="h-4 w-4 text-brand-600" /> Recent Booking Requests
                  </h3>
                  <button type="button" onClick={() => setActiveTab('bookings')} className="text-xs font-bold text-brand-700 hover:text-brand-800">
                    View All
                  </button>
                </div>
                <ul className="mt-3 divide-y divide-slate-100">
                  {(data?.bookings || []).slice(0, 4).map((b) => (
                    <li key={b.bookingId} className="flex items-center justify-between gap-3 py-3 text-xs">
                      <div className="min-w-0">
                        <p className="flex items-center gap-2">
                          <span className="font-mono font-bold text-brand-700">{b.bookingId}</span>
                          <span className="truncate font-semibold text-ink">{b.customerName}</span>
                        </p>
                        <p className="truncate text-[11px] text-slate-500">
                          {b.pickupName} → {b.dropName}
                        </p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${getStatusBadge(b.bookingStatus)}`}>
                        {b.bookingStatus}
                      </span>
                    </li>
                  ))}
                  {!loading && (data?.bookings || []).length === 0 && (
                    <li className="py-6 text-center text-xs text-slate-400">No booking requests yet.</li>
                  )}
                </ul>
              </div>

              <div className="card-float p-5">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-base font-extrabold">
                    <Users className="h-4 w-4 text-live-600" /> Recent Tour Enquiries
                  </h3>
                  <button type="button" onClick={() => setActiveTab('enquiries')} className="text-xs font-bold text-brand-700 hover:text-brand-800">
                    View All
                  </button>
                </div>
                <ul className="mt-3 divide-y divide-slate-100">
                  {(data?.enquiries || []).slice(0, 4).map((e, idx) => (
                    <li key={e.id || idx} className="flex items-center justify-between gap-3 py-3 text-xs">
                      <div className="min-w-0">
                        <p className="flex items-center gap-2">
                          <span className="font-bold text-ink">{e.name}</span>
                          <span className="text-[11px] text-slate-500">+91 {e.phone}</span>
                        </p>
                        <p className="max-w-xs truncate text-[11px] text-slate-500">{e.destination}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${enquiryBadge(e.status)}`}>{e.status}</span>
                    </li>
                  ))}
                  {!loading && (data?.enquiries || []).length === 0 && (
                    <li className="py-6 text-center text-xs text-slate-400">No enquiries yet.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BOOKINGS & DISPATCH */}
        {activeTab === 'bookings' && (
          <div className="animate-panel-in space-y-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className={panelTitle}>Bookings &amp; Chauffeur Dispatch</h2>
                <p className="text-sm text-slate-600">Manage approvals, driver assignments, and direct customer communication.</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative sm:w-64">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    placeholder="Search by ID, name, phone..."
                    aria-label="Search bookings"
                    className="field py-2.5 pl-11"
                  />
                </div>
                <div role="radiogroup" aria-label="Status filter" className="no-scrollbar flex gap-1 overflow-x-auto rounded-full border border-slate-200/80 bg-slate-100/70 p-1">
                  {['ALL', 'PENDING', 'CONFIRMED', 'DRIVER_ASSIGNED', 'COMPLETED'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      role="radio"
                      aria-checked={statusFilter === st}
                      onClick={() => setStatusFilter(st)}
                      className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                        statusFilter === st ? 'bg-white text-ink shadow-float ring-1 ring-slate-200/80' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {st === 'DRIVER_ASSIGNED' ? 'ASSIGNED' : st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {filteredBookings.length === 0 ? (
                <div className="card-float py-14 text-center text-sm text-slate-500">No bookings found matching your search.</div>
              ) : (
                filteredBookings.map((b) => {
                  const cleanCustomerPhone = b.customerPhone.replace(/\D/g, '');
                  const customerWaNumber = cleanCustomerPhone.length === 10 ? `91${cleanCustomerPhone}` : cleanCustomerPhone;

                  const confirmWaMessage = encodeURIComponent(
                    `Hello ${b.customerName},\n\nThis is ${siteConfig.brand.name}. We are pleased to confirm your Innova booking #${b.bookingId}:\n• Route: ${b.pickupName} ➔ ${b.dropName}\n• Service: ${b.serviceType.toUpperCase()} (${b.tripType === 'round' ? 'Round Trip' : 'One Way'})\n• Date & Time: ${b.pickupDate} at ${b.pickupTime}\n• Vehicle: ${b.vehicleName}\n• Tariff: ${b.fare !== null ? `₹${b.fare}` : 'Price on request'}\n\nOur operations desk will send chauffeur details 2 hours prior to departure.`
                  );
                  const confirmWaUrl = `https://wa.me/${customerWaNumber}?text=${confirmWaMessage}`;

                  return (
                    <article key={b.bookingId} className="card-float p-5">
                      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-mono text-sm font-extrabold text-brand-700">#{b.bookingId}</span>
                          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${getStatusBadge(b.bookingStatus)}`}>
                            {b.bookingStatus}
                          </span>
                          <span className="text-xs text-slate-500">Created: {new Date(b.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <label htmlFor={`status-${b.bookingId}`} className="text-xs font-semibold text-slate-500">
                            Status:
                          </label>
                          <select
                            id={`status-${b.bookingId}`}
                            value={b.bookingStatus}
                            onChange={(e) => handleStatusChange(b.bookingId, e.target.value as BookingStatus)}
                            className="field w-auto py-2 text-xs"
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

                      <div className="mt-4 grid gap-4 text-xs md:grid-cols-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Passenger Info</p>
                          <p className="mt-1 text-sm font-bold text-ink">{b.customerName}</p>
                          <p className="font-mono text-slate-500">+91 {b.customerPhone}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <a href={`tel:+91${cleanCustomerPhone}`} className={`${smallBtn} border border-slate-200/80 bg-white text-slate-800 hover:border-slate-300`}>
                              <Phone className="h-3 w-3 text-brand-600" /> Call
                            </a>
                            <a href={confirmWaUrl} target="_blank" rel="noopener noreferrer" className={`${smallBtn} bg-whatsapp text-white hover:brightness-95`}>
                              <MessageCircle className="h-3 w-3" /> WhatsApp
                            </a>
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                            Route &amp; Journey ({b.serviceType === 'outstation' || b.tripType === 'round' ? 'Round Trip' : 'One Way'})
                          </p>
                          <p className="mt-1 flex items-start gap-1.5 font-bold text-ink">
                            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
                            {b.pickupName} → {b.dropName}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1.5 text-slate-500">
                            <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            {b.pickupDate} at {formatTime12(b.pickupTime)}
                            {b.returnDate && ` · Return ${b.returnDate}`}
                          </p>
                          <p className="text-[11px] capitalize text-slate-500">
                            Service: {b.serviceType}
                            {b.serviceType === "local" && b.packageHours != null ? (b.packageHours ? ` · ${b.packageHours} hr package` : " · custom duration") : ""}
                          </p>
                          {b.stops && b.stops.length > 0 && (
                            <p className="text-[11px] text-slate-500">Stops: {b.stops.join(' → ')}</p>
                          )}
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Vehicle &amp; Chauffeur</p>
                          <p className="mt-1 flex items-center gap-1.5 font-bold text-ink">
                            <Car className="h-3.5 w-3.5 shrink-0 text-brand-600" />
                            {b.vehicleName}
                          </p>
                          <p className="text-slate-600">
                            Tariff: <strong className="text-brand-700">{b.fare !== null ? `₹${b.fare}` : 'Price on request'}</strong>
                          </p>
                          {b.driverName ? (
                            <div className="mt-2 rounded-xl border border-indigo-100 bg-indigo-50 p-2.5 text-[11px] text-indigo-800">
                              <p className="font-bold">
                                Chauffeur: {b.driverName} ({b.driverPhone})
                              </p>
                              <p className="text-indigo-700/80">Reg: {b.vehicleRegistration}</p>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenAssignDriver(b)}
                              className={`${smallBtn} mt-2 bg-brand-600 text-white shadow-glow hover:bg-brand-700`}
                            >
                              <UserCheck className="h-3.5 w-3.5" /> Assign Chauffeur
                            </button>
                          )}
                        </div>
                      </div>

                      {b.notes && (
                        <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-xs text-slate-600">
                          <strong className="text-ink">Passenger Notes:</strong> {b.notes}
                        </p>
                      )}
                    </article>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 3: PRICING — per-car tariffs, live across the website */}
        {activeTab === 'pricing' && (
          <div className="animate-panel-in space-y-5">
            <div>
              <h2 className={panelTitle}>Car Prices &amp; Tariffs</h2>
              <p className="text-sm text-slate-600">
                Set each car&apos;s rates once — fare results, fleet cards, route prices, vehicle pages and the comparison
                table all update automatically. Leave a field empty to show &quot;Price on request&quot;.
              </p>
            </div>
            <div className="grid gap-5 xl:grid-cols-2">
              {(data?.vehicles || []).map((v) => (
                <VehicleRatesEditor
                  key={`${v.id}-${JSON.stringify(v.rates)}`}
                  vehicle={v}
                  onSaved={(msg) => {
                    showToast(msg);
                    loadData();
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: FLEET & VEHICLES */}
        {activeTab === 'fleet' && (
          <div className="animate-panel-in space-y-5">
            <div>
              <h2 className={panelTitle}>Fleet &amp; Vehicle Confirmation</h2>
              <p className="text-sm text-slate-600">
                Vehicles flagged as unconfirmed (such as Hycross) remain hidden from customer vehicle selection until toggled active.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {(data?.vehicles || []).map((v) => (
                <div
                  key={v.id}
                  className={`card-float p-6 ${v.confirmed ? '' : 'border-dashed border-amber-300 bg-amber-50/30'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-extrabold tracking-tight">{v.name}</h3>
                      <p className="text-xs text-slate-500">{v.type}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        v.confirmed ? 'bg-live-500/15 text-live-600' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {v.confirmed ? 'Active on Site' : 'Unconfirmed / Hidden'}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <span className="flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 font-medium text-slate-700">
                      <Users className="h-3.5 w-3.5 text-brand-600" /> {v.seats} Seats
                    </span>
                    <span className="flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 font-medium text-slate-700">
                      <Car className="h-3.5 w-3.5 text-brand-600" /> {v.luggage} Luggage Bags
                    </span>
                  </div>
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => handleToggleVehicle(v.id, v.confirmed)}
                      className={v.confirmed ? 'btn-ghost w-full text-xs' : 'btn w-full bg-live-600 text-xs text-white hover:-translate-y-0.5 hover:bg-live-500'}
                    >
                      {v.confirmed ? (
                        'Deactivate Vehicle'
                      ) : (
                        <>
                          <Check className="h-4 w-4" /> Activate Hycross on Storefront
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: TOUR ENQUIRIES */}
        {activeTab === 'enquiries' && (
          <div className="animate-panel-in space-y-5">
            <div>
              <h2 className={panelTitle}>Tour Package &amp; Contact Enquiries</h2>
              <p className="text-sm text-slate-600">Inquiries captured from /tour-packages and /contact lead forms.</p>
            </div>

            <div className="space-y-3">
              {(data?.enquiries || []).length === 0 && (
                <div className="card-float py-14 text-center text-sm text-slate-500">No enquiries yet.</div>
              )}
              {(data?.enquiries || []).map((e, idx) => {
                const cleanPhone = e.phone.replace(/\D/g, '');
                const waNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                const tourWaMessage = encodeURIComponent(
                  `Hello ${e.name},\n\nThank you for reaching out to ${siteConfig.brand.name} regarding your upcoming tour to *${e.destination}* on ${e.travelDate}.\n\nOur team has prepared a custom Toyota Innova itinerary for your party of ${e.passengers} passengers. Are you available for a quick 2-minute call to discuss your preferences?`
                );
                const tourWaUrl = `https://wa.me/${waNumber}?text=${tourWaMessage}`;

                return (
                  <article key={e.id || idx} className="card-float p-5">
                    <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h4 className="flex flex-wrap items-center gap-2 text-sm font-extrabold text-ink">
                          {e.name}
                          <span className="font-mono text-xs font-medium text-slate-500">+91 {e.phone}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${enquiryBadge(e.status)}`}>{e.status}</span>
                        </h4>
                        <p className="mt-0.5 text-xs font-semibold text-brand-700">Destination: {e.destination}</p>
                      </div>
                      <select
                        value={e.status}
                        onChange={(ev) => handleEnquiryStatus(e.id || '', ev.target.value as Enquiry['status'])}
                        aria-label={`Status for ${e.name}`}
                        className="field w-auto py-2 text-xs"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONTACTED">CONTACTED</option>
                        <option value="CONVERTED">CONVERTED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </div>

                    <div className="mt-4 grid gap-3 text-xs text-slate-700 sm:grid-cols-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Travel Schedule</p>
                        <p className="mt-1">Date: {e.travelDate}</p>
                        {e.duration && <p className="text-slate-500">Duration: {e.duration}</p>}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Passengers &amp; Car</p>
                        <p className="mt-1">{e.passengers} Passengers</p>
                        <p className="text-slate-500">{e.vehicleModel || 'Innova Crysta'}</p>
                      </div>
                      <div className="flex items-center gap-2 sm:justify-end">
                        <a href={`tel:+91${cleanPhone}`} className={`${smallBtn} border border-slate-200/80 bg-white text-slate-800 hover:border-slate-300`}>
                          <Phone className="h-3.5 w-3.5 text-brand-600" /> Call
                        </a>
                        <a href={tourWaUrl} target="_blank" rel="noopener noreferrer" className={`${smallBtn} bg-whatsapp text-white hover:brightness-95`}>
                          <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Lead
                        </a>
                      </div>
                    </div>

                    {e.notes && (
                      <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-xs text-slate-600">
                        <strong className="text-ink">Requirements:</strong> {e.notes}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Assign chauffeur modal (design.md §3.6 overlay) */}
      {assignModalBooking && (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-labelledby="assign-title">
          <div className="absolute inset-0 animate-fade-in bg-slate-900/40 backdrop-blur-sm" onClick={() => setAssignModalBooking(null)} />
          <div className="pointer-events-none absolute inset-0 flex items-end justify-center p-3 sm:items-center">
            <div className="pointer-events-auto w-full animate-drawer-in overflow-hidden rounded-4xl bg-white shadow-float-lg sm:w-[480px]">
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 pb-4 pt-5">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-indigo-700">Chauffeur Assignment</p>
                  <h3 id="assign-title" className="text-lg font-extrabold tracking-tight">
                    Booking #{assignModalBooking.bookingId}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setAssignModalBooking(null)}
                  aria-label="Close"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-ink hover:bg-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveDriverAssignment} className="space-y-4 px-5 py-5">
                <div>
                  <label htmlFor="assign-name" className="label">
                    Chauffeur Full Name *
                  </label>
                  <input
                    id="assign-name"
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="e.g. Manjunath Gowda"
                    required
                    className="field"
                  />
                </div>
                <div>
                  <label htmlFor="assign-phone" className="label">
                    Chauffeur Mobile Number *
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">+91</span>
                    <input
                      id="assign-phone"
                      type="tel"
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="9448123456"
                      required
                      maxLength={10}
                      className="field pl-12 tabular-nums"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="assign-reg" className="label">
                    Vehicle Registration Number *
                  </label>
                  <input
                    id="assign-reg"
                    type="text"
                    value={vehicleReg}
                    onChange={(e) => setVehicleReg(e.target.value.toUpperCase())}
                    placeholder="e.g. KA 04 MP 7821"
                    required
                    className="field font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                  <button type="button" onClick={() => setAssignModalBooking(null)} className="btn-ghost">
                    Cancel
                  </button>
                  <button type="submit" disabled={driverSubmitting} className="btn-primary">
                    <Send className="h-4 w-4" />
                    {driverSubmitting ? 'Assigning...' : 'Assign & Send WhatsApp'}
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
