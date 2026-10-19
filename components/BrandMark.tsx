/** BrandMark.tsx — the Innova car emblem (public/logo-car.png, transparent), used where the car icon was. */

import { cn } from '@/lib/cn';
import { siteConfig } from '@/lib/siteConfig';

export default function BrandMark({ className }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src="/logo-car.png"
      alt={`${siteConfig.brand.name} logo`}
      width={300}
      height={265}
      decoding="async"
      className={cn('h-10 w-auto shrink-0 select-none', className)}
    />
  );
}
