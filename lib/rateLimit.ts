/**
 * rateLimit.ts
 * 
 * In-memory sliding window rate limiter for API routes.
 * Tracks requests per IP within a specified time window.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const ipRequestMap = new Map<string, RateLimitRecord>();

// Clean up stale entries every 10 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    ipRequestMap.forEach((record, ip) => {
      record.timestamps = record.timestamps.filter((t) => now - t < 600000);
      if (record.timestamps.length === 0) {
        ipRequestMap.delete(ip);
      }
    });
  }, 600000);
}

/**
 * Checks if an IP is within the rate limit.
 * @param ip - Client IP address
 * @param maxRequests - Maximum allowed requests within window (default: 5)
 * @param windowMs - Window duration in milliseconds (default: 10 minutes = 600000ms)
 */
export function checkRateLimit(
  ip: string,
  maxRequests: number = 5,
  windowMs: number = 600000 // 10 minutes
): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const record = ipRequestMap.get(ip) || { timestamps: [] };

  // Filter timestamps within the current sliding window
  record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

  if (record.timestamps.length >= maxRequests) {
    const oldestTimestamp = record.timestamps[0];
    const resetMs = windowMs - (now - oldestTimestamp);
    return {
      allowed: false,
      remaining: 0,
      resetMs: Math.max(0, resetMs),
    };
  }

  // Record this request
  record.timestamps.push(now);
  ipRequestMap.set(ip, record);

  return {
    allowed: true,
    remaining: maxRequests - record.timestamps.length,
    resetMs: windowMs,
  };
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

const hasFirestore = () =>
  Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      (process.env.FIREBASE_PRIVATE_KEY_BASE64 || process.env.FIREBASE_PRIVATE_KEY)
  );

/**
 * Rate limit shared by every server instance (Vercel runs many copies, each
 * with its own memory). Counts live in Firestore `rateLimits/{hash}`; the key
 * (which contains the visitor's IP) is stored only as a SHA-256 hash.
 * `expiresAt` lets a Firestore TTL policy delete old counters.
 * Falls back to the in-memory limiter without Firestore or if Firestore fails,
 * so a database hiccup never blocks a customer.
 */
export async function checkSharedRateLimit(key: string, maxRequests: number, windowMs: number): Promise<RateLimitResult> {
  if (!hasFirestore()) return checkRateLimit(key, maxRequests, windowMs);
  try {
    const [{ adminDb }, { createHash }] = await Promise.all([import('@/lib/firebaseAdmin'), import('crypto')]);
    const ref = adminDb.collection('rateLimits').doc(createHash('sha256').update(key).digest('hex'));
    return await adminDb.runTransaction(async (tx) => {
      const now = Date.now();
      const snap = await tx.get(ref);
      const stored = snap.exists ? (snap.data()?.hits as number[] | undefined) : undefined;
      const hits = (stored ?? []).filter((t) => now - t < windowMs);
      if (hits.length >= maxRequests) {
        return { allowed: false, remaining: 0, resetMs: Math.max(0, windowMs - (now - hits[0])) };
      }
      hits.push(now);
      tx.set(ref, { hits, expiresAt: new Date(now + windowMs) });
      return { allowed: true, remaining: maxRequests - hits.length, resetMs: windowMs };
    });
  } catch (err) {
    console.warn('[rateLimit] Shared limiter unavailable, using in-memory limit:', err);
    return checkRateLimit(key, maxRequests, windowMs);
  }
}
