import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import StorefrontShell from '@/components/StorefrontShell';
import { siteConfig } from '@/lib/siteConfig';
import { siteUrl } from '@/lib/siteUrl';
import { BusinessJsonLd } from '@/components/seo/JsonLd';

// Design-system typeface (design.md §1.3)
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteConfig.seo.title,
  description: siteConfig.seo.metaDescription,
  keywords: [
    ...siteConfig.seo.primaryKeywords,
    ...siteConfig.seo.secondaryKeywords,
    ...siteConfig.seo.highIntentKeywords,
  ],
  authors: [{ name: siteConfig.brand.name }],
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: siteConfig.brand.name,
    title: siteConfig.seo.title,
    description: siteConfig.seo.metaDescription,
    images: [{ url: '/images/fleet/own/innova-side.jpg', width: 1600, height: 1200, alt: 'Toyota Innova from our Bangalore fleet' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#F8FAFC',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="flex min-h-screen flex-col">
        <BusinessJsonLd />
        <StorefrontShell>{children}</StorefrontShell>
      </body>
    </html>
  );
}
