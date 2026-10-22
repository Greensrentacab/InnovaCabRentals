/**
 * Homepage image slots (lib/siteImages.ts) and Cloudinary signing
 * (lib/cloudinary.ts): defaults match the built-in pictures, published
 * overrides are validated, and rendering falls back safely.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'crypto';
import {
  buildSiteImagesView,
  carPhotos,
  cloudinaryIds,
  cloudinaryUrl,
  DEFAULT_SITE_IMAGES,
  defaultSlotValue,
  parseOverrides,
  SLOT_DEFS,
  type PlacedImage,
} from '@/lib/siteImages';
import { routePhotosByKey } from '@/lib/routePhotos';
import { fleetPhotos } from '@/lib/fleetPhotos';
import { createUploadTicket, signParams } from '@/lib/cloudinary';

const cloud = (over: Partial<PlacedImage['source']> = {}): PlacedImage => ({
  source: {
    kind: 'cloudinary',
    publicId: 'innova-cabs/site-images/hero-airport-0123abcd',
    version: 1730000000,
    width: 2400,
    height: 1350,
    format: 'jpg',
    bytes: 900_000,
    ...over,
  } as PlacedImage['source'],
  alt: 'Diwali offer',
  focus: { x: 60, y: 40 },
  mirror: false,
});

test('every slot has a built-in default', () => {
  for (const def of SLOT_DEFS) assert.ok(defaultSlotValue(def.id), def.id);
  assert.equal(SLOT_DEFS.filter((d) => d.group === 'routes').length, Object.keys(routePhotosByKey).length);
  assert.equal(SLOT_DEFS.filter((d) => d.group === 'fleet').length, Object.keys(fleetPhotos).length);
});

test('defaults reproduce the pictures the site showed before', () => {
  const v = DEFAULT_SITE_IMAGES;
  assert.equal(v.hero.airport.desktop.src, '/images/hero/hero-airport-960.webp');
  assert.equal(v.hero.airport.desktop.large, '/images/hero/hero-airport-1920.webp');
  assert.equal(v.hero.airport.desktop.mirror, true);
  assert.equal(v.hero.airport.mobile?.src, '/images/hero/hero-airport-mobile.webp');
  assert.equal(v.hero.outstation.mobile, null);
  assert.equal(v.services.airport.length, 4);
  assert.equal(v.services.airport[0].position, '75% 60%');
  assert.deepEqual(v.fleet.innova.map((p) => p.src), fleetPhotos.innova.map((p) => p.src));
  assert.equal(v.fleet.ertiga[0].own, false);
  assert.equal(v.fleet.innova[0].label, fleetPhotos.innova[0].label);
  assert.equal(v.routes.coorg.src, '/images/routes/coorg.webp');
  assert.equal(v.routes.coorg.credit?.author, routePhotosByKey.coorg.author);
});

test('a valid upload override is accepted and rendered through Cloudinary', () => {
  const res = parseOverrides({ 'hero.airport': { kind: 'single', desktop: cloud(), mobile: null } });
  assert.ok(res.ok);
  const view = buildSiteImagesView(res.value, 'demo');
  const hero = view.hero.airport.desktop;
  assert.equal(hero.custom, true);
  assert.equal(hero.src, 'https://res.cloudinary.com/demo/image/upload/c_limit,w_960,f_auto,q_auto/v1730000000/innova-cabs/site-images/hero-airport-0123abcd');
  assert.match(hero.srcSet!, /w_2400.* 2400w$/); // never upscaled beyond the original 2400px
  assert.equal(hero.position, '60% 40%');
  assert.equal(view.hero.airport.mobile, null); // phone crops the new desktop picture
  assert.equal(view.hero.outstation.desktop.src, '/images/hero/hero-outstation-960.webp'); // untouched slot
});

test('without a Cloudinary cloud name, uploaded pictures fall back to the built-in ones', () => {
  const res = parseOverrides({ 'fleet.innova': { kind: 'gallery', items: [cloud()] } });
  assert.ok(res.ok);
  const view = buildSiteImagesView(res.value, null);
  assert.deepEqual(view.fleet.innova.map((p) => p.src), fleetPhotos.innova.map((p) => p.src));
});

test('galleries keep their order and can mix built-in and uploaded photos', () => {
  const builtIn = (defaultSlotValue('services.local') as { items: PlacedImage[] }).items;
  const res = parseOverrides({ 'services.local': { kind: 'gallery', items: [cloud(), builtIn[2], builtIn[0]] } });
  assert.ok(res.ok);
  const photos = buildSiteImagesView(res.value, 'demo').services.local;
  assert.equal(photos.length, 3);
  assert.equal(photos[0].custom, true);
  assert.equal(photos[1].src, builtIn[2].source.kind === 'static' ? builtIn[2].source.src : '');
});

test('invalid overrides are rejected with readable errors', () => {
  const bad = (input: unknown) => {
    const r = parseOverrides(input);
    assert.equal(r.ok, false);
    return r.ok ? [] : r.errors;
  };
  assert.match(bad({ 'hero.nowhere': { kind: 'single', desktop: cloud(), mobile: null } })[0], /Unknown image slot/);
  assert.match(bad({ 'hero.airport': { kind: 'gallery', items: [] } })[0], /malformed/);
  assert.match(bad({ 'route.coorg': { kind: 'single', desktop: { ...cloud(), source: { kind: 'static', src: 'https://evil.example/x.jpg' } }, mobile: null } })[0], /unknown built-in picture/);
  assert.match(bad({ 'hero.airport': { kind: 'single', desktop: cloud({ publicId: 'someone-else/folder/x' } as never), mobile: null } })[0], /malformed/);
  assert.match(bad({ 'hero.airport': { kind: 'single', desktop: cloud({ width: 1000, height: 600 } as never), mobile: null } })[0], /at least 1600×900px/);
  assert.match(bad({ 'hero.airport': { kind: 'single', desktop: cloud(), mobile: cloud({ width: 500, height: 900 } as never) } })[0], /phone.*at least 720×1080px/);
  assert.match(bad({ 'services.airport': { kind: 'gallery', items: [] } })[0], /keep at least one photo/);
  assert.match(bad({ 'route.coorg': { kind: 'single', desktop: cloud(), mobile: cloud() } })[0], /phone picture is not used/);
  assert.match(bad({ 'fleet.innova': { kind: 'gallery', items: [cloud({ format: 'gif' } as never)] } })[0], /malformed/);
  assert.match(bad({ 'fleet.innova': { kind: 'gallery', items: [] } })[0], /keep at least one photo/);
  assert.match(bad({ 'fleet.innova': { kind: 'gallery', items: Array(9).fill(cloud()) } })[0], /8 photos or fewer/);
  assert.match(bad([])[0], /malformed/);
});

test('static sources take size and credit from the catalogue, never from the browser', () => {
  const tampered = { source: { kind: 'static', src: '/images/routes/coorg.webp', width: 1, height: 1 }, alt: '', focus: null, credit: null };
  const res = parseOverrides({ 'route.coorg': { kind: 'single', desktop: tampered, mobile: null } });
  assert.ok(res.ok);
  const img = (res.value['route.coorg'] as { desktop: PlacedImage }).desktop;
  assert.equal(img.source.width, 800);
  assert.equal(img.credit?.author, routePhotosByKey.coorg.author);
  assert.equal(img.alt, 'Coorg (Madikeri)'); // empty description falls back to the slot name
});

test('cloudinaryIds lists every uploaded picture', () => {
  const res = parseOverrides({
    'hero.local': { kind: 'single', desktop: cloud(), mobile: cloud({ publicId: 'innova-cabs/site-images/m1', width: 1080, height: 1920 } as never) },
  });
  assert.ok(res.ok);
  assert.deepEqual(cloudinaryIds(res.value).sort(), ['innova-cabs/site-images/hero-airport-0123abcd', 'innova-cabs/site-images/m1']);
  assert.equal(cloudinaryUrl('demo', { publicId: 'a/b', version: 3 }, 640), 'https://res.cloudinary.com/demo/image/upload/c_limit,w_640,f_auto,q_auto/v3/a/b');
});

test('Cloudinary signature: sorted params joined with & plus the secret, SHA-1', () => {
  // Example from Cloudinary's "Generating authentication signatures" guide
  assert.equal(
    signParams({ eager: 'w_400,h_300,c_pad|w_260,h_200,c_crop', public_id: 'sample_image', timestamp: 1315060510 }, 'abcd'),
    'bfd09f95f331f558cbd1320e67aa8d488770583e'
  );
  const expected = createHash('sha1').update('allowed_formats=jpg,png&public_id=x/y&timestamp=5secret').digest('hex');
  assert.equal(signParams({ timestamp: 5, public_id: 'x/y', allowed_formats: 'jpg,png' }, 'secret'), expected);
});

test('upload ticket: own folder, Media Library folder, and every field covered by the signature', () => {
  const saved = { ...process.env };
  Object.assign(process.env, { CLOUDINARY_CLOUD_NAME: 'demo', CLOUDINARY_API_KEY: 'key', CLOUDINARY_API_SECRET: 'secret' });
  try {
    const t = createUploadTicket('hero.airport');
    const { api_key, signature, ...signed } = t.fields;
    assert.equal(api_key, 'key');
    assert.equal(signed.asset_folder, 'innova-cabs/site-images');
    assert.match(signed.public_id, /^innova-cabs\/site-images\/hero-airport-[0-9a-f]{16}$/);
    assert.equal(signed.public_id, t.publicId);
    assert.equal(signature, signParams(signed, 'secret'));
  } finally {
    for (const k of ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
  }
});

test('car photo sets: replace, reorder and remove update every page; photo 1 is the main photo', () => {
  const builtIn = (defaultSlotValue('fleet.innova-crysta') as { items: PlacedImage[] }).items;
  assert.equal(builtIn.length, fleetPhotos['innova-crysta'].length);
  // New photo first, two built-ins reordered, the rest removed
  const res = parseOverrides({ 'fleet.innova-crysta': { kind: 'gallery', items: [cloud({ publicId: 'innova-cabs/site-images/fleet-innova-crysta-aa11' } as never), builtIn[2], builtIn[0]] } });
  assert.ok(res.ok);
  const set = buildSiteImagesView(res.value, 'demo').fleet['innova-crysta'];
  assert.equal(set.length, 3);
  assert.equal(set[0].custom, true);
  assert.equal(set[0].own, true);
  assert.equal(set[1].src, fleetPhotos['innova-crysta'][2].src);
  assert.equal(set[1].label, fleetPhotos['innova-crysta'][2].label); // built-in caption kept
  assert.equal(set[2].src, fleetPhotos['innova-crysta'][0].src);

  const photos = carPhotos(buildSiteImagesView(res.value, 'demo'), 'innova-crysta');
  assert.equal(photos.length, 3);
  assert.match(photos[0].src, /res\.cloudinary\.com\/demo\/.*w_1280.*fleet-innova-crysta-aa11$/);
  assert.equal(photos[0].label, 'Diwali offer'); // uploads use their description as the caption
  assert.equal(photos[0].own, true);
  // Untouched cars keep their built-in sets
  assert.deepEqual(carPhotos(undefined, 'ertiga').map((p) => p.src), fleetPhotos.ertiga.map((p) => p.src));
});

test('a previously published single main photo becomes photo 1 of the car set', () => {
  const legacy = { kind: 'single', desktop: cloud({ publicId: 'innova-cabs/site-images/fleet-innova-old1' } as never), mobile: null };
  const res = parseOverrides({ 'fleet.innova': legacy });
  assert.ok(res.ok);
  const v = res.value['fleet.innova'];
  assert.equal(v.kind, 'gallery');
  const items = (v as { items: PlacedImage[] }).items;
  assert.equal(items.length, fleetPhotos.innova.length);
  assert.equal(items[0].source.kind === 'cloudinary' && items[0].source.publicId, 'innova-cabs/site-images/fleet-innova-old1');
  assert.deepEqual(items.slice(1).map((i) => (i.source.kind === 'static' ? i.source.src : '')), fleetPhotos.innova.slice(1).map((p) => p.src));
  assert.deepEqual(cloudinaryIds(res.value), ['innova-cabs/site-images/fleet-innova-old1']); // still cleaned up when replaced later
});
