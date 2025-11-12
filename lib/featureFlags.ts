/**
 * Feature flags for conditional feature enablement
 * Control via environment variables
 */

export interface FeatureFlags {
  // ESP Integration flags
  ESP_ENABLED: boolean
  ESP_MAILCHIMP_ENABLED: boolean
  ESP_CONSTANT_CONTACT_ENABLED: boolean
  ESP_SYNC_AUDIENCE_ENABLED: boolean
  ESP_WEBHOOK_TRACKING_ENABLED: boolean

  // Verification flags
  VERIFICATION_RATE_LIMITING_ENABLED: boolean
  VERIFICATION_EMAIL_VALIDATION_ENABLED: boolean

  // Developer flags
  VERBOSE_LOGGING_ENABLED: boolean
  MOCK_GINKGO_API_ENABLED: boolean
}

/**
 * Parse boolean from environment variable
 */
function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) return defaultValue
  return value === 'true' || value === '1' || value === 'yes'
}

/**
 * Get all feature flags from environment
 */
export function getFeatureFlags(): FeatureFlags {
  return {
    // ESP Integration flags (disabled by default)
    ESP_ENABLED: parseBoolean(process.env.FEATURE_ESP_ENABLED, false),
    ESP_MAILCHIMP_ENABLED: parseBoolean(
      process.env.FEATURE_ESP_MAILCHIMP_ENABLED,
      false
    ),
    ESP_CONSTANT_CONTACT_ENABLED: parseBoolean(
      process.env.FEATURE_ESP_CONSTANT_CONTACT_ENABLED,
      false
    ),
    ESP_SYNC_AUDIENCE_ENABLED: parseBoolean(
      process.env.FEATURE_ESP_SYNC_AUDIENCE_ENABLED,
      false
    ),
    ESP_WEBHOOK_TRACKING_ENABLED: parseBoolean(
      process.env.FEATURE_ESP_WEBHOOK_TRACKING_ENABLED,
      false
    ),

    // Verification flags (enabled by default)
    VERIFICATION_RATE_LIMITING_ENABLED: parseBoolean(
      process.env.FEATURE_VERIFICATION_RATE_LIMITING_ENABLED,
      true
    ),
    VERIFICATION_EMAIL_VALIDATION_ENABLED: parseBoolean(
      process.env.FEATURE_VERIFICATION_EMAIL_VALIDATION_ENABLED,
      true
    ),

    // Developer flags (disabled by default)
    VERBOSE_LOGGING_ENABLED: parseBoolean(
      process.env.FEATURE_VERBOSE_LOGGING_ENABLED,
      false
    ),
    MOCK_GINKGO_API_ENABLED: parseBoolean(
      process.env.FEATURE_MOCK_GINKGO_API_ENABLED,
      false
    ),
  }
}

/**
 * Check if a specific feature is enabled
 */
export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags()
  return flags[flag]
}

/**
 * Get feature flags for client-side use (safe subset)
 * Do NOT expose sensitive feature flags to client
 */
export function getClientFeatureFlags(): Partial<FeatureFlags> {
  const flags = getFeatureFlags()
  return {
    // Only expose non-security-related flags to client
    VERIFICATION_RATE_LIMITING_ENABLED: flags.VERIFICATION_RATE_LIMITING_ENABLED,
    VERIFICATION_EMAIL_VALIDATION_ENABLED:
      flags.VERIFICATION_EMAIL_VALIDATION_ENABLED,
  }
}

/**
 * Feature Flag Naming Convention:
 *
 * Environment Variable: FEATURE_[AREA]_[FEATURE]_ENABLED
 *
 * Examples:
 * - FEATURE_ESP_ENABLED - Master flag for all ESP features
 * - FEATURE_ESP_MAILCHIMP_ENABLED - Specific provider flag
 * - FEATURE_VERIFICATION_RATE_LIMITING_ENABLED
 *
 * Usage:
 * export FEATURE_ESP_ENABLED=true
 * export FEATURE_ESP_MAILCHIMP_ENABLED=true
 * export FEATURE_ESP_CONSTANT_CONTACT_ENABLED=false
 * export FEATURE_ESP_WEBHOOK_TRACKING_ENABLED=true
 *
 * Defaults:
 * - Integration features: disabled (false)
 * - Core verification: enabled (true)
 * - Developer features: disabled (false)
 */

export const FEATURE_FLAG_DOCS = `
Feature Flags Guide

Setup in .env.local:
FEATURE_ESP_ENABLED=true
FEATURE_ESP_MAILCHIMP_ENABLED=true
FEATURE_ESP_CONSTANT_CONTACT_ENABLED=true
FEATURE_ESP_SYNC_AUDIENCE_ENABLED=true
FEATURE_ESP_WEBHOOK_TRACKING_ENABLED=true
FEATURE_VERIFICATION_RATE_LIMITING_ENABLED=true
FEATURE_VERBOSE_LOGGING_ENABLED=false

ESP Features:
- FEATURE_ESP_ENABLED: Master switch for all ESP functionality
- FEATURE_ESP_MAILCHIMP_ENABLED: Enable Mailchimp integration
- FEATURE_ESP_CONSTANT_CONTACT_ENABLED: Enable Constant Contact integration
- FEATURE_ESP_SYNC_AUDIENCE_ENABLED: Enable audience sync to ESP
- FEATURE_ESP_WEBHOOK_TRACKING_ENABLED: Enable ESP webhook event tracking

Verification Features:
- FEATURE_VERIFICATION_RATE_LIMITING_ENABLED: Rate limit form submissions
- FEATURE_VERIFICATION_EMAIL_VALIDATION_ENABLED: Validate email format

Developer Features:
- FEATURE_VERBOSE_LOGGING_ENABLED: Enable detailed logging
- FEATURE_MOCK_GINKGO_API_ENABLED: Use mock Ginkgo API responses

IMPORTANT:
- Never expose sensitive flags to client
- Always default to secure/restrictive behavior
- Test feature flags before production rollout
- Document which features affect compliance
`
