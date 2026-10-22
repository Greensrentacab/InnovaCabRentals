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
  /** Adds a dark halo so the orange lettering stays readable over a dim/translucent surface. */
  halo?: boolean;
  className?: string;
  title?: string;
}

export default function Logo({ tone = 'light', halo = false, className, title = 'Innova Cabs Bangalore' }: LogoProps) {
  return (
    <span className="relative inline-flex">
      {/* CABS-only copy underneath: the main logo hides its fill, so only its shadow shows. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-cabs-only.webp"
        alt=""
        aria-hidden="true"
        width={1200}
        height={349}
        decoding="async"
        className={cn(
          'pointer-events-none absolute inset-0 h-full w-full select-none transition-opacity duration-300',
          halo ? 'opacity-100' : 'opacity-0',
          '[filter:drop-shadow(0_0_0.5px_rgba(11,27,51,0.7))_drop-shadow(0_1px_1px_rgba(11,27,51,0.5))_drop-shadow(0_0_3px_rgba(11,27,51,0.35))]'
        )}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={tone === 'dark' ? '/logo-dark.webp' : '/logo-light.webp'}
        alt={title}
        width={1200}
        height={349}
        decoding="async"
        className={cn('relative select-none', className)}
      />
    </span>
  );
}
