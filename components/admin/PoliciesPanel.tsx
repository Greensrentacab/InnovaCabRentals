'use client';

/**
 * PoliciesPanel.tsx — Admin → Terms & policies.
 *
 * Edits the Terms & Conditions page (headings, paragraphs, bullet lists —
 * add, reorder, remove) and, per service (airport / outstation / local),
 * what the fare includes, what it excludes and the fare terms shown with
 * every quote. Work can be saved as a draft, previewed exactly as customers
 * will see it, and published without a deployment. Every publish is kept
 * as a version that can be loaded back into the editor.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Eye,
  ExternalLink,
  History,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Undo2,
  Upload,
} from 'lucide-react';
import {
  discardPoliciesDraft,
  getPoliciesAdmin,
  getPoliciesRevision,
  publishPoliciesContent,
  savePoliciesDraft,
  type PoliciesAdminData,
} from '@/app/actions/siteContent';
import StickyActionBar from '@/components/admin/StickyActionBar';
import {
  checkPublishable,
  newBlockId,
  parsePolicyContent,
  POLICY_LIMITS,
  POLICY_SERVICE_LABEL,
  POLICY_SERVICES,
  type PolicyBlock,
  type PolicyBlockType,
  type PolicyContent,
  type PolicyService,
  type ServicePolicy,
} from '@/lib/policies';
import { FareTermsList, IncludedExcluded, TermsBlocks } from '@/components/policies/PolicyViews';

type Section = 'terms' | PolicyService;

const SECTION_LABEL: Record<Section, string> = { terms: 'Terms & conditions', ...POLICY_SERVICE_LABEL };
const BLOCK_LABEL: Record<PolicyBlockType, string> = { heading: 'Heading', paragraph: 'Paragraph', bullets: 'Bullet list' };

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '');

function moveItem<T>(list: T[], i: number, by: -1 | 1): T[] {
  const next = [...list];
  [next[i], next[i + by]] = [next[i + by], next[i]];
  return next;
}

function IconButton({ label, onClick, disabled, children, danger }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label} title={label} className={`adm-btn-ghost !min-h-[36px] !px-2 ${danger ? 'text-rose-600' : ''}`}>
      {children}
    </button>
  );
}

/** Editable list of one-line items (bullets, inclusions, exclusions, fare terms). */
function ListEditor({
  items,
  onChange,
  addLabel,
  placeholder,
  showEmpty,
  name,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  addLabel: string;
  placeholder: string;
  /** Highlight empty items (after a publish attempt) */
  showEmpty: boolean;
  name: string;
}) {
  return (
    <div>
      <ol className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-1.5">
            <span className="mt-3 w-5 shrink-0 text-right text-[11px] font-bold text-slate-400">{i + 1}.</span>
            <textarea
              value={item}
              rows={1}
              maxLength={POLICY_LIMITS.itemChars}
              onChange={(e) => onChange(items.map((it, j) => (j === i ? e.target.value.replace(/\n/g, ' ') : it)))}
              placeholder={placeholder}
              aria-label={`${name} ${i + 1}`}
              className={`adm-field min-w-0 flex-1 resize-y !py-2.5 [field-sizing:content] ${showEmpty && !item.trim() ? '!border-rose-400 !bg-rose-50' : ''}`}
            />
            <div className="flex shrink-0 gap-1 pt-0.5">
              <IconButton label={`Move ${name.toLowerCase()} ${i + 1} up`} onClick={() => onChange(moveItem(items, i, -1))} disabled={i === 0}>
                <ArrowUp className="h-3.5 w-3.5" />
              </IconButton>
              <IconButton label={`Move ${name.toLowerCase()} ${i + 1} down`} onClick={() => onChange(moveItem(items, i, 1))} disabled={i === items.length - 1}>
                <ArrowDown className="h-3.5 w-3.5" />
              </IconButton>
              <IconButton label={`Remove ${name.toLowerCase()} ${i + 1}`} onClick={() => onChange(items.filter((_, j) => j !== i))} danger>
                <Trash2 className="h-3.5 w-3.5" />
              </IconButton>
            </div>
          </li>
        ))}
      </ol>
      {items.length === 0 && <p className="rounded-xl border-2 border-dashed border-slate-200 p-3 text-center text-xs text-slate-500">Nothing here yet.</p>}
      <button
        type="button"
        onClick={() => onChange([...items, ''])}
        disabled={items.length >= POLICY_LIMITS.items}
        className="adm-btn-ghost mt-2 !min-h-[38px] !px-3 text-xs"
      >
        <Plus className="h-3.5 w-3.5" /> {addLabel}
      </button>
    </div>
  );
}

