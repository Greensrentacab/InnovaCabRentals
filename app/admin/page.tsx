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
  updateRouteFares,
  toggleVehicleActive,
  updateEnquiryStatus,
  adminLogout,
  AdminDashboardData,
} from '@/app/actions/admin';
import { Booking, BookingStatus, Route, Vehicle, Enquiry } from '@/lib/types';
import { siteConfig } from '@/lib/siteConfig';

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

  // Pricing Edit State (Route slug -> fares)
  const [editingFares, setEditingFares] = useState<{
    [slug: string]: { innova: string; crysta: string };
  }>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getAdminDashboardData();
      setData(res);

      // Pre-populate pricing editable inputs
      const initialFares: { [slug: string]: { innova: string; crysta: string } } = {};
      res.routes.forEach((r) => {
        initialFares[r.slug] = {
          innova: r.fares.innova !== null ? String(r.fares.innova) : '',
          crysta: r.fares['innova-crysta'] !== null ? String(r.fares['innova-crysta']) : '',
        };
      });
      setEditingFares(initialFares);
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

  const handleSaveRouteFares = async (slug: string) => {
    const current = editingFares[slug];
    if (!current) return;

    const parsedInnova = current.innova.trim() ? Number(current.innova) : null;
    const parsedCrysta = current.crysta.trim() ? Number(current.crysta) : null;

    const res = await updateRouteFares(slug, {
      innova: isNaN(parsedInnova as number) ? null : parsedInnova,
      'innova-crysta': isNaN(parsedCrysta as number) ? null : parsedCrysta,
    });

    if (res.success) {
      showToast(`Updated tariffs for ${slug}`);
      loadData();
    } else {
      showToast(res.error || 'Failed to update tariffs');
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

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'CONFIRMED':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'DRIVER_ASSIGNED':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'TRIP_STARTED':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'COMPLETED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'CANCELLED':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-brand-orange text-white px-5 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================================================================== */}
      {/* TOP CONSOLE NAVIGATION                                             */}
      {/* ================================================================== */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-orange text-white flex items-center justify-center font-black shadow-md">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white flex items-center gap-2">
                  <span>INNOVA CABS</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Operations Live
                  </span>
                </h1>
                <p className="text-[10px] text-slate-400">
                  Bangalore Dispatch Desk • <code>greensrentacab@gmail.com</code>
                </p>
              </div>
            </div>

            <div className="flex sm:hidden items-center gap-2">
              <button
                onClick={loadData}
                className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg bg-red-950 text-red-300"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Live Website</span>
            </Link>

            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/60 text-red-300 text-xs font-semibold border border-red-800/60 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="max-w-7xl mx-auto mt-3 pt-2 border-t border-slate-800 flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-brand-orange text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'bookings'
                ? 'bg-brand-orange text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Bookings &amp; Dispatch</span>
            {data?.stats.pendingBookings ? (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-red-500 text-white font-black">
                {data.stats.pendingBookings}
              </span>
            ) : null}
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'pricing'
                ? 'bg-brand-orange text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Pricing &amp; Tariffs</span>
          </button>

          <button
            onClick={() => setActiveTab('fleet')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'fleet'
                ? 'bg-brand-orange text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Fleet &amp; Vehicles</span>
          </button>

          <button
            onClick={() => setActiveTab('enquiries')}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'enquiries'
                ? 'bg-brand-orange text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Tour Enquiries</span>
            {data?.stats.pendingEnquiries ? (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-slate-950 font-black">
                {data.stats.pendingEnquiries}
              </span>
            ) : null}
          </button>
        </div>
      </header>

      {/* ================================================================== */}
      {/* MAIN CONSOLE BODY                                                  */}
      {/* ================================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8">
        
        {/* ---------------------------------------------------------------- */}
        {/* TAB 1: OVERVIEW DASHBOARD                                        */}
        {/* ---------------------------------------------------------------- */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Urgent Pending Action Banner */}
            {(data?.stats.pendingBookings || 0) > 0 && (
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-200">
                      {data?.stats.pendingBookings} Booking Request(s) Awaiting Confirmation
                    </h3>
                    <p className="text-xs text-amber-300/80">
                      Passengers are waiting for driver assignment or WhatsApp verification.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('bookings');
                    setStatusFilter('PENDING');
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all self-start sm:self-auto"
                >
                  Review Pending Requests
                </button>
              </div>
            )}

            {/* Live KPI Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Total Bookings
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-white">
                    {data?.stats.totalBookings || 0}
                  </span>
                  <span className="text-xs text-slate-500">All time</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  Pending Approval
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-amber-400">
                    {data?.stats.pendingBookings || 0}
                  </span>
                  <span className="text-xs text-amber-500/70 font-semibold">Action needed</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
                  Assigned / Active
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-purple-400">
                    {data?.stats.activeTrips || 0}
                  </span>
                  <span className="text-xs text-purple-500/70 font-semibold">Chauffeur on duty</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  Completed Trips
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-emerald-400">
                    {data?.stats.completedTrips || 0}
                  </span>
                  <span className="text-xs text-emerald-500/70 font-semibold">Finished</span>
                </div>
              </div>
            </div>

            {/* Quick Overview Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              {/* Recent Bookings preview */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-brand-orange" />
                    <span>Recent Booking Requests</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="text-xs font-bold text-brand-orange hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="divide-y divide-slate-800/80">
                  {(data?.bookings || []).slice(0, 4).map((b) => (
                    <div key={b.bookingId} className="py-3 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white">{b.bookingId}</span>
                          <span className="font-semibold text-slate-300">{b.customerName}</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {b.pickupName} ➔ {b.dropName}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${getStatusBadge(b.bookingStatus)}`}>
                        {b.bookingStatus}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Enquiries preview */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>Recent Tour Enquiries</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('enquiries')}
                    className="text-xs font-bold text-emerald-400 hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="divide-y divide-slate-800/80">
                  {(data?.enquiries || []).slice(0, 4).map((e, idx) => (
                    <div key={e.id || idx} className="py-3 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{e.name}</span>
                          <span className="text-[11px] text-slate-400">+91 {e.phone}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate max-w-xs">
                          {e.destination}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-300">
                        {e.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* TAB 2: BOOKINGS & DISPATCH                                       */}
        {/* ---------------------------------------------------------------- */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Bookings &amp; Chauffeur Dispatch
                </h2>
                <p className="text-xs text-slate-400">
                  Manage approvals, driver assignments, and direct customer communication.
                </p>
              </div>

              {/* Search & Filter */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    placeholder="Search by ID, name, phone..."
                    className="pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 w-48 sm:w-64"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                  {['ALL', 'PENDING', 'CONFIRMED', 'DRIVER_ASSIGNED', 'COMPLETED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                        statusFilter === st
                          ? 'bg-brand-orange text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {st === 'DRIVER_ASSIGNED' ? 'ASSIGNED' : st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bookings List */}
            <div className="space-y-4">
              {filteredBookings.length === 0 ? (
                <div className="py-16 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
                  No bookings found matching your search.
                </div>
              ) : (
                filteredBookings.map((b) => {
                  const cleanCustomerPhone = b.customerPhone.replace(/\D/g, '');
                  const customerWaNumber =
                    cleanCustomerPhone.length === 10 ? `91${cleanCustomerPhone}` : cleanCustomerPhone;

                  const confirmWaMessage = encodeURIComponent(
                    `Hello ${b.customerName},\n\nThis is ${siteConfig.brand.name}. We are pleased to confirm your Innova booking #${b.bookingId}:\n• Route: ${b.pickupName} ➔ ${b.dropName}\n• Service: ${b.serviceType.toUpperCase()} (${b.tripType === 'round' ? 'Round Trip' : 'One Way'})\n• Date & Time: ${b.pickupDate} at ${b.pickupTime}\n• Vehicle: ${b.vehicleName}\n• Tariff: ${b.fare !== null ? `₹${b.fare}` : 'Price on request'}\n\nOur operations desk will send chauffeur details 2 hours prior to departure.`
                  );
                  const confirmWaUrl = `https://wa.me/${customerWaNumber}?text=${confirmWaMessage}`;

                  return (
                    <div
                      key={b.bookingId}
                      className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 transition-all shadow-md space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-mono text-sm font-extrabold text-brand-orange">
                            #{b.bookingId}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full border text-xs font-bold ${getStatusBadge(
                              b.bookingStatus
                            )}`}
                          >
                            {b.bookingStatus}
                          </span>
                          <span className="text-xs text-slate-400">
                            Created: {new Date(b.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Status Switcher Dropdown */}
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-slate-400 font-medium">Status:</label>
                          <select
                            value={b.bookingStatus}
                            onChange={(e) =>
                              handleStatusChange(b.bookingId, e.target.value as BookingStatus)
                            }
                            className="bg-slate-950 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-orange"
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

                      {/* Booking Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        {/* Passenger */}
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-500">
                            Passenger Info
                          </span>
                          <p className="font-bold text-white text-sm">{b.customerName}</p>
                          <p className="text-slate-400 font-mono">+91 {b.customerPhone}</p>
                          <div className="flex items-center gap-2 pt-1">
                            <a
                              href={`tel:+91${cleanCustomerPhone}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 text-[11px] font-semibold transition-colors"
                            >
                              <Phone className="w-3 h-3 text-brand-orange" />
                              <span>Call</span>
                            </a>
                            <a
                              href={confirmWaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-800/60 text-[11px] font-semibold transition-colors"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </a>
                          </div>
                        </div>

                        {/* Route & Schedule */}
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-500">
                            Route &amp; Journey ({b.tripType === 'round' ? 'Round Trip' : 'One Way'})
                          </span>
                          <p className="font-bold text-white flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                            <span>{b.pickupName} ➔ {b.dropName}</span>
                          </p>
                          <p className="text-slate-400 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>{b.pickupDate} at {b.pickupTime}</span>
                          </p>
                          <p className="text-[11px] text-slate-400 capitalize">
                            Service: {b.serviceType}
                          </p>
                        </div>

                        {/* Vehicle & Chauffeur */}
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-500">
                            Vehicle &amp; Chauffeur
                          </span>
                          <p className="font-bold text-white flex items-center gap-1.5">
                            <Car className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{b.vehicleName}</span>
                          </p>
                          <p className="text-slate-300">
                            Tariff: <strong className="text-brand-orange">{b.fare !== null ? `₹${b.fare}` : 'Price on request'}</strong>
                          </p>

                          {b.driverName ? (
                            <div className="pt-1 text-[11px] text-purple-300 bg-purple-950/40 p-2 rounded-lg border border-purple-800/40">
                              <p className="font-bold">Chauffeur: {b.driverName} ({b.driverPhone})</p>
                              <p className="text-slate-400">Reg: {b.vehicleRegistration}</p>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleOpenAssignDriver(b)}
                              className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-700/60 text-xs font-bold transition-colors"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Assign Chauffeur</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Notes if any */}
                      {b.notes && (
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-400">
                          <strong className="text-slate-300">Passenger Notes:</strong> {b.notes}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* TAB 3: PRICING & TARIFFS                                         */}
        {/* ---------------------------------------------------------------- */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">
                Tariffs &amp; Route Pricing Manager
              </h2>
              <p className="text-xs text-slate-400">
                All prices in Firestore are nullable. Leaving values empty will show &quot;Price on request&quot; on the website.
              </p>
            </div>

            {/* 8 Routes Pricing Editor */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">
                  Outstation &amp; Airport Route Fixed Fares
                </h3>
                <span className="text-[11px] text-slate-400">
                  8 Pre-configured Routes
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-semibold text-[10px]">
                    <tr>
                      <th className="px-6 py-3">Route Destination</th>
                      <th className="px-4 py-3">Distance &amp; Time</th>
                      <th className="px-4 py-3">Toyota Innova (₹)</th>
                      <th className="px-4 py-3">Toyota Innova Crysta (₹)</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {(data?.routes || []).map((r) => {
                      const current = editingFares[r.slug] || { innova: '', crysta: '' };

                      return (
                        <tr key={r.slug} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-6 py-4 font-bold text-white">
                            <div>{r.name}</div>
                            <span className="text-[10px] text-slate-500 font-mono">
                              /routes/{r.slug}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-slate-300">
                            <div>{r.distanceKm} Km</div>
                            <span className="text-[10px] text-slate-500">{r.durationText}</span>
                          </td>
                          <td className="px-4 py-4">
                            <input
                              type="number"
                              value={current.innova}
                              onChange={(e) =>
                                setEditingFares({
                                  ...editingFares,
                                  [r.slug]: { ...current, innova: e.target.value },
                                })
                              }
                              placeholder="Null (On request)"
                              className="w-32 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:ring-1 focus:ring-brand-orange"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <input
                              type="number"
                              value={current.crysta}
                              onChange={(e) =>
                                setEditingFares({
                                  ...editingFares,
                                  [r.slug]: { ...current, crysta: e.target.value },
                                })
                              }
                              placeholder="Null (On request)"
                              className="w-32 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:ring-1 focus:ring-brand-orange"
                            />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleSaveRouteFares(r.slug)}
                              className="px-3 py-1.5 rounded-lg bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs shadow-sm transition-all"
                            >
                              Save Tariff
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* TAB 4: FLEET & VEHICLES                                          */}
        {/* ---------------------------------------------------------------- */}
        {activeTab === 'fleet' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">
                Fleet &amp; Vehicle Confirmation
              </h2>
              <p className="text-xs text-slate-400">
                Vehicles flagged as unconfirmed (such as Hycross) remain hidden from customer vehicle selection until toggled active.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(data?.vehicles || []).map((v) => (
                <div
                  key={v.id}
                  className={`bg-slate-900 border rounded-2xl p-6 space-y-4 transition-all shadow-md ${
                    v.confirmed
                      ? 'border-slate-800'
                      : 'border-dashed border-amber-500/40 bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">{v.name}</h3>
                      <p className="text-xs text-slate-400">{v.type}</p>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        v.confirmed
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {v.confirmed ? 'Active on Site' : 'Unconfirmed / Hidden'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>{v.seats} Seats</span>
                    <span>•</span>
                    <span>{v.luggage} Luggage Bags</span>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <button
                      onClick={() => handleToggleVehicle(v.id, v.confirmed)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${
                        v.confirmed
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {v.confirmed ? (
                        <span>Deactivate Vehicle</span>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Activate Hycross on Storefront</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* TAB 5: TOUR ENQUIRIES                                            */}
        {/* ---------------------------------------------------------------- */}
        {activeTab === 'enquiries' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">
                Tour Package &amp; Contact Enquiries
              </h2>
              <p className="text-xs text-slate-400">
                Inquiries captured from /tour-packages and /contact lead forms.
              </p>
            </div>

            <div className="space-y-4">
              {(data?.enquiries || []).map((e, idx) => {
                const cleanPhone = e.phone.replace(/\D/g, '');
                const waNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                const tourWaMessage = encodeURIComponent(
                  `Hello ${e.name},\n\nThank you for reaching out to ${siteConfig.brand.name} regarding your upcoming tour to *${e.destination}* on ${e.travelDate}.\n\nOur team has prepared a custom Toyota Innova itinerary for your party of ${e.passengers} passengers. Are you available for a quick 2-minute call to discuss your preferences?`
                );
                const tourWaUrl = `https://wa.me/${waNumber}?text=${tourWaMessage}`;

                return (
                  <div
                    key={e.id || idx}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{e.name}</span>
                          <span className="text-xs text-slate-400 font-mono">+91 {e.phone}</span>
                        </h4>
                        <p className="text-xs text-brand-orange font-semibold mt-0.5">
                          Destination: {e.destination}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <select
                          value={e.status}
                          onChange={(ev) =>
                            handleEnquiryStatus(e.id || '', ev.target.value as Enquiry['status'])
                          }
                          className="bg-slate-950 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONTACTED">CONTACTED</option>
                          <option value="CONVERTED">CONVERTED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">
                          Travel Schedule
                        </span>
                        <span>Date: {e.travelDate}</span>
                        {e.duration && <span className="block text-slate-400">Duration: {e.duration}</span>}
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">
                          Passengers &amp; Car
                        </span>
                        <span>{e.passengers} Passengers</span>
                        <span className="block text-slate-400">{e.vehicleModel || 'Innova Crysta'}</span>
                      </div>

                      <div className="flex items-center gap-2 sm:justify-end">
                        <a
                          href={`tel:+91${cleanPhone}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 font-bold text-xs"
                        >
                          <Phone className="w-3.5 h-3.5 text-brand-orange" />
                          <span>Call</span>
                        </a>

                        <a
                          href={tourWaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp Lead</span>
                        </a>
                      </div>
                    </div>

                    {e.notes && (
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                        <strong className="text-slate-300">Requirements:</strong> {e.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* ================================================================== */}
      {/* ASSIGN CHAUFFEUR MODAL                                             */}
      {/* ================================================================== */}
      {assignModalBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-400">
                  Chauffeur Assignment
                </span>
                <h3 className="text-base font-bold text-white">
                  Booking #{assignModalBooking.bookingId}
                </h3>
              </div>
              <button
                onClick={() => setAssignModalBooking(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDriverAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Chauffeur Full Name *
                </label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="e.g. Manjunath Gowda"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Chauffeur Mobile Number *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9448123456"
                    required
                    maxLength={10}
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Vehicle Registration Number *
                </label>
                <input
                  type="text"
                  value={vehicleReg}
                  onChange={(e) => setVehicleReg(e.target.value.toUpperCase())}
                  placeholder="e.g. KA 04 MP 7821"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAssignModalBooking(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={driverSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{driverSubmitting ? 'Assigning...' : 'Assign & Send WhatsApp'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
