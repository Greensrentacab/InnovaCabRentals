/**
 * siteImages.ts — every editable homepage image ("slot"), its built-in
 * default, and how a published override becomes the <img> the storefront
 * renders. Admin → Homepage images edits these; the published overrides live
 * in Firestore (siteContent/homepageImages) and uploads in Cloudinary.
 *
 * Shared by the server (validation, rendering) and the admin editor, so it
 * must stay free of server-only imports.
 *
 * Slots:
 *   hero.<scene>      hero picture per booking tab, desktop + optional phone image
 *   services.<scene>  "Our services" card carousels (ordered galleries)
 *   fleet.<car id>    each car's photo set (fare-result carousels, the car's page;
 *                     the first photo is the car's main photo everywhere else)
 *   route.<key>       destination photo of each route (slider, widget, route page)
 * An empty slot always falls back to the built-in picture, so nothing breaks.
 */

import { z } from 'zod';
import { fleetPhotos, type FleetPhoto } from '@/lib/fleetPhotos';
import { routePhotosByKey } from '@/lib/routePhotos';
import { catalogRoutes } from '@/lib/routeCatalog';

export type HeroScene = 'airport' | 'outstation' | 'local';
export const HERO_SCENES: HeroScene[] = ['airport', 'outstation', 'local'];

/** Upload rules (checked in the browser and again on the server). */
export const IMAGE_RULES = {
  maxBytes: 10 * 1024 * 1024,
  /** Cloudinary format names */
  formats: ['jpg', 'png', 'webp', 'avif'] as const,
  mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] as const,
  altChars: 200,
};

/** Cloudinary folder every upload goes into (anything else is rejected). */
export const CLOUDINARY_FOLDER = 'innova-cabs/site-images';
const PUBLIC_ID_RE = /^innova-cabs\/site-images\/[A-Za-z0-9_-]{1,100}$/;

