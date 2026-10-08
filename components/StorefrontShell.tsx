'use client';

/**
 * StorefrontShell.tsx
 *
 * Wraps customer-facing pages with the design.md shell (§2.4): floating
 * HomeHeader, Footer, HomeDock (mobile quick actions + desktop WhatsApp FAB)
 * and the BookingFlowModal. /admin routes get an uninterrupted full-screen
 * console instead.
 */

import React from 'react';
import { usePathname } from 'next/navigation';
import Footer from '@/components/Footer';
import BookingFlowModal from '@/components/BookingFlowModal';
import HomeHeader from '@/components/home/HomeHeader';
import HomeDock from '@/components/home/HomeDock';
import { BookingFlowProvider } from '@/context/BookingFlowContext';

export default function StorefrontShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    return <main className="ds-scope min-h-screen bg-porcelain">{children}</main>;
  }

  return (
    <BookingFlowProvider>
      <HomeHeader />
      <main className="flex-1 bg-porcelain">{children}</main>
      <Footer />
      <HomeDock />
      <BookingFlowModal />
    </BookingFlowProvider>
  );
}
