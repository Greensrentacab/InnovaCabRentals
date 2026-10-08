'use client';

import { cn } from '@/lib/cn';
import { scrollToBook, type HomeService } from '@/components/home/scrollToBook';

/** Button that scrolls to the hero booking widget, optionally preselecting a service. */
export default function BookButton({
  children,
  className,
  service,
}: {
  children: React.ReactNode;
  className?: string;
  service?: HomeService;
}) {
  return (
    <button type="button" onClick={() => scrollToBook(service)} className={cn(className)}>
      {children}
    </button>
  );
}
