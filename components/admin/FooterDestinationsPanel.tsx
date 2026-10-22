'use client';

/**
 * FooterDestinationsPanel.tsx — Admin → Footer destinations.
 *
 * List: the footer's three route columns. Their built-in links stay as they
 * are; added destinations follow them, with their status and order (moving one
 * applies to the footer at once).
 *
 * Editor: footer link text and column, "show in footer", page heading and
 * address, one of three templates, and the page content (photos, text,
 * sections). Everything is a draft until Publish; Preview shows the page
 * exactly as customers will see it. Photos upload like Homepage images
 * (checked in the browser, sent to Cloudinary, checked again on the server).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  ImagePlus,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Undo2,
  Upload,
} from 'lucide-react';
import {
  confirmDestinationImageUpload,
  createDestination,
  createDestinationImageUpload,
  deleteDestination,
  discardDestinationUploads,
  getDestinationsAdmin,
  moveDestination,
  publishDestination,
  saveDestinationDraft,
  unpublishDestination,
  type DestinationsAdminData,
} from '@/app/actions/destinations';
import StickyActionBar from '@/components/admin/StickyActionBar';
import { checkFile, mb, sendToCloudinary } from '@/components/admin/imageUpload';
import DestinationView from '@/components/destinations/DestinationView';
import {
  checkPublishable,
  DESTINATION_IMAGE_MIN,
  DESTINATION_LIMITS,
  DESTINATION_TEMPLATES,
  destinationImageIds,
  destinationStatus,
  forTemplate,
  newSectionId,
  placeName,
  sameContent,
  slugify,
  TEMPLATE_INFO,
  type DestinationContent,
  type DestinationImage,
  type DestinationRecord,
  type DestinationSection,
  type DestinationTemplate,
} from '@/lib/destinations';
import { BUILT_IN_FOOTER_COLUMNS, FOOTER_COLUMN_IDS, FOOTER_COLUMN_TITLE, type FooterColumnId } from '@/lib/footerColumns';
import { cloudinaryUrl, IMAGE_RULES } from '@/lib/siteImages';

const L = DESTINATION_LIMITS;
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;
const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '');
const BODY_HINT = 'Leave an empty line between paragraphs. Start a line with “- ” to make a bullet point.';
const PHOTO_RULES = `At least ${DESTINATION_IMAGE_MIN.w}×${DESTINATION_IMAGE_MIN.h}px · JPG, PNG, WebP or AVIF · up to ${mb(IMAGE_RULES.maxBytes)}`;

function moveItem<T>(list: T[], i: number, by: -1 | 1): T[] {
  const next = [...list];
  [next[i], next[i + by]] = [next[i + by], next[i]];
  return next;
}

// ─── Small building blocks ──────────────────────────────────────────────────

function IconButton({ label, onClick, disabled, children, danger }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label} title={label} className={`adm-btn-ghost !min-h-[36px] !px-2 ${danger ? 'text-rose-600' : ''}`}>
      {children}
    </button>
  );
}

function StatusPill({ record }: { record: Pick<DestinationRecord, 'draft' | 'live'> }) {
  const status = destinationStatus(record);
  const [label, tone] =
    status === 'draft'
      ? ['Not published', 'bg-slate-100 text-slate-700']
      : status === 'changed'
        ? ['Live · unpublished changes', 'bg-amber-100 text-amber-800']
        : ['Live', 'bg-emerald-100 text-emerald-800'];
  return (
    <span className="flex flex-wrap gap-1.5">
      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${tone}`}>{label}</span>
      {record.live && !record.live.showInFooter && (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
          <EyeOff className="h-3 w-3" /> Not in footer
        </span>
      )}
    </span>
  );
}

/** Wireframe of a template (helps choose without reading). */
function TemplateThumb({ template }: { template: DestinationTemplate }) {
  const bar = 'h-1 rounded-full bg-slate-300';
  if (template === 'simple') {
    return (
      <div className="space-y-1.5 p-2" aria-hidden="true">
        <div className="h-9 rounded-md bg-slate-700" />
        <div className={`${bar} w-4/5`} />
        <div className={`${bar} w-full`} />
        <div className={`${bar} w-3/5`} />
        <div className="grid grid-cols-3 gap-1">
          <div className="h-4 rounded bg-slate-300" />
          <div className="h-4 rounded bg-slate-300" />
          <div className="h-4 rounded bg-slate-300" />
        </div>
      </div>
    );
  }
  if (template === 'split') {
    return (
      <div className="space-y-1.5 p-2" aria-hidden="true">
        <div className="space-y-1 rounded-md bg-brand-50 p-1.5">
          <div className="h-1.5 w-3/5 rounded-full bg-slate-500" />
          <div className={`${bar} w-4/5`} />
        </div>
        <div className="grid grid-cols-2 items-center gap-1.5">
          <div className="h-6 rounded bg-slate-300" />
          <div className="space-y-1">
            <div className={`${bar} w-full`} />
            <div className={`${bar} w-2/3`} />
          </div>
        </div>
        <div className="grid grid-cols-2 items-center gap-1.5">
          <div className="space-y-1">
            <div className={`${bar} w-full`} />
            <div className={`${bar} w-2/3`} />
          </div>
          <div className="h-6 rounded bg-slate-300" />
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-1.5 p-2" aria-hidden="true">
      <div className="h-6 rounded-md bg-slate-700" />
      <div className="-mt-3 mx-1.5 space-y-1 rounded bg-white p-1 shadow-sm">
        <div className={`${bar} w-full`} />
        <div className={`${bar} w-1/2`} />
      </div>
      {[0, 1].map((i) => (
        <div key={i} className="flex items-center gap-1 rounded border border-slate-200 bg-white p-1">
          <div className="h-2.5 w-2.5 rounded bg-brand-200" />
          <div className={`${bar} flex-1`} />
        </div>
      ))}
    </div>
  );
}

function TemplatePicker({ value, onChange, name }: { value: DestinationTemplate; onChange: (t: DestinationTemplate) => void; name: string }) {
  return (
    <div role="radiogroup" aria-label="Page template" className="grid gap-3 sm:grid-cols-3">
      {DESTINATION_TEMPLATES.map((t) => {
        const active = t === value;
        return (
          <label
            key={t}
            className={`flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white transition-colors ${
              active ? 'border-brand-500 ring-4 ring-brand-500/10' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <input type="radio" name={name} value={t} checked={active} onChange={() => onChange(t)} className="sr-only" />
            <div className="border-b border-slate-100 bg-slate-50">
              <TemplateThumb template={t} />
            </div>
            <span className="flex flex-1 flex-col p-3">
              <span className="flex items-center gap-2 text-sm font-extrabold text-ink">
                <span className={`h-3.5 w-3.5 shrink-0 rounded-full border-2 ${active ? 'border-[4px] border-brand-600' : 'border-slate-300'}`} />
                {TEMPLATE_INFO[t].name}
              </span>
              <span className="mt-1 text-xs leading-relaxed text-slate-500">{TEMPLATE_INFO[t].summary}</span>
            </span>
          </label>
        );
      })}
    </div>
  );
}

function ColumnSelect({ value, onChange, id }: { value: FooterColumnId; onChange: (c: FooterColumnId) => void; id: string }) {
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value as FooterColumnId)} className="adm-field">
      {FOOTER_COLUMN_IDS.map((c) => (
        <option key={c} value={c}>
          {FOOTER_COLUMN_TITLE[c]}
        </option>
      ))}
    </select>
  );
}

function Notice({ tone, children }: { tone: 'amber' | 'rose'; children: React.ReactNode }) {
  const cls = tone === 'amber' ? 'border-amber-300 bg-amber-50 text-amber-900' : 'border-rose-200 bg-rose-50 text-rose-900';
  return (
    <div role="alert" className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${cls}`}>
      <AlertCircle className={`mt-0.5 h-4 w-4 shrink-0 ${tone === 'amber' ? 'text-amber-600' : 'text-rose-600'}`} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function ErrorList({ error, errors }: { error: string | null; errors: string[] }) {
  if (!error && errors.length === 0) return null;
  return (
    <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
      <p className="flex items-center gap-2 font-bold">
        <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" /> {error}
      </p>
      {errors.length > 0 && (
        <ul className="mt-2 list-disc space-y-1 pl-6 text-xs">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Photos ─────────────────────────────────────────────────────────────────

/** Where a picked photo goes: the main photo, a section (append or replace n), or the gallery. */
type PhotoTarget = { area: 'hero' } | { area: 'section'; id: string; index: number | null } | { area: 'gallery'; index: number | null };
const areaKey = (t: PhotoTarget) => (t.area === 'section' ? `section:${t.id}` : t.area);

interface PhotoAreaState {
  progress: number | null;
  error: string | null;
}

function PhotoTile({
  img,
  cloudName,
  onAlt,
  onReplace,
  onRemove,
  onMove,
  index,
  count,
  disabled,
  wide,
}: {
  img: DestinationImage;
  cloudName: string | null;
  onAlt: (alt: string) => void;
  onReplace: () => void;
  onRemove: () => void;
  onMove?: (by: -1 | 1) => void;
  index: number;
  count: number;
  disabled: boolean;
  wide?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-2">
      {cloudName ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cloudinaryUrl(cloudName, img, Math.min(wide ? 960 : 480, img.width))}
          alt=""
          className={`w-full rounded-lg bg-slate-100 object-cover ${wide ? 'aspect-[16/9]' : 'aspect-[4/3]'}`}
        />
      ) : (
        <div className={`flex w-full items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-500 ${wide ? 'aspect-[16/9]' : 'aspect-[4/3]'}`}>Photo</div>
      )}
      <input
        type="text"
        value={img.alt}
        maxLength={IMAGE_RULES.altChars}
        onChange={(e) => onAlt(e.target.value)}
        placeholder="Describe the photo (for Google & screen readers)"
        aria-label={`Photo ${index + 1} description`}
        className="adm-field mt-2 !py-2 text-xs"
      />
      <div className="mt-2 flex flex-wrap gap-1">
        {onMove && count > 1 && (
          <>
            <IconButton label={`Move photo ${index + 1} earlier`} onClick={() => onMove(-1)} disabled={disabled || index === 0}>
              <ArrowUp className="h-3.5 w-3.5 -rotate-90" />
            </IconButton>
            <IconButton label={`Move photo ${index + 1} later`} onClick={() => onMove(1)} disabled={disabled || index === count - 1}>
              <ArrowDown className="h-3.5 w-3.5 -rotate-90" />
            </IconButton>
          </>
        )}
        <button type="button" onClick={onReplace} disabled={disabled} className="adm-btn-ghost !min-h-[36px] !px-2.5 text-xs">
          <Upload className="h-3.5 w-3.5" /> Replace
        </button>
        <IconButton label={`Remove photo ${index + 1}`} onClick={onRemove} disabled={disabled} danger>
          <Trash2 className="h-3.5 w-3.5" />
        </IconButton>
      </div>
    </div>
  );
}

function AreaStatus({ state }: { state: PhotoAreaState | undefined }) {
  if (!state) return null;
  return (
    <>
      {state.progress !== null && (
        <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-brand-700" aria-live="polite">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          {state.progress < 100 ? `Uploading… ${state.progress}%` : 'Checking the photo…'}
        </p>
      )}
      {state.error && (
        <p role="alert" className="mt-2 flex items-start gap-1.5 text-xs font-semibold text-rose-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {state.error}
        </p>
      )}
    </>
  );
}

// ─── Editor ─────────────────────────────────────────────────────────────────

function DestinationEditor({
  record,
  data,
  onData,
  onClose,
  onToast,
}: {
  record: DestinationRecord;
  data: DestinationsAdminData;
  onData: (d: DestinationsAdminData) => void;
  onClose: () => void;
  onToast: (message: string) => void;
}) {
  const [working, setWorking] = useState<DestinationContent>(() => clone(record.draft));
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [busy, setBusy] = useState<'save' | 'publish' | 'unpublish' | 'delete' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [attempted, setAttempted] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [photos, setPhotos] = useState<Record<string, PhotoAreaState>>({});

  /** Uploaded in this editor but not saved yet (deleted again on discard). */
  const pendingUploads = useRef<Set<string>>(new Set());
  const fileInput = useRef<HTMLInputElement>(null);
  const pickTarget = useRef<PhotoTarget | null>(null);

  const t = TEMPLATE_INFO[working.template];
  const unsaved = !sameContent(working, record.draft);
  const status = destinationStatus(record);
  const live = Boolean(record.live);
  const uploadsEnabled = Boolean(data.cloudName);
  const uploading = Object.values(photos).some((p) => p.progress !== null);
  const hiddenPhotos = destinationImageIds(working).length - destinationImageIds(forTemplate(working)).length;

  useEffect(() => {
    if (!unsaved) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [unsaved]);

  const set = (patch: Partial<DestinationContent>) => setWorking((w) => ({ ...w, ...patch }));
  const setSection = (id: string, patch: Partial<DestinationSection>) =>
    setWorking((w) => ({ ...w, sections: w.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)) }));

  /** Link text also updates the heading and address while they still follow it (and the page has never gone live). */
  const setLinkText = (linkText: string) =>
    setWorking((w) => ({
      ...w,
      linkText,
      heading: w.heading === w.linkText ? linkText : w.heading,
      slug: !live && w.slug === slugify(w.linkText) ? slugify(linkText) : w.slug,
    }));

  const discardPending = () => {
    const ids = Array.from(pendingUploads.current);
    pendingUploads.current = new Set();
    if (ids.length) void discardDestinationUploads(ids);
  };

  const run = async (
    kind: 'save' | 'publish' | 'unpublish' | 'delete',
    action: () => Promise<{ success: true; data: DestinationsAdminData } | { success: false; error: string; errors?: string[] }>,
    done: string
  ) => {
    setBusy(kind);
    setError(null);
    setErrors([]);
    const res = await action();
    setBusy(null);
    if (!res.success) {
      setError(res.error);
      setErrors(res.errors ?? []);
      return;
    }
    pendingUploads.current = new Set();
    setAttempted(false);
    onData(res.data);
    if (kind === 'delete') {
      onClose();
    } else {
      const next = res.data.items.find((r) => r.id === record.id);
      if (next) setWorking(clone(next.draft));
    }
    onToast(done);
  };

  const publish = () => {
    setAttempted(true);
    const problems = checkPublishable(working);
    if (problems.length) {
      setError('Fix these before publishing:');
      setErrors(problems);
      return;
    }
    void run('publish', () => publishDestination(record.id, working, record.version), live ? 'Changes published — live on the website now' : `“${working.linkText}” published — it is in the footer now`);
  };

  const discard = () => {
    setWorking(clone(record.draft));
    setError(null);
    setErrors([]);
    setAttempted(false);
    discardPending();
  };

  const close = () => {
    if (unsaved && !window.confirm('Leave without saving? Your unsaved changes to this destination will be lost.')) return;
    discardPending();
    onClose();
  };

  // Photos
  const pick = (target: PhotoTarget) => {
    pickTarget.current = target;
    fileInput.current?.click();
  };

  const onFile = async (file: File) => {
    const target = pickTarget.current;
    if (!target) return;
    const key = areaKey(target);
    const setArea = (s: PhotoAreaState) => setPhotos((p) => ({ ...p, [key]: s }));

    setArea({ progress: null, error: null });
    const problem = await checkFile(file, DESTINATION_IMAGE_MIN);
    if (problem) {
      setArea({ progress: null, error: problem });
      return;
    }
    setArea({ progress: 0, error: null });
    try {
      const ticket = await createDestinationImageUpload();
      if (!ticket.success) throw new Error(ticket.error);
      await sendToCloudinary(ticket.ticket.uploadUrl, ticket.ticket.fields, file, (progress) => setArea({ progress, error: null }));
      setArea({ progress: 100, error: null });
      const checked = await confirmDestinationImageUpload(ticket.ticket.publicId);
      if (!checked.success) throw new Error(checked.error);
      pendingUploads.current.add(ticket.ticket.publicId);

      setWorking((w) => {
        const section = target.area === 'section' ? w.sections.find((s) => s.id === target.id) : undefined;
        const alt = target.area === 'hero' ? w.heading : target.area === 'section' ? section?.heading || w.heading : `${placeName(w.linkText || w.heading)}`;
        const img: DestinationImage = { ...checked.image, alt: alt.slice(0, IMAGE_RULES.altChars) };
        const place = (list: DestinationImage[], index: number | null) =>
          index === null ? [...list, img] : list.map((it, j) => (j === index ? { ...img, alt: it.alt || img.alt } : it));
        if (target.area === 'hero') return { ...w, heroImage: { ...img, alt: w.heroImage?.alt || img.alt } };
        if (target.area === 'gallery') return { ...w, gallery: place(w.gallery, target.index) };
        return { ...w, sections: w.sections.map((s) => (s.id === target.id ? { ...s, images: place(s.images, target.index) } : s)) };
      });
      setArea({ progress: null, error: null });
    } catch (err) {
      setArea({ progress: null, error: err instanceof Error ? err.message : 'Upload failed. Please try again.' });
    }
  };

  const photoDisabled = !uploadsEnabled || uploading || busy !== null;
  const empty = (bad: boolean) => (attempted && bad ? '!border-rose-400 !bg-rose-50' : '');

  const statusText =
    busy === 'save'
      ? 'Saving draft…'
      : busy === 'publish'
        ? 'Publishing…'
        : busy === 'unpublish'
          ? 'Unpublishing…'
          : busy === 'delete'
            ? 'Deleting…'
            : unsaved
              ? 'Unsaved changes'
              : status === 'draft'
                ? `Draft saved ${when(record.draftSavedAt)} — not on the website yet`
                : status === 'changed'
                  ? 'Draft saved — changes not published yet'
                  : `Live · published ${when(record.publishedAt)}`;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <button type="button" onClick={close} className="mb-3 inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> All footer destinations
          </button>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink [overflow-wrap:anywhere] sm:text-[28px]">{working.linkText || 'New destination'}</h1>
          <div className="mt-2">
            <StatusPill record={record} />
          </div>
        </div>
        {record.live && (
          <a href={`/routes/${record.live.slug}`} target="_blank" rel="noopener noreferrer" className="adm-btn-ghost shrink-0">
            <ExternalLink className="h-4 w-4" /> View live page
          </a>
        )}
      </div>

      <StickyActionBar>
        <p className="flex min-w-0 items-center gap-2.5 text-sm font-bold">
          {unsaved || status !== 'live' ? <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" /> : <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />}
          <span className="min-w-0 truncate">{statusText}</span>
        </p>
        <div className="grid grid-cols-3 gap-2 sm:flex">
          <button
            type="button"
            onClick={discard}
            disabled={busy !== null || uploading || !unsaved}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/20 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-white/10 disabled:opacity-40"
          >
            <Undo2 className="h-4 w-4" /> Discard
          </button>
          <button
            type="button"
            onClick={() => run('save', () => saveDestinationDraft(record.id, working, record.version), 'Draft saved')}
            disabled={busy !== null || uploading || !unsaved}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/20 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-white/10 disabled:opacity-40"
          >
            <Save className="h-4 w-4" /> Save draft
          </button>
          <button
            type="button"
            onClick={publish}
            disabled={busy !== null || uploading || (!unsaved && status === 'live')}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-extrabold text-white transition-colors hover:bg-brand-500 disabled:bg-brand-900/70 disabled:text-white/50"
          >
            <Upload className="h-4 w-4" /> {live ? 'Publish changes' : 'Publish'}
          </button>
        </div>
      </StickyActionBar>

      <ErrorList error={error} errors={errors} />

      <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1" role="group" aria-label="Edit or preview">
        {(['edit', 'preview'] as const).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
            className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg px-3.5 text-xs font-bold ${mode === m ? 'bg-brand-600 text-white' : 'text-slate-600'}`}
          >
            {m === 'edit' ? <Pencil className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />} {m === 'edit' ? 'Edit' : 'Preview'}
          </button>
        ))}
      </div>

      {mode === 'preview' ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-porcelain">
          <p className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
            Preview — as customers will see it
            <span className="normal-case tracking-normal text-slate-500">/routes/{working.slug || '…'}</span>
          </p>
          {/* Links are disabled here so the editor is never left by accident (in-page anchors still work) */}
          <div
            onClickCapture={(e) => {
              const a = (e.target as HTMLElement).closest('a');
              if (a && !a.getAttribute('href')?.startsWith('#')) e.preventDefault();
            }}
          >
            <DestinationView content={forTemplate(working)} cloudName={data.cloudName} />
          </div>
          <p className="border-t border-slate-200 bg-white px-4 py-3 text-center text-xs text-slate-500">
            On the website, the booking band (Get instant fare · Call · WhatsApp) follows the page.
          </p>
        </div>
      ) : (
        <>
          {/* Footer link */}
          <section className="adm-card p-4 sm:p-6">
            <h2 className="text-[15px] font-extrabold text-ink">Footer link</h2>
            <p className="mt-0.5 text-xs text-slate-500">How the link looks in the footer, and which column it appears in (after the existing links).</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="dest-link" className="adm-label">
                  Link text
                </label>
                <input
                  id="dest-link"
                  type="text"
                  value={working.linkText}
                  maxLength={L.linkTextChars}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Bangalore to Hyderabad"
                  className={`adm-field ${empty(!working.linkText.trim())}`}
                />
              </div>
              <div>
                <label htmlFor="dest-column" className="adm-label">
                  Footer column
                </label>
                <ColumnSelect id="dest-column" value={working.column} onChange={(column) => set({ column })} />
              </div>
            </div>
            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <input
                type="checkbox"
                checked={working.showInFooter}
                onChange={(e) => set({ showInFooter: e.target.checked })}
                className="mt-0.5 h-5 w-5 shrink-0 accent-brand-600"
              />
              <span className="text-sm">
                <span className="font-bold text-ink">Show a link in the footer</span>
                <span className="block text-xs text-slate-500">Turn off to keep the page on the website without a footer link.</span>
              </span>
            </label>
          </section>

          {/* Page */}
          <section className="adm-card p-4 sm:p-6">
            <h2 className="text-[15px] font-extrabold text-ink">Page</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="dest-heading" className="adm-label">
                  Page heading
                </label>
                <input
                  id="dest-heading"
                  type="text"
                  value={working.heading}
                  maxLength={L.headingChars}
                  onChange={(e) => set({ heading: e.target.value })}
                  placeholder="Bangalore to Hyderabad Cab"
                  className={`adm-field ${empty(!working.heading.trim())}`}
                />
                <p className="mt-1 text-[11px] text-slate-500">The large title at the top of the page. It can differ from the link text.</p>
              </div>
              <div>
                <label htmlFor="dest-slug" className="adm-label">
                  Page address
                </label>
                <div className="flex min-w-0">
                  <span className="inline-flex shrink-0 items-center rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 px-3 text-sm font-semibold text-slate-500">
                    /routes/
                  </span>
                  <input
                    id="dest-slug"
                    type="text"
                    value={working.slug}
                    maxLength={L.slugChars}
                    disabled={live}
                    onChange={(e) => set({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-') })}
                    onBlur={() => set({ slug: slugify(working.slug) })}
                    placeholder="bangalore-to-hyderabad"
                    className={`adm-field !rounded-l-none disabled:cursor-not-allowed disabled:opacity-70 ${empty(working.slug.length < 3)}`}
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  {live ? 'Locked while the page is live, so links to it keep working. Unpublish to change it.' : 'Lowercase letters, numbers and dashes.'}
                </p>
              </div>
            </div>
          </section>

          {/* Template */}
          <section className="adm-card p-4 sm:p-6">
            <h2 className="text-[15px] font-extrabold text-ink">Template</h2>
            <p className="mb-4 mt-0.5 text-xs text-slate-500">The layout of the page. You can switch at any time; your text is kept.</p>
            <TemplatePicker value={working.template} onChange={(template) => set({ template })} name={`template-${record.id}`} />
            {hiddenPhotos > 0 && (
              <p className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {hiddenPhotos} photo{hiddenPhotos > 1 ? 's are' : ' is'} not shown by this template and will be removed when you publish. Switch back to keep{' '}
                {hiddenPhotos > 1 ? 'them' : 'it'}.
              </p>
            )}
          </section>

          {/* Content */}
          <section className="adm-card p-4 sm:p-6">
            <h2 className="text-[15px] font-extrabold text-ink">Page content</h2>
            {!uploadsEnabled && (
              <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900">
                <strong>Photo uploads are switched off.</strong> Add the Cloudinary keys to the server settings to add photos. The page works without them.
              </p>
            )}

            {t.heroImage && (
              <div className="mt-5">
                <p className="adm-label">{working.template === 'simple' ? 'Main photo' : 'Introduction photo'}</p>
                <p className="mb-2 text-[11px] text-slate-500">Shown large at the top of the page. A wide landscape photo works best. {PHOTO_RULES}.</p>
                {working.heroImage ? (
                  <div className="max-w-md">
                    <PhotoTile
                      img={working.heroImage}
                      cloudName={data.cloudName}
                      onAlt={(alt) => set({ heroImage: { ...working.heroImage!, alt } })}
                      onReplace={() => pick({ area: 'hero' })}
                      onRemove={() => set({ heroImage: null })}
                      index={0}
                      count={1}
                      disabled={photoDisabled}
                      wide
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => pick({ area: 'hero' })}
                    disabled={photoDisabled}
                    className="flex aspect-[16/9] w-full max-w-md flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-sm font-bold text-slate-600 transition-colors hover:border-brand-400 hover:text-brand-700 disabled:opacity-60"
                  >
                    <ImagePlus className="h-6 w-6" /> Add main photo
                  </button>
                )}
                <AreaStatus state={photos.hero} />
              </div>
            )}

            <div className="mt-5">
              <label htmlFor="dest-intro" className="adm-label">
                {t.introLabel}
              </label>
              <textarea
                id="dest-intro"
                value={working.intro}
                rows={5}
                maxLength={L.introChars}
                onChange={(e) => set({ intro: e.target.value })}
                placeholder="A few lines about the destination: what it is known for and why people visit."
                className={`adm-field resize-y leading-relaxed [field-sizing:content] ${empty(!working.intro.trim())}`}
              />
              <p className="mt-1 text-[11px] text-slate-500">{BODY_HINT} The first paragraph is shown a little larger.</p>
            </div>

            {/* Sections */}
            <div className="mt-6">
              <p className="adm-label">{working.template === 'simple' ? 'More paragraphs (optional)' : 'Sections'}</p>
              <p className="mb-3 text-[11px] text-slate-500">
                {working.template === 'simple'
                  ? 'Extra text blocks below the description, each with an optional sub-heading.'
                  : working.template === 'split'
                    ? 'Each section shows a photo beside its text; the photo switches sides from one section to the next.'
                    : 'Sections such as destination details, attractions, travel information and tips. Each can have up to 4 photos.'}
              </p>
              <div className="space-y-3">
                {working.sections.map((s, i) => {
                  const key = `section:${s.id}`;
                  const shown = s.images.slice(0, t.sectionImages);
                  return (
                    <div key={s.id} className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Section {i + 1}</span>
                        <div className="ml-auto flex gap-1">
                          <IconButton label={`Move section ${i + 1} up`} onClick={() => set({ sections: moveItem(working.sections, i, -1) })} disabled={i === 0}>
                            <ArrowUp className="h-3.5 w-3.5" />
                          </IconButton>
                          <IconButton
                            label={`Move section ${i + 1} down`}
                            onClick={() => set({ sections: moveItem(working.sections, i, 1) })}
                            disabled={i === working.sections.length - 1}
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </IconButton>
                          <IconButton label={`Remove section ${i + 1}`} onClick={() => set({ sections: working.sections.filter((x) => x.id !== s.id) })} danger>
                            <Trash2 className="h-3.5 w-3.5" />
                          </IconButton>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={s.heading}
                        maxLength={L.sectionHeadingChars}
                        onChange={(e) => setSection(s.id, { heading: e.target.value })}
                        placeholder={t.sectionHeading ? 'Section heading, e.g. Top attractions' : 'Sub-heading (optional)'}
                        aria-label={`Section ${i + 1} heading`}
                        className={`adm-field mt-2.5 !py-2.5 font-extrabold ${empty(t.sectionHeading && !s.heading.trim())}`}
                      />
                      <textarea
                        value={s.body}
                        rows={4}
                        maxLength={L.sectionBodyChars}
                        onChange={(e) => setSection(s.id, { body: e.target.value })}
                        placeholder={BODY_HINT}
                        aria-label={`Section ${i + 1} text`}
                        className={`adm-field mt-2 resize-y !py-2.5 leading-relaxed [field-sizing:content] ${empty(!s.body.trim() && shown.length === 0)}`}
                      />
                      {t.sectionImages > 0 && (
                        <div className="mt-3">
                          <div className={`grid gap-2 ${t.sectionImages > 1 ? 'grid-cols-2 lg:grid-cols-4' : 'max-w-xs'}`}>
                            {shown.map((img, j) => (
                              <PhotoTile
                                key={img.publicId}
                                img={img}
                                cloudName={data.cloudName}
                                onAlt={(alt) => setSection(s.id, { images: s.images.map((x, k) => (k === j ? { ...x, alt } : x)) })}
                                onReplace={() => pick({ area: 'section', id: s.id, index: j })}
                                onRemove={() => setSection(s.id, { images: s.images.filter((_, k) => k !== j) })}
                                onMove={(by) => setSection(s.id, { images: moveItem(s.images, j, by) })}
                                index={j}
                                count={shown.length}
                                disabled={photoDisabled}
                              />
                            ))}
                          </div>
                          {shown.length < t.sectionImages && (
                            <button
                              type="button"
                              onClick={() => pick({ area: 'section', id: s.id, index: null })}
                              disabled={photoDisabled}
                              className="adm-btn-ghost mt-2 !min-h-[38px] !px-3 text-xs"
                            >
                              <ImagePlus className="h-3.5 w-3.5" /> Add photo
                            </button>
                          )}
                          <AreaStatus state={photos[key]} />
                        </div>
                      )}
                    </div>
                  );
                })}
                {working.sections.length === 0 && (
                  <p className="rounded-2xl border-2 border-dashed border-slate-200 p-5 text-center text-sm text-slate-500">
                    {t.needsSections ? 'No sections yet. Add at least one.' : 'No extra paragraphs. The description above is enough for a simple page.'}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => set({ sections: [...working.sections, { id: newSectionId(), heading: '', body: '', images: [] }] })}
                  disabled={working.sections.length >= L.sections}
                  className="adm-btn-ghost !min-h-[40px] text-xs"
                >
                  <Plus className="h-3.5 w-3.5" /> Add section
                </button>
              </div>
            </div>

            {t.gallery && (
              <div className="mt-6">
                <p className="adm-label">More photos (optional)</p>
                <p className="mb-2 text-[11px] text-slate-500">A photo gallery after the text. The first photo is shown larger. {PHOTO_RULES}.</p>
                {working.gallery.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                    {working.gallery.map((img, j) => (
                      <PhotoTile
                        key={img.publicId}
                        img={img}
                        cloudName={data.cloudName}
                        onAlt={(alt) => set({ gallery: working.gallery.map((x, k) => (k === j ? { ...x, alt } : x)) })}
                        onReplace={() => pick({ area: 'gallery', index: j })}
                        onRemove={() => set({ gallery: working.gallery.filter((_, k) => k !== j) })}
                        onMove={(by) => set({ gallery: moveItem(working.gallery, j, by) })}
                        index={j}
                        count={working.gallery.length}
                        disabled={photoDisabled}
                      />
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => pick({ area: 'gallery', index: null })}
                  disabled={photoDisabled || working.gallery.length >= L.galleryImages}
                  className="adm-btn-ghost mt-2 !min-h-[38px] !px-3 text-xs"
                >
                  <ImagePlus className="h-3.5 w-3.5" /> Add photo
                </button>
                <AreaStatus state={photos.gallery} />
              </div>
            )}
          </section>

          {/* Page status */}
          <section className="adm-card p-4 sm:p-6">
            <h2 className="text-[15px] font-extrabold text-ink">On the website</h2>
            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <p className="text-sm text-slate-600">
                {live
                  ? 'Unpublishing removes the page and its footer link from the website at once. Your content stays here as a draft.'
                  : 'This destination is not on the website. Press Publish when the page is ready.'}
              </p>
              {live && (
                <button
                  type="button"
                  onClick={() => run('unpublish', () => unpublishDestination(record.id, record.version), 'Unpublished — the page and its footer link are off the website')}
                  disabled={busy !== null || unsaved}
                  title={unsaved ? 'Save or discard your changes first' : undefined}
                  className="adm-btn-ghost shrink-0"
                >
                  <EyeOff className="h-4 w-4" /> Unpublish
                </button>
              )}
            </div>
            <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600">Deleting removes the destination, its page, footer link and photos for good.</p>
              {confirmDelete ? (
                <div className="flex shrink-0 gap-2">
                  <button type="button" onClick={() => setConfirmDelete(false)} className="adm-btn-ghost">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      discardPending();
                      void run('delete', () => deleteDestination(record.id, record.version), `“${record.draft.linkText}” deleted`);
                    }}
                    disabled={busy !== null}
                    className="adm-btn bg-rose-600 text-white hover:bg-rose-700"
                  >
                    <Trash2 className="h-4 w-4" /> Delete permanently
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => setConfirmDelete(true)} disabled={busy !== null} className="adm-btn-ghost shrink-0 text-rose-600">
                  <Trash2 className="h-4 w-4" /> Delete destination
                </button>
              )}
            </div>
          </section>
        </>
      )}

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
    </div>
  );
}

// ─── Add ────────────────────────────────────────────────────────────────────

function AddDestination({ onCancel, onCreated }: { onCancel: () => void; onCreated: (data: DestinationsAdminData, id: string) => void }) {
  const [linkText, setLinkText] = useState('');
  const [column, setColumn] = useState<FooterColumnId>(FOOTER_COLUMN_IDS[0]);
  const [template, setTemplate] = useState<DestinationTemplate>('simple');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async () => {
    setBusy(true);
    setError(null);
    const res = await createDestination({ linkText, column, template });
    setBusy(false);
    if (!res.success) setError(res.error);
    else onCreated(res.data, res.id);
  };

  return (
    <section className="adm-card animate-pop-in border-brand-200 p-4 sm:p-6">
      <h2 className="text-lg font-extrabold text-ink">Add a destination</h2>
      <p className="mt-0.5 text-sm text-slate-600">You can change all of this later. Nothing appears on the website until you publish.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="new-dest-link" className="adm-label">
            Footer link text
          </label>
          <input
            id="new-dest-link"
            type="text"
            value={linkText}
            maxLength={L.linkTextChars}
            onChange={(e) => setLinkText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && linkText.trim() && !busy) void create();
            }}
            placeholder="Bangalore to Hyderabad"
            autoFocus
            className="adm-field"
          />
        </div>
        <div>
          <label htmlFor="new-dest-column" className="adm-label">
            Footer column
          </label>
          <ColumnSelect id="new-dest-column" value={column} onChange={setColumn} />
        </div>
      </div>
      <p className="adm-label mt-5">Page template</p>
      <TemplatePicker value={template} onChange={setTemplate} name="new-dest-template" />
      {error && (
        <p role="alert" className="mt-4 flex items-start gap-2 text-sm font-semibold text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </p>
      )}
      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} disabled={busy} className="adm-btn-ghost">
          Cancel
        </button>
        <button type="button" onClick={create} disabled={busy || !linkText.trim()} className="adm-btn-primary">
          <Plus className="h-4 w-4" /> {busy ? 'Creating…' : 'Create page'}
        </button>
      </div>
    </section>
  );
}

// ─── Panel ──────────────────────────────────────────────────────────────────

export default function FooterDestinationsPanel({ onToast }: { onToast: (message: string) => void }) {
  const [data, setData] = useState<DestinationsAdminData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [moving, setMoving] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    const res = await getDestinationsAdmin();
    if (res.success) setData(res.data);
    else setLoadError(res.error);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const move = async (id: string, by: -1 | 1) => {
    setMoving(id);
    setListError(null);
    const res = await moveDestination(id, by);
    setMoving(null);
    if (res.success) setData(res.data);
    else setListError(res.error);
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
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" /> Loading footer destinations…
      </div>
    );
  }

  const editing = editingId ? data.items.find((r) => r.id === editingId) : undefined;
  if (editing) {
    return <DestinationEditor key={editing.id} record={editing} data={data} onData={setData} onClose={() => setEditingId(null)} onToast={onToast} />;
  }

  const liveCount = data.items.filter((r) => r.live).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-[28px]">Footer destinations</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Add destination links to the footer’s route columns, each with its own page. The existing links stay as they are; yours appear after them. Nothing
            changes on the website until you press <strong>Publish</strong>.
          </p>
        </div>
        {!adding && (
          <button type="button" onClick={() => setAdding(true)} className="adm-btn-primary shrink-0" disabled={data.items.length >= L.destinations}>
            <Plus className="h-4 w-4" /> Add destination
          </button>
        )}
      </div>

      {adding && (
        <AddDestination
          onCancel={() => setAdding(false)}
          onCreated={(next, id) => {
            setData(next);
            setAdding(false);
            setEditingId(id);
            onToast('Destination added — fill in the page, then publish');
          }}
        />
      )}

      {listError && <Notice tone="rose">{listError}</Notice>}

      <p className="text-xs font-semibold text-slate-500">
        {data.items.length === 0
          ? 'No destinations added yet.'
          : `${data.items.length} destination${data.items.length > 1 ? 's' : ''} · ${liveCount} live on the website`}
      </p>

      {BUILT_IN_FOOTER_COLUMNS.map((col) => {
        const items = data.items.filter((r) => r.draft.column === col.id);
        return (
          <section key={col.id} className="adm-card overflow-hidden">
            <div className="border-b border-slate-100 px-4 py-3.5 sm:px-5">
              <h2 className="text-[15px] font-extrabold text-ink">{col.title}</h2>
              <details className="group mt-1">
                <summary className="cursor-pointer list-none text-xs font-semibold text-slate-500 hover:text-slate-700 [&::-webkit-details-marker]:hidden">
                  {col.links.length} existing links (unchanged) <span className="text-brand-700 group-open:hidden">· show</span>
                  <span className="hidden text-brand-700 group-open:inline">· hide</span>
                </summary>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {col.links.map((l) => (
                    <li key={l.href} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                      {l.label}
                    </li>
                  ))}
                </ul>
              </details>
            </div>
            {items.length === 0 ? (
              <p className="px-4 py-4 text-sm text-slate-500 sm:px-5">No destinations added to this column yet.</p>
            ) : (
              <ol className="divide-y divide-slate-100">
                {items.map((r, i) => (
                  <li key={r.id} className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:px-5">
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-ink [overflow-wrap:anywhere]">{r.draft.linkText || 'Untitled destination'}</p>
                      <p className="mt-0.5 text-xs text-slate-500 [overflow-wrap:anywhere]">
                        /routes/{r.draft.slug || '…'} · {TEMPLATE_INFO[r.draft.template].name}
                      </p>
                      <div className="mt-2">
                        <StatusPill record={r} />
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <IconButton label={`Move ${r.draft.linkText} up`} onClick={() => move(r.id, -1)} disabled={i === 0 || moving !== null}>
                        <ArrowUp className="h-3.5 w-3.5" />
                      </IconButton>
                      <IconButton label={`Move ${r.draft.linkText} down`} onClick={() => move(r.id, 1)} disabled={i === items.length - 1 || moving !== null}>
                        <ArrowDown className="h-3.5 w-3.5" />
                      </IconButton>
                      <button type="button" onClick={() => setEditingId(r.id)} className="adm-btn-ghost ml-1">
                        <Pencil className="h-4 w-4" /> Edit
                      </button>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        );
      })}
      {data.items.length > 1 && <p className="text-xs text-slate-500">The arrows change the order of your links in the footer straight away.</p>}
    </div>
  );
}
