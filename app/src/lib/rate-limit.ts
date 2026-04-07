/**
 * Simple in-memory rate limiter.
 * Not distributed — works for single-instance deployments.
 * For multi-instance, use Redis or Upstash.
 */

const store = new Map<string, { count: number; resetAt: number }>()

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, val] of store) {
    if (val.resetAt < now) store.delete(key)
  }
}, 5 * 60 * 1000)

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1 }
  }

  entry.count++
  if (entry.count > limit) {
    return { allowed: false, remaining: 0 }
  }

  return { allowed: true, remaining: limit - entry.count }
}
