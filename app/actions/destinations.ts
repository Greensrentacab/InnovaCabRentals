'use server';

/**
 * destinations.ts — server actions for Admin → Footer destinations. Every
 * action checks the admin session first (server actions are public endpoints)
 * and re-validates everything the browser sends. Publishing, unpublishing,
 * deleting and reordering revalidate the whole site, so the footer and the
 * destination pages change without a deployment.
 *
 * Photos use the same signed Cloudinary upload as Admin → Homepage images,
 * under their own "destination-" prefix; photos no destination uses any more
 * are deleted again.
 */

import { revalidatePath, revalidateTag } from 'next/cache';
import { verifyAdminSession } from '@/app/actions/admin';
import { hasFirestore } from '@/lib/adminStore';
import { cloudinaryCloudName, createUploadTicket, destroyCloudImage, fetchCloudImage, type UploadTicket } from '@/lib/cloudinary';
import { getRoutes } from '@/lib/dataService';
import {
  createDestinationRecord,
  deleteDestinationRecord,
  listDestinations,
  MissingDestinationError,
  moveDestinationRecord,
  updateDestinationRecord,
} from '@/lib/destinationStore';
import {
  checkPublishable,
  DESTINATION_IMAGE_MIN,
  DESTINATION_LIMITS,
  DESTINATION_TEMPLATES,
  destinationImageIds,
  forTemplate,
  newDestinationContent,
  parseDestinationContent,
  type DestinationContent,
  type DestinationRecord,
  type DestinationTemplate,
} from '@/lib/destinations';
import { FOOTER_COLUMN_IDS, type FooterColumnId } from '@/lib/footerColumns';
import { catalogRoutes } from '@/lib/routeCatalog';
import { ConflictError, SITE_CONTENT_TAG } from '@/lib/siteContentStore';
import { IMAGE_RULES, isOwnPublicId, type CloudImage } from '@/lib/siteImages';

type Fail = { success: false; error: string; errors?: string[] };
type Result<T extends object = object> = ({ success: true } & T) | Fail;

const SESSION_EXPIRED = 'Your admin session has expired. Please sign in again.';
const CONFLICT = 'This destination was changed in another window or by another admin. Reload the page to see the latest version, then make your change again.';
const SLUG_LOCKED = 'The page address cannot change while the page is live (links to it would break). Unpublish the page first to change it.';

/** Upload slot name; Cloudinary ids become innova-cabs/site-images/destination-<16 hex>. */
const UPLOAD_SLOT = 'destination';
const isDestinationUpload = (id: unknown): id is string => isOwnPublicId(id) && /\/destination-[0-9a-f]{16}$/.test(id);

const fail = (error: string, errors?: string[]): Fail => ({ success: false, error, ...(errors ? { errors } : {}) });
const failFrom = (err: unknown, fallback: string): Fail => {
  if (err instanceof ConflictError) return fail(CONFLICT);
  if (err instanceof MissingDestinationError) return fail(err.message);
  console.error('[destinations]', fallback, err);
  return fail(err instanceof Error && err.message ? err.message : fallback);
};

/** Refresh every page that shows the footer, plus the destination pages. */
function publishToSite() {
  revalidateTag(SITE_CONTENT_TAG);
  revalidatePath('/', 'layout');
}

export interface DestinationsAdminData {
  /** In footer order */
  items: DestinationRecord[];
  /** null = Cloudinary not configured (photo uploads disabled) */
  cloudName: string | null;
  /** false = no database; destinations last only until the server restarts */
  persistent: boolean;
}

async function adminData(): Promise<DestinationsAdminData> {
  return { items: await listDestinations(), cloudName: cloudinaryCloudName(), persistent: hasFirestore() };
}

/** Why a page address cannot be used, or null. Existing route pages and other destinations keep theirs. */
async function slugProblem(slug: string, selfId: string | null, list: DestinationRecord[]): Promise<string | null> {
  if (!slug) return null; // drafts may not have one yet; publishing requires it
  const routeSlugs = new Set([...catalogRoutes.map((r) => r.slug), ...(await getRoutes().catch(() => [])).map((r) => r.slug)]);
  if (routeSlugs.has(slug)) return `The address /routes/${slug} is already an existing route page. Choose a different address.`;
  const taken = list.find((r) => r.id !== selfId && (r.draft.slug === slug || r.live?.slug === slug));
  return taken ? `The address /routes/${slug} is already used by “${taken.draft.linkText || 'another destination'}”. Choose a different address.` : null;
}

/** Deletes photos (from earlier versions) that no destination uses any more. Best-effort. */
async function cleanUpImages(candidates: string[]) {
  const ids = candidates.filter(isDestinationUpload);
  if (!ids.length) return;
  try {
    const inUse = new Set((await listDestinations()).flatMap((r) => [...destinationImageIds(r.draft), ...destinationImageIds(r.live)]));
    await Promise.all(Array.from(new Set(ids)).filter((id) => !inUse.has(id)).map(destroyCloudImage));
  } catch (err) {
    console.warn('[destinations] Could not clean up unused photos:', err);
  }
}

