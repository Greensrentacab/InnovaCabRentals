import { Suspense } from 'react';
import type { Metadata } from 'next';
import AuthPage from '@/components/auth/AuthPage';
import { siteConfig } from '@/lib/siteConfig';
import { withSeo } from '@/lib/seo';

export const metadata: Metadata = withSeo({
  title: `Sign In | ${siteConfig.brand.name}`,
  description: 'Sign in to Innova Cab Rentals with Google or email to confirm bookings and track your trips.',
  alternates: { canonical: '/signin' },
  robots: { index: false, follow: true },
});

export default function SignInPage() {
  return (
    <Suspense>
      <AuthPage mode="signin" />
    </Suspense>
  );
}
