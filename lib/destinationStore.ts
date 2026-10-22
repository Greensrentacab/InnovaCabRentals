/**
 * destinationStore.ts — SERVER ONLY. Admin → Footer destinations storage.
 *
 * Firestore (when configured):
 *   siteDestinations/{id}   { order, draft, draftSavedAt, live, publishedAt, createdAt, version }
 * Without Firestore (local development) the same records live in server memory.
 *
 * Storefront reads (footer links, /routes/<slug> pages, sitemap) go through
 * unstable_cache tagged SITE_CONTENT_TAG; every publish revalidates it.
 */

import 'server-only';
import { randomBytes } from 'crypto';
import { unstable_cache } from 'next/cache';
import { hasFirestore } from '@/lib/adminStore';
import { ConflictError, SITE_CONTENT_TAG } from '@/lib/siteContentStore';
import { DESTINATION_LIMITS, parseDestinationContent, type DestinationContent, type DestinationRecord } from '@/lib/destinations';
import type { FooterDestinationLink } from '@/lib/footerColumns';

const COLLECTION = 'siteDestinations';

export class MissingDestinationError extends Error {
  constructor() {
    super('This destination no longer exists. Reload the page to see the latest list.');
  }
}

const memory = globalThis as unknown as { __icbDestinations?: DestinationRecord[] };

/** Firestore rejects `undefined`; a JSON round-trip drops those keys. */
const plain = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const str = (v: unknown) => (typeof v === 'string' ? v : null);
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);

async function db() {
  const { adminDb } = await import('@/lib/firebaseAdmin');
  return adminDb;
}

/** A stored record, or null when it cannot be read (skipped, not fatal). */
function toRecord(id: string, d: Record<string, unknown>): DestinationRecord | null {
  const draft = parseDestinationContent(d.draft);
  if (!draft) {
    console.warn(`[destinations] Ignoring unreadable destination "${id}"`);
    return null;
  }
  const live = d.live ? parseDestinationContent(d.live) : null;
  if (d.live && !live) console.warn(`[destinations] Published copy of "${id}" is unreadable; treating it as unpublished`);
  return {
    id,
    order: num(d.order),
    draft,
    draftSavedAt: str(d.draftSavedAt) ?? '',
    live,
    publishedAt: live ? str(d.publishedAt) : null,
    createdAt: str(d.createdAt) ?? '',
    version: num(d.version),
  };
}

const byOrder = (a: DestinationRecord, b: DestinationRecord) => a.order - b.order || a.createdAt.localeCompare(b.createdAt);

export async function listDestinations(): Promise<DestinationRecord[]> {
  if (!hasFirestore()) return [...(memory.__icbDestinations ??= [])].sort(byOrder);
  const snap = await (await db()).collection(COLLECTION).get();
  return snap.docs
    .map((doc) => toRecord(doc.id, doc.data()))
    .filter((r): r is DestinationRecord => r !== null)
    .sort(byOrder);
}

/** Adds a new (unpublished) destination after the others. */
export async function createDestinationRecord(draft: DestinationContent): Promise<DestinationRecord> {
  const existing = await listDestinations();
  if (existing.length >= DESTINATION_LIMITS.destinations) {
    throw new Error(`You can add up to ${DESTINATION_LIMITS.destinations} destinations. Delete one you no longer need first.`);
  }
  const now = new Date().toISOString();
  const record: DestinationRecord = {
    id: `d${randomBytes(6).toString('hex')}`,
    order: existing.reduce((max, r) => Math.max(max, r.order), 0) + 1,
    draft: plain(draft),
    draftSavedAt: now,
    live: null,
    publishedAt: null,
    createdAt: now,
    version: 1,
  };
  if (!hasFirestore()) {
    (memory.__icbDestinations ??= []).push(record);
    return record;
  }
  const { id, ...data } = record;
  await (await db()).collection(COLLECTION).doc(id).create(data);
  return record;
}

type Change = Pick<DestinationRecord, 'draft' | 'draftSavedAt' | 'live' | 'publishedAt'>;

/**
 * Applies a change to one destination. Throws ConflictError when it was
 * changed since `baseVersion` was loaded. Returns the new and previous record.
 */
