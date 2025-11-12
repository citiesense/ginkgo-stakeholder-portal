import { randomBytes } from 'crypto'

/**
 * Token generation and validation utilities
 * Uses cryptographically secure random bytes for opaque tokens
 * Never includes PII in tokens
 */

/**
 * Generates a cryptographically secure opaque token
 * Uses randomBytes() for cryptographic security
 * Base64url encoding (no padding) for URL-safe representation
 * @param lengthBytes - Number of bytes to generate (default 32 = 43-char string)
 * @returns Base64url-encoded token string (no padding)
 */
export function generateOpaqueToken(lengthBytes: number = 32): string {
  if (lengthBytes < 16) {
    throw new Error('Token length must be at least 16 bytes (128 bits)')
  }
  return randomBytes(lengthBytes).toString('base64url')
}

/**
 * Validates token format
 * Checks length and character set (base64url safe)
 * @param token - Token to validate
 * @returns true if valid format, false otherwise
 */
export function isValidTokenFormat(token: string): boolean {
  if (!token || typeof token !== 'string') return false
  // Base64url chars: A-Z, a-z, 0-9, -, _
  // Min 16 bytes = 22 chars base64url
  if (token.length < 22 || token.length > 100) return false
  return /^[A-Za-z0-9_-]+$/.test(token)
}

/**
 * Generates a token expiry date
 * @param days - Number of days until expiry (default 60)
 * @returns Future Date object
 */
export function generateTokenExpiry(days: number = 60): Date {
  if (days < 1 || days > 365) {
    throw new Error('Expiry must be between 1 and 365 days')
  }
  const expiry = new Date()
  expiry.setDate(expiry.getDate() + days)
  return expiry
}

/**
 * Checks if a token has expired
 * @param expiresAt - Token expiry date
 * @returns true if expired, false otherwise
 */
export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt
}

/**
 * Gets time remaining until token expiry (in seconds)
 * @param expiresAt - Token expiry date
 * @returns Seconds until expiry (negative if expired)
 */
export function getTokenTimeRemaining(expiresAt: Date): number {
  const now = new Date().getTime()
  const expiry = new Date(expiresAt).getTime()
  return Math.floor((expiry - now) / 1000)
}

/**
 * Generates a one-time use token with short expiry
 * Useful for email verification links
 * @param minutesValid - Minutes until expiry (default 30)
 * @returns Token with expiry
 */
export function generateOneTimeToken(
  minutesValid: number = 30
): { token: string; expiresAt: Date } {
  if (minutesValid < 1 || minutesValid > 1440) {
    throw new Error('OTP validity must be between 1 and 1440 minutes (24 hours)')
  }
  const token = generateOpaqueToken(32)
  const expiresAt = new Date()
  expiresAt.setMinutes(expiresAt.getMinutes() + minutesValid)
  return { token, expiresAt }
}

/**
 * IMPORTANT: Never include PII (Personally Identifiable Information) in tokens
 * - NO email addresses
 * - NO phone numbers
 * - NO names
 * - NO IP addresses
 * - NO user IDs directly (use opaque mapping in database)
 *
 * Always generate opaque tokens and store the PII separately in a database
 */
export const TOKEN_SECURITY_NOTICE = `
SECURITY NOTICE: Token Handling

✓ DO:
  - Generate tokens with crypto.randomBytes()
  - Use base64url encoding for URL safety
  - Store PII in database, not in token
  - Use short expiry times for sensitive operations
  - Validate token format before DB lookup
  - Use HTTPS-only cookies for token transmission
  - Log token usage for audit trails

✗ DON'T:
  - Include email, phone, name in token
  - Use predictable or sequential token IDs
  - Expose token in URLs (use HTTP headers)
  - Log full tokens (log last 4 chars only)
  - Reuse tokens after expiry
  - Transmit tokens over unencrypted connections
`
