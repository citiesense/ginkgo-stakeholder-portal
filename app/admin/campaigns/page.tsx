import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

interface Campaign {
  id: string
  name: string
  audienceType: string
  createdAt: Date
  createdBy: string
  recipients: { id: string }[]
  tenant?: {
    companyId: number
    name: string
  }
}

async function getCampaigns(userEmail: string): Promise<Campaign[]> {
  try {
    const campaigns = await prisma.verificationCampaign.findMany({
      where: {
        createdBy: userEmail,
      },
      include: {
        recipients: {
          select: { id: true },
        },
        tenant: {
          select: { companyId: true, name: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return campaigns
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return []
  }
}

export default async function CampaignsPage() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <div className="rounded-lg bg-amber-50 p-6 border border-amber-200">
        <p className="text-amber-800">Please log in to view campaigns</p>
      </div>
    )
  }

  const campaigns = await getCampaigns(user.email)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campaigns</h2>
          <p className="text-gray-600 mt-1">Manage your verification campaigns</p>
        </div>
        <Link
          href="/admin/campaigns/new"
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          + New Campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="rounded-lg bg-gray-50 p-12 text-center border border-gray-200">
          <p className="text-gray-600 mb-4">No campaigns yet</p>
          <p className="text-sm text-gray-500 mb-6">
            Create your first campaign to get started with verifications
          </p>
          <Link
            href="/admin/campaigns/new"
            className="inline-block rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Create First Campaign
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Campaign Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Community
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Audience Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Recipients
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
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{campaign.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {campaign.tenant?.name || `Community ${campaign.tenant?.companyId}`}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                    {campaign.audienceType.replace(/_/g, ' ')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                      {campaign.recipients.length}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <Link
                      href={`/admin/campaigns/${campaign.id}`}
                      className="font-medium text-blue-600 hover:text-blue-700"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
