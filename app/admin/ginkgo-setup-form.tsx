'use client'

import { useState, useEffect } from 'react'

interface ValidationResult {
  success: boolean
  counts?: {
    contacts: number
    businesses: number
    properties: number
  }
  error?: string
}

interface GinkgoSetupFormProps {
  onSuccess?: (data: { communityId: string; apiKey: string; apiBaseUrl: string; counts: any }) => void
}

interface StoredCredentials {
  communityId: string
  apiKey: string
  apiBaseUrl: string
  validatedAt: string
}

export function GinkgoSetupForm({ onSuccess }: GinkgoSetupFormProps) {
  const [communityId, setCommunityId] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [apiBaseUrl, setApiBaseUrl] = useState('https://api.ginkgobioworks.com')
  const [loading, setLoading] = useState(false)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [showApiKey, setShowApiKey] = useState(false)
  const [storedCredentials, setStoredCredentials] = useState<StoredCredentials | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    // Check if credentials are already stored in sessionStorage
    const stored = sessionStorage.getItem('ginkgo_credentials')
    if (stored) {
      try {
        const credentials = JSON.parse(stored)
        setStoredCredentials(credentials)
        // Pre-fill the form with stored credentials
        setCommunityId(credentials.communityId)
        setApiKey(credentials.apiKey)
        setApiBaseUrl(credentials.apiBaseUrl)
      } catch (error) {
        console.error('Failed to parse stored credentials:', error)
      }
    }
  }, [])

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationResult(null)
    setLoading(true)

    try {
      const response = await fetch('/api/ginkgo/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          communityId,
          apiKey,
          apiBaseUrl,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setValidationResult({
          success: false,
          error: data.error || 'Validation failed',
        })
        return
      }

      setValidationResult(data)

      if (data.success) {
        // Set up tenant in database
        try {
          const tenantResponse = await fetch('/api/ginkgo/setup-tenant', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              communityId,
              apiKey,
              apiBaseUrl,
              tenantName: `Community ${communityId}`,
            }),
          })

          if (tenantResponse.ok) {
            const tenantData = await tenantResponse.json()

            // Store credentials and tenant ID in sessionStorage for use in campaign creation
            sessionStorage.setItem(
              'ginkgo_credentials',
              JSON.stringify({
                communityId,
                apiKey,
                apiBaseUrl,
                tenantId: tenantData.tenantId,
                validatedAt: new Date().toISOString(),
              })
            )

            if (onSuccess) {
              onSuccess({
                communityId,
                apiKey,
                apiBaseUrl,
                counts: data.counts,
              })
            }
          } else {
            console.error('Failed to set up tenant')
          }
        } catch (error) {
          console.error('Error setting up tenant:', error)
        }
      }
    } catch (error) {
      setValidationResult({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to validate credentials',
      })
    } finally {
      setLoading(false)
    }
  }

  // Show stored credentials summary if available and not editing
  if (storedCredentials && !isEditing && validationResult?.success) {
    return (
      <div className="rounded-lg bg-green-50 p-6 shadow border border-green-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-green-900">✓ Ginkgo Connected</h3>
            <p className="text-sm text-green-700 mt-1">
              Community ID: <span className="font-mono font-semibold">{storedCredentials.communityId}</span>
            </p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Change Credentials
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mt-6">
          <div className="rounded-lg bg-white p-4">
            <p className="text-sm text-gray-600">Available Contacts</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {validationResult.counts?.contacts || 0}
            </p>
          </div>
          <div className="rounded-lg bg-white p-4">
            <p className="text-sm text-gray-600">Available Businesses</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {validationResult.counts?.businesses || 0}
            </p>
          </div>
          <div className="rounded-lg bg-white p-4">
            <p className="text-sm text-gray-600">Available Properties</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {validationResult.counts?.properties || 0}
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            🎯 Ready to create campaigns? Visit the <span className="font-semibold">New Campaign</span> page to get started.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Update Ginkgo Credentials' : 'Connect to Ginkgo'}
          </h3>
          <p className="text-sm text-gray-600">
            {isEditing
              ? 'Update your Ginkgo Community ID and API credentials'
              : 'Enter your Ginkgo Community ID and API credentials to get started'}
          </p>
        </div>
        {isEditing && (
          <button
            onClick={() => setIsEditing(false)}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ✕
          </button>
        )}
      </div>

      <form onSubmit={handleValidate} className="space-y-4">
        <div>
          <label htmlFor="communityId" className="block text-sm font-medium text-gray-700">
            Community ID
          </label>
          <input
            id="communityId"
            type="text"
            value={communityId}
            onChange={(e) => setCommunityId(e.target.value)}
            placeholder="e.g., 12345"
            disabled={loading}
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
            X-API-KEY
          </label>
          <div className="relative">
            <input
              id="apiKey"
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Your Ginkgo API key"
              disabled={loading}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
            >
              {showApiKey ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="apiBaseUrl" className="block text-sm font-medium text-gray-700">
            API Base URL
          </label>
          <input
            id="apiBaseUrl"
            type="url"
            value={apiBaseUrl}
            onChange={(e) => setApiBaseUrl(e.target.value)}
            placeholder="https://api.ginkgobioworks.com"
            disabled={loading}
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        {validationResult && !validationResult.success && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
            <p className="font-semibold">Connection Failed</p>
            <p>{validationResult.error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 transition-colors disabled:bg-blue-400"
        >
          {loading ? 'Validating...' : isEditing ? 'Update Credentials' : 'Connect to Ginkgo'}
        </button>
      </form>
    </div>
  )
}
