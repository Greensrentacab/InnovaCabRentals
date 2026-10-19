/**
 * siteContentStore.ts — SERVER ONLY. Published website content edited in the
 * admin: homepage images and Terms & policies.
 *
 * Firestore (when configured):
 *   siteContent/homepageImages            { overrides, version, updatedAt }
 *   siteContent/policies                  { published, publishedAt, version, draft, draftSavedAt }
 *   siteContent/policies/revisions/{v}    { version, publishedAt, content }  (last 25 kept)
 * Without Firestore (local development) the same data lives in server memory.
 *
 * Storefront reads go through unstable_cache tagged SITE_CONTENT_TAG; every
 * publish calls revalidateTag + revalidatePath so the live site updates at once.
 */

import 'server-only';
import { unstable_cache } from 'next/cache';
import { hasFirestore } from '@/lib/adminStore';
import { cloudinaryCloudName } from '@/lib/cloudinary';
import {
  buildSiteImagesView,
  DEFAULT_SITE_IMAGES,
  parseOverrides,
  type SiteImageOverrides,
  type SiteImagesView,
} from '@/lib/siteImages';
import { defaultPolicyContent, parsePolicyContent, type PolicyContent, type PolicyRevision } from '@/lib/policies';

export const SITE_CONTENT_TAG = 'site-content';

const COLLECTION = 'siteContent';
const IMAGES_DOC = 'homepageImages';
const POLICIES_DOC = 'policies';
const REVISIONS_KEPT = 25;

export interface ImagesRecord {
  overrides: SiteImageOverrides;
  /** Increments on every publish (stops two admin tabs overwriting each other) */
  version: number;
  updatedAt: string | null;
}

export interface PolicyRecord {
  /** null = never published (the website shows the starting content) */
  published: PolicyContent | null;
  publishedAt: string | null;
  version: number;
  draft: PolicyContent | null;
  draftSavedAt: string | null;
}

export class ConflictError extends Error {}

const memory = globalThis as unknown as {
  __icbSiteImages?: ImagesRecord;
  __icbPolicies?: PolicyRecord;
  __icbPolicyRevisions?: PolicyRevision[];
};

const emptyImages = (): ImagesRecord => ({ overrides: {}, version: 0, updatedAt: null });
const emptyPolicies = (): PolicyRecord => ({ published: null, publishedAt: null, version: 0, draft: null, draftSavedAt: null });

/** Firestore rejects `undefined`; a JSON round-trip drops those keys. */
const plain = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

async function db() {
  const { adminDb } = await import('@/lib/firebaseAdmin');
  return adminDb;
}

/** Keeps every stored slot that is still valid (a slot removed from the code is ignored, not fatal). */
function readOverrides(raw: unknown): SiteImageOverrides {
  if (!raw || typeof raw !== 'object') return {};
  const out: SiteImageOverrides = {};
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    const parsed = parseOverrides({ [id]: value });
    if (parsed.ok && parsed.value[id]) out[id] = parsed.value[id];
    else console.warn(`[siteContent] Ignoring invalid stored image slot "${id}"`);
  }
  return out;
}

// ─── Homepage images ────────────────────────────────────────────────────────

export async function readImagesRecord(): Promise<ImagesRecord> {
  if (!hasFirestore()) return (memory.__icbSiteImages ??= emptyImages());
  const snap = await (await db()).collection(COLLECTION).doc(IMAGES_DOC).get();
  if (!snap.exists) return emptyImages();
  const d = snap.data() ?? {};
  return {
    overrides: readOverrides(d.overrides),
    version: typeof d.version === 'number' ? d.version : 0,
    updatedAt: typeof d.updatedAt === 'string' ? d.updatedAt : null,
  };
}

/**
 * Publishes validated overrides. Throws ConflictError when someone else
 * published since `baseVersion` was loaded. Returns the previous overrides.
 */
export async function writeImagesRecord(overrides: SiteImageOverrides, baseVersion: number): Promise<{ record: ImagesRecord; previous: SiteImageOverrides }> {
  const updatedAt = new Date().toISOString();
  if (!hasFirestore()) {
    const current = (memory.__icbSiteImages ??= emptyImages());
    if (current.version !== baseVersion) throw new ConflictError();
    const record = { overrides: plain(overrides), version: current.version + 1, updatedAt };
    memory.__icbSiteImages = record;
    return { record, previous: current.overrides };
  }

  const firestore = await db();
  const ref = firestore.collection(COLLECTION).doc(IMAGES_DOC);
  return firestore.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const d = snap.exists ? snap.data() ?? {} : {};
    const version = typeof d.version === 'number' ? d.version : 0;
    if (version !== baseVersion) throw new ConflictError();
    const record = { overrides: plain(overrides), version: version + 1, updatedAt };
    tx.set(ref, record);
    return { record, previous: readOverrides(d.overrides) };
  });
}

const cachedImageOverrides = unstable_cache(async () => (await readImagesRecord()).overrides, ['site-images-overrides'], {
  tags: [SITE_CONTENT_TAG],
  revalidate: 3600,
});

/**
 * Homepage pictures for the storefront (published overrides over the
 * built-in defaults). Never throws — a database problem shows the defaults.
 */
