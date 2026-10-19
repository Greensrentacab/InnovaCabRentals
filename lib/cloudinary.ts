/**
 * cloudinary.ts — SERVER ONLY. Signed uploads, upload verification and
 * clean-up for Admin → Homepage images.
 *
 * Flow: the server signs an upload for a public id it chooses (inside
 * CLOUDINARY_FOLDER), the admin's browser sends the file straight to
 * Cloudinary (no size limits from our host), then the server reads the
 * stored image back through the Admin API and checks format, size and
 * dimensions before the image can be published. The API secret never
 * leaves the server.
 *
 * Configure with CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and
 * CLOUDINARY_API_SECRET (or a single CLOUDINARY_URL=cloudinary://key:secret@cloud).
 */

import 'server-only';
import { createHash, randomBytes } from 'crypto';
import { CLOUDINARY_FOLDER, IMAGE_RULES, isOwnPublicId, type CloudImage } from '@/lib/siteImages';

interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

export function cloudinaryConfig(): CloudinaryConfig | null {
  let cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  let apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  let apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  const url = process.env.CLOUDINARY_URL?.trim();
  if ((!cloudName || !apiKey || !apiSecret) && url) {
    const m = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
    if (m) [, apiKey, apiSecret, cloudName] = m;
  }
  return cloudName && apiKey && apiSecret ? { cloudName, apiKey, apiSecret } : null;
}

/** Cloud name for delivery URLs (null = Cloudinary not configured). */
export const cloudinaryCloudName = (): string | null => cloudinaryConfig()?.cloudName ?? null;

/** Cloudinary request signature: sha1 of the sorted "key=value" pairs joined by "&", then the API secret. */
export function signParams(params: Record<string, string | number>, apiSecret: string): string {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return createHash('sha1').update(toSign + apiSecret).digest('hex');
}

export interface UploadTicket {
  uploadUrl: string;
  /** Form fields the browser sends with the file (all signed) */
  fields: Record<string, string>;
  publicId: string;
}

/** Signed one-off upload for a new image (valid for one hour, per Cloudinary). */
export function createUploadTicket(slotId: string): UploadTicket {
  const cfg = cloudinaryConfig();
  if (!cfg) throw new Error('Cloudinary is not configured.');
  const slug = slotId.replace(/[^A-Za-z0-9]+/g, '-').slice(0, 40);
  const publicId = `${CLOUDINARY_FOLDER}/${slug}-${randomBytes(8).toString('hex')}`;
  const params = {
    allowed_formats: IMAGE_RULES.formats.join(','),
    // Media Library folder on dynamic-folder accounts (the public id alone doesn't place it in a folder)
    asset_folder: CLOUDINARY_FOLDER,
    public_id: publicId,
    timestamp: Math.floor(Date.now() / 1000),
  };
  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${encodeURIComponent(cfg.cloudName)}/image/upload`,
    fields: {
      ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
      api_key: cfg.apiKey,
      signature: signParams(params, cfg.apiSecret),
    },
    publicId,
  };
}

const authHeader = (cfg: CloudinaryConfig) =>
  `Basic ${Buffer.from(`${cfg.apiKey}:${cfg.apiSecret}`).toString('base64')}`;

/** The stored image as Cloudinary sees it (authoritative size/format), or null if it does not exist. */
export async function fetchCloudImage(publicId: string): Promise<CloudImage | null> {
  const cfg = cloudinaryConfig();
  if (!cfg) throw new Error('Cloudinary is not configured.');
  if (!isOwnPublicId(publicId)) return null;

  const path = publicId.split('/').map(encodeURIComponent).join('/');
  const res = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cfg.cloudName)}/resources/image/upload/${path}`, {
    headers: { Authorization: authHeader(cfg) },
    cache: 'no-store',
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Cloudinary lookup failed (${res.status}).`);
  const j = (await res.json()) as { public_id: string; version: number; width: number; height: number; format: string; bytes: number };
  return { publicId: j.public_id, version: j.version, width: j.width, height: j.height, format: j.format, bytes: j.bytes };
}

/** Deletes an uploaded image and purges it from the CDN. Never throws (clean-up is best-effort). */
export async function destroyCloudImage(publicId: string): Promise<boolean> {
  const cfg = cloudinaryConfig();
  if (!cfg || !isOwnPublicId(publicId)) return false;
  try {
    const params = { invalidate: 'true', public_id: publicId, timestamp: Math.floor(Date.now() / 1000) };
    const body = new URLSearchParams({
      ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
      api_key: cfg.apiKey,
      signature: signParams(params, cfg.apiSecret),
    });
    const res = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cfg.cloudName)}/image/destroy`, {
      method: 'POST',
      body,
      cache: 'no-store',
    });
    const j = (await res.json().catch(() => ({}))) as { result?: string };
    return res.ok && (j.result === 'ok' || j.result === 'not found');
  } catch (err) {
    console.error('[cloudinary] Could not delete', publicId, err);
    return false;
  }
}
