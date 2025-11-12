/**
 * Unit tests for token generation and validation
 * Run with: npm test or jest
 */

import {
  generateOpaqueToken,
  isValidTokenFormat,
  generateTokenExpiry,
  isTokenExpired,
  getTokenTimeRemaining,
  generateOneTimeToken,
} from '../tokens'

describe('Token Generation', () => {
  test('generateOpaqueToken returns valid format', () => {
    const token = generateOpaqueToken()
    expect(token).toBeTruthy()
    expect(typeof token).toBe('string')
    expect(token.length).toBeGreaterThanOrEqual(22) // Min 16 bytes in base64url
  })

  test('generateOpaqueToken with custom length', () => {
    const token = generateOpaqueToken(64)
    expect(token).toBeTruthy()
    expect(token.length).toBeGreaterThan(generateOpaqueToken(32).length)
  })

  test('generateOpaqueToken throws on too short length', () => {
    expect(() => generateOpaqueToken(8)).toThrow('at least 16 bytes')
  })

  test('generateOpaqueToken generates unique tokens', () => {
    const token1 = generateOpaqueToken()
    const token2 = generateOpaqueToken()
    expect(token1).not.toBe(token2)
  })

  test('generateOpaqueToken uses base64url encoding (URL safe)', () => {
    const token = generateOpaqueToken()
    // No padding (=), only URL-safe chars
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(token).not.toContain('=')
  })
})

describe('Token Validation', () => {
  test('isValidTokenFormat accepts valid tokens', () => {
    const token = generateOpaqueToken()
    expect(isValidTokenFormat(token)).toBe(true)
  })

  test('isValidTokenFormat rejects invalid characters', () => {
    expect(isValidTokenFormat('token+with/invalid')).toBe(false)
  })

  test('isValidTokenFormat rejects short tokens', () => {
    expect(isValidTokenFormat('short')).toBe(false)
  })

  test('isValidTokenFormat rejects long tokens', () => {
    expect(isValidTokenFormat('a'.repeat(150))).toBe(false)
  })

  test('isValidTokenFormat rejects non-strings', () => {
    expect(isValidTokenFormat(null as any)).toBe(false)
    expect(isValidTokenFormat(undefined as any)).toBe(false)
    expect(isValidTokenFormat(123 as any)).toBe(false)
  })

  test('isValidTokenFormat rejects empty string', () => {
    expect(isValidTokenFormat('')).toBe(false)
  })
})

describe('Token Expiry', () => {
  test('generateTokenExpiry returns future date', () => {
    const expiry = generateTokenExpiry()
    const now = new Date()
    expect(expiry.getTime()).toBeGreaterThan(now.getTime())
  })

  test('generateTokenExpiry with custom days', () => {
    const expiry1 = generateTokenExpiry(1)
    const expiry90 = generateTokenExpiry(90)
    expect(expiry90.getTime()).toBeGreaterThan(expiry1.getTime())
  })

  test('generateTokenExpiry throws on invalid days', () => {
    expect(() => generateTokenExpiry(0)).toThrow('between 1 and 365')
    expect(() => generateTokenExpiry(366)).toThrow('between 1 and 365')
    expect(() => generateTokenExpiry(-1)).toThrow('between 1 and 365')
  })

  test('isTokenExpired returns false for future date', () => {
    const expiry = generateTokenExpiry(1)
    expect(isTokenExpired(expiry)).toBe(false)
  })

  test('isTokenExpired returns true for past date', () => {
    const expiry = new Date()
    expiry.setDate(expiry.getDate() - 1)
    expect(isTokenExpired(expiry)).toBe(true)
  })

  test('isTokenExpired returns true for current time', () => {
    const expiry = new Date()
    expiry.setSeconds(expiry.getSeconds() - 1)
    expect(isTokenExpired(expiry)).toBe(true)
  })
})

describe('Token Time Remaining', () => {
  test('getTokenTimeRemaining returns positive for valid token', () => {
    const expiry = generateTokenExpiry(1)
    const remaining = getTokenTimeRemaining(expiry)
    expect(remaining).toBeGreaterThan(0)
    expect(remaining).toBeLessThanOrEqual(60 * 60 * 24) // 1 day in seconds
  })

  test('getTokenTimeRemaining returns negative for expired token', () => {
    const expiry = new Date()
    expiry.setDate(expiry.getDate() - 1)
    const remaining = getTokenTimeRemaining(expiry)
    expect(remaining).toBeLessThan(0)
  })
})

describe('One-Time Tokens', () => {
  test('generateOneTimeToken returns valid structure', () => {
    const { token, expiresAt } = generateOneTimeToken()
    expect(token).toBeTruthy()
    expect(expiresAt).toBeInstanceOf(Date)
    expect(isValidTokenFormat(token)).toBe(true)
  })

  test('generateOneTimeToken with custom validity', () => {
    const { expiresAt: expiry30 } = generateOneTimeToken(30)
    const { expiresAt: expiry60 } = generateOneTimeToken(60)
    expect(expiry60.getTime()).toBeGreaterThan(expiry30.getTime())
  })

  test('generateOneTimeToken throws on invalid validity', () => {
    expect(() => generateOneTimeToken(0)).toThrow('between 1 and 1440')
    expect(() => generateOneTimeToken(1441)).toThrow('between 1 and 1440')
  })
})
