/**
 * JsonLd.tsx — schema.org structured data (LocalBusiness / TravelAgency and
 * BreadcrumbList). Business details come from siteConfig only.
 */

import { siteConfig } from '@/lib/siteConfig';
import { absoluteUrl } from '@/lib/siteUrl';

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\u003c') }}
    />
  );
}

export function BusinessJsonLd() {
  const { contact, brand, seo, payments } = siteConfig;
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': ['TravelAgency', 'LocalBusiness'],
        '@id': absoluteUrl('/#business'),
        name: brand.name,
        description: seo.metaDescription,
        url: absoluteUrl('/'),
        image: absoluteUrl('/images/fleet/own/innova-side.jpg'),
        telephone: `+91${contact.phone.raw}`,
        email: contact.email,
        address: {
          '@type': 'PostalAddress',
          streetAddress: contact.address.street,
          addressLocality: contact.address.city,
          addressRegion: contact.address.state,
          postalCode: contact.address.postalCode,
          addressCountry: contact.address.country,
        },
        areaServed: { '@type': 'City', name: 'Bengaluru' },
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: '00:00',
          closes: '23:59',
        },
        paymentAccepted: payments.schema,
        currenciesAccepted: 'INR',
      }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: { label: string; href?: string }[] }) {
  const crumbs = [{ label: 'Home', href: '/' }, ...items];
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: c.label,
          ...(c.href ? { item: absoluteUrl(c.href) } : {}),
        })),
      }}
    />
  );
}
