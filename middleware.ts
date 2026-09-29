import { NextRequest, NextResponse } from 'next/server';

/**
 * middleware.ts
 *
 * Client-reveal gate: lets the whole site be deployed to Vercel while only
 * showing the client the pages we've explicitly signed off on. Anything not
 * in RELEASED_ROUTES renders the "Coming Soon" page instead — the real page
 * still exists and ships in the build, it's just not shown yet.
 *
 * To reveal a page: add its path to RELEASED_ROUTES in Vercel
 * (Project Settings -> Environment Variables) and hit "Redeploy" (no code
 * push needed, reuses the existing build).
 *
 * Format: comma-separated paths. "/" always means the homepage only.
 * A trailing "/*" releases a path and everything nested under it, e.g.
 * "/routes/*" releases /routes and /routes/mysore, /routes/coorg, etc.
 *
 * Leaving RELEASED_ROUTES unset releases only the homepage.
 */

const DEFAULT_RELEASED = '/';

function parseReleased(raw: string): { exact: Set<string>; prefixes: string[] } {
  const exact = new Set<string>();
  const prefixes: string[] = [];

  for (const entry of raw.split(',').map((r) => r.trim()).filter(Boolean)) {
    if (entry.endsWith('/*')) {
      prefixes.push(entry.slice(0, -2) || '/');
    } else {
      exact.add(entry);
    }
  }

  return { exact, prefixes };
}

// Never gated: admin console, APIs, static assets, and the coming-soon page itself.
const ALWAYS_ALLOWED_PREFIXES = ['/admin', '/api', '/coming-soon', '/_next', '/favicon.ico'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (ALWAYS_ALLOWED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  const { exact, prefixes } = parseReleased(process.env.RELEASED_ROUTES || DEFAULT_RELEASED);

  const isReleased =
    exact.has(pathname) ||
    prefixes.some((p) => pathname === p || pathname.startsWith(p + '/'));

  if (!isReleased) {
    const url = request.nextUrl.clone();
    url.pathname = '/coming-soon';
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
