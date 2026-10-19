import { Suspense } from 'react';
import type { Metadata } from 'next';
import AuthPage from '@/components/auth/AuthPage';
import { siteConfig } from '@/lib/siteConfig';
import { withSeo } from '@/lib/seo';

export const metadata: Metadata = withSeo({
  title: `Create Account | ${siteConfig.brand.name}`,
  description: 'Create your Innova Cab Rentals account with Google or email to book faster and track your trips.',
  alternates: { canonical: '/signup' },
  robots: { index: false, follow: true },
});

export default function CreateAccountPage() {
  return (
    <Suspense>
      <AuthPage mode="signup" />
    </Suspense>
  );
}
