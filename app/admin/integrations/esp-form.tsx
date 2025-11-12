'use client'

import { useState } from 'react'
import { saveEspConnection } from '@/lib/actions/esp'

interface EspConnectionFormProps {
  provider: 'mailchimp' | 'constant_contact'
  tenantId: string
  onClose: () => void
  onSuccess: () => void
}

export default function EspConnectionForm({
  provider,
  tenantId,
  onClose,
  onSuccess,
}: EspConnectionFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const [formData, setFormData] = useState({
    accessKey: '',
    accessSecret: '',
    listId: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await saveEspConnection({
        tenantId,
        provider,
        accessKey: formData.accessKey,
        accessSecret: formData.accessSecret,
        listId: formData.listId,
      })

      if (!result.success) {
        setError(result.error || 'Failed to save connection')
        return
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const isMailchimp = provider === 'mailchimp'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="rounded-lg bg-white p-8 shadow-lg max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-gray-900 text-lg">
            Connect {isMailchimp ? 'Mailchimp' : 'Constant Contact'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* API Key */}
          <div>
            <label htmlFor="accessKey" className="block text-sm font-medium text-gray-700">
              {isMailchimp ? 'API Key' : 'Access Token'} <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="accessKey"
              name="accessKey"
              value={formData.accessKey}
              onChange={handleChange}
              placeholder={isMailchimp ? 'xxxxxxxxxxxxxxxxxxxxxxxx-us1' : 'Bearer token'}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              required
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500">
              {isMailchimp
                ? 'Find in Account > Extras > API Keys'
                : 'Find in Account Settings > API Keys'}
            </p>
          </div>

          {/* API Secret (only for Constant Contact) */}
          {!isMailchimp && (
            <div>
              <label htmlFor="accessSecret" className="block text-sm font-medium text-gray-700">
                API Secret (Optional)
              </label>
              <input
                type="password"
                id="accessSecret"
                name="accessSecret"
                value={formData.accessSecret}
                onChange={handleChange}
                placeholder="API secret"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                disabled={loading}
              />
            </div>
          )}

          {/* List ID */}
          <div>
            <label htmlFor="listId" className="block text-sm font-medium text-gray-700">
              {isMailchimp ? 'Audience ID' : 'List ID'} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="listId"
              name="listId"
              value={formData.listId}
              onChange={handleChange}
              placeholder={isMailchimp ? 'a1b2c3d4e5' : 'contact-list-123'}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              required
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500">
              {isMailchimp
                ? 'Find in Audience > Settings > Audience ID'
                : 'Find in Contacts > Lists'}
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-red-700 text-sm border border-red-200">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-2 font-medium text-gray-900 hover:border-gray-400 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {loading ? 'Saving...' : 'Save Connection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
