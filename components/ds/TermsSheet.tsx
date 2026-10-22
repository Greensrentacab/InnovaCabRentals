'use client';

/**
 * TermsSheet.tsx — terms & conditions as a bottom sheet on mobile (centred
 * dialog from sm up). Portalled to <body> so card transforms can't break its
 * fixed positioning. Closes on Escape, backdrop tap or the close button.
 * Content comes in titled sections (fare details, what's included, not
 * included, terms) published from Admin → Pricing and Admin → Terms & policies.
 */

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Check, Minus, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import TermText from '@/components/policies/TermText';

export interface TermsSection {
  title: string;
  items: string[];
  /** included = green tick, excluded = amber cross, fare = plain lines */
  tone?: 'included' | 'excluded' | 'fare' | 'terms';
}

const MARK = {
  included: { icon: Check, cls: 'bg-live-500/10 text-live-600' },
  excluded: { icon: X, cls: 'bg-amber-500/15 text-amber-700' },
  terms: { icon: Check, cls: 'bg-live-500/10 text-live-600' },
  fare: { icon: Minus, cls: 'bg-slate-100 text-slate-500' },
};

export default function TermsSheet({
  open,
  onClose,
  title,
  subtitle,
  terms,
  sections,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  /** Plain list of terms (used when no sections are given) */
  terms?: string[];
  sections?: TermsSection[];
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center max-lg:pb-[calc(6rem+env(safe-area-inset-bottom))]" role="presentation">
      <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${title} terms`}
        className="relative flex max-h-[85vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:max-w-md sm:rounded-2xl"
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-slate-300 sm:hidden" aria-hidden="true" />
        <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-3 sm:pt-5">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Terms &amp; conditions</p>
            <h3 className="mt-0.5 text-lg font-extrabold leading-tight tracking-tight text-ink">{title}</h3>
            {subtitle && <p className="mt-0.5 text-sm font-semibold text-slate-500">{subtitle}</p>}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close terms"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition hover:bg-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-5 overflow-y-auto border-t border-slate-100 px-5 py-4 text-sm leading-relaxed text-slate-700">
          {(sections ?? [{ title: '', items: terms ?? [], tone: 'terms' as const }])
            .filter((s) => s.items.length > 0)
            .map((section) => {
              const mark = MARK[section.tone ?? 'terms'];
              return (
                <div key={section.title || 'terms'}>
                  {section.title && (
                    <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">{section.title}</h4>
                  )}
                  <ul className={cn('space-y-2.5', section.tone === 'fare' && 'space-y-1.5 font-semibold tabular-nums text-ink')}>
                    {section.items.map((item, i) => (
                      <li key={`${i}-${item}`} className="flex items-start gap-2.5">
                        <span className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full', mark.cls)}>
                          <mark.icon className="h-3 w-3" strokeWidth={3} />
                        </span>
                        <TermText text={item} />
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          <Link href="/terms-and-conditions" className="inline-block text-xs font-bold text-brand-700 underline-offset-4 hover:underline" onClick={onClose}>
            Full terms &amp; conditions
          </Link>
        </div>
        <div className="border-t border-slate-100 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <button type="button" onClick={onClose} className="btn-primary !min-h-0 h-11 w-full !rounded-lg text-sm">
            Got it
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
