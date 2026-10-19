'use server';

/**
 * siteContent.ts — server actions for Admin → Homepage images and
 * Admin → Terms & policies. Every action checks the admin session first
 * (server actions are public endpoints) and re-validates everything the
 * browser sends. Publishing revalidates the whole site so changes go live
 * without a deployment.
 */

import { revalidatePath, revalidateTag } from 'next/cache';
import { verifyAdminSession } from '@/app/actions/admin';
import { hasFirestore } from '@/lib/adminStore';
import { cloudinaryCloudName, createUploadTicket, destroyCloudImage, fetchCloudImage, type UploadTicket } from '@/lib/cloudinary';
import {
  ConflictError,
  getPolicyRevision,
  listPolicyRevisions,
  publishPolicies,
  readImagesRecord,
  readPolicies,
  savePolicyDraft,
  SITE_CONTENT_TAG,
  writeImagesRecord,
} from '@/lib/siteContentStore';
import {
  cloudinaryIds,
  IMAGE_RULES,
  isOwnPublicId,
  parseOverrides,
  SLOT_BY_ID,
  type CloudImage,
  type SiteImageOverrides,
} from '@/lib/siteImages';
import { checkPublishable, defaultPolicyContent, parsePolicyContent, type PolicyContent } from '@/lib/policies';

type Fail = { success: false; error: string; errors?: string[] };
type Result<T extends object = object> = ({ success: true } & T) | Fail;

const SESSION_EXPIRED = 'Your admin session has expired. Please sign in again.';
const CONFLICT = 'These settings were changed in another window or by another admin. Reload the page to see the latest version, then make your change again.';

async function isAdmin() {
  return verifyAdminSession();
}

const fail = (error: string, errors?: string[]): Fail => ({ success: false, error, ...(errors ? { errors } : {}) });
const failFrom = (err: unknown, fallback: string): Fail => {
  if (err instanceof ConflictError) return fail(CONFLICT);
  console.error('[siteContent]', fallback, err);
  return fail(err instanceof Error && err.message ? err.message : fallback);
};

/** Refresh every page that shows site content (homepage, service, route and policy pages). */
function publishToSite() {
  revalidateTag(SITE_CONTENT_TAG);
  revalidatePath('/', 'layout');
}

// ─── Homepage images ────────────────────────────────────────────────────────

export interface SiteImagesAdminData {
  overrides: SiteImageOverrides;
  version: number;
  updatedAt: string | null;
  /** null = Cloudinary not configured (uploads disabled) */
  cloudName: string | null;
  /** false = no database; published images last only until the server restarts */
  persistent: boolean;
}

async function imagesAdminData(): Promise<SiteImagesAdminData> {
  const record = await readImagesRecord();
  return { ...record, cloudName: cloudinaryCloudName(), persistent: hasFirestore() };
}

export async function getSiteImagesAdmin(): Promise<Result<{ data: SiteImagesAdminData }>> {
  if (!(await isAdmin())) return fail(SESSION_EXPIRED);
  try {
    return { success: true, data: await imagesAdminData() };
  } catch (err) {
    return failFrom(err, 'Could not load the homepage images.');
  }
}

/** Signed, single-use upload for one picture of a slot (the browser sends the file to Cloudinary). */
export async function createImageUpload(slotId: string): Promise<Result<{ ticket: UploadTicket }>> {
  if (!(await isAdmin())) return fail(SESSION_EXPIRED);
  if (!SLOT_BY_ID[slotId]) return fail('Unknown image slot.');
  if (!cloudinaryCloudName()) return fail('Image uploads are not set up yet. Add the Cloudinary keys to the server settings.');
  try {
    return { success: true, ticket: createUploadTicket(slotId) };
  } catch (err) {
    return failFrom(err, 'Could not start the upload.');
  }
}

/**
 * Checks an uploaded picture as Cloudinary stored it (format, file size,
 * dimensions for the slot). A picture that fails is deleted again.
 */
export async function confirmImageUpload(
  slotId: string,
  variant: 'desktop' | 'mobile',
  publicId: string
): Promise<Result<{ image: CloudImage }>> {
  if (!(await isAdmin())) return fail(SESSION_EXPIRED);
  const def = SLOT_BY_ID[slotId];
  if (!def) return fail('Unknown image slot.');
  if (!isOwnPublicId(publicId)) return fail('That upload does not belong to this website.');

  try {
    const image = await fetchCloudImage(publicId);
    if (!image) return fail('The upload could not be found. Please try again.');

    const min = variant === 'mobile' ? def.minMobile ?? def.min : def.min;
    const problem = !(IMAGE_RULES.formats as readonly string[]).includes(image.format)
      ? `Unsupported file type (${image.format}). Use JPG, PNG, WebP or AVIF.`
      : image.bytes > IMAGE_RULES.maxBytes
        ? 'The file is larger than 10 MB.'
        : image.width < min.w || image.height < min.h
          ? `The picture is ${image.width}×${image.height}px; this spot needs at least ${min.w}×${min.h}px.`
          : null;
    if (problem) {
      await destroyCloudImage(publicId);
      return fail(problem);
    }
    return { success: true, image };
  } catch (err) {
    return failFrom(err, 'Could not check the uploaded picture.');
  }
}

