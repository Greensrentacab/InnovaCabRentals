import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import StorefrontShell from '@/components/StorefrontShell';
import { siteConfig } from '@/lib/siteConfig';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: siteConfig.seo.title,
  description: siteConfig.seo.metaDescription,
  keywords: [
    ...siteConfig.seo.primaryKeywords,
    ...siteConfig.seo.secondaryKeywords,
    ...siteConfig.seo.highIntentKeywords,
  ],
  authors: [{ name: siteConfig.brand.name }],
  robots: 'index, follow',
};

export const viewport: Viewport = {
  themeColor: '#0B1B33',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} font-sans`}>
      <body className="min-h-screen bg-brand-offwhite text-brand-navy flex flex-col antialiased">
        <StorefrontShell>{children}</StorefrontShell>
      </body>
    </html>
  );
}