const validVersion = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= 0;
const validId = (id: unknown): id is string => typeof id === 'string' && /^d[0-9a-f]{12}$/.test(id);

// ─── Read ───────────────────────────────────────────────────────────────────

export async function getDestinationsAdmin(): Promise<Result<{ data: DestinationsAdminData }>> {
  if (!(await verifyAdminSession())) return fail(SESSION_EXPIRED);
  try {
    return { success: true, data: await adminData() };
  } catch (err) {
    return failFrom(err, 'Could not load the footer destinations.');
  }
}

// ─── Create / save / publish ────────────────────────────────────────────────

/** Adds an unpublished destination with the template's starter sections. */
export async function createDestination(input: {
  linkText: string;
  column: FooterColumnId;
  template: DestinationTemplate;
}): Promise<Result<{ data: DestinationsAdminData; id: string }>> {
  if (!(await verifyAdminSession())) return fail(SESSION_EXPIRED);
  const linkText = typeof input?.linkText === 'string' ? input.linkText.trim().replace(/\s+/g, ' ') : '';
  if (!linkText) return fail('Type the footer link text, for example “Bangalore to Hyderabad”.');
  if (linkText.length > DESTINATION_LIMITS.linkTextChars) return fail(`Keep the link text to ${DESTINATION_LIMITS.linkTextChars} characters or fewer.`);
  if (!(FOOTER_COLUMN_IDS as readonly string[]).includes(input.column)) return fail('Choose a footer column.');
  if (!(DESTINATION_TEMPLATES as readonly string[]).includes(input.template)) return fail('Choose a page template.');

  try {
    const content = newDestinationContent({ linkText, column: input.column, template: input.template });
    const list = await listDestinations();
    // A free address: bangalore-to-hyderabad, then -2, -3…
    const base = content.slug || 'destination';
    for (let n = 1; n < 50; n++) {
      const slug = n === 1 ? base : `${base.slice(0, DESTINATION_LIMITS.slugChars - 3)}-${n}`;
      if (!(await slugProblem(slug, null, list))) {
        content.slug = slug;
        break;
      }
    }
    const record = await createDestinationRecord(content);
    return { success: true, data: await adminData(), id: record.id };
  } catch (err) {
    return failFrom(err, 'Could not add the destination.');
  }
}

/** Checks shared by save and publish; returns the parsed content or a failure. */
async function prepare(id: unknown, content: unknown, baseVersion: unknown): Promise<{ content: DestinationContent } | Fail> {
  if (!validId(id) || !validVersion(baseVersion)) return fail('Invalid request.');
  const parsed = parseDestinationContent(content);
  if (!parsed) return fail('The page is malformed or some text is far too long, so it was not saved.');
  const list = await listDestinations();
  const current = list.find((r) => r.id === id);
  if (!current) return fail(new MissingDestinationError().message);
  if (current.live && parsed.slug !== current.live.slug) return fail(SLUG_LOCKED);
  const problem = await slugProblem(parsed.slug, id, list);
  return problem ? fail(problem) : { content: parsed };
}

/** Saves work in progress (not shown on the website; may be incomplete). */
export async function saveDestinationDraft(id: string, content: unknown, baseVersion: number): Promise<Result<{ data: DestinationsAdminData }>> {
  if (!(await verifyAdminSession())) return fail(SESSION_EXPIRED);
  try {
    const ready = await prepare(id, content, baseVersion);
    if ('success' in ready) return ready;
    const { previous } = await updateDestinationRecord(id, baseVersion, (r) => ({
      draft: ready.content,
      draftSavedAt: new Date().toISOString(),
      live: r.live,
      publishedAt: r.publishedAt,
    }));
    await cleanUpImages(destinationImageIds(previous.draft));
    return { success: true, data: await adminData() };
  } catch (err) {
    return failFrom(err, 'Could not save the draft.');
  }
}

/** Publishes after checking nothing required is missing; the footer link appears at once. */
export async function publishDestination(id: string, content: unknown, baseVersion: number): Promise<Result<{ data: DestinationsAdminData }>> {
  if (!(await verifyAdminSession())) return fail(SESSION_EXPIRED);
  try {
    const ready = await prepare(id, content, baseVersion);
    if ('success' in ready) return ready;
    const errors = checkPublishable(ready.content);
    if (errors.length) return fail('Fix these before publishing:', errors);

    const page = forTemplate(ready.content);
    const now = new Date().toISOString();
    const { previous } = await updateDestinationRecord(id, baseVersion, () => ({ draft: page, draftSavedAt: now, live: page, publishedAt: now }));
    publishToSite();
    // Photos replaced earlier, or not shown by this template, are no longer needed
    await cleanUpImages([...destinationImageIds(previous.draft), ...destinationImageIds(previous.live), ...destinationImageIds(ready.content)]);
    return { success: true, data: await adminData() };
  } catch (err) {
    return failFrom(err, 'Could not publish the destination.');
  }
}

