/**
 * TermText.tsx — one T&C line. The cancellation line points customers to the
 * Terms & Conditions page instead of stating a cancellation window.
 */

import Link from 'next/link';
import { siteConfig } from '@/lib/siteConfig';

export default function TermText({ text, onNavigate }: { text: string; onNavigate?: () => void }) {
  if (text.trim() !== siteConfig.policies.cancellation) return <>{text}</>;
  return (
    <Link href="/terms-and-conditions" onClick={onNavigate} className="font-semibold text-brand-700 underline underline-offset-2 hover:text-brand-800">
      {text}
    </Link>
  );
}
