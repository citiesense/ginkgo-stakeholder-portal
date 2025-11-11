'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { createCampaign } from '@/lib/actions/campaign'
import { type CreateCampaignInput, type VerificationRecipientData } from '@/lib/validation/campaign'
import { generateVerificationCsv, downloadCsv } from '@/lib/csv'
import CampaignWizard from './wizard'

export default function NewCampaignPage() {
  const searchParams = useSearchParams()
  const tenantId = searchParams.get('tenantId')
  const [campaignCreated, setCampaignCreated] = useState(false)
  const [createdCampaign, setCreatedCampaign] = useState<{
    id: string
    name: string
    recipientCount: number
  } | null>(null)
  const [recipients, setRecipients] = useState<VerificationRecipientData[]>([])

  if (!tenantId) {
    return (
      <div className="mx-auto max-w-2xl rounded-lg bg-red-50 p-6 text-red-700 border border-red-200">
        <h2 className="font-semibold">Error: No Tenant Selected</h2>
        <p className="mt-2">Please select a tenant to create a campaign.</p>
        <a href="/admin" className="mt-4 inline-block text-blue-600 hover:underline">
          Back to Admin
        </a>
      </div>
    )
  }

  if (campaignCreated && createdCampaign) {
    const handleDownloadCsv = () => {
      const appBaseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000'
      const csvContent = generateVerificationCsv(recipients, appBaseUrl)
      downloadCsv(csvContent, `campaign_${createdCampaign.id}_recipients.csv`)
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
              <h1 className="text-3xl font-bold text-gray-900">Campaign Created</h1>
              <p className="text-gray-600">Your verification campaign has been generated</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
              <p className="text-sm text-gray-600">Campaign Name:</p>
              <p className="mt-1 font-semibold text-gray-900">{createdCampaign.name}</p>

              <p className="mt-4 text-sm text-gray-600">Recipients:</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{createdCampaign.recipientCount}</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleDownloadCsv}
                className="flex-1 rounded-lg bg-green-600 px-6 py-2 text-center font-semibold text-white hover:bg-green-700 transition-colors"
              >
                ⬇ Download CSV
              </button>
              <a
                href="/admin"
                className="flex-1 rounded-lg border-2 border-gray-300 px-6 py-2 text-center font-semibold text-gray-900 hover:border-gray-400 transition-colors"
              >
                Back to Dashboard
              </a>
            </div>

            <div className="rounded-lg bg-amber-50 p-4 border border-amber-200">
              <h3 className="font-semibold text-amber-900">Next Steps</h3>
              <ul className="mt-2 space-y-1 text-sm text-amber-800">
                <li>• Download the CSV file with verification links</li>
                <li>• Send emails to recipients with their verification links</li>
                <li>• Track engagement and responses in the campaign dashboard</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <CampaignWizard
      tenantId={tenantId}
      onCampaignCreated={(campaign, recipientData) => {
        setCreatedCampaign(campaign)
        setRecipients(recipientData)
        setCampaignCreated(true)
      }}
    />
  )
}
