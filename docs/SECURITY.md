# Security Guidelines

## Overview

This document outlines security best practices and implementation details for the Ginkgo Stakeholder Portal.

---

## PII (Personally Identifiable Information) Handling

### ✅ DO: Keep PII Out of URLs

**❌ NEVER DO THIS:**
```
GET /verify/jane.doe@example.com/token
GET /api/contact/recipient?email=john@example.com
POST /api/users/123/address?street=123+Main+St
```

**✅ CORRECT APPROACH:**
```
GET /verify/AbCdEfGhIjKlMnOpQrStUvWxYz0123456789==
POST /api/verify/submit with token in body
```

### Why?

1. **Browser History**: URLs are stored in browser history, exposing PII
2. **Server Logs**: URLs are logged in access logs (Apache, Nginx, CDN)
3. **HTTP Referrer**: URLs leak via Referer headers to external sites
4. **Browser Plugins**: Extensions can capture and sync URLs
5. **DNS/ISP Logs**: ISPs log DNS queries and some URLs
6. **Proxy/Cache**: Proxies and caches store URLs
7. **Cross-site Leaks**: JavaScript can leak URL via XSS

### Implementation

The portal uses **opaque tokens** for all sensitive operations:

- **Verification Links**: `/verify/[token]` - token maps to recipient via database
- **API Requests**: Token in request body or Authorization header
- **Rate Limiting**: Based on IP, not user identity
- **Forms**: All PII submitted via POST body (encrypted in transit)

---

## Token Security

### Token Generation

```typescript
// GOOD: Cryptographically random
const token = generateOpaqueToken(32) // 256 bits of entropy
// Result: 43-character base64url string, never repeats

// BAD: Predictable
const token = userId + '-' + timestamp // Easy to guess
const token = Buffer.from(email).toString('base64') // Encodes PII
```

### Token Validation

```typescript
// Check format before database lookup
if (!isValidTokenFormat(token)) return 403

// Check expiry before using token
if (isTokenExpired(expiresAt)) return 401

// Validate against stored token (safe comparison)
const valid = constantTimeEqual(submitted, stored)
```

### Token Storage

```typescript
// Database schema includes:
token: String @unique        // Indexed for lookups
tokenExpiresAt: DateTime     // Always checked
status: String               // Tracks token state
lastActivityAt: DateTime     // Audit trail
```

---

## Encryption

### API Keys (at rest)

All sensitive credentials are encrypted:

```typescript
// Store encrypted
const encrypted = encrypt(apiKey)
await prisma.espConnection.create({
  accessKey: encrypted // Stored as ciphertext
})

// Decrypt on use (never in logs)
const decrypted = decrypt(ciphertext)
// Use immediately, never store plaintext
```

### Implementation: AES-256-GCM

- **Algorithm**: AES-256-GCM (AEAD)
- **Key Derivation**: scrypt(ENCRYPTION_KEY, salt)
- **IV**: 12 random bytes per encryption
- **Auth Tag**: Detects tampering
- **Format**: base64(IV + AuthTag + Ciphertext)

### Encryption Best Practices

```
✓ DO:
  - Use ENCRYPTION_KEY from environment only
  - Encrypt credentials before storage
  - Decrypt only when needed
  - Use fresh IV for each encryption
  - Validate auth tag (AEAD)
  - Log encrypted values only (not plaintext)

✗ DON'T:
  - Store plaintext secrets in database
  - Log decrypted values
  - Reuse IVs
  - Use ECB mode
  - Store keys in code
  - Transmit unencrypted over HTTP
```

---

## Rate Limiting

### Per-IP Rate Limits

```
/api/verify/submit:    10 requests / 60 seconds
/api/verify/report:    5 requests / 60 seconds
/api/esp/webhooks:     Unlimited (external webhooks)
```

### Implementation

```typescript
// Extract client IP from headers
const ip = getClientIp(request.headers)

// Check rate limit
const { allowed } = checkRateLimit(limiter, ip)

if (!allowed) {
  return 429 {
    'X-RateLimit-Remaining': '0',
    'X-RateLimit-Reset': resetTime
  }
}
```

### IP Detection

```typescript
// Check multiple sources for IP (proxy support)
X-Forwarded-For: 203.0.113.45, 198.51.100.99
X-Real-IP: 203.0.113.45
CF-Connecting-IP: 203.0.113.45

// Takes first IP, most recent is client
```

---

## CORS Policy

### Default: DISABLED

Portal pages have **NO CORS** enabled:
- `/admin/*` - No CORS
- `/verify/*` - No CORS (form submission only)
- `/` - No CORS

### Explicitly Enabled: Public APIs

Only external-facing APIs enable CORS:
```typescript
// ✅ Enabled
GET /api/health - allows *
POST /api/esp/webhooks/mailchimp - allows *

// ❌ Disabled
POST /api/verify/submit - NO CORS
GET /admin/dashboard - NO CORS
```

