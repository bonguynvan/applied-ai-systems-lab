import { Ratelimit } from '@upstash/ratelimit';
import { getRedis } from '@/lib/redis';

interface RateLimitData {
  count: number;
  resetTime: number;
}

const ipRequests = new Map<string, RateLimitData>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5; // 5 requests per minute per IP

let upstashRatelimit: Ratelimit | null = null;

function getUpstashRatelimit(): Ratelimit | null {
  if (upstashRatelimit) return upstashRatelimit;
  const redis = getRedis();
  if (!redis) return null;
  upstashRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(MAX_REQUESTS_PER_WINDOW, '1 m'),
    prefix: 'ai-lab:ratelimit',
  });
  return upstashRatelimit;
}

function rateLimitInMemory(ip: string): { allowed: boolean; resetTime: number } {
  const now = Date.now();
  for (const [key, data] of ipRequests.entries()) {
    if (now > data.resetTime) ipRequests.delete(key);
  }
  if (!ipRequests.has(ip)) {
    ipRequests.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return { allowed: true, resetTime: now + WINDOW_MS };
  }
  const data = ipRequests.get(ip)!;
  if (now > data.resetTime) {
    ipRequests.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return { allowed: true, resetTime: now + WINDOW_MS };
  }
  if (data.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, resetTime: data.resetTime };
  }
  data.count++;
  return { allowed: true, resetTime: data.resetTime };
}

/**
 * Returns { allowed, resetTime }. Use await when using Redis (Upstash).
 */
export async function rateLimit(
  ip: string
): Promise<{ allowed: boolean; resetTime: number }> {
  const rl = getUpstashRatelimit();
  if (rl) {
    const res = await rl.limit(ip);
    return {
      allowed: res.success,
      resetTime: res.reset,
    };
  }
  return rateLimitInMemory(ip);
}

export async function getRateLimitStatus(ip: string): Promise<{
  remaining: number;
  resetTime: number;
}> {
  const rl = getUpstashRatelimit();
  if (rl) {
    // Upstash doesn't expose "get status without consuming"; return conservative default for UI
    return {
      remaining: MAX_REQUESTS_PER_WINDOW,
      resetTime: Date.now() + WINDOW_MS,
    };
  }
  const now = Date.now();
  const data = ipRequests.get(ip);
  if (!data || now > data.resetTime) {
    return { remaining: MAX_REQUESTS_PER_WINDOW, resetTime: now + WINDOW_MS };
  }
  return {
    remaining: Math.max(0, MAX_REQUESTS_PER_WINDOW - data.count),
    resetTime: data.resetTime,
  };
}

export const RATE_LIMIT_CONFIG = {
  windowMs: WINDOW_MS,
  maxRequests: MAX_REQUESTS_PER_WINDOW,
};