export async function getSiteImages(): Promise<SiteImagesView> {
  try {
    // The in-memory store must not be cached across dev restarts
    const overrides = hasFirestore() ? await cachedImageOverrides() : (await readImagesRecord()).overrides;
    return buildSiteImagesView(overrides, cloudinaryCloudName());
  } catch (err) {
    console.error('[siteContent] Could not load homepage images, showing defaults:', err);
    return DEFAULT_SITE_IMAGES;
  }
}

// ─── Terms & policies ───────────────────────────────────────────────────────

function toPolicyRecord(d: Record<string, unknown>): PolicyRecord {
  return {
    published: d.published ? parsePolicyContent(d.published) : null,
    publishedAt: typeof d.publishedAt === 'string' ? d.publishedAt : null,
    version: typeof d.version === 'number' ? d.version : 0,
    draft: d.draft ? parsePolicyContent(d.draft) : null,
    draftSavedAt: typeof d.draftSavedAt === 'string' ? d.draftSavedAt : null,
  };
}

export async function readPolicies(): Promise<PolicyRecord> {
  if (!hasFirestore()) return (memory.__icbPolicies ??= emptyPolicies());
  const snap = await (await db()).collection(COLLECTION).doc(POLICIES_DOC).get();
  return snap.exists ? toPolicyRecord(snap.data() ?? {}) : emptyPolicies();
}
export async function savePolicyDraft(draft: PolicyContent | null): Promise<PolicyRecord> {
  const draftSavedAt = draft ? new Date().toISOString() : null;
  if (!hasFirestore()) {
    const current = (memory.__icbPolicies ??= emptyPolicies());
    memory.__icbPolicies = { ...current, draft: draft ? plain(draft) : null, draftSavedAt };
    return memory.__icbPolicies;
  }
  const ref = (await db()).collection(COLLECTION).doc(POLICIES_DOC);
  await ref.set({ draft: draft ? plain(draft) : null, draftSavedAt }, { merge: true });
  return readPolicies();
}

/** Publishes content (already validated) as a new version and clears the draft. */
export async function publishPolicies(content: PolicyContent, baseVersion: number): Promise<PolicyRecord> {
  const publishedAt = new Date().toISOString();
  const data = plain(content);

  if (!hasFirestore()) {
    const current = (memory.__icbPolicies ??= emptyPolicies());
    if (current.version !== baseVersion) throw new ConflictError();
    const version = current.version + 1;
    memory.__icbPolicies = { published: data, publishedAt, version, draft: null, draftSavedAt: null };
    memory.__icbPolicyRevisions = [{ version, publishedAt, content: data }, ...(memory.__icbPolicyRevisions ?? [])].slice(0, REVISIONS_KEPT);
    return memory.__icbPolicies;
  }

  const firestore = await db();
  const ref = firestore.collection(COLLECTION).doc(POLICIES_DOC);
  const version = await firestore.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const current = typeof snap.data()?.version === 'number' ? (snap.data()!.version as number) : 0;
    if (current !== baseVersion) throw new ConflictError();
    const next = current + 1;
    tx.set(ref, { published: data, publishedAt, version: next, draft: null, draftSavedAt: null });
    tx.set(ref.collection('revisions').doc(String(next)), { version: next, publishedAt, content: data });
    return next;
  });

  // Keep the newest revisions only (best-effort)
  try {
    const old = await ref.collection('revisions').orderBy('version', 'desc').offset(REVISIONS_KEPT).get();
    await Promise.all(old.docs.map((d) => d.ref.delete()));
  } catch (err) {
    console.warn('[siteContent] Could not prune policy revisions:', err);
  }
  return { published: data, publishedAt, version, draft: null, draftSavedAt: null };
}

/** Published versions, newest first (without their content). */
export async function listPolicyRevisions(): Promise<Omit<PolicyRevision, 'content'>[]> {
  if (!hasFirestore()) return (memory.__icbPolicyRevisions ?? []).map(({ version, publishedAt }) => ({ version, publishedAt }));
  const snap = await (await db())
    .collection(COLLECTION)
    .doc(POLICIES_DOC)
    .collection('revisions')
    .orderBy('version', 'desc')
    .limit(REVISIONS_KEPT)
    .select('version', 'publishedAt')
    .get();
  return snap.docs.map((d) => ({ version: d.get('version') as number, publishedAt: d.get('publishedAt') as string }));
}

export async function getPolicyRevision(version: number): Promise<PolicyRevision | null> {
  if (!hasFirestore()) return (memory.__icbPolicyRevisions ?? []).find((r) => r.version === version) ?? null;
  const snap = await (await db()).collection(COLLECTION).doc(POLICIES_DOC).collection('revisions').doc(String(version)).get();
  if (!snap.exists) return null;
  const content = parsePolicyContent(snap.get('content'));
  return content ? { version, publishedAt: snap.get('publishedAt') as string, content } : null;
}

const cachedPublishedPolicies = unstable_cache(async () => (await readPolicies()).published, ['site-policies-published'], {
  tags: [SITE_CONTENT_TAG],
  revalidate: 3600,
});

/**
 * Published Terms & policies for the storefront and the fare calculator
 * (the starting content until the first publish). Never throws.
 */
export async function getPublishedPolicies(): Promise<PolicyContent> {
  try {
    const published = hasFirestore() ? await cachedPublishedPolicies() : (await readPolicies()).published;
    return published ?? defaultPolicyContent();
  } catch (err) {
    console.error('[siteContent] Could not load policies, showing the starting content:', err);
    return defaultPolicyContent();
  }
}
