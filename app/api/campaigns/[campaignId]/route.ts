import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      )
    }

    // Fetch campaign with recipients
    const campaign = await prisma.verificationCampaign.findUnique({
      where: { id: campaignId },
      include: {
        recipients: {
          select: {
            id: true,
            token: true,
            status: true,
            contactId: true,
            lastActivityAt: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        tenant: {
          select: {
            companyId: true,
            name: true,
          },
        },
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        id: campaign.id,
        name: campaign.name,
        audienceType: campaign.audienceType,
        createdAt: campaign.createdAt,
        recipients: campaign.recipients,
        tenant: campaign.tenant,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Failed to fetch campaign:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    )
  }
}
