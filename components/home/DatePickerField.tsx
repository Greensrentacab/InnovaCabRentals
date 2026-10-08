'use client';

/**
 * DatePickerField.tsx — field-styled trigger + pop-up calendar
 * (design.md §3.2.8). Values are local-date keys (YYYY-MM-DD).
 * Past dates and dates outside the bookable window are disabled.
 */

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function toDateKey(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function fromDateKey(key: string) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number) {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

interface DatePickerFieldProps {
  value: string;
  onChange: (key: string) => void;
  /** First selectable date (local midnight). */
  minDate: Date;
  /** Last selectable date (local midnight). */
  maxDate: Date;
  /** Local midnight of "today", used for the Today/Tomorrow badges. */
  today: Date;
  label?: string;
}

export default function DatePickerField({
  value,
  onChange,
  minDate,
  maxDate,
  today,
  label = 'Travel date',
}: DatePickerFieldProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const selected = value ? fromDateKey(value) : null;
  const [viewMonth, setViewMonth] = useState(() => {
    const base = selected ?? minDate;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const [focusKey, setFocusKey] = useState(value || toDateKey(minDate));

  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const minKey = toDateKey(minDate);
  const maxKey = toDateKey(maxDate);
  const todayKey = toDateKey(today);
  const tomorrowKey = toDateKey(addDays(today, 1));
  const inWindow = (key: string) => key >= minKey && key <= maxKey;

  // 6×7 grid starting on the Sunday on/before the 1st of the view month
  const cells = useMemo(() => {
    const first = new Date(viewMonth);
    const start = addDays(first, -first.getDay());
    return Array.from({ length: 42 }, (_, i) => addDays(start, i));
  }, [viewMonth]);

  const canPrev = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 0) >= startOfDay(minDate);
  const canNext = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1) <= startOfDay(maxDate);

  const close = (returnFocus = false) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  const openPicker = () => {
    const base = selected ?? minDate;
    setViewMonth(new Date(base.getFullYear(), base.getMonth(), 1));
    setFocusKey(value && inWindow(value) ? value : minKey);
    setOpen(true);
  };

  const pick = (key: string) => {
    if (!inWindow(key)) return;
    onChange(key);
    close(true);
  };

  // Outside pointer-down & Esc close the pop-up
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close(true);
      }
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Keep the roving-focus day focused while navigating with the keyboard
  useEffect(() => {
    if (!open) return;
    const btn = gridRef.current?.querySelector<HTMLButtonElement>(`[data-key="${focusKey}"]`);
    btn?.focus({ preventScroll: true });
  }, [open, focusKey]);

  const moveFocus = (deltaDays: number) => {
    let next = toDateKey(addDays(fromDateKey(focusKey), deltaDays));
    if (next < minKey) next = minKey;
    if (next > maxKey) next = maxKey;
    const nd = fromDateKey(next);
    if (nd.getMonth() !== viewMonth.getMonth() || nd.getFullYear() !== viewMonth.getFullYear()) {
      setViewMonth(new Date(nd.getFullYear(), nd.getMonth(), 1));
    }
    setFocusKey(next);
  };

  const onGridKeyDown = (e: React.KeyboardEvent) => {
    const map: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (e.key in map) {
      e.preventDefault();
      moveFocus(map[e.key]);
    }
  };

  const display = selected
    ? selected.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
    : 'Select a date';
  const badge = value === todayKey ? 'Today' : value === tomorrowKey ? 'Tomorrow' : null;

  return (
    <div ref={wrapRef} className="relative">
      <label htmlFor={id} className="label">
        {label}
      </label>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => (open ? close() : openPicker())}
        className={cn('field flex items-center gap-3 text-left', open && 'border-brand-500 bg-white ring-4 ring-brand-500/10')}
      >
        <CalendarDays className="h-4 w-4 shrink-0 text-brand-600" />
        <span className={cn('flex-1 truncate', !selected && 'text-slate-400')}>{display}</span>
        {badge && (
          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700">{badge}</span>
        )}
        <ChevronDown className={cn('h-4 w-4 shrink-0 text-slate-400 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Choose travel date"
          className="glass-strong absolute left-0 top-[calc(100%+8px)] z-40 bg-white/95 w-full min-w-[288px] max-w-[340px] animate-pop-in rounded-3xl p-4 shadow-float-lg"
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous month"
              disabled={!canPrev}
              onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-sm font-extrabold" aria-live="polite">
              {viewMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </p>
            <button
              type="button"
              aria-label="Next month"
              disabled={!canNext}
              onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 text-center text-[10px] font-bold uppercase tracking-wide text-slate-400">
            {WEEKDAYS.map((d) => (
              <span key={d} className="py-1">
                {d}
              </span>
            ))}
          </div>

          <div ref={gridRef} role="grid" className="grid grid-cols-7 gap-0.5" onKeyDown={onGridKeyDown}>
            {cells.map((day) => {
              const key = toDateKey(day);
              const disabled = !inWindow(key);
              const isSelected = key === value;
              const isToday = key === todayKey;
              const outside = day.getMonth() !== viewMonth.getMonth();
              return (
                <button
                  key={key}
                  type="button"
                  role="gridcell"
                  data-key={key}
                  disabled={disabled}
                  aria-selected={isSelected}
                  aria-label={day.toDateString()}
                  tabIndex={key === focusKey ? 0 : -1}
                  onClick={() => pick(key)}
                  className={cn(
                    'relative flex aspect-square items-center justify-center rounded-xl text-sm font-semibold transition-colors',
                    disabled
                      ? 'cursor-not-allowed text-slate-300 line-through decoration-slate-300'
                      : isSelected
                        ? 'bg-brand-600 text-white shadow-glow hover:bg-brand-600'
                        : 'text-ink hover:bg-brand-50',
                    outside && 'opacity-40',
                    isToday && !isSelected && 'ring-1 ring-inset ring-brand-300'
                  )}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
            <button type="button" className="pill disabled:opacity-40" disabled={!inWindow(todayKey)} onClick={() => pick(todayKey)}>
              Today
            </button>
            <button type="button" className="pill disabled:opacity-40" disabled={!inWindow(tomorrowKey)} onClick={() => pick(tomorrowKey)}>
              Tomorrow
            </button>
            <span className="ml-auto self-center text-[10px] text-slate-400">Past dates unavailable</span>
          </div>
        </div>
      )}
    </div>
  );
}
