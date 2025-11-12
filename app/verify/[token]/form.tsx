'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ReportIssueModal from './report-modal'

interface VerificationFormProps {
  token: string
  recipientId: string
}

export default function VerificationForm({ token, recipientId }: VerificationFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [showReportModal, setShowReportModal] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    mailing_address: '',
    i_am_owner: false,
    preferred_channel: 'email' as const,
    allow_updates: false,
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, type, value } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/verify/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          ...formData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to submit verification')
        return
      }

      if (data.redirectUrl) {
        router.push(data.redirectUrl)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg bg-white p-8 shadow">
          <h1 className="text-3xl font-bold text-gray-900">Verify Your Information</h1>
          <p className="mt-2 text-gray-600">
            Please review and confirm your information below.
          </p>

          {/* Read-only Summary */}
          <div className="mt-8 rounded-lg bg-gray-50 p-6 border border-gray-200">
            <h2 className="font-semibold text-gray-900 text-lg mb-4">Summary</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-600">Entity Type</p>
                <p className="mt-1 font-medium text-gray-900">Property / Business</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Contact ID</p>
                <p className="mt-1 font-medium text-gray-900">{recipientId}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Address</p>
                <p className="mt-1 font-medium text-gray-900">123 Main Street</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-lg bg-red-50 p-4 text-red-700 border border-red-200">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
                disabled={loading}
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone (Optional)
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(555) 123-4567"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                disabled={loading}
              />
            </div>

            {/* Mailing Address */}
            <div>
              <label htmlFor="mailing_address" className="block text-sm font-medium text-gray-700">
                Mailing Address (Optional)
              </label>
              <textarea
                id="mailing_address"
                name="mailing_address"
                value={formData.mailing_address}
                onChange={handleChange}
                placeholder="123 Main St, Suite 100, City, State 12345"
                rows={3}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                disabled={loading}
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="i_am_owner"
                  checked={formData.i_am_owner}
                  onChange={handleChange}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={loading}
                />
                <span className="ml-3 text-gray-900">I am the owner of this property/business</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="allow_updates"
                  checked={formData.allow_updates}
                  onChange={handleChange}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={loading}
                />
                <span className="ml-3 text-gray-900">Allow future updates about this property/business</span>
              </label>
            </div>

            {/* Preferred Channel */}
            <div>
              <label htmlFor="preferred_channel" className="block text-sm font-medium text-gray-700">
                Preferred Communication Channel
              </label>
              <select
                id="preferred_channel"
                name="preferred_channel"
                value={formData.preferred_channel}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                disabled={loading}
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="none">No preference</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Submitting...' : 'Looks Correct - Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setShowReportModal(true)}
                className="flex-1 rounded-lg border-2 border-gray-300 px-6 py-2 font-semibold text-gray-900 hover:border-gray-400 transition-colors"
              >
                Report Issue
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-xs text-gray-500">
            This is a secure form. Your information will only be used for verification purposes.
          </p>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <ReportIssueModal
          token={token}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </>
  )
}
