/**
 * Simple in-memory rate limiter
 * Use for development; use Redis or similar in production
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map()
  private windowMs: number
  private maxRequests: number

  constructor(windowMs: number = 60000, maxRequests: number = 10) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests
  }

  /**
   * Check if request is allowed
   * @param key - Identifier (usually IP address)
   * @returns true if request is allowed, false if rate limited
   */
  isAllowed(key: string): boolean {
    const now = Date.now()
    const entry = this.store.get(key)

    if (!entry || now > entry.resetTime) {
      // Create new window
      this.store.set(key, {
        count: 1,
        resetTime: now + this.windowMs,
      })
      return true
    }

    // Within existing window
    if (entry.count < this.maxRequests) {
      entry.count++
      return true
    }

    return false
  }

  /**
   * Get remaining requests for key
   */
  getRemaining(key: string): number {
    const entry = this.store.get(key)
    if (!entry || Date.now() > entry.resetTime) {
      return this.maxRequests
    }
    return Math.max(0, this.maxRequests - entry.count)
  }

  /**
   * Get reset time for key (in milliseconds from now)
   */
  getResetTime(key: string): number {
    const entry = this.store.get(key)
    if (!entry) return 0
    return Math.max(0, entry.resetTime - Date.now())
  }

  /**
   * Cleanup old entries (call periodically)
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key)
      }
    }
  }
}

/**
 * Global rate limiters by endpoint
 * 10 requests per 60 seconds per IP
 */
export const verifyFormLimiter = new RateLimiter(60000, 10) // /verify/*/submit
export const verifyReportLimiter = new RateLimiter(60000, 5) // /verify/*/report

/**
 * Extract client IP from request headers
 * Handles proxies (X-Forwarded-For, etc)
 */
export function getClientIp(headers: HeadersInit | Headers | undefined): string {
  if (!headers) return 'unknown'

  const headerObj =
    headers instanceof Headers
      ? Object.fromEntries(headers.entries())
      : (headers as Record<string, any>)

  // Check common proxy headers
  const xff = headerObj['x-forwarded-for']
  if (xff && typeof xff === 'string') {
    // Take first IP if multiple
    return xff.split(',')[0].trim()
  }

  const xri = headerObj['x-real-ip']
  if (xri && typeof xri === 'string') {
    return xri
  }

  const cf = headerObj['cf-connecting-ip'] // Cloudflare
  if (cf && typeof cf === 'string') {
    return cf
  }

  return 'unknown'
}

/**
 * Check rate limit and return headers
 */
export function checkRateLimit(
  limiter: RateLimiter,
  clientIp: string
): { allowed: boolean; headers: Record<string, string> } {
  const allowed = limiter.isAllowed(clientIp)
  const remaining = limiter.getRemaining(clientIp)
  const resetTime = limiter.getResetTime(clientIp)

  return {
    allowed,
    headers: {
      'X-RateLimit-Limit': '10',
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': Math.ceil(Date.now() + resetTime).toString(),
    },
  }
}

// Cleanup old entries every 5 minutes
setInterval(() => {
  verifyFormLimiter.cleanup()
  verifyReportLimiter.cleanup()
}, 5 * 60 * 1000)
