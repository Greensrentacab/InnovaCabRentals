import type { Metadata } from 'next';

// Booking receipts are private to each customer: keep them out of search results
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
