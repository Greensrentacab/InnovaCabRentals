/**
 * VehiclePhotoCard.tsx — design.md §3.3 "Representative photo card".
 * Always shows the representative-photo note and the CC BY-SA credit line.
 */

import { Info } from 'lucide-react';
import { cn } from '@/lib/cn';
import { photoCredit, type FleetPhoto } from '@/lib/fleetPhotos';

export function PhotoCredit({ photo, className }: { photo: FleetPhoto; className?: string }) {
  return (
    <a
      href={photo.sourceUrl}
      target="_blank"
      rel="noopener noreferrer license"
      className={cn('text-[10px] leading-snug text-slate-400 transition-colors hover:text-slate-600', className)}
    >
      {photoCredit(photo)}
    </a>
  );
}

interface VehiclePhotoCardProps {
  photo: FleetPhoto;
  eyebrow?: string;
  title?: string;
  badge?: string;
  aspect?: string;
  priority?: boolean;
  className?: string;
  showNote?: boolean;
}

export default function VehiclePhotoCard({
  photo,
  eyebrow,
  title,
  badge,
  aspect = 'aspect-[4/3]',
  priority = false,
  className,
  showNote = true,
}: VehiclePhotoCardProps) {
  return (
    <figure className={cn('card-float overflow-hidden rounded-4xl', className)}>
      <div className={cn('relative overflow-hidden bg-slate-200', aspect)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 ease-premium hover:scale-[1.03]"
        />
        {(eyebrow || title || badge) && (
          <>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-950/60 to-transparent" />
            <figcaption className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3 text-white">
              <span>
                {eyebrow && (
                  <span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-white/80">{eyebrow}</span>
                )}
                {title && <span className="block text-lg font-extrabold leading-tight">{title}</span>}
              </span>
              {badge && (
                <span className="shrink-0 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold backdrop-blur-md">{badge}</span>
              )}
            </figcaption>
          </>
        )}
      </div>
      <div className="space-y-1 px-4 py-3">
        {showNote && (
          <p className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-500">
            <Info className="mt-px h-3.5 w-3.5 shrink-0 text-slate-400" />
            Representative photo. The car assigned to your trip may differ in colour, model year, trim and features.
          </p>
        )}
        <PhotoCredit photo={photo} className={cn('block', showNote && 'pl-[22px]')} />
      </div>
    </figure>
  );
}