export interface CloudImage {
  publicId: string;
  version: number;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export interface StaticImage {
  src: string;
  srcSet?: string;
  /** Largest variant (used for preloading) */
  large?: string;
  width: number;
  height: number;
}

export type ImageSource = ({ kind: 'static' } & StaticImage) | ({ kind: 'cloudinary' } & CloudImage);

export interface ImageCredit {
  author: string;
  license: string;
  sourceUrl: string;
}

export interface PlacedImage {
  source: ImageSource;
  alt: string;
  /** Focal point in % of width/height (CSS object-position); null = the layout's default crop */
  focus: { x: number; y: number } | null;
  /** Mirror horizontally on desktop (hero only — the built-in scenes are flipped there) */
  mirror?: boolean;
  /** Attribution for built-in third-party photos (never set for uploads) */
  credit?: ImageCredit | null;
  /** Built-in car photos only: gallery caption and "photo of our own fleet" (from the catalogue) */
  label?: string;
  own?: boolean;
}

export interface SingleValue {
  kind: 'single';
  desktop: PlacedImage;
  /** Separate phone picture; null = phones crop the desktop picture */
  mobile: PlacedImage | null;
}

export interface GalleryValue {
  kind: 'gallery';
  items: PlacedImage[];
}

export type SlotValue = SingleValue | GalleryValue;

/** Published overrides by slot id; a slot that is absent shows its default. */
export type SiteImageOverrides = Record<string, SlotValue>;

export type SlotGroup = 'hero' | 'services' | 'fleet' | 'routes';

export interface SlotDef {
  id: string;
  group: SlotGroup;
  label: string;
  hint?: string;
  kind: 'single' | 'gallery';
  /** Single slots with a separate phone picture */
  hasMobile?: boolean;
  canMirror?: boolean;
  /** Minimum size of the main (desktop) picture */
  min: { w: number; h: number };
  minMobile?: { w: number; h: number };
  /** Preview frame aspect ratios (width / height) */
  aspect: number;
  mobileAspect?: number;
  maxItems?: number;
  /** Gallery crop previews in the admin (how the photos are cut on the website) */
  previews?: { label: string; aspect: number }[];
}

export const SLOT_GROUPS: { id: SlotGroup; title: string; hint: string }[] = [
  {
    id: 'hero',
    title: 'Hero pictures',
    hint: 'The large picture at the top of the homepage. It changes with the booking tab (Airport / Outstation / Local) and is also used on the service pages.',
  },
  { id: 'services', title: '"Our services" cards', hint: 'Photo carousels on the three service cards. Drag order with the arrows; the first photo shows first.' },
  {
    id: 'fleet',
    title: 'Car photos',
    hint: "Every photo of each car — the carousel on the fare results and the gallery on the car's own page. The first photo is the car's main photo (homepage fleet cards, compare page, booking summary).",
  },
  { id: 'routes', title: 'Route photos', hint: 'Destination photos on the "Popular trips" slider, the booking widget and each route page.' },
];

const SCENE_LABEL: Record<HeroScene, string> = { airport: 'Airport', outstation: 'Outstation', local: 'Local & hourly' };
const SCENE_ALT: Record<HeroScene, string> = {
  airport: 'White Toyota Innova Hycross waiting at the Bangalore airport terminal',
  outstation: 'Silver Toyota Innova on a hill highway through tea plantations',
  local: 'Silver Toyota Innova Crysta parked near Vidhana Soudha, Bangalore',
};
const SERVICE_CARD_LABEL: Record<HeroScene, string> = {
  airport: 'Airport Transfers card',
  outstation: 'Outstation Trips card',
  local: 'Local & Hourly Rentals card',
};
const FLEET_LABEL: Record<string, string> = {
  innova: 'Toyota Innova',
  'innova-crysta': 'Toyota Innova Crysta',
  ertiga: 'Maruti Suzuki Ertiga',
  'innova-hycross': 'Toyota Innova Hycross',
};

const routeLabel = (key: string) =>
  key === 'airport' ? 'Airport ↔ City' : catalogRoutes.find((r) => r.slug === `bangalore-to-${key}`)?.destination ?? key;

/** Every editable slot, in admin display order. */
export const SLOT_DEFS: SlotDef[] = [
  ...HERO_SCENES.map(
    (s): SlotDef => ({
      id: `hero.${s}`,
      group: 'hero',
      label: `${SCENE_LABEL[s]} hero`,
      hint: 'Desktop: wide landscape picture. Phone: optional tall picture; without one, phones crop the desktop picture.',
      kind: 'single',
      hasMobile: true,
      canMirror: true,
      min: { w: 1600, h: 900 },
      minMobile: { w: 720, h: 1080 },
      aspect: 16 / 9,
      mobileAspect: 9 / 16,
    })
  ),
  ...HERO_SCENES.map(
    (s): SlotDef => ({
      id: `services.${s}`,
      group: 'services',
      label: SERVICE_CARD_LABEL[s],
      kind: 'gallery',
      min: { w: 800, h: 500 },
      aspect: 4 / 3,
      maxItems: 8,
      previews: [
        { label: 'Phone card', aspect: 4 / 5 },
        { label: 'Desktop card', aspect: 16 / 9 },
      ],
    })
  ),
  ...Object.keys(fleetPhotos).map(
    (id): SlotDef => ({
      id: `fleet.${id}`,
      group: 'fleet',
      label: FLEET_LABEL[id] ?? id,
      kind: 'gallery',
      min: { w: 800, h: 500 },
      aspect: 4 / 3,
      maxItems: 8,
      previews: [
        { label: 'Fleet card', aspect: 16 / 10 },
        { label: 'Fare results card', aspect: 4 / 3 },
      ],
    })
  ),
  ...Object.keys(routePhotosByKey).map(
    (key): SlotDef => ({
      id: `route.${key}`,
      group: 'routes',
      label: routeLabel(key),
      kind: 'single',
      min: { w: 800, h: 500 },
      aspect: 4 / 3,
    })
  ),
];

export const SLOT_BY_ID: Record<string, SlotDef> = Object.fromEntries(SLOT_DEFS.map((d) => [d.id, d]));

// ─── Built-in defaults ──────────────────────────────────────────────────────

/** "center 60%" / "75% 60%" → { x, y } in % (null when unset). */
function parsePosition(position?: string): { x: number; y: number } | null {
  if (!position) return null;
  const word: Record<string, number> = { left: 0, top: 0, center: 50, right: 100, bottom: 100 };
  const [a, b = 'center'] = position.trim().split(/\s+/);
  const val = (t: string) => (t in word ? word[t] : parseFloat(t));
  const x = val(a);
  const y = val(b);
  return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
}

const heroLandscape = (s: HeroScene): StaticImage => ({
  src: `/images/hero/hero-${s}-960.webp`,
  srcSet: `/images/hero/hero-${s}-960.webp 960w, /images/hero/hero-${s}-1920.webp 1920w`,
  large: `/images/hero/hero-${s}-1920.webp`,
  width: 1920,
  height: 1071,
});

const HERO_MOBILE: Partial<Record<HeroScene, StaticImage>> = {
  airport: { src: '/images/hero/hero-airport-mobile.webp', width: 768, height: 1376 },
};

const fromFleetPhoto = (p: FleetPhoto): PlacedImage => ({
  source: { kind: 'static', src: p.src, width: p.width, height: p.height },
  alt: p.alt,
  focus: parsePosition(p.position),
  credit: p.own || !p.author || !p.license || !p.sourceUrl ? null : { author: p.author, license: p.license, sourceUrl: p.sourceUrl },
  label: p.label,
  own: Boolean(p.own),
});

/** Service card scene photo (the 960 hero file shown as a card photo). */
const sceneCard = (s: HeroScene, alt: string): PlacedImage => ({
  source: { kind: 'static', src: `/images/hero/hero-${s}-960.webp`, width: 960, height: 536 },
  alt,
  focus: { x: 75, y: 60 },
});

const SERVICE_DEFAULTS: Record<HeroScene, () => PlacedImage[]> = {
  airport: () => [
    sceneCard('airport', 'Innova Hycross waiting at the Bangalore airport terminal'),
    fromFleetPhoto(fleetPhotos['innova-hycross'][0]),
    fromFleetPhoto(fleetPhotos['innova-crysta'][0]),
    fromFleetPhoto(fleetPhotos['innova-hycross'][4]),
  ],
  outstation: () => [
    sceneCard('outstation', 'Toyota Innova on a hill highway through tea plantations'),
    fromFleetPhoto(fleetPhotos.innova[0]),
    fromFleetPhoto(fleetPhotos['innova-hycross'][1]),
    fromFleetPhoto(fleetPhotos['innova-crysta'][1]),
  ],
  local: () => [
    sceneCard('local', 'Innova Crysta parked near Vidhana Soudha, Bangalore'),
    fromFleetPhoto(fleetPhotos['innova-hycross'][2]),
    fromFleetPhoto(fleetPhotos.innova[1]),
    fromFleetPhoto(fleetPhotos['innova-crysta'][2]),
  ],
};

/** Built-in value of a slot (what the site shows when nothing is published). */
export function defaultSlotValue(id: string): SlotValue | null {
  const [group, key] = [id.slice(0, id.indexOf('.')), id.slice(id.indexOf('.') + 1)];
  if (group === 'hero' && HERO_SCENES.includes(key as HeroScene)) {
    const s = key as HeroScene;
    const mobile = HERO_MOBILE[s];
    return {
      kind: 'single',
      desktop: { source: { kind: 'static', ...heroLandscape(s) }, alt: SCENE_ALT[s], focus: null, mirror: true },
      mobile: mobile ? { source: { kind: 'static', ...mobile }, alt: SCENE_ALT[s], focus: null } : null,
    };
  }
  if (group === 'services' && HERO_SCENES.includes(key as HeroScene)) {
    return { kind: 'gallery', items: SERVICE_DEFAULTS[key as HeroScene]() };
  }
  if (group === 'fleet' && fleetPhotos[key]?.length) {
    return { kind: 'gallery', items: fleetPhotos[key].map(fromFleetPhoto) };
  }
  if (group === 'route' && routePhotosByKey[key]) {
    const p = routePhotosByKey[key];
    return {
      kind: 'single',
      desktop: {
        source: { kind: 'static', src: p.src, width: 800, height: 500 },
        alt: p.alt,
        focus: null,
        credit: { author: p.author, license: p.license, sourceUrl: p.sourceUrl },
      },
      mobile: null,
    };
  }
  return null;
}

/**
 * Every built-in picture by src — the only static files an override may
 * point at (stops arbitrary URLs). Sizes and credits come from here, never
 * from the browser.
 */
interface CatalogEntry {
  source: StaticImage;
  credit: ImageCredit | null;
  label?: string;
  own?: boolean;
}

export const STATIC_CATALOG: Record<string, CatalogEntry> = (() => {
  const out: Record<string, CatalogEntry> = {};
  const add = (img: PlacedImage | null | undefined) => {
    if (img && img.source.kind === 'static' && !out[img.source.src]) {
      const { kind: _kind, ...source } = img.source;
      out[img.source.src] = {
        source,
        credit: img.credit ?? null,
        ...(img.label !== undefined ? { label: img.label } : {}),
        ...(img.own !== undefined ? { own: img.own } : {}),
      };
    }
  };
  for (const def of SLOT_DEFS) {
    const v = defaultSlotValue(def.id);
    if (!v) continue;
    if (v.kind === 'single') {
      add(v.desktop);
      add(v.mobile);
    } else v.items.forEach(add);
  }
  for (const list of Object.values(fleetPhotos)) list.forEach((p) => add(fromFleetPhoto(p)));
  return out;
})();

// ─── Rendering ──────────────────────────────────────────────────────────────

export interface ResolvedImage {
  src: string;
  srcSet?: string;
  /** Largest variant (preload) */
  large: string;
  width: number;
  height: number;
  alt: string;
  /** CSS object-position from the focal point; undefined = the layout's default */
  position?: string;
  mirror: boolean;
  /** true = uploaded through the admin */
  custom: boolean;
  credit?: ImageCredit | null;
  /** Gallery caption (built-in car photos; uploads use their description) */
  label?: string;
  /** Photo of the client's own fleet (uploads count as their own) */
  own: boolean;
}

/** Cloudinary delivery URL: resized (never upscaled), best format and quality per browser. */
export const cloudinaryUrl = (cloudName: string, img: Pick<CloudImage, 'publicId' | 'version'>, width: number) =>
  `https://res.cloudinary.com/${cloudName}/image/upload/c_limit,w_${Math.round(width)},f_auto,q_auto/v${img.version}/${img.publicId}`;

export interface SizeSpec {
  /** Width of the default `src` */
  src: number;
  /** srcSet widths */
  widths: number[];
}

/** Rendering widths per use (match the layouts' displayed sizes). */
export const SIZES = {
  heroDesktop: { src: 960, widths: [960, 1440, 1920, 2560] },
  heroMobile: { src: 828, widths: [640, 828, 1080, 1290] },
  card: { src: 960, widths: [480, 960] },
  /** Car galleries (also the large photo on each car's page) */
  fleet: { src: 1280, widths: [640, 960, 1280] },
  thumb: { src: 160, widths: [160] },
} satisfies Record<string, SizeSpec>;

/** Turns a placed image into <img> attributes; null when a Cloudinary image cannot be served. */
export function resolveImage(img: PlacedImage, cloudName: string | null, size: SizeSpec): ResolvedImage | null {
  const base = {
    alt: img.alt,
    position: img.focus ? `${round1(img.focus.x)}% ${round1(img.focus.y)}%` : undefined,
    mirror: Boolean(img.mirror),
    credit: img.credit ?? null,
    ...(img.label ? { label: img.label } : {}),
  };
  const s = img.source;
  if (s.kind === 'static') {
    return { ...base, src: s.src, srcSet: s.srcSet, large: s.large ?? s.src, width: s.width, height: s.height, custom: false, own: Boolean(img.own) };
  }
  if (!cloudName) return null;
  const widths = Array.from(new Set(size.widths.map((w) => Math.min(w, s.width)))).sort((a, b) => a - b);
  return {
    ...base,
    src: cloudinaryUrl(cloudName, s, Math.min(size.src, s.width)),
    srcSet: widths.length > 1 ? widths.map((w) => `${cloudinaryUrl(cloudName, s, w)} ${w}w`).join(', ') : undefined,
    large: cloudinaryUrl(cloudName, s, widths[widths.length - 1]),
    width: s.width,
    height: s.height,
    custom: true,
    own: true,
  };
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export interface SiteImagesView {
  hero: Record<HeroScene, { desktop: ResolvedImage; mobile: ResolvedImage | null }>;
  services: Record<HeroScene, ResolvedImage[]>;
  /** Each car's photo set, in order; [0] is the car's main photo */
  fleet: Record<string, ResolvedImage[]>;
  routes: Record<string, ResolvedImage>;
}

/** What the storefront renders: published overrides over the built-in defaults. */
export function buildSiteImagesView(overrides: SiteImageOverrides, cloudName: string | null): SiteImagesView {
  const view: SiteImagesView = {
    hero: {} as SiteImagesView['hero'],
    services: {} as SiteImagesView['services'],
    fleet: {},
    routes: {},
  };

  for (const def of SLOT_DEFS) {
    const fallback = defaultSlotValue(def.id)!;
    const value = overrides[def.id]?.kind === def.kind ? overrides[def.id] : fallback;
    const key = def.id.slice(def.id.indexOf('.') + 1);

    if (def.kind === 'gallery') {
      const size = def.group === 'fleet' ? SIZES.fleet : SIZES.card;
      const items = (value as GalleryValue).items.map((i) => resolveImage(i, cloudName, size));
      const ok = items.filter((i): i is ResolvedImage => i !== null);
      const photos = ok.length ? ok : (fallback as GalleryValue).items.map((i) => resolveImage(i, null, size)!);
      if (def.group === 'fleet') view.fleet[key] = photos;
      else view.services[key as HeroScene] = photos;
      continue;
    }

    const single = value as SingleValue;
    const main = def.group === 'hero' ? SIZES.heroDesktop : SIZES.card;
    const desktop = resolveImage(single.desktop, cloudName, main) ?? resolveImage((fallback as SingleValue).desktop, null, main)!;
    if (def.group === 'hero') {
      const mobileSrc = single.mobile ? resolveImage(single.mobile, cloudName, SIZES.heroMobile) : null;
      // A phone picture that can't be served falls back to cropping the desktop one
      view.hero[key as HeroScene] = { desktop, mobile: mobileSrc };
    } else {
      view.routes[key] = desktop;
    }
  }
  return view;
}

/**
 * A car's published photo set in the shape the gallery components use
 * (FleetPhoto). Falls back to the built-in photos; [0] is the main photo.
 */
export function carPhotos(images: SiteImagesView | undefined, vehicleId: string): FleetPhoto[] {
  const set = images?.fleet[vehicleId];
  if (!set?.length) return fleetPhotos[vehicleId] ?? [];
  return set.map((p) => ({
    src: p.src,
    alt: p.alt,
    label: p.label ?? p.alt,
    width: p.width,
    height: p.height,
    ...(p.position ? { position: p.position } : {}),
    own: p.own,
    ...(p.credit ? { author: p.credit.author, license: p.credit.license, sourceUrl: p.credit.sourceUrl } : {}),
  }));
}

/** Built-in pictures only (used before anything is published and as the client fallback). */
export const DEFAULT_SITE_IMAGES: SiteImagesView = buildSiteImagesView({}, null);

// ─── Validation (server) ────────────────────────────────────────────────────

const focusSchema = z.object({ x: z.number().min(0).max(100), y: z.number().min(0).max(100) }).nullable();
const sourceSchema = z.discriminatedUnion('kind', [
  // Only the src is read; size and credit come from STATIC_CATALOG
  z.object({ kind: z.literal('static'), src: z.string().max(300) }),
  z.object({
    kind: z.literal('cloudinary'),
    publicId: z.string().regex(PUBLIC_ID_RE),
    version: z.number().int().positive(),
    width: z.number().int().positive().max(20000),
    height: z.number().int().positive().max(20000),
    format: z.enum(IMAGE_RULES.formats),
    bytes: z.number().int().positive().max(IMAGE_RULES.maxBytes),
  }),
]);
const placedSchema = z.object({
  source: sourceSchema,
  alt: z.string().max(IMAGE_RULES.altChars * 2),
  focus: focusSchema,
  mirror: z.boolean().optional(),
});
const slotSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('single'), desktop: placedSchema, mobile: placedSchema.nullable() }),
  z.object({ kind: z.literal('gallery'), items: z.array(placedSchema).max(50) }),
]);

