'use client';

import { useEffect } from 'react';

/**
 * Scrolls to a section of the page on load. Used by service URLs that open an
 * existing page at one of its sections (e.g. /bangalore-hourly-cab-rental opens
 * the local rental page at its packages), since a URL fragment (#packages)
 * can't be used as a crawlable address.
 */
export default function ScrollToSection({ id }: { id: string }) {
  useEffect(() => {
    document.getElementById(id)?.scrollIntoView({ block: 'start' });
  }, [id]);
  return null;
}
