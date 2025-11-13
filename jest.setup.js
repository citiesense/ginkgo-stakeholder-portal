/**
 * Jest Setup File
 * Configures test environment, mocks, and test-only environment variables
 */

// Set test encryption key - used only for unit tests, never for production
process.env.ENCRYPTION_KEY = 'test-key-32-characters-minimum'
