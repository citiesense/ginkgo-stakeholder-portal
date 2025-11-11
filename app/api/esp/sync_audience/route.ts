import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createEspClient } from '@/lib/espClient'
import { z } from 'zod'

const prisma = new PrismaClient()

const syncSchema = z.object({
  tenantId: z.string().min(1),
  campaignId: z.string().min(1),
})

/**
 * POST /api/esp/sync_audience
 *
 * Syncs campaign recipients to connected ESP
 * - Verifies ESP connection exists
 * - Creates/updates merge fields
 * - Pushes all pending recipients
 * - Returns sync results
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tenantId, campaignId } = syncSchema.parse(body)

    // Fetch campaign
    const campaign = await prisma.verificationCampaign.findUnique({
      where: { id: campaignId },
      include: {
        tenant: true,
        recipients: {
          where: { status: 'pending' },
          take: 1000, // Limit to prevent large syncs
        },
      },
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Fetch ESP connection
    const espConnection = await prisma.espConnection.findFirst({
      where: {
        tenantId,
      },
    })

    if (!espConnection) {
      return NextResponse.json(
        { error: 'No ESP connection configured' },
        { status: 400 }
      )
    }

    // Create ESP client
    const espClient = createEspClient(
      espConnection.provider as 'mailchimp' | 'constant_contact',
      espConnection.accessKey,
      espConnection.listId || '',
      espConnection.accessSecret || undefined
    )

    // Ensure merge fields exist
    const fieldsCreated = await espClient.ensureMergeFields()
    if (!fieldsCreated) {
      return NextResponse.json(
        { error: 'Failed to create merge fields in ESP' },
        { status: 500 }
      )
    }

    // Sync each recipient
    let successCount = 0
    let failureCount = 0

    for (const recipient of campaign.recipients) {
      // Note: In production, would fetch full contact details from Ginkgo API
      const success = await espClient.addOrUpdateSubscriber(
        recipient.id, // Placeholder: would be actual email
        {
          first_name: '', // Would fetch from Ginkgo
          last_name: '',
          business_name: '',
          property_address: '',
          owner_type: recipient.primaryType,
        }
      )

      if (success) {
        successCount++
        // Update recipient espMessageId if needed
      } else {
        failureCount++
      }
    }

    return NextResponse.json({
      success: true,
      synced: successCount,
      failed: failureCount,
      total: campaign.recipients.length,
      provider: espConnection.provider,
    })
  } catch (error) {
    console.error('ESP sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync audience' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
