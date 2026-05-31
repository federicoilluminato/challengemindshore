type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const windowMs = 60 * 1000;
const maxRequests = 20;
const store = new Map<string, RateLimitEntry>();

export function checkRateLimit(key: string) {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (existing.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  const nextCount = existing.count + 1;
  store.set(key, { count: nextCount, resetAt: existing.resetAt });

  return { allowed: true, remaining: maxRequests - nextCount, resetAt: existing.resetAt };
}
