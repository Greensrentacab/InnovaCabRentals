'use client';

/**
 * HomepageImagesPanel.tsx — Admin → Homepage images.
 *
 * Every homepage picture (hero per booking tab with desktop + phone pictures,
 * service card carousels, each car's photo set, route photos) can be replaced,
 * reordered or reset to the built-in picture. Changes are a draft until "Publish", which
 * puts them live without a deployment.
 *
 * Upload: the file is checked in the browser (type, size, dimensions), sent
 * straight to Cloudinary with a server-signed ticket, then checked again on
 * the server before it can be used. Discarded uploads are deleted again.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ExternalLink,
  ImagePlus,
  Monitor,
  RefreshCw,
  RotateCcw,
  Save,
  Smartphone,
  Trash2,
  Undo2,
  Upload,
} from 'lucide-react';
import {
  confirmImageUpload,
  createImageUpload,
  discardImageUploads,
  getSiteImagesAdmin,
  publishSiteImages,
  type SiteImagesAdminData,
} from '@/app/actions/siteContent';
import {
  cloudinaryUrl,
  defaultSlotValue,
  IMAGE_RULES,
  SLOT_BY_ID,
  SLOT_DEFS,
  SLOT_GROUPS,
  type GalleryValue,
  type PlacedImage,
  type SingleValue,
  type SiteImageOverrides,
  type SlotDef,
  type SlotGroup,
  type SlotValue,
} from '@/lib/siteImages';

/** Which picture an upload is for: hero desktop/phone, a new gallery photo, or gallery photo n (0-based) */
type Variant = 'desktop' | 'mobile' | 'add' | `replace-${number}`;
type Focus = PlacedImage['focus'];

/** Default crops used by the live layouts when no focal point is set. */
const HERO_DESKTOP_POS: Record<string, string> = { 'hero.airport': '100% 70%', 'hero.outstation': '100% 60%', 'hero.local': '100% 70%' };
const HERO_PHONE_CROP_POS = '88% 72%';
const HERO_PHONE_OWN_POS = '50% 100%';

/** JSON with sorted keys — key order must not count as a change. */
const canon = (v: unknown) =>
  JSON.stringify(v ?? null, (_k, val) =>
    val && typeof val === 'object' && !Array.isArray(val)
      ? Object.fromEntries(Object.keys(val).sort().map((k) => [k, (val as Record<string, unknown>)[k]]))
      : val
  );

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;
const pos = (focus: Focus, fallback: string) => (focus ? `${focus.x}% ${focus.y}%` : fallback);
const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

function previewSrc(img: PlacedImage, cloudName: string | null, width = 960): string {
  const s = img.source;
  if (s.kind === 'static') return s.src;
  return cloudName ? cloudinaryUrl(cloudName, s, Math.min(width, s.width)) : '';
}