function TermsEditor({ blocks, onChange, showEmpty }: { blocks: PolicyBlock[]; onChange: (b: PolicyBlock[]) => void; showEmpty: boolean }) {
  const update = (i: number, patch: Partial<PolicyBlock>) => onChange(blocks.map((b, j) => (j === i ? { ...b, ...patch } : b)));
  const changeType = (i: number, type: PolicyBlockType) => {
    const b = blocks[i];
    if (type === b.type) return;
    // Keep the wording when switching between text and bullets
    if (type === 'bullets') update(i, { type, items: b.text ? b.text.split('\n').map((t) => t.trim()).filter(Boolean) : [''], text: '' });
    else update(i, { type, text: b.type === 'bullets' ? b.items.join(type === 'heading' ? ' ' : '\n') : b.text, items: [] });
  };
  const add = (type: PolicyBlockType) => onChange([...blocks, { id: newBlockId(), type, text: '', items: type === 'bullets' ? [''] : [] }]);

  return (
    <div className="space-y-3">
      {blocks.map((b, i) => {
        const empty = b.type === 'bullets' ? b.items.length === 0 : !b.text.trim();
        return (
          <div key={b.id} className={`rounded-2xl border bg-white p-3 sm:p-4 ${showEmpty && empty ? 'border-rose-300' : 'border-slate-200'}`}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Clause {i + 1}</span>
              <select
                value={b.type}
                onChange={(e) => changeType(i, e.target.value as PolicyBlockType)}
                aria-label={`Clause ${i + 1} type`}
                className="adm-field !w-auto !py-1.5 text-xs font-bold"
              >
                {(Object.keys(BLOCK_LABEL) as PolicyBlockType[]).map((t) => (
                  <option key={t} value={t}>
                    {BLOCK_LABEL[t]}
                  </option>
                ))}
              </select>
              <div className="ml-auto flex gap-1">
                <IconButton label={`Move clause ${i + 1} up`} onClick={() => onChange(moveItem(blocks, i, -1))} disabled={i === 0}>
                  <ArrowUp className="h-3.5 w-3.5" />
                </IconButton>
                <IconButton label={`Move clause ${i + 1} down`} onClick={() => onChange(moveItem(blocks, i, 1))} disabled={i === blocks.length - 1}>
                  <ArrowDown className="h-3.5 w-3.5" />
                </IconButton>
                <IconButton label={`Remove clause ${i + 1}`} onClick={() => onChange(blocks.filter((_, j) => j !== i))} danger>
                  <Trash2 className="h-3.5 w-3.5" />
                </IconButton>
              </div>
            </div>
            <div className="mt-2.5">
              {b.type === 'heading' ? (
                <input
                  type="text"
                  value={b.text}
                  maxLength={POLICY_LIMITS.headingChars}
                  onChange={(e) => update(i, { text: e.target.value })}
                  placeholder="Heading, e.g. Cancellation"
                  aria-label={`Clause ${i + 1} heading`}
                  className={`adm-field !py-2.5 font-extrabold ${showEmpty && empty ? '!border-rose-400 !bg-rose-50' : ''}`}
                />
              ) : b.type === 'paragraph' ? (
                <textarea
                  value={b.text}
                  rows={3}
                  maxLength={POLICY_LIMITS.textChars}
                  onChange={(e) => update(i, { text: e.target.value })}
                  placeholder="Paragraph text"
                  aria-label={`Clause ${i + 1} paragraph`}
                  className={`adm-field resize-y !py-2.5 leading-relaxed [field-sizing:content] ${showEmpty && empty ? '!border-rose-400 !bg-rose-50' : ''}`}
                />
              ) : (
                <ListEditor items={b.items} onChange={(items) => update(i, { items })} addLabel="Add bullet" placeholder="Bullet point" showEmpty={showEmpty} name="Bullet" />
              )}
            </div>
          </div>
        );
      })}
      {blocks.length === 0 && (
        <p className="rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">No clauses yet. Add a heading or paragraph below.</p>
      )}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(BLOCK_LABEL) as PolicyBlockType[]).map((t) => (
          <button key={t} type="button" onClick={() => add(t)} disabled={blocks.length >= POLICY_LIMITS.blocks} className="adm-btn-ghost !min-h-[40px] text-xs">
            <Plus className="h-3.5 w-3.5" /> {BLOCK_LABEL[t]}
          </button>
        ))}
      </div>
    </div>
  );
}

const SERVICE_LISTS: { key: keyof ServicePolicy; title: string; hint: string; add: string; placeholder: string; name: string }[] = [
  { key: 'inclusions', title: "What's included", hint: 'Shown on the service page, in every fare’s terms and on /terms-and-conditions.', add: 'Add inclusion', placeholder: 'e.g. Driver charges', name: 'Inclusion' },
  { key: 'exclusions', title: 'Not included', hint: 'Charges the customer pays separately (shown under the fares too).', add: 'Add exclusion', placeholder: 'e.g. Toll charges', name: 'Exclusion' },
  {
    key: 'terms',
    title: 'Fare terms',
    hint: 'Shown with every fare. Rate lines (base fare, per-km, extra km/hour, driver allowance) are added automatically from Pricing.',
    add: 'Add term',
    placeholder: 'e.g. Night driving allowance applies between 10 PM and 6 AM.',
    name: 'Term',
  },
];

