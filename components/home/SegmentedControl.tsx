'use client';

/**
 * SegmentedControl.tsx — pill radiogroup with a sliding white indicator
 * (design.md §3.2.4). Options share equal widths so the indicator can be
 * positioned purely with CSS transforms.
 */

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  size?: 'md' | 'sm';
  className?: string;
}

export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  size = 'md',
  className,
}: SegmentedControlProps<T>) {
  const n = options.length;
  const activeIndex = Math.max(0, options.findIndex((o) => o.value === value));

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn('relative flex gap-1 rounded-2xl bg-slate-100/80 p-1', className)}
    >
      <span
        aria-hidden="true"
        className="absolute bottom-1 left-1 top-1 rounded-xl bg-brand-600 shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.34,1.25,0.64,1)]"
        style={{
          width: `calc((100% - 8px - ${(n - 1) * 4}px) / ${n})`,
          transform: `translateX(calc(${activeIndex} * (100% + 4px)))`,
        }}
      />
      {options.map((option) => {
        const Icon = option.icon;
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative min-w-0 flex-1 whitespace-nowrap rounded-xl font-semibold transition-colors',
              size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-3 py-3 text-[13px]',
              selected ? 'text-white' : 'text-slate-500 hover:text-slate-800'
            )}
          >
            <span className="relative flex items-center justify-center gap-1.5">
              {Icon && <Icon className="h-3.5 w-3.5" />}
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