const EXT_OK = /\.(jpe?g|png|webp|avif)$/i;

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
async function checkFile(file: File, min: { w: number; h: number }): Promise<string | null> {
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

function sendToCloudinary(url: string, fields: Record<string, string>, file: File, onProgress: (pct: number) => void): Promise<void> {
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

// ─── Small building blocks ──────────────────────────────────────────────────

/** Full picture; click (or arrow keys) to set the focal point the crops keep in view. */
function FocalPicker({
  src,
  width,
  height,
  focus,
  onChange,
  label,
}: {
  src: string;
  width: number;
  height: number;
  focus: Focus;
  onChange: (focus: Focus) => void;
  label: string;
}) {
  const clamp = (n: number) => Math.min(100, Math.max(0, Math.round(n)));
  const current = focus ?? { x: 50, y: 50 };
  return (
    <div
      role="group"
      tabIndex={0}
      aria-label={`${label}: click the picture, or use the arrow keys, to set the part that must stay in view`}
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        onChange({ x: clamp(((e.clientX - r.left) / r.width) * 100), y: clamp(((e.clientY - r.top) / r.height) * 100) });
      }}
      onKeyDown={(e) => {
        const step = e.shiftKey ? 10 : 2;
        const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
        const d = moves[e.key];
        if (!d) return;
        e.preventDefault();
        onChange({ x: clamp(current.x + d[0]), y: clamp(current.y + d[1]) });
      }}
      className="relative mx-auto cursor-crosshair overflow-hidden rounded-xl bg-slate-900 outline-none ring-brand-500/40 focus-visible:ring-4"
      style={{ aspectRatio: `${width} / ${height}`, width: `min(100%, ${Math.round((260 * width) / height)}px)` }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" draggable={false} />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center p-3 text-center text-xs text-slate-300">Preview unavailable (Cloudinary not connected)</span>
      )}
      {focus && (
        <span
          className="pointer-events-none absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-[0_0_0_2px_rgba(37,99,235,0.9),0_2px_8px_rgba(0,0,0,0.5)]"
          style={{ left: `${focus.x}%`, top: `${focus.y}%` }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

/** A crop preview with the same object-fit / position as the live layout. */
function CropFrame({
  src,
  aspect,
  position,
  mirror,
  wash,
  className,
  caption,
}: {
  src: string;
  aspect: number;
  position: string;
  mirror?: boolean;
  wash?: 'hero' | 'card';
  className?: string;
  caption: string;
}) {
  return (
    <figure className={className}>
      <div className="relative overflow-hidden rounded-lg bg-slate-200 ring-1 ring-slate-200" style={{ aspectRatio: aspect }}>
        {src && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className={`absolute inset-0 h-full w-full object-cover ${mirror ? '-scale-x-100' : ''}`} style={{ objectPosition: position }} />
        )}
        {wash === 'hero' && (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
            <div className="absolute left-[8%] top-[22%] w-[45%] space-y-1.5" aria-hidden="true">
              <div className="h-2 w-full rounded bg-white/90" />
              <div className="h-2 w-3/4 rounded bg-white/90" />
              <div className="h-1 w-2/3 rounded bg-white/50" />
            </div>
          </>
        )}
        {wash === 'card' && <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />}
      </div>
      <figcaption className="mt-1 text-center text-[10px] font-bold uppercase tracking-wide text-slate-400">{caption}</figcaption>
    </figure>
  );
}

function Badge({ tone, children }: { tone: 'slate' | 'brand' | 'amber'; children: React.ReactNode }) {
  const cls = { slate: 'bg-slate-100 text-slate-600', brand: 'bg-brand-50 text-brand-700', amber: 'bg-amber-100 text-amber-800' }[tone];
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${cls}`}>{children}</span>;
}

function UploadButton({
  label,
  onClick,
  disabled,
  title,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} title={title} className="adm-btn-ghost !min-h-[40px] !px-3 text-xs">
      <Upload className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

const ruleText = (min: { w: number; h: number }) => `At least ${min.w}×${min.h}px · JPG, PNG, WebP or AVIF · up to ${mb(IMAGE_RULES.maxBytes)}`;

// ─── Slot editors ───────────────────────────────────────────────────────────

interface SlotProps {
  def: SlotDef;
  isCustom: boolean;
  changed: boolean;
  cloudName: string | null;
  busy: { variant: Variant; progress: number } | null;
  error: string | null;
  onPick: (variant: Variant) => void;
  onReset: () => void;
}

function SlotHeader({ def, isCustom, changed, onReset, busy }: Pick<SlotProps, 'def' | 'isCustom' | 'changed' | 'onReset' | 'busy'>) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-2 px-4 pt-4 sm:px-5">
      <div className="min-w-0">
        <h3 className="text-[15px] font-extrabold tracking-tight text-ink">{def.label}</h3>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <Badge tone={isCustom ? 'brand' : 'slate'}>{isCustom ? 'Customised' : 'Built-in'}</Badge>
          {changed && <Badge tone="amber">Not published yet</Badge>}
        </div>
      </div>
      {isCustom && (
        <button type="button" onClick={onReset} disabled={Boolean(busy)} className="adm-btn-ghost !min-h-[36px] !px-3 text-xs">
          <RotateCcw className="h-3.5 w-3.5" /> Reset to built-in
        </button>
      )}
    </div>
  );
}

function SlotStatus({ busy, error }: Pick<SlotProps, 'busy' | 'error'>) {
  return (
    <>
      {busy && (
        <div className="mt-3" role="status">
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${Math.max(busy.progress, 4)}%` }} />
          </div>
          <p className="mt-1 text-[11px] font-semibold text-slate-500">
            {busy.progress < 100 ? `Uploading… ${busy.progress}%` : 'Checking the picture…'}
          </p>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-3 flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
          <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" /> {error}
        </p>
      )}
    </>
  );
}