### Implementation

```typescript
// Apply CORS headers selectively
export async function POST(request: NextRequest) {
  const response = await handleRequest()
  // Only add CORS for external services
  return applyCorsHeaders(response, request.headers.get('origin'))
}
```

---

## Feature Flags

### Purpose

Control sensitive features via environment variables:

```bash
# Production: Disable experimental features
FEATURE_ESP_ENABLED=false
FEATURE_MOCK_GINKGO_API_ENABLED=false

# Staging: Enable for testing
FEATURE_ESP_ENABLED=true
FEATURE_VERBOSE_LOGGING_ENABLED=true
```

### Flag Naming Convention

```
FEATURE_[AREA]_[FEATURE]_ENABLED

FEATURE_ESP_ENABLED               # Master switch
FEATURE_ESP_MAILCHIMP_ENABLED     # Specific provider
FEATURE_VERIFICATION_RATE_LIMITING_ENABLED
FEATURE_VERBOSE_LOGGING_ENABLED   # Debug features
```

### Security Rules

```
✓ Default: DISABLED (fail secure)
  - Integration features: disabled
  - Dev features: disabled
  - Logging features: disabled

✓ Safe to expose to client:
  - Non-security-related flags only
  - Never expose debug/admin flags

✗ Never expose to client:
  - FEATURE_MOCK_GINKGO_API_ENABLED
  - FEATURE_VERBOSE_LOGGING_ENABLED
  - Database/credentials flags
```

---

## Secrets Management

### Environment Variables

```bash
# NEVER commit to git
.env              # ← Add to .gitignore
.env.local        # ← Add to .gitignore
.env.*.local      # ← Add to .gitignore

# Safe to commit
.env.example      # Template only, no real secrets
```

### Sensitive Values

```typescript
ENCRYPTION_KEY      // ← Generate new per environment
DATABASE_URL        // ← Different per environment
JWT_SECRET          // ← Generate per environment

// In .env.example:
ENCRYPTION_KEY="your-secret-encryption-key-change-in-production"
DATABASE_URL="postgresql://user:password@host/db"
```

### Rotation

```
When to rotate:
- Developer leaves team
- Suspected compromise
- Regular schedule (quarterly)
- After security incident

How to rotate:
1. Generate new secret
2. Update in secrets manager
3. Deploy with new secret
4. Keep old secret for grace period
5. Remove old secret after no use
```

---

## Audit Logging

### What to Log

```typescript
✓ Log these events:
  - Verification form submissions
  - Token generation
  - Failed authentication
  - Rate limit violations
  - API errors (generic messages)
  - ESP webhook receipt

✗ Never log:
  - Email addresses in URLs
  - API keys or secrets
  - Full request bodies (PII)
  - Full response bodies (PII)
  - User passwords
  - Authorization tokens
```

### Log Redaction

```typescript
// ✓ Good
console.log(`Token created: ${token.slice(-4)}...`)
console.log(`Submission from IP: ${clientIp}`)
console.log(`Rate limit exceeded for ${hash(clientIp)}`)

// ✗ Bad
console.log(`API key: ${apiKey}`)
console.log(`User email: ${email}`)
console.log(`Full token: ${token}`)
```

---

## Database Security

### Sensitive Columns

```prisma
// Encrypted at rest
apiKeyCiphertext  String   // Never store plaintext
accessSecret      String   // Encrypted

// PII stored separately from tokens
email             String   // Linked via token, not in URL
firstName         String?
lastName          String?
phone             String?
```

### Access Control

```typescript
// Only decrypt when needed
const decrypted = decrypt(ciphertext)
// Use immediately, don't store in memory

// Log safely
console.log(`Updated token: ${token.slice(-8)}`)
```

---

## Compliance

### GDPR/CCPA

```
✓ Requirements met:
  - PII not in URLs (not logged/cached)
  - Encryption of sensitive data
  - Token-based access (not user ID)
  - Audit logs for all access
  - Rate limiting prevents scraping
  - No unnecessary data retention
```

### Transmission Security

```
✓ HTTPS only (enforced):
  - All requests must use TLS 1.2+
  - HSTS headers set
  - No HTTP fallback
  - Cookies: Secure flag set
  - Cookies: HttpOnly flag set
```

---

## Incident Response

If a security incident is suspected:

1. **Stop**: Take affected system offline
2. **Assess**: Determine scope of exposure
3. **Contain**: Limit further damage
4. **Notify**: Alert affected users/admins
5. **Rotate**: Change all affected secrets
6. **Review**: Conduct post-mortem
7. **Fix**: Apply security patches

---

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Next.js Security Recommendations](https://nextjs.org/docs/advanced-features/security-headers)
