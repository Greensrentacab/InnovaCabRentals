/**
 * SectionHeading.tsx — design.md §3.6 section heading (eyebrow + H2 + lead).
 */

import { cn } from '@/lib/cn';

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  centered = true,
  className,
  as: Tag = 'h2',
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  centered?: boolean;
  className?: string;
  as?: 'h1' | 'h2';
}) {
  return (
    <div className={cn('max-w-2xl', centered && 'mx-auto text-center', className)}>
      <span className="eyebrow">{eyebrow}</span>
      <Tag className="text-balance mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</Tag>
      {subtitle && <p className="mt-3 text-slate-600">{subtitle}</p>}
    </div>
  );
}

/** Top hairline for white sections (design.md §1.4). */
export function Hairline() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
  );
}