function SingleSlot({
  value,
  onChange,
  uploadsEnabled,
  ...p
}: SlotProps & { value: SingleValue; onChange: (v: SingleValue) => void; uploadsEnabled: boolean }) {
  const { def, cloudName, busy } = p;
  const isHero = def.group === 'hero';
  const d = value.desktop;
  const m = value.mobile;
  const dSrc = previewSrc(d, cloudName);
  const mSrc = m ? previewSrc(m, cloudName, 828) : '';
  const desktopPos = pos(d.focus, isHero ? HERO_DESKTOP_POS[def.id] ?? '100% 70%' : '50% 50%');
  const setDesktop = (patch: Partial<PlacedImage>) => onChange({ ...value, desktop: { ...d, ...patch } });
  const uploadTitle = uploadsEnabled ? undefined : 'Connect Cloudinary to upload pictures';
  const phoneStillBuiltIn = isHero && d.source.kind === 'cloudinary' && m?.source.kind === 'static';

  return (
    <section className="adm-card overflow-hidden">
      <SlotHeader {...p} />
      <div className="px-4 pb-4 pt-3 sm:px-5">
        <div className={isHero ? 'grid gap-4 md:grid-cols-2' : 'grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'}>
          {/* Desktop / main picture */}
          <div className="min-w-0">
            {isHero && (
              <p className="adm-label flex items-center gap-1.5">
                <Monitor className="h-3.5 w-3.5" /> Desktop picture
              </p>
            )}
            <FocalPicker src={dSrc} width={d.source.width} height={d.source.height} focus={d.focus} onChange={(focus) => setDesktop({ focus })} label={`${def.label} picture`} />
            <div className="mt-2 flex flex-wrap gap-2">
              <UploadButton label="Replace" onClick={() => p.onPick('desktop')} disabled={!uploadsEnabled || Boolean(busy)} title={uploadTitle} />
              {d.focus && (
                <button type="button" onClick={() => setDesktop({ focus: null })} className="adm-btn-ghost !min-h-[40px] !px-3 text-xs">
                  Default crop
                </button>
              )}
              {def.canMirror && (
                <label className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700">
                  <input type="checkbox" checked={Boolean(d.mirror)} onChange={(e) => setDesktop({ mirror: e.target.checked })} className="h-4 w-4 accent-brand-600" />
                  Mirror on desktop
                </label>
              )}
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500">{ruleText(def.min)}</p>
          </div>

          {/* Phone picture (hero) or the live crop (other slots) */}
          {isHero ? (
            <div className="min-w-0">
              <p className="adm-label flex items-center gap-1.5">
                <Smartphone className="h-3.5 w-3.5" /> Phone picture <span className="font-semibold normal-case tracking-normal text-slate-400">(optional)</span>
              </p>
              {m ? (
                <FocalPicker
                  src={mSrc}
                  width={m.source.width}
                  height={m.source.height}
                  focus={m.focus}
                  onChange={(focus) => onChange({ ...value, mobile: { ...m, focus } })}
                  label={`${def.label} phone picture`}
                />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center rounded-xl border-2 border-dashed border-slate-200 p-4 text-center text-xs text-slate-500">
                  No phone picture — phones show a crop of the desktop picture.
                </div>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                <UploadButton label={m ? 'Replace' : 'Add phone picture'} onClick={() => p.onPick('mobile')} disabled={!uploadsEnabled || Boolean(busy)} title={uploadTitle} />
                {m && (
                  <button type="button" onClick={() => onChange({ ...value, mobile: null })} className="adm-btn-ghost !min-h-[40px] !px-3 text-xs">
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                )}
              </div>
              <p className="mt-1.5 text-[11px] text-slate-500">{def.minMobile && ruleText(def.minMobile)} · tall (portrait) pictures work best</p>
            </div>
          ) : (
            <CropFrame src={dSrc} aspect={def.aspect} position={desktopPos} wash="card" caption="On the website" />
          )}
        </div>

        {phoneStillBuiltIn && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
            Phones still show the built-in phone picture. Upload a matching phone picture, or remove it so phones crop your new desktop picture.
          </p>
        )}

        {isHero && (
          <div className="mt-4">
            <p className="adm-label">How it looks</p>
            <div className="flex items-end gap-3">
              <CropFrame src={dSrc} aspect={16 / 10} position={desktopPos} mirror={d.mirror} wash="hero" caption="Desktop" className="min-w-0 flex-1" />
              <CropFrame
                src={m ? mSrc : dSrc}
                aspect={9 / 16}
                position={m ? pos(m.focus, HERO_PHONE_OWN_POS) : pos(d.focus, HERO_PHONE_CROP_POS)}
                wash="hero"
                caption="Phone"
                className="w-[22%] min-w-[72px] max-w-[120px]"
              />
            </div>
          </div>
        )}

        <label className="mt-4 block">
          <span className="adm-label">Picture description (for screen readers &amp; Google)</span>
          <input
            type="text"
            value={d.alt}
            maxLength={IMAGE_RULES.altChars}
            onChange={(e) => setDesktop({ alt: e.target.value })}
            placeholder={def.label}
            className="adm-field !py-2.5"
          />
        </label>
        <SlotStatus busy={busy} error={p.error} />
      </div>
    </section>
  );
}

function GallerySlot({
  value,
  onChange,
  uploadsEnabled,
  ...p
}: SlotProps & { value: GalleryValue; onChange: (v: GalleryValue) => void; uploadsEnabled: boolean }) {
  const { def, cloudName, busy } = p;
  const [open, setOpen] = useState<number | null>(null);
  const items = value.items;
  const max = def.maxItems ?? 8;
  const isCar = def.group === 'fleet';
  const previews = def.previews ?? [{ label: 'On the website', aspect: def.aspect }];
  const uploadTitle = uploadsEnabled ? undefined : 'Connect Cloudinary to upload pictures';
  const set = (next: PlacedImage[]) => onChange({ kind: 'gallery', items: next });
  const move = (i: number, by: -1 | 1) => {
    const next = [...items];
    [next[i], next[i + by]] = [next[i + by], next[i]];
    set(next);
    setOpen(null);
  };

  return (
    <section className="adm-card overflow-hidden">
      <SlotHeader {...p} />
      <div className="px-4 pb-4 pt-3 sm:px-5">
        <p className="text-xs text-slate-500">
          {items.length} of {max} photos · {isCar ? 'photo 1 is the main photo' : 'the first photo shows first'}. Tap a photo to set its focal point.
        </p>
        <ol className="mt-3 space-y-2">
          {items.map((img, i) => {
            const src = previewSrc(img, cloudName, 480);
            return (
              <li key={`${i}-${img.source.kind === 'static' ? img.source.src : img.source.publicId}`} className="rounded-xl border border-slate-200 p-2">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setOpen(open === i ? null : i)}
                    aria-expanded={open === i}
                    aria-label={`Photo ${i + 1}: set focal point`}
                    className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100 ring-brand-500 focus-visible:ring-2"
                  >
                    {src && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={src} alt="" className="h-full w-full object-cover" style={{ objectPosition: pos(img.focus, '50% 50%') }} />
                    )}
                    <span className="absolute left-1 top-1 rounded bg-black/60 px-1 text-[10px] font-bold text-white">{i + 1}</span>
                    {isCar && i === 0 && (
                      <span className="absolute inset-x-0 bottom-0 bg-brand-600/90 text-center text-[9px] font-extrabold uppercase tracking-wide text-white">Main</span>
                    )}
                  </button>
                  <input
                    type="text"
                    value={img.alt}
                    maxLength={IMAGE_RULES.altChars}
                    onChange={(e) => set(items.map((it, j) => (j === i ? { ...it, alt: e.target.value } : it)))}
                    placeholder="Picture description"
                    aria-label={`Photo ${i + 1} description`}
                    className="adm-field min-w-0 flex-1 !py-2 text-xs"
                  />
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => p.onPick(`replace-${i}`)}
                      disabled={!uploadsEnabled || Boolean(busy)}
                      title={uploadTitle ?? `Replace photo ${i + 1}`}
                      aria-label={`Replace photo ${i + 1}`}
                      className="adm-btn-ghost !min-h-[36px] !px-2"
                    >
                      <Upload className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move photo ${i + 1} up`} className="adm-btn-ghost !min-h-[36px] !px-2">
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label={`Move photo ${i + 1} down`} className="adm-btn-ghost !min-h-[36px] !px-2">
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        set(items.filter((_, j) => j !== i));
                        setOpen(null);
                      }}
                      disabled={items.length <= 1}
                      title={items.length <= 1 ? 'Keep at least one photo' : undefined}
                      aria-label={`Remove photo ${i + 1}`}
                      className="adm-btn-ghost !min-h-[36px] !px-2 text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {open === i && (
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    <FocalPicker
                      src={src}
                      width={img.source.width}
                      height={img.source.height}
                      focus={img.focus}
                      onChange={(focus) => set(items.map((it, j) => (j === i ? { ...it, focus } : it)))}
                      label={`Photo ${i + 1}`}
                    />
                    <div className="flex items-end gap-3">
                      {previews.map((pv) => (
                        <CropFrame key={pv.label} src={src} aspect={pv.aspect} position={pos(img.focus, '50% 50%')} wash="card" caption={pv.label} className="w-1/2" />
                      ))}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => p.onPick('add')}
            disabled={!uploadsEnabled || Boolean(busy) || items.length >= max}
            title={!uploadsEnabled ? 'Connect Cloudinary to upload pictures' : items.length >= max ? `Up to ${max} photos` : undefined}
            className="adm-btn-ghost !min-h-[40px] !px-3 text-xs"
          >
            <ImagePlus className="h-3.5 w-3.5" /> Add photo
          </button>
          <span className="text-[11px] text-slate-500">{ruleText(def.min)}</span>
        </div>
        <SlotStatus busy={busy} error={p.error} />
      </div>
    </section>
  );
}

// ─── Panel ──────────────────────────────────────────────────────────────────

export default function HomepageImagesPanel({ onToast }: { onToast: (message: string) => void }) {
  const [data, setData] = useState<SiteImagesAdminData | null>(null);
  const [draft, setDraft] = useState<SiteImageOverrides>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [group, setGroup] = useState<SlotGroup>('hero');
  const [busy, setBusy] = useState<Record<string, { variant: Variant; progress: number } | null>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [publishing, setPublishing] = useState(false);
  const [publishErrors, setPublishErrors] = useState<string[]>([]);
  const [publishError, setPublishError] = useState<string | null>(null);

  /** Uploaded this session but not yet published (deleted again on discard). */
  const pendingUploads = useRef<Set<string>>(new Set());
  const fileInput = useRef<HTMLInputElement>(null);
  const pickTarget = useRef<{ slotId: string; variant: Variant } | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    const res = await getSiteImagesAdmin();
    if (!res.success) {
      setLoadError(res.error);
      return;
    }
    setData(res.data);
    setDraft(clone(res.data.overrides));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const published = data?.overrides ?? {};
  const changedIds = useMemo(
    () => SLOT_DEFS.map((d) => d.id).filter((id) => canon(draft[id]) !== canon(published[id])),
    [draft, published]
  );
  const dirty = changedIds.length > 0;
  const anyBusy = Object.values(busy).some(Boolean);

  // Warn before leaving with unpublished changes
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const valueOf = (id: string): SlotValue => draft[id] ?? defaultSlotValue(id)!;
  const setSlot = (id: string, value: SlotValue) => setDraft((d) => ({ ...d, [id]: value }));
  const resetSlot = (id: string) =>
    setDraft((d) => {
      const next = { ...d };
      delete next[id];
      return next;
    });

  const pick = (slotId: string, variant: Variant) => {
    pickTarget.current = { slotId, variant };
    fileInput.current?.click();
  };

  const onFile = async (file: File) => {
    const target = pickTarget.current;
    if (!target) return;
    const { slotId, variant } = target;
    const def = SLOT_BY_ID[slotId];
    const setSlotError = (msg: string | null) => setErrors((e) => ({ ...e, [slotId]: msg }));
    const setSlotBusy = (b: { variant: Variant; progress: number } | null) => setBusy((s) => ({ ...s, [slotId]: b }));

    setSlotError(null);
    const problem = await checkFile(file, variant === 'mobile' ? def.minMobile ?? def.min : def.min);
    if (problem) {
      setSlotError(problem);
      return;
    }

    setSlotBusy({ variant, progress: 0 });
    try {
      const ticket = await createImageUpload(slotId);
      if (!ticket.success) throw new Error(ticket.error);
      await sendToCloudinary(ticket.ticket.uploadUrl, ticket.ticket.fields, file, (progress) => setSlotBusy({ variant, progress }));
      setSlotBusy({ variant, progress: 100 });
      const checked = await confirmImageUpload(slotId, variant === 'mobile' ? 'mobile' : 'desktop', ticket.ticket.publicId);
      if (!checked.success) throw new Error(checked.error);
      pendingUploads.current.add(ticket.ticket.publicId);

      const placed: PlacedImage = {
        source: { kind: 'cloudinary', ...checked.image },
        alt: '',
        focus: null,
        ...(def.canMirror && variant !== 'mobile' ? { mirror: false } : {}),
      };
      setDraft((d) => {
        const current = d[slotId] ?? defaultSlotValue(slotId)!;
        const replaceAt = variant.startsWith('replace-') ? Number(variant.slice('replace-'.length)) : -1;
        const next: SlotValue =
          current.kind === 'gallery'
            ? {
                kind: 'gallery',
                items:
                  replaceAt >= 0 && replaceAt < current.items.length
                    ? current.items.map((it, j) => (j === replaceAt ? placed : it))
                    : [...current.items, placed],
              }
            : variant === 'mobile'
              ? { ...current, mobile: placed }
              : { ...current, desktop: placed };
        return { ...d, [slotId]: next };
      });
    } catch (err) {
      setSlotError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setSlotBusy(null);
    }
  };

  const discard = async () => {
    if (!data) return;
    const ids = Array.from(pendingUploads.current);
    pendingUploads.current = new Set();
    setDraft(clone(data.overrides));
    setErrors({});
    setPublishErrors([]);
    setPublishError(null);
    if (ids.length) await discardImageUploads(ids);
  };

  const publish = async () => {
    if (!data) return;
    setPublishing(true);
    setPublishErrors([]);
    setPublishError(null);
    const res = await publishSiteImages(draft, data.version);
    setPublishing(false);
    if (!res.success) {
      setPublishError(res.error);
      setPublishErrors(res.errors ?? []);
      return;
    }
    // Uploads that were published are no longer pending; unused ones are cleaned up
    const live = new Set(
      Object.values(res.data.overrides).flatMap((v) =>
        (v.kind === 'single' ? [v.desktop, v.mobile] : v.items).flatMap((i) => (i && i.source.kind === 'cloudinary' ? [i.source.publicId] : []))
      )
    );
    const unused = Array.from(pendingUploads.current).filter((id) => !live.has(id));
    pendingUploads.current = new Set();
    if (unused.length) void discardImageUploads(unused);

    setData(res.data);
    setDraft(clone(res.data.overrides));
    onToast('Homepage images published — live on the website now');
  };

  if (loadError) {
    return (
      <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-3 text-sm text-rose-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" /> {loadError}
        </p>
        <button type="button" onClick={load} className="adm-btn-ghost shrink-0">
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center gap-3 py-10 text-sm font-semibold text-slate-500" aria-busy="true">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" /> Loading homepage images…
      </div>
    );
  }

  const uploadsEnabled = Boolean(data.cloudName);
  const groupDefs = SLOT_DEFS.filter((d) => d.group === group);
  const groupInfo = SLOT_GROUPS.find((g) => g.id === group)!;

  return (
    <div className="space-y-5 pb-28 sm:pb-24">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-[28px]">Homepage images</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Replace any picture on the homepage — for festivals, offers or new photos of your cars. Nothing changes on the website until you
            press <strong>Publish</strong>.
          </p>
        </div>
        <a href="/" target="_blank" rel="noopener noreferrer" className="adm-btn-ghost shrink-0">
          <ExternalLink className="h-4 w-4" /> View homepage
        </a>
      </div>

      {!uploadsEnabled && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="min-w-0">
            <strong>Uploads are switched off.</strong> Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to the server
            settings and redeploy once. You can still reorder, remove and reset pictures.
          </p>
        </div>
      )}

      {/* Group switcher */}
      <div role="tablist" aria-label="Picture groups" className="flex gap-2 overflow-x-auto pb-1">
        {SLOT_GROUPS.map((g) => {
          const defs = SLOT_DEFS.filter((d) => d.group === g.id);
          const pending = defs.filter((d) => changedIds.includes(d.id)).length;
          const active = g.id === group;
          return (
            <button
              key={g.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setGroup(g.id)}
              className={`inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-bold transition-colors ${
                active ? 'bg-ink text-white' : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              {g.title}
              <span className={`rounded-full px-2 py-0.5 text-[11px] ${active ? 'bg-white/15' : 'bg-slate-100'}`}>{defs.length}</span>
              {pending > 0 && <span className="h-2 w-2 rounded-full bg-amber-400" aria-label={`${pending} unpublished`} />}
            </button>
          );
        })}
      </div>
      <p className="-mt-2 text-sm text-slate-600">{groupInfo.hint}</p>

      <div className={`grid items-start gap-4 ${group === 'hero' ? '' : group === 'routes' ? 'md:grid-cols-2 2xl:grid-cols-3' : 'xl:grid-cols-2'}`}>
        {groupDefs.map((def) => {
          const value = valueOf(def.id);
          const common: SlotProps = {
            def,
            isCustom: def.id in draft,
            changed: changedIds.includes(def.id),
            cloudName: data.cloudName,
            busy: busy[def.id] ?? null,
            error: errors[def.id] ?? null,
            onPick: (variant) => pick(def.id, variant),
            onReset: () => resetSlot(def.id),
          };
          return value.kind === 'gallery' ? (
            <GallerySlot key={def.id} {...common} value={value} onChange={(v) => setSlot(def.id, v)} uploadsEnabled={uploadsEnabled} />
          ) : (
            <SingleSlot key={def.id} {...common} value={value} onChange={(v) => setSlot(def.id, v)} uploadsEnabled={uploadsEnabled} />
          );
        })}
      </div>

      <input
        ref={fileInput}
        type="file"
        accept={IMAGE_RULES.mimeTypes.join(',')}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) void onFile(file);
        }}
      />

      {(publishError || publishErrors.length > 0) && (
        <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          <p className="flex items-center gap-2 font-bold">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" /> {publishError}
          </p>
          {publishErrors.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-6 text-xs">
              {publishErrors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Sticky publish bar */}
      <div className="fixed inset-x-3 bottom-3 z-30 lg:left-[calc(16rem+0.75rem)] lg:right-3">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-3 rounded-2xl bg-[#0B1120] px-4 py-3 text-white shadow-float-lg sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-3.5 pb-safe">
          <p className="flex min-w-0 items-center gap-2.5 text-sm font-bold">
            {dirty ? <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" /> : <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />}
            <span className="min-w-0 truncate">
              {anyBusy
                ? 'Uploading…'
                : dirty
                  ? `${changedIds.length} picture spot${changedIds.length > 1 ? 's' : ''} changed — not live yet`
                  : data.updatedAt
                    ? `Live · last published ${new Date(data.updatedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}`
                    : 'Showing the built-in pictures'}
            </span>
          </p>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <button
              type="button"
              onClick={discard}
              disabled={!dirty || publishing || anyBusy}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-white/10 disabled:opacity-40"
            >
              <Undo2 className="h-4 w-4" /> Discard
            </button>
            <button
              type="button"
              onClick={publish}
              disabled={!dirty || publishing || anyBusy}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-2 text-sm font-extrabold text-white transition-colors hover:bg-brand-500 disabled:bg-brand-900/70 disabled:text-white/50"
            >
              <Save className="h-4 w-4" /> {publishing ? 'Publishing…' : 'Publish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
