import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'

let derivedKey: Buffer | null = null

function getKey(): Buffer {
  if (derivedKey) {
    return derivedKey
  }

  const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY

  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY environment variable is required')
  }

  // Derive a 32-byte key from ENCRYPTION_KEY using scrypt
  derivedKey = scryptSync(ENCRYPTION_KEY, 'ginkgo', 32)
  return derivedKey
}

/**
 * Encrypts plaintext using AES-256-GCM
 * Returns: base64-encoded string containing: IV(16 bytes) + authTag(16 bytes) + ciphertext
 */
export function encrypt(plaintext: string): string {
  try {
    const key = getKey()

    // Generate a random 96-bit (12-byte) IV for GCM
    const iv = randomBytes(12)

    // Create cipher
    const cipher = createCipheriv('aes-256-gcm', key, iv)

    // Encrypt the plaintext
    let encrypted = cipher.update(plaintext, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    // Get the authentication tag
    const authTag = cipher.getAuthTag()

    // Combine IV + authTag + ciphertext and encode as base64
    const combined = Buffer.concat([iv, authTag, Buffer.from(encrypted, 'hex')])
    return combined.toString('base64')
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Decrypts AES-256-GCM ciphertext
 * Expects: base64-encoded string containing: IV(12 bytes) + authTag(16 bytes) + ciphertext
 */
export function decrypt(ciphertext: string): string {
  try {
    const key = getKey()

    // Decode from base64
    const combined = Buffer.from(ciphertext, 'base64')

    // Extract IV (first 12 bytes), authTag (next 16 bytes), and encrypted data (rest)
    const iv = combined.slice(0, 12)
    const authTag = combined.slice(12, 28)
    const encrypted = combined.slice(28)

    // Create decipher
    const decipher = createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(authTag)

    // Decrypt the ciphertext (encrypted is already a Buffer)
    let decrypted = decipher.update(encrypted, undefined, 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
