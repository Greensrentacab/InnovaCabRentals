/**
 * Logo.tsx
 *
 * Innova Cabs Bangalore logo, transparent PNG in two colourways:
 * - tone="light" (default): original navy lettering — for white / light surfaces
 *   (homepage glass bar, admin login).
 * - tone="dark": same artwork with the navy lettering recoloured white — for navy
 *   / black surfaces (secondary header, footer, admin sidebar).
 *
 * `className` sizes the image (e.g. "h-10 w-auto").
 */

import { cn } from '@/lib/cn';

interface LogoProps {
  /** Kept for backwards compatibility; both variants render the same artwork. */
  variant?: 'mark' | 'full';
  /** Which background the logo sits on: 'light' surface or 'dark' surface. */
  tone?: 'light' | 'dark';
  className?: string;
  title?: string;
}

export default function Logo({ tone = 'light', className, title = 'Innova Cabs Bangalore' }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={tone === 'dark' ? '/logo-dark.png' : '/logo-light.png'}
      alt={title}
      width={1200}
      height={349}
      decoding="async"
      className={cn('select-none', className)}
    />
  );
}
