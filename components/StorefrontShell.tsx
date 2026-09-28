'use client';

/**
 * StorefrontShell.tsx
 * 
 * Conditionally wraps pages with customer-facing Header, Footer,
 * MobileStickyBar, and BookingFlowModal. When visiting /admin routes,
 * gives the Operations Dispatch Team an uninterrupted, full-screen console.
 */

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileStickyBar from '@/components/MobileStickyBar';
import BookingFlowModal from '@/components/BookingFlowModal';
import { BookingFlowProvider } from '@/context/BookingFlowContext';

export default function StorefrontShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    return <main className="min-h-screen bg-slate-950 text-slate-100">{children}</main>;
  }

  return (
    <BookingFlowProvider>
      <Header />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
      <MobileStickyBar />
      <BookingFlowModal />
    </BookingFlowProvider>
  );
}
