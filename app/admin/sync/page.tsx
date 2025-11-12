'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function SyncPage() {
  const searchParams = useSearchParams()
  const tenantId = searchParams.get('tenantId')
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-lg bg-white p-8 shadow">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tenant Created</h1>
            <p className="text-gray-600">Your organization has been successfully onboarded</p>
          </div>
        </div>

        {tenantId && (
          <div className="mb-6 rounded-lg bg-blue-50 p-4 border border-blue-200">
            <p className="text-sm text-gray-600">Tenant ID:</p>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 break-all rounded bg-white p-2 text-sm font-mono text-gray-900">
                {tenantId}
              </code>
              <button
                onClick={() => copyToClipboard(tenantId)}
                className="rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <h2 className="mb-4 text-xl font-bold text-gray-900">Next Steps</h2>
            <ol className="space-y-3">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
                  1
                </span>
                <div>
                  <p className="font-semibold text-gray-900">Configure ESP Connection</p>
                  <p className="text-sm text-gray-600">
                    Connect your email service provider (Mailchimp, Constant Contact, etc.)
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
                  2
                </span>
                <div>
                  <p className="font-semibold text-gray-900">Create Verification Campaign</p>
                  <p className="text-sm text-gray-600">
                    Set up your first property owner or business owner verification campaign
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
                  3
                </span>
                <div>
                  <p className="font-semibold text-gray-900">Import Recipients</p>
                  <p className="text-sm text-gray-600">
                    Upload your stakeholder contact list to begin verification
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
                  4
                </span>
                <div>
                  <p className="font-semibold text-gray-900">Monitor & Analyze</p>
                  <p className="text-sm text-gray-600">
                    Track campaign engagement and collect verified stakeholder information
                  </p>
                </div>
              </li>
            </ol>
          </div>

          <div className="rounded-lg bg-amber-50 p-4 border border-amber-200">
            <h3 className="font-semibold text-amber-900">Coming Soon</h3>
            <ul className="mt-2 space-y-1 text-sm text-amber-800">
              <li>• ESP connection management</li>
              <li>• Campaign creation and management</li>
              <li>• Recipient import and verification</li>
              <li>• Analytics dashboard</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <a
              href="/admin"
              className="flex-1 rounded-lg bg-gray-900 px-6 py-2 text-center font-semibold text-white hover:bg-gray-800 transition-colors"
            >
              Back to Dashboard
            </a>
            <a
              href="/admin/onboard"
              className="flex-1 rounded-lg border-2 border-gray-300 px-6 py-2 text-center font-semibold text-gray-900 hover:border-gray-400 transition-colors"
            >
              Onboard Another Tenant
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
