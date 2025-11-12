/**
 * CORS (Cross-Origin Resource Sharing) configuration
 * Minimal CORS - only enable for necessary API routes
 * Portal pages have NO CORS (prevents external access)
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * CORS configuration for different route types
 */
export const CORS_CONFIG = {
  // No CORS for internal portal pages - they should not be accessed from other origins
  internal: {
    allowed: false,
  },

  // Minimal CORS for public APIs (only health check and webhooks)
  public: {
    origins: ['*'], // Webhooks may come from external providers
    methods: ['GET', 'POST', 'OPTIONS'],
    headers: ['Content-Type', 'Authorization'],
    credentials: false,
  },

  // No CORS for admin APIs
  admin: {
    allowed: false,
  },
}

/**
 * Check if request origin is allowed
 */
export function isOriginAllowed(
  requestOrigin: string | null,
  allowedOrigins: string[]
): boolean {
  if (!requestOrigin) return false
  if (allowedOrigins.includes('*')) return true
  return allowedOrigins.includes(requestOrigin)
}

/**
 * Apply CORS headers to response
 * Use for specific routes that need CORS
 */
export function applyCorsHeaders(
  response: NextResponse,
  requestOrigin: string | null,
  config: {
    origins: string[]
    methods: string[]
    headers: string[]
    credentials: boolean
  }
): NextResponse {
  // Check if origin is allowed
  if (!isOriginAllowed(requestOrigin, config.origins)) {
    return response
  }

  const origin = requestOrigin || '*'

  response.headers.set('Access-Control-Allow-Origin', origin)
  response.headers.set(
    'Access-Control-Allow-Methods',
    config.methods.join(', ')
  )
  response.headers.set(
    'Access-Control-Allow-Headers',
    config.headers.join(', ')
  )

  if (config.credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }

  // Cache CORS preflight for 1 hour
  response.headers.set('Access-Control-Max-Age', '3600')

  return response
}

/**
 * Handle preflight CORS requests (OPTIONS)
 */
export function handleCorsPreflights(
  request: NextRequest,
  config: {
    origins: string[]
    methods: string[]
    headers: string[]
    credentials: boolean
  }
): NextResponse | null {
  // Check if this is a CORS preflight request
  if (request.method !== 'OPTIONS') {
    return null
  }

  const origin = request.headers.get('origin')

  if (!isOriginAllowed(origin, config.origins)) {
    return new NextResponse(null, { status: 403 })
  }

  return applyCorsHeaders(new NextResponse(null, { status: 204 }), origin, config)
}

/**
 * IMPORTANT CORS SECURITY NOTES:
 *
 * ✓ DO:
 *   - Disallow CORS for authenticated endpoints
 *   - Only enable CORS for public APIs that need it
 *   - Specify exact allowed origins, not '*' for sensitive data
 *   - Use credentials: false for public APIs
 *   - Enable CORS for webhook endpoints (external services)
 *   - Set reasonable CORS cache times
 *
 * ✗ DON'T:
 *   - Enable CORS on all routes blindly
 *   - Use '*' for origins on authenticated endpoints
 *   - Expose credentials with '*' origin
 *   - Enable CORS for admin/portal pages
 *   - Store sensitive data in CORS responses
 *   - Allow arbitrary origins via request header
 */

export const CORS_SECURITY_NOTE = `
CORS Policy for Ginkgo Stakeholder Portal:

DISABLED (NO CORS):
  ❌ /admin/* - Portal pages (internal only)
  ❌ /api/verify/submit - Form submission (browser-only)
  ❌ /api/verify/report - Issue reporting (browser-only)

ENABLED (Public APIs):
  ✅ /api/esp/webhooks/* - External provider webhooks (allow *)
  ✅ /api/health - Health checks (allow *)

APPROACH:
  - Default deny (no CORS)
  - Explicitly allow only necessary routes
  - Use * for true public endpoints only
  - All authenticated endpoints deny CORS
`