/** Takes the page and its footer link off the website; the content stays as a draft. */
export async function unpublishDestination(id: string, baseVersion: number): Promise<Result<{ data: DestinationsAdminData }>> {
  if (!(await verifyAdminSession())) return fail(SESSION_EXPIRED);
  if (!validId(id) || !validVersion(baseVersion)) return fail('Invalid request.');
  try {
    const { previous } = await updateDestinationRecord(id, baseVersion, (r) => ({
      draft: r.draft,
      draftSavedAt: r.draftSavedAt,
      live: null,
      publishedAt: null,
    }));
    publishToSite();
    await cleanUpImages(destinationImageIds(previous.live));
    return { success: true, data: await adminData() };
  } catch (err) {
    return failFrom(err, 'Could not unpublish the destination.');
  }
}

/** Deletes the destination, its page, footer link and photos. */
export async function deleteDestination(id: string, baseVersion: number): Promise<Result<{ data: DestinationsAdminData }>> {
  if (!(await verifyAdminSession())) return fail(SESSION_EXPIRED);
  if (!validId(id) || !validVersion(baseVersion)) return fail('Invalid request.');
  try {
    const previous = await deleteDestinationRecord(id, baseVersion);
    if (previous.live) publishToSite();
    await cleanUpImages([...destinationImageIds(previous.draft), ...destinationImageIds(previous.live)]);
    return { success: true, data: await adminData() };
  } catch (err) {
    return failFrom(err, 'Could not delete the destination.');
  }
}

/** Moves a destination one place up or down within its footer column (applies at once). */
export async function moveDestination(id: string, direction: -1 | 1): Promise<Result<{ data: DestinationsAdminData }>> {
  if (!(await verifyAdminSession())) return fail(SESSION_EXPIRED);
  if (!validId(id) || (direction !== -1 && direction !== 1)) return fail('Invalid request.');
  try {
    await moveDestinationRecord(id, direction);
    publishToSite();
    return { success: true, data: await adminData() };
  } catch (err) {
    return failFrom(err, 'Could not change the order.');
  }
}

// ─── Photos ─────────────────────────────────────────────────────────────────

/** Signed, single-use upload for one destination photo (the browser sends the file to Cloudinary). */
export async function createDestinationImageUpload(): Promise<Result<{ ticket: UploadTicket }>> {
  if (!(await verifyAdminSession())) return fail(SESSION_EXPIRED);
  if (!cloudinaryCloudName()) return fail('Photo uploads are not set up yet. Add the Cloudinary keys to the server settings.');
  try {
    return { success: true, ticket: createUploadTicket(UPLOAD_SLOT) };
  } catch (err) {
    return failFrom(err, 'Could not start the upload.');
  }
}

/** Checks an uploaded photo as Cloudinary stored it (format, file size, dimensions); a photo that fails is deleted. */
export async function confirmDestinationImageUpload(publicId: string): Promise<Result<{ image: CloudImage }>> {
  if (!(await verifyAdminSession())) return fail(SESSION_EXPIRED);
  if (!isDestinationUpload(publicId)) return fail('That upload does not belong to this website.');
  try {
    const image = await fetchCloudImage(publicId);
    if (!image) return fail('The upload could not be found. Please try again.');
    const min = DESTINATION_IMAGE_MIN;
    const problem = !(IMAGE_RULES.formats as readonly string[]).includes(image.format)
      ? `Unsupported file type (${image.format}). Use JPG, PNG, WebP or AVIF.`
      : image.bytes > IMAGE_RULES.maxBytes
        ? 'The file is larger than 10 MB.'
        : image.width < min.w || image.height < min.h
          ? `The picture is ${image.width}×${image.height}px; it needs to be at least ${min.w}×${min.h}px.`
          : null;
    if (problem) {
      await destroyCloudImage(publicId);
      return fail(problem);
    }
    return { success: true, image };
  } catch (err) {
    return failFrom(err, 'Could not check the uploaded photo.');
  }
}

/** Deletes photos uploaded in the editor but then discarded. Photos any destination still uses are kept. */
export async function discardDestinationUploads(publicIds: string[]): Promise<Result> {
  if (!(await verifyAdminSession())) return fail(SESSION_EXPIRED);
  if (!Array.isArray(publicIds)) return fail('Invalid request.');
  await cleanUpImages(publicIds.slice(0, 100));
  return { success: true };
}