/** Deletes uploads that were never published (discarded drafts). Published pictures are never touched. */
export async function discardImageUploads(publicIds: string[]): Promise<Result> {
  if (!(await isAdmin())) return fail(SESSION_EXPIRED);
  if (!Array.isArray(publicIds)) return fail('Invalid request.');
  try {
    const published = new Set(cloudinaryIds((await readImagesRecord()).overrides));
    const ids = publicIds.filter((id) => isOwnPublicId(id) && !published.has(id)).slice(0, 100);
    await Promise.all(ids.map(destroyCloudImage));
    return { success: true };
  } catch (err) {
    return failFrom(err, 'Could not clean up the discarded uploads.');
  }
}

/** Validates and publishes the homepage images; replaced uploads are deleted from Cloudinary. */
export async function publishSiteImages(overrides: unknown, baseVersion: number): Promise<Result<{ data: SiteImagesAdminData }>> {
  if (!(await isAdmin())) return fail(SESSION_EXPIRED);
  const parsed = parseOverrides(overrides);
  if (!parsed.ok) return fail('Some pictures need attention before publishing.', parsed.errors);
  if (!Number.isInteger(baseVersion) || baseVersion < 0) return fail('Invalid request.');

  try {
    const { previous } = await writeImagesRecord(parsed.value, baseVersion);
    publishToSite();

    const kept = new Set(cloudinaryIds(parsed.value));
    await Promise.all(cloudinaryIds(previous).filter((id) => !kept.has(id)).map(destroyCloudImage));

    return { success: true, data: await imagesAdminData() };
  } catch (err) {
    return failFrom(err, 'Could not publish the homepage images.');
  }
}

// ─── Terms & policies ───────────────────────────────────────────────────────

export interface PoliciesAdminData {
  /** What the website shows now */
  published: PolicyContent;
  /** true = nothing published yet (the website shows the starting content) */
  isStartingContent: boolean;
  publishedAt: string | null;
  version: number;
  draft: PolicyContent | null;
  draftSavedAt: string | null;
  revisions: { version: number; publishedAt: string }[];
  persistent: boolean;
}

async function policiesAdminData(): Promise<PoliciesAdminData> {
  const [record, revisions] = await Promise.all([readPolicies(), listPolicyRevisions()]);
  return {
    published: record.published ?? defaultPolicyContent(),
    isStartingContent: record.published === null,
    publishedAt: record.publishedAt,
    version: record.version,
    draft: record.draft,
    draftSavedAt: record.draftSavedAt,
    revisions,
    persistent: hasFirestore(),
  };
}

export async function getPoliciesAdmin(): Promise<Result<{ data: PoliciesAdminData }>> {
  if (!(await isAdmin())) return fail(SESSION_EXPIRED);
  try {
    return { success: true, data: await policiesAdminData() };
  } catch (err) {
    return failFrom(err, 'Could not load the terms & policies.');
  }
}

/** Saves work in progress (not shown on the website; may be incomplete). */
export async function savePoliciesDraft(content: unknown): Promise<Result<{ data: PoliciesAdminData }>> {
  if (!(await isAdmin())) return fail(SESSION_EXPIRED);
  const parsed = parsePolicyContent(content);
  if (!parsed) return fail('The draft is malformed or too long and could not be saved.');
  try {
    await savePolicyDraft(parsed);
    return { success: true, data: await policiesAdminData() };
  } catch (err) {
    return failFrom(err, 'Could not save the draft.');
  }
}

export async function discardPoliciesDraft(): Promise<Result<{ data: PoliciesAdminData }>> {
  if (!(await isAdmin())) return fail(SESSION_EXPIRED);
  try {
    await savePolicyDraft(null);
    return { success: true, data: await policiesAdminData() };
  } catch (err) {
    return failFrom(err, 'Could not discard the draft.');
  }
}

/** Publishes after checking nothing required is empty or malformed; keeps a revision. */
export async function publishPoliciesContent(content: unknown, baseVersion: number): Promise<Result<{ data: PoliciesAdminData }>> {
  if (!(await isAdmin())) return fail(SESSION_EXPIRED);
  const parsed = parsePolicyContent(content);
  if (!parsed) return fail('The content is malformed or too long and was not published.');
  const errors = checkPublishable(parsed);
  if (errors.length) return fail('Fix these before publishing:', errors);
  if (!Number.isInteger(baseVersion) || baseVersion < 0) return fail('Invalid request.');

  try {
    await publishPolicies(parsed, baseVersion);
    publishToSite();
    return { success: true, data: await policiesAdminData() };
  } catch (err) {
    return failFrom(err, 'Could not publish the terms & policies.');
  }
}

/** Content of an earlier published version (to restore into the editor). */
export async function getPoliciesRevision(version: number): Promise<Result<{ content: PolicyContent }>> {
  if (!(await isAdmin())) return fail(SESSION_EXPIRED);
  if (!Number.isInteger(version) || version < 1) return fail('Invalid version.');
  try {
    const revision = await getPolicyRevision(version);
    return revision ? { success: true, content: revision.content } : fail('That version is no longer available.');
  } catch (err) {
    return failFrom(err, 'Could not load that version.');
  }
}
