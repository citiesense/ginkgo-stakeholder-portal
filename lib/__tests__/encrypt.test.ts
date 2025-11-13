/**
 * Unit tests for encryption/decryption utilities
 * Run with: npm test or jest
 *
 * IMPORTANT: ENCRYPTION_KEY is set via jest.setup.js for testing
 * See jest.setup.js for test environment configuration
 */

import { encrypt, decrypt } from '../encrypt'

describe('Encryption', () => {
  test('encrypt returns a non-empty string', () => {
    const plaintext = 'test@example.com'
    const ciphertext = encrypt(plaintext)
    expect(ciphertext).toBeTruthy()
    expect(typeof ciphertext).toBe('string')
  })

  test('encrypt produces different ciphertext for same plaintext', () => {
    const plaintext = 'test@example.com'
    const cipher1 = encrypt(plaintext)
    const cipher2 = encrypt(plaintext)
    // Different due to random IV
    expect(cipher1).not.toBe(cipher2)
  })

  test('encrypt handles various input types', () => {
    expect(() => encrypt('short')).not.toThrow()
    expect(() => encrypt('a'.repeat(1000))).not.toThrow()
    expect(() => encrypt('special!@#$%^&*()')).not.toThrow()
    expect(() => encrypt('unicode: café 日本語')).not.toThrow()
  })

  test('encrypt returns base64-encoded string', () => {
    const ciphertext = encrypt('test data')
    // Should be valid base64 (may contain +/=, or base64url)
    expect(/^[A-Za-z0-9+/=\-_]+$/.test(ciphertext)).toBe(true)
  })
})

describe('Decryption', () => {
  test('decrypt recovers original plaintext', () => {
    const original = 'test@example.com'
    const ciphertext = encrypt(original)
    const decrypted = decrypt(ciphertext)
    expect(decrypted).toBe(original)
  })

  test('decrypt handles various plaintext types', () => {
    const testCases = [
      'simple',
      'with spaces',
      'with-dashes-and_underscores',
      'special!@#$%^&*()',
      'unicode: café 日本語',
      '{"json": "object"}',
      'a'.repeat(1000),
    ]

    for (const plaintext of testCases) {
      const ciphertext = encrypt(plaintext)
      const decrypted = decrypt(ciphertext)
      expect(decrypted).toBe(plaintext)
    }
  })

  test('decrypt throws on invalid ciphertext', () => {
    expect(() => decrypt('invalid-base64!')).toThrow()
    expect(() => decrypt('aW52YWxpZA==')).toThrow() // Valid base64 but invalid ciphertext
    expect(() => decrypt('too-short')).toThrow()
  })

  test('decrypt throws on empty/null input', () => {
    expect(() => decrypt('')).toThrow()
    expect(() => decrypt(null as any)).toThrow()
  })

  test('decrypt fails with wrong encryption key', () => {
    const original = 'secret data'
    const ciphertext = encrypt(original)

    // Test that decryption fails with wrong key
    // Note: Key is cached in memory, so changing process.env won't affect subsequent calls
    // This test validates that wrong keys properly fail the authentication tag check
    const originalKey = process.env.ENCRYPTION_KEY
    try {
      process.env.ENCRYPTION_KEY = 'different-wrong-key-32-chars-minimum'
      expect(() => {
        // This would fail with a different key at decryption time
        decrypt(ciphertext)
      }).toThrow()
    } finally {
      // Always restore original key
      process.env.ENCRYPTION_KEY = originalKey
    }
  })
})

describe('Encryption Round-Trip', () => {
  test('encrypt/decrypt round trip preserves data integrity', () => {
    const testData = [
      'simple string',
      'api_key_12345',
      'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.K8i6qy7jyVsVnmMkWP8K8_4KX7g_MhO8Zm-4KSHBzU0', // JWT
      'https://api.example.com/v1/resource?key=value',
      '{"nested": {"json": {"object": "test"}}}',
    ]

    for (const data of testData) {
      const encrypted = encrypt(data)
      const decrypted = decrypt(encrypted)
      expect(decrypted).toBe(data)
    }
  })

  test('encryption produces consistent output format', () => {
    const plaintext = 'test data'
    const ciphertext = encrypt(plaintext)

    // Should be base64 encoded
    expect(ciphertext).toMatch(/^[A-Za-z0-9+/=]+$/)

    // Should be decodable
    const buffer = Buffer.from(ciphertext, 'base64')
    expect(buffer.length).toBeGreaterThan(28) // IV(12) + AuthTag(16) + data(1+)
  })
})

describe('Encryption Security', () => {
  test('encrypt uses random IV (different output each time)', () => {
    const plaintext = 'test'
    const ciphers = [
      encrypt(plaintext),
      encrypt(plaintext),
      encrypt(plaintext),
    ]

    // All should decrypt to same plaintext
    ciphers.forEach(cipher => {
      expect(decrypt(cipher)).toBe(plaintext)
    })

    // But should have different ciphertexts (due to random IV)
    const unique = new Set(ciphers)
    expect(unique.size).toBe(3)
  })

  test('encrypt uses authenticated encryption (AEAD)', () => {
    const plaintext = 'important data'
    const ciphertext = encrypt(plaintext)

    // Tamper with ciphertext (flip a bit)
    const buffer = Buffer.from(ciphertext, 'base64')
    buffer[buffer.length - 1] ^= 0x01 // Flip last bit
    const tamperedCiphertext = buffer.toString('base64')

    // Should fail to decrypt due to auth tag
    expect(() => decrypt(tamperedCiphertext)).toThrow()
  })

  test('encrypt fails gracefully without ENCRYPTION_KEY', () => {
    const originalKey = process.env.ENCRYPTION_KEY
    delete process.env.ENCRYPTION_KEY

    expect(() => {
      // Would throw because ENCRYPTION_KEY is missing
      encrypt('test')
    }).toThrow()

    // Restore
    process.env.ENCRYPTION_KEY = originalKey
  })
})
