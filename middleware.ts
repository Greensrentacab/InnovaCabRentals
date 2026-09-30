import { NextRequest, NextResponse } from 'next/server';

/**
 * middleware.ts
 *
 * Client-reveal gate: lets specific pages be hidden behind a branded "Coming
 * Soon" page while the rest of the site stays fully public. Off by default —
 * everything is visible unless RELEASED_ROUTES is explicitly set to a
 * restricted list.
 *
 * To hide pages again later: set RELEASED_ROUTES in Netlify/Vercel
 * (Site/Project Settings -> Environment Variables) to a comma-separated list
 * of the paths that SHOULD be public, e.g. "/,/about,/contact". Everything
 * else will then show "Coming Soon" instead. A trailing "/*" releases a path
 * and everything nested under it, e.g. "/routes/*" releases /routes and
 * /routes/mysore, /routes/coorg, etc. Redeploy after changing it (no code
 * push needed, reuses the existing build).
 *
 * Leaving RELEASED_ROUTES unset, or setting it to "*", releases everything.
 */

const DEFAULT_RELEASED = '*';

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

  const releasedRaw = (process.env.RELEASED_ROUTES || DEFAULT_RELEASED).trim();
  if (releasedRaw === '*') {
    return NextResponse.next();
  }

  const { exact, prefixes } = parseReleased(releasedRaw);

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
