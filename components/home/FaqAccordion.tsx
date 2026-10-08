'use client';

/**
 * FaqAccordion.tsx — design.md §3.6 FAQ accordion. Answers stay in the DOM
 * (collapsed via grid rows) so they remain crawlable.
 */

import { useId, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';

export default function FaqAccordion({
  faqs,
  defaultOpen = 0,
}: {
  faqs: { q: string; a: string }[];
  /** Index opened on load; null keeps every item closed. */
  defaultOpen?: number | null;
}) {
  const baseId = useId();
  const [open, setOpen] = useState<number | null>(defaultOpen);

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => {
        const isOpen = open === i;
        const panelId = `${baseId}-panel-${i}`;
        return (
          <div key={faq.q} className={cn('card-float rounded-2xl', isOpen && 'border-brand-200')}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left"
              >
                <span className="text-[15px] font-bold">{faq.q}</span>
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors',
                    isOpen ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
                  )}
                >
                  {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              className={cn(
                'grid transition-[grid-template-rows,opacity] duration-[250ms] ease-premium',
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              )}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-sm leading-relaxed text-slate-600">{faq.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
