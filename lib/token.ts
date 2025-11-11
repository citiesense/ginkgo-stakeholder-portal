import { randomBytes } from 'crypto'

/**
 * Generates a cryptographically secure opaque token
 * @param lengthBytes - Number of bytes to generate (default 32, produces 43-char base64url string)
 * @returns Base64url-encoded token string (no padding)
 */
export function generateVerificationToken(lengthBytes: number = 32): string {
  return randomBytes(lengthBytes).toString('base64url')
}

/**
 * Generates a token expiry date
 * @param days - Number of days until expiry (default 60)
 * @returns Future Date object
 */
export function generateTokenExpiry(days: number = 60): Date {
  const expiry = new Date()
  expiry.setDate(expiry.getDate() + days)
  return expiry
}
