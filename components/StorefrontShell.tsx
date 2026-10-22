'use client';

/**
 * StorefrontShell.tsx
 *
 * Wraps customer-facing pages with the design.md shell (§2.4): floating
 * HomeHeader, Footer, HomeDock (mobile quick actions + desktop WhatsApp FAB),
 * the BookingFlowModal and the customer-account AuthDialog. /admin routes get
 * an uninterrupted full-screen console instead.
 */

import React from 'react';
import { usePathname } from 'next/navigation';
import Footer from '@/components/Footer';
import BookingFlowModal from '@/components/BookingFlowModal';
import HomeHeader from '@/components/home/HomeHeader';
import HomeDock from '@/components/home/HomeDock';
import AuthDialog from '@/components/auth/AuthDialog';
import { BookingFlowProvider } from '@/context/BookingFlowContext';
import { AuthProvider } from '@/context/AuthContext';
import type { FooterDestinationLink } from '@/lib/footerColumns';

export default function StorefrontShell({
  children,
  footerLinks,
}: {
  children: React.ReactNode;
  /** Published Admin → Footer destinations (loaded by the root layout) */
  footerLinks: FooterDestinationLink[];
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    return <main className="ds-scope min-h-screen bg-porcelain">{children}</main>;
  }

  return (
    <AuthProvider>
      <BookingFlowProvider>
        <HomeHeader />
        <main className="flex-1 bg-porcelain">{children}</main>
        <Footer destinationLinks={footerLinks} />
        <HomeDock />
        <BookingFlowModal />
        <AuthDialog />
      </BookingFlowProvider>
    </AuthProvider>
  );
}