type ParsedPlaced = z.infer<typeof placedSchema>;

/**
 * Validates untrusted overrides (admin publish / Firestore read). Static
 * sources are swapped for the catalogue entry; Cloudinary sources must be in
 * our folder and big enough for the slot. Returns readable errors.
 */
export function parseOverrides(input: unknown): { ok: true; value: SiteImageOverrides } | { ok: false; errors: string[] } {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { ok: false, errors: ['Image settings are malformed.'] };
  const errors: string[] = [];
  const value: SiteImageOverrides = {};

  for (const [id, raw] of Object.entries(input as Record<string, unknown>)) {
    const def = SLOT_BY_ID[id];
    if (!def) {
      errors.push(`Unknown image slot "${id}".`);
      continue;
    }
    const parsed = slotSchema.safeParse(def.group === 'fleet' ? upgradeLegacyFleet(id, raw) : raw);
    if (!parsed.success || parsed.data.kind !== def.kind) {
      errors.push(`${def.label}: image settings are malformed.`);
      continue;
    }

    const place = (p: ParsedPlaced, variant: 'desktop' | 'mobile'): PlacedImage | null => {
      const min = variant === 'mobile' ? def.minMobile ?? def.min : def.min;
      const where = def.kind === 'single' && def.hasMobile ? `${def.label} (${variant === 'mobile' ? 'phone' : 'desktop'})` : def.label;
      let source: ImageSource;
      let credit: ImageCredit | null = null;
      let builtIn: Pick<PlacedImage, 'label' | 'own'> = {};
      if (p.source.kind === 'static') {
        const known = STATIC_CATALOG[p.source.src];
        if (!known) {
          errors.push(`${where}: unknown built-in picture.`);
          return null;
        }
        source = { kind: 'static', ...known.source };
        credit = known.credit;
        builtIn = { ...(known.label !== undefined ? { label: known.label } : {}), ...(known.own !== undefined ? { own: known.own } : {}) };
      } else {
        if (p.source.width < min.w || p.source.height < min.h) {
          errors.push(`${where}: the picture is ${p.source.width}×${p.source.height}px; it must be at least ${min.w}×${min.h}px.`);
          return null;
        }
        source = { ...p.source };
      }
      const alt = p.alt.trim().replace(/\s+/g, ' ');
      if (alt.length > IMAGE_RULES.altChars) {
        errors.push(`${where}: the description is longer than ${IMAGE_RULES.altChars} characters.`);
        return null;
      }
      return {
        source,
        alt: alt || def.label,
        focus: p.focus ? { x: round1(p.focus.x), y: round1(p.focus.y) } : null,
        ...(def.canMirror && variant === 'desktop' ? { mirror: Boolean(p.mirror) } : {}),
        ...(credit ? { credit } : {}),
        ...builtIn,
      };
    };

    if (parsed.data.kind === 'gallery') {
      const max = def.maxItems ?? 8;
      if (parsed.data.items.length === 0) errors.push(`${def.label}: keep at least one photo (or reset it to the default photos).`);
      else if (parsed.data.items.length > max) errors.push(`${def.label}: use ${max} photos or fewer.`);
      const items = parsed.data.items.map((i) => place(i, 'desktop'));
      if (items.every((i): i is PlacedImage => i !== null)) value[id] = { kind: 'gallery', items };
    } else {
      if (parsed.data.mobile && !def.hasMobile) errors.push(`${def.label}: a separate phone picture is not used here.`);
      const desktop = place(parsed.data.desktop, 'desktop');
      const mobile = parsed.data.mobile && def.hasMobile ? place(parsed.data.mobile, 'mobile') : null;
      if (desktop && (mobile || !parsed.data.mobile)) value[id] = { kind: 'single', desktop, mobile };
    }
  }

  return errors.length ? { ok: false, errors } : { ok: true, value };
}

/**
 * Before car photo sets existed, a car had one published "main photo"
 * (kind 'single'). Such an override becomes photo 1 of the car's set,
 * followed by the rest of the built-in photos — the website looks the same.
 */
function upgradeLegacyFleet(id: string, raw: unknown): unknown {
  const r = raw as { kind?: unknown; desktop?: unknown } | null;
  if (!r || r.kind !== 'single' || !r.desktop) return raw;
  const builtIn = defaultSlotValue(id);
  const rest = builtIn?.kind === 'gallery' ? builtIn.items.slice(1) : [];
  return { kind: 'gallery', items: [r.desktop, ...rest] };
}

/** Cloudinary public ids referenced by a set of overrides. */
export function cloudinaryIds(overrides: SiteImageOverrides): string[] {
  const ids: string[] = [];
  const add = (img: PlacedImage | null) => {
    if (img?.source.kind === 'cloudinary') ids.push(img.source.publicId);
  };
  for (const v of Object.values(overrides)) {
    if (v.kind === 'single') {
      add(v.desktop);
      add(v.mobile);
    } else v.items.forEach(add);
  }
  return ids;
}

export const isOwnPublicId = (id: unknown): id is string => typeof id === 'string' && PUBLIC_ID_RE.test(id);