export default function PoliciesPanel({ onToast }: { onToast: (message: string) => void }) {
  const [data, setData] = useState<PoliciesAdminData | null>(null);
  const [working, setWorking] = useState<PolicyContent | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [section, setSection] = useState<Section>('terms');
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [busy, setBusy] = useState<'save' | 'publish' | 'discard' | 'restore' | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionErrors, setActionErrors] = useState<string[]>([]);
  const [attempted, setAttempted] = useState(false);

  const applyData = (d: PoliciesAdminData) => {
    setData(d);
    setWorking(clone(d.draft ?? d.published));
  };

  const load = useCallback(async () => {
    setLoadError(null);
    const res = await getPoliciesAdmin();
    if (res.success) applyData(res.data);
    else setLoadError(res.error);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const saved = data ? data.draft ?? data.published : null;
  const unsaved = Boolean(working && saved && !same(parsePolicyContent(working), saved));
  const differsFromLive = Boolean(working && data && !same(parsePolicyContent(working), data.published));

  // Same checks the server runs before publishing (on trimmed text)
  const problems = useMemo(() => {
    if (!working) return [];
    const parsed = parsePolicyContent(working);
    return parsed ? checkPublishable(parsed) : ['Some text is far too long. Shorten it before publishing.'];
  }, [working]);
  const problemsIn = (s: Section) => problems.filter((p) => p.startsWith(SECTION_LABEL[s]));

  useEffect(() => {
    if (!unsaved) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [unsaved]);

  const run = async (kind: 'save' | 'publish' | 'discard', action: () => Promise<{ success: true; data: PoliciesAdminData } | { success: false; error: string; errors?: string[] }>, done: string) => {
    setBusy(kind);
    setActionError(null);
    setActionErrors([]);
    const res = await action();
    setBusy(null);
    if (!res.success) {
      setActionError(res.error);
      setActionErrors(res.errors ?? []);
      return;
    }
    applyData(res.data);
    setAttempted(false);
    onToast(done);
  };

  const publish = () => {
    setAttempted(true);
    if (!working || !data) return;
    if (problems.length) {
      setActionError('Fix these before publishing:');
      setActionErrors(problems);
      return;
    }
    void run('publish', () => publishPoliciesContent(working, data.version), 'Terms & policies published — live on the website now');
  };

  const restore = async (version: number) => {
    setBusy('restore');
    setActionError(null);
    setActionErrors([]);
    const res = await getPoliciesRevision(version);
    setBusy(null);
    if (!res.success) {
      setActionError(res.error);
      return;
    }
    setWorking(clone(res.content));
    setMode('preview');
    onToast(`Version ${version} loaded into the editor — publish to make it live again`);
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

  if (!data || !working) {
    return (
      <div className="flex items-center gap-3 py-10 text-sm font-semibold text-slate-500" aria-busy="true">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" /> Loading terms &amp; policies…
      </div>
    );
  }

  const preview = parsePolicyContent(working) ?? working;
  const setService = (s: PolicyService, patch: Partial<ServicePolicy>) =>
    setWorking({ ...working, services: { ...working.services, [s]: { ...working.services[s], ...patch } } });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-[28px]">Terms &amp; policies</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            The Terms &amp; Conditions page, and what each kind of trip includes and excludes. Save a draft any time; customers only see it after you
            press <strong>Publish</strong>.
          </p>
        </div>
        <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="adm-btn-ghost shrink-0">
          <ExternalLink className="h-4 w-4" /> View live page
        </a>
      </div>

      {/* Action bar, pinned to the top while scrolling */}
      <StickyActionBar>
        <p className="flex min-w-0 items-center gap-2.5 text-sm font-bold">
          {unsaved || data.draft ? <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" /> : <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />}
          <span className="min-w-0 truncate">
            {busy === 'save'
              ? 'Saving draft…'
              : busy === 'publish'
                ? 'Publishing…'
                : unsaved
                  ? 'Unsaved changes'
                  : data.draft
                    ? `Draft saved ${when(data.draftSavedAt)} — not live yet`
                    : data.isStartingContent
                      ? 'Showing the starting content'
                      : `Live · version ${data.version}, ${when(data.publishedAt)}`}
          </span>
        </p>
        <div className="grid grid-cols-3 gap-2 sm:flex">
          <button
            type="button"
            onClick={() => run('discard', discardPoliciesDraft, 'Draft discarded — back to the live version')}
            disabled={busy !== null || (!unsaved && !data.draft)}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/20 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-white/10 disabled:opacity-40"
          >
            <Undo2 className="h-4 w-4" /> Discard
          </button>
          <button
            type="button"
            onClick={() => run('save', () => savePoliciesDraft(working), 'Draft saved')}
            disabled={busy !== null || !unsaved}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/20 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-white/10 disabled:opacity-40"
          >
            <Save className="h-4 w-4" /> Save draft
          </button>
          <button
            type="button"
            onClick={publish}
            disabled={busy !== null || (!differsFromLive && !data.isStartingContent)}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-extrabold text-white transition-colors hover:bg-brand-500 disabled:bg-brand-900/70 disabled:text-white/50"
          >
            <Upload className="h-4 w-4" /> Publish
          </button>
        </div>
      </StickyActionBar>

      {(actionError || actionErrors.length > 0) && (
        <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          <p className="flex items-center gap-2 font-bold">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" /> {actionError}
          </p>
          {actionErrors.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-6 text-xs">
              {actionErrors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {data.isStartingContent && (
        <p className="rounded-2xl border border-brand-200 bg-brand-50/60 px-4 py-3 text-sm text-brand-900">
          The website shows the starting content (built from your existing policies). Review it, change anything that does not apply to your business,
          then publish.
        </p>
      )}

      {/* Section + mode switches */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div role="tablist" aria-label="Policy sections" className="flex gap-2 overflow-x-auto pb-1">
          {(['terms', ...POLICY_SERVICES] as Section[]).map((s) => {
            const active = s === section;
            const bad = attempted && problemsIn(s).length > 0;
            return (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSection(s)}
                className={`inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-bold transition-colors ${
                  active ? 'bg-ink text-white' : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                {SECTION_LABEL[s]}
                {bad && <span className="h-2 w-2 rounded-full bg-rose-500" aria-label="needs attention" />}
              </button>
            );
          })}
        </div>
        <div className="inline-flex shrink-0 self-start rounded-xl border border-slate-200 bg-white p-1" role="group" aria-label="Edit or preview">
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
      </div>

      {mode === 'edit' ? (
        section === 'terms' ? (
          <TermsEditor blocks={working.terms} onChange={(terms) => setWorking({ ...working, terms })} showEmpty={attempted} />
        ) : (
          <div className="grid items-start gap-4 xl:grid-cols-3">
            {SERVICE_LISTS.map((l) => (
              <section key={l.key} className="adm-card p-4 sm:p-5">
                <h3 className="text-[15px] font-extrabold text-ink">{l.title}</h3>
                <p className="mb-3 mt-0.5 text-xs leading-relaxed text-slate-500">{l.hint}</p>
                <ListEditor
                  items={working.services[section][l.key]}
                  onChange={(items) => setService(section, { [l.key]: items })}
                  addLabel={l.add}
                  placeholder={l.placeholder}
                  showEmpty={attempted}
                  name={l.name}
                />
              </section>
            ))}
          </div>
        )
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-4 sm:p-8">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-wide text-slate-400">Preview — as customers will see it</p>
          {section === 'terms' ? (
            <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-10">
              <h2 className="mb-5 text-3xl font-extrabold tracking-tight text-ink">Terms &amp; Conditions</h2>
              <TermsBlocks blocks={preview.terms} className="max-w-3xl" />
            </div>
          ) : (
            <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-8">
              <h3 className="text-lg font-extrabold tracking-tight text-ink">{POLICY_SERVICE_LABEL[section]}</h3>
              <IncludedExcluded policy={preview.services[section]} className="mt-3" />
              <FareTermsList terms={preview.services[section].terms} className="mt-4" />
            </div>
          )}
        </div>
      )}

      {/* Version history */}
      <details className="adm-card group overflow-hidden">
        <summary className="flex min-h-[52px] cursor-pointer list-none items-center gap-2 px-4 text-sm font-extrabold text-ink sm:px-5">
          <History className="h-4 w-4 text-slate-500" /> Version history
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">{data.revisions.length}</span>
        </summary>
        <div className="border-t border-slate-100 px-4 py-3 sm:px-5">
          {data.revisions.length === 0 ? (
            <p className="text-sm text-slate-500">Nothing published yet. Each publish is kept here so you can go back to it.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.revisions.map((r) => (
                <li key={r.version} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="min-w-0 text-sm">
                    <strong className="text-ink">Version {r.version}</strong>
                    <span className="text-slate-500"> · {when(r.publishedAt)}</span>
                    {r.version === data.version && <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">Live</span>}
                  </span>
                  <button type="button" onClick={() => restore(r.version)} disabled={busy !== null} className="adm-btn-ghost !min-h-[36px] shrink-0 !px-3 text-xs">
                    Load into editor
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </details>

    </div>
  );
}
