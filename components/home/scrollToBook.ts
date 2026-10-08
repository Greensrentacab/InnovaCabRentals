/**
 * Homepage helpers for jumping to the hero booking widget (#book).
 * Any surface (header, dock, CTA band, service cards) can call
 * scrollToBook('airport') to scroll there and preselect a service tab.
 */

export type HomeService = 'airport' | 'outstation' | 'local';

export const BOOK_EVENT = 'home:book';
const HEADER_OFFSET = 88;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return false;
  const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
  window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  return true;
}

export function scrollToBook(service?: HomeService) {
  if (service) {
    window.dispatchEvent(new CustomEvent<HomeService>(BOOK_EVENT, { detail: service }));
  }
  if (!scrollToId('book')) {
    window.location.href = '/#book';
  }
}
