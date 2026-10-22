/**
 * imageUpload.ts — browser side of the admin photo uploads (Homepage images,
 * Footer destinations): checks a picked file before uploading and sends it
 * straight to Cloudinary with a server-signed ticket. The server checks the
 * stored picture again before it can be used.
 */

import { IMAGE_RULES } from '@/lib/siteImages';

const EXT_OK = /\.(jpe?g|png|webp|avif)$/i;

export const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

async function readDimensions(file: File): Promise<{ width: number; height: number } | null> {
  try {
    if (typeof createImageBitmap === 'function') {
      const bmp = await createImageBitmap(file);
      const d = { width: bmp.width, height: bmp.height };
      bmp.close();
      return d;
    }
  } catch {
    // fall through to <img> decoding
  }
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

/** Browser-side checks (repeated on the server). Returns a message or null. */
export async function checkFile(file: File, min: { w: number; h: number }): Promise<string | null> {
  const typeOk = (IMAGE_RULES.mimeTypes as readonly string[]).includes(file.type) || (!file.type && EXT_OK.test(file.name));
  if (!typeOk) return `"${file.name}" is not a supported picture. Use JPG, PNG, WebP or AVIF.`;
  if (file.size > IMAGE_RULES.maxBytes) return `"${file.name}" is ${mb(file.size)}; the limit is ${mb(IMAGE_RULES.maxBytes)}.`;
  const dims = await readDimensions(file);
  if (!dims) return `"${file.name}" could not be opened as a picture. It may be damaged; try exporting it again.`;
  if (dims.width < min.w || dims.height < min.h) {
    return `"${file.name}" is ${dims.width}×${dims.height}px; this spot needs at least ${min.w}×${min.h}px so it stays sharp.`;
  }
  return null;
}

export function sendToCloudinary(url: string, fields: Record<string, string>, file: File, onProgress: (pct: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    Object.entries(fields).forEach(([k, v]) => form.append(k, v));
    form.append('file', file);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      let body: { public_id?: string; error?: { message?: string } } | null = null;
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        // non-JSON error page
      }
      if (xhr.status >= 200 && xhr.status < 300 && body?.public_id) resolve();
      else reject(new Error(body?.error?.message ? `Upload refused: ${body.error.message}` : `Upload failed (${xhr.status}). Please try again.`));
    };
    xhr.onerror = () => reject(new Error('Upload failed. Check the internet connection and try again.'));
    xhr.send(form);
  });
}