export async function updateDestinationRecord(
  id: string,
  baseVersion: number,
  change: (current: DestinationRecord) => Change
): Promise<{ record: DestinationRecord; previous: DestinationRecord }> {
  if (!hasFirestore()) {
    const list = (memory.__icbDestinations ??= []);
    const i = list.findIndex((r) => r.id === id);
    if (i < 0) throw new MissingDestinationError();
    const previous = list[i];
    if (previous.version !== baseVersion) throw new ConflictError();
    const record = { ...previous, ...plain(change(previous)), version: previous.version + 1 };
    list[i] = record;
    return { record, previous };
  }

  const firestore = await db();
  const ref = firestore.collection(COLLECTION).doc(id);
  return firestore.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const previous = snap.exists ? toRecord(id, snap.data() ?? {}) : null;
    if (!previous) throw new MissingDestinationError();
    if (previous.version !== baseVersion) throw new ConflictError();
    const record = { ...previous, ...plain(change(previous)), version: previous.version + 1 };
    const { id: _id, ...data } = record;
    tx.set(ref, data);
    return { record, previous };
  });
}

/** Deletes a destination (checked against `baseVersion`); returns what was deleted. */
export async function deleteDestinationRecord(id: string, baseVersion: number): Promise<DestinationRecord> {
  if (!hasFirestore()) {
    const list = (memory.__icbDestinations ??= []);
    const previous = list.find((r) => r.id === id);
    if (!previous) throw new MissingDestinationError();
    if (previous.version !== baseVersion) throw new ConflictError();
    memory.__icbDestinations = list.filter((r) => r.id !== id);
    return previous;
  }

  const firestore = await db();
  const ref = firestore.collection(COLLECTION).doc(id);
  return firestore.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const previous = snap.exists ? toRecord(id, snap.data() ?? {}) : null;
    if (!previous) throw new MissingDestinationError();
    if (previous.version !== baseVersion) throw new ConflictError();
    tx.delete(ref);
    return previous;
  });
}

/**
 * Moves a destination one place up or down among the added links of its
 * footer column (by the column in the admin's draft). Order only — content
 * and version are untouched, so an open editor can still save.
 */
export async function moveDestinationRecord(id: string, by: -1 | 1): Promise<void> {
  const list = await listDestinations();
  const record = list.find((r) => r.id === id);
  if (!record) throw new MissingDestinationError();
  const siblings = list.filter((r) => r.draft.column === record.draft.column);
  const i = siblings.findIndex((r) => r.id === id);
  const other = siblings[i + by];
  if (!other) return;

  // Distinct positions even if two records ever shared an order value
  const [a, b] = record.order === other.order ? [other.order + by, record.order] : [other.order, record.order];
  if (!hasFirestore()) {
    for (const r of memory.__icbDestinations ?? []) {
      if (r.id === record.id) r.order = a;
      else if (r.id === other.id) r.order = b;
    }
    return;
  }
  const firestore = await db();
  const batch = firestore.batch();
  batch.update(firestore.collection(COLLECTION).doc(record.id), { order: a });
  batch.update(firestore.collection(COLLECTION).doc(other.id), { order: b });
  await batch.commit();
}

// ─── Storefront ─────────────────────────────────────────────────────────────

export interface LiveDestination {
  id: string;
  content: DestinationContent;
}

const liveOnly = (list: DestinationRecord[]): LiveDestination[] =>
  list.filter((r) => r.live).map((r) => ({ id: r.id, content: r.live! }));

const cachedLiveDestinations = unstable_cache(async () => liveOnly(await listDestinations()), ['site-destinations-live'], {
  tags: [SITE_CONTENT_TAG],
  revalidate: 3600,
});

/** Published destinations in footer order. Never throws — a database problem shows none. */
export async function getLiveDestinations(): Promise<LiveDestination[]> {
  try {
    // The in-memory store must not be cached across dev restarts
    return hasFirestore() ? await cachedLiveDestinations() : liveOnly(await listDestinations());
  } catch (err) {
    console.error('[destinations] Could not load the published destinations:', err);
    return [];
  }
}

export async function getLiveDestination(slug: string): Promise<DestinationContent | null> {
  return (await getLiveDestinations()).find((d) => d.content.slug === slug)?.content ?? null;
}

/** Footer links of the published destinations set to show in the footer. */
export async function getFooterDestinationLinks(): Promise<FooterDestinationLink[]> {
  return (await getLiveDestinations())
    .filter((d) => d.content.showInFooter)
    .map((d) => ({ column: d.content.column, label: d.content.linkText, href: `/routes/${d.content.slug}` }));
}
