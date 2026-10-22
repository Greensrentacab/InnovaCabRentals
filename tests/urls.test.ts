/**
 * Service and company URLs: old paths redirect once to a page that exists,
 * every internal link points straight at a live page, and the sitemap lists them.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), 'utf8');
const pageExists = (path: string) => existsSync(join(root, 'app', path.replace(/^\//, ''), 'page.tsx'));

const SERVICE_PATHS = [
  '/bangalore-airport-taxi',
  '/bangalore-outstation-cab-service',
  '/bangalore-local-city-taxi',
  '/bangalore-round-trip-cab-rental',
  '/bangalore-hourly-cab-rental',
  '/bangalore-tour-packages',
];

/** Footer "Company" pages: old short path → full descriptive path */
const COMPANY_PATHS: Record<string, string> = {
  '/about': '/about-us',
  '/faq': '/frequently-asked-questions',
  '/terms': '/terms-and-conditions',
  '/contact': '/contact-and-booking',
};

type Redirect = { source: string; destination: string; permanent?: boolean; statusCode?: number };

test('every service URL is a real page with its own canonical', () => {
  for (const path of SERVICE_PATHS) {
    assert.ok(pageExists(path), `${path} has no page`);
    assert.ok(read(`app${path}/page.tsx`).includes(`canonical: '${path}'`), `${path} canonical`);
  }
});

test('every company URL is a real page with a self-referencing canonical', () => {
  for (const path of Object.values(COMPANY_PATHS)) {
    assert.ok(pageExists(path), `${path} has no page`);
    assert.ok(read(`app${path}/page.tsx`).includes(`canonical: '${path}'`), `${path} canonical`);
  }
});

test('old URLs redirect permanently, once, to an existing page', async () => {
  const { legacyRedirects } = (await import('../next.config.mjs')) as { legacyRedirects: Redirect[] };
  const sources = new Set<string>(legacyRedirects.map((r) => r.source));
  for (const r of legacyRedirects) {
    assert.ok(r.permanent === true || r.statusCode === 301 || r.statusCode === 308, `${r.source} is not permanent`);
    assert.ok(pageExists(r.destination), `${r.destination} does not exist`);
    assert.ok(!sources.has(r.destination), `${r.source} → ${r.destination} would chain`);
    assert.ok(!pageExists(r.source), `${r.source} still has its own page`);
  }
  for (const old of ['/airport-taxi', '/outstation-cabs', '/local-rides', '/tour-packages']) assert.ok(sources.has(old), old);
});

test('old company URLs answer 301 and point at the new full path', async () => {
  const { legacyRedirects } = (await import('../next.config.mjs')) as { legacyRedirects: Redirect[] };
  for (const [from, to] of Object.entries(COMPANY_PATHS)) {
    const r = legacyRedirects.find((x) => x.source === from);
    assert.ok(r, `${from} has no redirect`);
    assert.equal(r.destination, to, from);
    assert.equal(r.statusCode, 301, `${from} must be a 301`);
    assert.equal(r.permanent, undefined, `${from}: permanent would override the 301 with a 308`);
  }
});

test('no internal link still points at an old service or company URL', () => {
  const files = [
    'components/Header.tsx',
    'components/Footer.tsx',
    'components/home/HomeHeader.tsx',
    'components/home/ServicesSection.tsx',
    'components/home/TrustInfoSection.tsx',
    'components/MobileStickyBar.tsx',
    'components/BookingFlowModal.tsx',
    'components/LandingTemplate.tsx',
    'components/VehicleDetailTemplate.tsx',
    'components/ds/TermsSheet.tsx',
    'components/policies/TermText.tsx',
    'components/admin/PoliciesPanel.tsx',
    'app/page.tsx',
    'app/vehicles/page.tsx',
    'app/frequently-asked-questions/page.tsx',
    'app/terms-and-conditions/page.tsx',
    'app/sitemap.ts',
    'app/admin/page.tsx',
  ];
  for (const f of files) {
    const src = read(f);
    assert.doesNotMatch(src, /['"`]\/(airport-taxi|outstation-cabs|local-rides|tour-packages)\b/, f);
    assert.doesNotMatch(src, /['"`]\/(outstation-cabs|local-rides)#/, f);
    assert.doesNotMatch(src, /['"`]\/(about|faq|terms|contact)(?=['"`#?])/, f);
  }
});

test('the sitemap lists every service and company URL, and none of the old ones', () => {
  const src = read('app/sitemap.ts');
  for (const path of [...SERVICE_PATHS, ...Object.values(COMPANY_PATHS)]) assert.ok(src.includes(`'${path}'`), path);
  for (const old of Object.keys(COMPANY_PATHS)) assert.ok(!src.includes(`'${old}'`), `${old} still in the sitemap`);
});
