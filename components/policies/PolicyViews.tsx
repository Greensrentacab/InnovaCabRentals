/**
 * PolicyViews.tsx — customer-facing rendering of the Terms & policies
 * published in Admin → Terms & policies. Used by /terms, the service
 * landing pages and the admin preview, so the preview matches the site.
 * No hooks: works in server and client components. Plain text only.
 */

import { Check, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { PolicyBlock, ServicePolicy } from '@/lib/policies';

/** Terms & Conditions clauses: headings, paragraphs and bullet lists. */
export function TermsBlocks({ blocks, className }: { blocks: PolicyBlock[]; className?: string }) {
  return (
    <div className={cn('space-y-3 text-[15px] leading-relaxed text-slate-700', className)}>
      {blocks.map((b) =>
        b.type === 'heading' ? (
          <h2 key={b.id} className="pt-4 text-xl font-extrabold tracking-tight text-ink first:pt-0 sm:text-2xl">
            {b.text}
          </h2>
        ) : b.type === 'paragraph' ? (
          <p key={b.id} className="whitespace-pre-line">
            {b.text}
          </p>
        ) : (
          <ul key={b.id} className="space-y-2 pl-1">
            {b.items.map((item, i) => (
              <li key={`${b.id}-${i}`} className="flex items-start gap-2.5">
                <span className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" aria-hidden="true" />
                <span className="min-w-0">{item}</span>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
}

/** "What's included" / "Not included" side by side (stacked on phones). */
export function IncludedExcluded({ policy, className }: { policy: Pick<ServicePolicy, 'inclusions' | 'exclusions'>; className?: string }) {
  return (
    <div className={cn('grid gap-3 sm:grid-cols-2 sm:gap-4', className)}>
      <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-4 sm:p-5">
        <h3 className="text-sm font-extrabold uppercase tracking-wide text-emerald-800">What&apos;s included</h3>
        <ul className="mt-3 space-y-2.5 text-sm text-slate-700">
          {policy.inclusions.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-live-500/15 text-live-600">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              <span className="min-w-0">{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4 sm:p-5">
        <h3 className="text-sm font-extrabold uppercase tracking-wide text-amber-800">Not included</h3>
        <ul className="mt-3 space-y-2.5 text-sm text-slate-700">
          {policy.exclusions.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-700">
                <X className="h-3 w-3" strokeWidth={3} />
              </span>
              <span className="min-w-0">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Service fare terms as a simple bullet list. */
export function FareTermsList({ terms, className }: { terms: string[]; className?: string }) {
  if (terms.length === 0) return null;
  return (
    <ul className={cn('space-y-2 text-sm leading-relaxed text-slate-600', className)}>
      {terms.map((t, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" aria-hidden="true" />
          <span className="min-w-0">{t}</span>
        </li>
      ))}
    </ul>
  );
}
