'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Recipient {
  id: string
  token: string
  status: string
  contactId: number
  lastActivityAt?: string
  createdAt: string
}

interface Campaign {
  id: string
  name: string
  audienceType: string
  createdAt: string
  recipients: Recipient[]
  tenant?: {
    companyId: number
    name: string
  }
}

export default function CampaignDetailPage() {
  const params = useParams()
  const campaignId = params.campaignId as string
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchCampaign()
  }, [campaignId])

  const fetchCampaign = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/campaigns/${campaignId}`)
      if (response.ok) {
        const data = await response.json()
        setCampaign(data)
      } else {
        setError('Campaign not found')
      }
    } catch (err) {
      console.error('Failed to fetch campaign:', err)
      setError('Failed to load campaign')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading campaign...</p>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="space-y-4">
        <Link href="/admin/campaigns" className="inline-flex items-center text-blue-600 hover:text-blue-700">
          ← Back to Campaigns
        </Link>
        <div className="rounded-lg bg-red-50 p-6 border border-red-200">
          <p className="text-red-800">{error || 'Campaign not found'}</p>
        </div>
      </div>
    )
  }

  const campaignUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/campaigns/${campaign.id}/manage`
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    visited: 'bg-blue-100 text-blue-800',
    submitted: 'bg-green-100 text-green-800',
    expired: 'bg-gray-100 text-gray-800',
    bounced: 'bg-red-100 text-red-800',
  }

  const getStatusStats = () => {
    const stats: Record<string, number> = {
      pending: 0,
      visited: 0,
      submitted: 0,
      expired: 0,
      bounced: 0,
    }
    campaign.recipients.forEach(r => {
      if (r.status in stats) {
        stats[r.status]++
      }
    })
    return stats
  }

  const stats = getStatusStats()

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/admin/campaigns" className="inline-flex items-center text-blue-600 hover:text-blue-700">
        ← Back to Campaigns
      </Link>

      {/* Campaign Header */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{campaign.name}</h2>
            <p className="text-gray-600 mt-2">
              Community: {campaign.tenant?.name || `Community ${campaign.tenant?.companyId}`} •{' '}
              Audience: {campaign.audienceType.replace(/_/g, ' ')}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Created {new Date(campaign.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Shareable URL Section */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Campaign Management URL</h3>
          <p className="text-xs text-blue-700 mb-3">
            Share this link with your team members to view campaign status and results
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={campaignUrl}
              className="flex-1 rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm text-gray-700 font-mono"
            />
            <button
              onClick={() => copyToClipboard(campaignUrl)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm font-medium text-gray-600">Total Recipients</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{campaign.recipients.length}</p>
        </div>
        <div className="rounded-lg bg-yellow-50 p-4 shadow border border-yellow-200">
          <p className="text-sm font-medium text-yellow-700">Pending</p>
          <p className="mt-2 text-2xl font-bold text-yellow-900">{stats.pending}</p>
        </div>
        <div className="rounded-lg bg-blue-50 p-4 shadow border border-blue-200">
          <p className="text-sm font-medium text-blue-700">Visited</p>
          <p className="mt-2 text-2xl font-bold text-blue-900">{stats.visited}</p>
        </div>
        <div className="rounded-lg bg-green-50 p-4 shadow border border-green-200">
          <p className="text-sm font-medium text-green-700">Submitted</p>
          <p className="mt-2 text-2xl font-bold text-green-900">{stats.submitted}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-4 shadow border border-gray-200">
          <p className="text-sm font-medium text-gray-700">Other</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{stats.expired + stats.bounced}</p>
        </div>
      </div>

      {/* Recipients Table */}
      <div className="rounded-lg bg-white shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recipients ({campaign.recipients.length})</h3>
        </div>

        {campaign.recipients.length === 0 ? (
          <div className="p-6 text-center text-gray-600">No recipients in this campaign</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Contact ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Last Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {campaign.recipients.map((recipient) => (
                  <tr key={recipient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{recipient.contactId}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusColors[recipient.status] || 'bg-gray-100 text-gray-800'}`}>
                        {recipient.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {recipient.lastActivityAt
                        ? new Date(recipient.lastActivityAt).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(recipient.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        href={`/verify/${recipient.token}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:text-blue-700"
                      >
                        View Form
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
