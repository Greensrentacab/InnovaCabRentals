import type { Metadata, Viewport } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';
import StorefrontShell from '@/components/StorefrontShell';
import { siteConfig } from '@/lib/siteConfig';
import { siteUrl } from '@/lib/siteUrl';
import { BusinessJsonLd } from '@/components/seo/JsonLd';
import { baseOpenGraph, defaultShareImage } from '@/lib/seo';
import { getFooterDestinationLinks } from '@/lib/destinationStore';

// Site typeface (DM Sans), exposed as --font-dm-sans for the Tailwind font-sans stack.
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-dm-sans',
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
  icons: {
    icon: [
      { url: '/icon.png?v=2', type: 'image/png', sizes: '512x512' },
      { url: '/favicon.ico?v=2', sizes: 'any' },
    ],
    shortcut: '/favicon.ico?v=2',
    apple: '/apple-icon.png?v=2',
  },
  openGraph: {
    ...baseOpenGraph,
    title: siteConfig.seo.title,
    description: siteConfig.seo.metaDescription,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.seo.title,
    description: siteConfig.seo.metaDescription,
    images: [defaultShareImage.url],
  },
};

export const viewport: Viewport = {
  themeColor: '#F8FAFC',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Admin → Footer destinations (published links; never throws)
  const footerLinks = await getFooterDestinationLinks();

  return (
    <html lang="en" className={dmSans.variable}>
      <body className="flex min-h-screen flex-col">
        <BusinessJsonLd />
        <StorefrontShell footerLinks={footerLinks}>{children}</StorefrontShell>
      </body>
    </html>
  );
}
