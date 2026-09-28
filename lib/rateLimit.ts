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
