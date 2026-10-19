/**
 * seo.ts — shared page metadata. withSeo() gives every page its own Open
 * Graph / Twitter title, description and URL (Next.js otherwise reuses the
 * homepage's link-preview tags from app/layout.tsx on every page).
 */

import type { Metadata } from 'next';
import { siteConfig } from '@/lib/siteConfig';

export const defaultShareImage = {
  url: '/images/fleet/own/innova-side.jpg',
  width: 1600,
  height: 1200,
  alt: 'Toyota Innova from our Bangalore fleet',
};

export const baseOpenGraph = {
  type: 'website' as const,
  locale: 'en_IN',
  siteName: siteConfig.brand.name,
  images: [defaultShareImage],
};

export function withSeo(meta: Metadata): Metadata {
  const title = typeof meta.title === 'string' ? meta.title : undefined;
  const description = meta.description ?? undefined;
  const canonical = meta.alternates?.canonical;
  const url = typeof canonical === 'string' ? canonical : undefined;

  return {
    ...meta,
    openGraph: { ...baseOpenGraph, title, description, url, ...meta.openGraph },
    twitter: { card: 'summary_large_image', title, description, images: [defaultShareImage.url], ...meta.twitter },
  };
}
