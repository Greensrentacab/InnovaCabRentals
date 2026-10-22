/**
 * Service URLs: old paths redirect once to a page that exists, every
 * internal link points straight at a live page, and the sitemap lists them.
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

test('every service URL is a real page with its own canonical', () => {
  for (const path of SERVICE_PATHS) {
    assert.ok(pageExists(path), `${path} has no page`);
    assert.ok(read(`app${path}/page.tsx`).includes(`canonical: '${path}'`), `${path} canonical`);
  }
});

test('old service URLs redirect permanently, once, to an existing page', async () => {
  const { legacyRedirects } = await import('../next.config.mjs');
  const sources = new Set<string>(legacyRedirects.map((r: { source: string }) => r.source));
  for (const r of legacyRedirects as { source: string; destination: string; permanent: boolean }[]) {
    assert.equal(r.permanent, true, r.source);
    assert.ok(pageExists(r.destination), `${r.destination} does not exist`);
    assert.ok(!sources.has(r.destination), `${r.source} → ${r.destination} would chain`);
    assert.ok(!pageExists(r.source), `${r.source} still has its own page`);
  }
  for (const old of ['/airport-taxi', '/outstation-cabs', '/local-rides', '/tour-packages']) assert.ok(sources.has(old), old);
});

test('no internal link still points at an old service URL or a #fragment service link', () => {
  const files = [
    'components/Header.tsx',
    'components/Footer.tsx',
    'components/home/HomeHeader.tsx',
    'components/home/ServicesSection.tsx',
    'app/sitemap.ts',
    'app/admin/page.tsx',
  ];
  for (const f of files) {
    const src = read(f);
    assert.doesNotMatch(src, /['"`]\/(airport-taxi|outstation-cabs|local-rides|tour-packages)\b/, f);
    assert.doesNotMatch(src, /['"`]\/(outstation-cabs|local-rides)#/, f);
  }
});

test('the sitemap lists every service URL', () => {
  const src = read('app/sitemap.ts');
  for (const path of SERVICE_PATHS) assert.ok(src.includes(`'${path}'`), path);
});
