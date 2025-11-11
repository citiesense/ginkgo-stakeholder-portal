'use client'

import { useState } from 'react'
import { createTenant } from '@/lib/actions/tenant'
import { createTenantSchema, type CreateTenantInput } from '@/lib/validation/tenant'
import { ZodError } from 'zod'

export default function OnboardPage() {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState<string>('')

  const [formData, setFormData] = useState({
    companyId: '',
    name: '',
    apiBaseUrl: 'https://api.ginkgo.city',
    apiKey: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    setGeneralError('')

    try {
      // Parse form data to match expected types
      const inputData: CreateTenantInput = {
        companyId: parseInt(formData.companyId, 10),
        name: formData.name,
        apiBaseUrl: formData.apiBaseUrl,
        apiKey: formData.apiKey,
      }

      // Validate with Zod
      const validatedData = createTenantSchema.parse(inputData)

      // Call server action
      const result = await createTenant(validatedData)

      if (result && !result.success) {
        setGeneralError(result.error)
      }
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors
        const formattedErrors: Record<string, string> = {}
        error.errors.forEach(err => {
          const path = err.path.join('.')
          formattedErrors[path] = err.message
        })
        setErrors(formattedErrors)
      } else if (error instanceof Error) {
        setGeneralError(error.message)
      } else {
        setGeneralError('An unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-lg bg-white p-8 shadow">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Onboard Tenant</h1>
        <p className="mb-6 text-gray-600">
          Create a new Business Improvement District tenant organization
        </p>

        {generalError && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700 border border-red-200">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company ID */}
          <div>
            <label htmlFor="companyId" className="block text-sm font-medium text-gray-700">
              Company ID <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="companyId"
              name="companyId"
              value={formData.companyId}
              onChange={handleChange}
              placeholder="e.g., 12345"
              className={`mt-1 block w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                errors.companyId ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              required
              disabled={loading}
            />
            {errors.companyId && (
              <p className="mt-1 text-sm text-red-600">{errors.companyId}</p>
            )}
          </div>

          {/* Tenant Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Tenant Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Downtown Business Improvement District"
              className={`mt-1 block w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              required
              disabled={loading}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* API Base URL */}
          <div>
            <label htmlFor="apiBaseUrl" className="block text-sm font-medium text-gray-700">
              API Base URL
            </label>
            <input
              type="url"
              id="apiBaseUrl"
              name="apiBaseUrl"
              value={formData.apiBaseUrl}
              onChange={handleChange}
              placeholder="https://api.ginkgo.city"
              className={`mt-1 block w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                errors.apiBaseUrl ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            <p className="mt-1 text-sm text-gray-500">
              Defaults to https://api.ginkgo.city
            </p>
            {errors.apiBaseUrl && (
              <p className="mt-1 text-sm text-red-600">{errors.apiBaseUrl}</p>
            )}
          </div>

          {/* API Key */}
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
              API Key <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="apiKey"
              name="apiKey"
              value={formData.apiKey}
              onChange={handleChange}
              placeholder="Your API key (will be encrypted)"
              className={`mt-1 block w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                errors.apiKey ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              required
              disabled={loading}
            />
            <p className="mt-1 text-sm text-gray-500">
              The API key will be encrypted using AES-256-GCM and securely stored
            </p>
            {errors.apiKey && (
              <p className="mt-1 text-sm text-red-600">{errors.apiKey}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating Tenant...' : 'Create Tenant'}
            </button>
            <a
              href="/admin"
              className="flex-1 rounded-lg border-2 border-gray-300 px-6 py-2 text-center font-semibold text-gray-900 hover:border-gray-400 transition-colors"
            >
              Cancel
            </a>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-8 rounded-lg bg-blue-50 p-4 border border-blue-200">
          <h3 className="font-semibold text-blue-900">Security Notice</h3>
          <ul className="mt-2 space-y-1 text-sm text-blue-800">
            <li>✓ API keys are encrypted with AES-256-GCM before storage</li>
            <li>✓ Encryption uses your ENCRYPTION_KEY environment variable</li>
            <li>✓ Keys are never logged or exposed in transit</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
