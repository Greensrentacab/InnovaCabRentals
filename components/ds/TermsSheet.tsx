'use client';

/**
 * TermsSheet.tsx — terms & conditions as a bottom sheet on mobile (centred
 * dialog from sm up). Portalled to <body> so card transforms can't break its
 * fixed positioning. Closes on Escape, backdrop tap or the close button.
 */

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Check, X } from 'lucide-react';

export default function TermsSheet({
  open,
  onClose,
  title,
  subtitle,
  terms,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  terms: string[];
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
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center" role="presentation">
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
        <ul className="space-y-3 overflow-y-auto border-t border-slate-100 px-5 py-4 text-sm leading-relaxed text-slate-700">
          {terms.map((term) => (
            <li key={term} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-live-500/10 text-live-600">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              {term}
            </li>
          ))}
        </ul>
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
