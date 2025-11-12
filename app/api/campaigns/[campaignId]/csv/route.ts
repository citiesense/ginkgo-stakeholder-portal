import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000'

/**
 * GET /api/campaigns/[campaignId]/csv
 * Streams CSV file with verification recipients and links
 * CSV columns: email,first_name,last_name,business_name,property_address,owner_type,verification_link
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params

    // Fetch campaign
    const campaign = await prisma.verificationCampaign.findUnique({
      where: { id: campaignId },
      include: {
        recipients: {
          select: {
            token: true,
            primaryType: true,
            primaryRecordId: true,
          },
        },
      },
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Fetch full recipient data with contact info
    const recipients = await prisma.verificationRecipient.findMany({
      where: { campaignId },
      select: {
        id: true,
        token: true,
        primaryType: true,
        primaryRecordId: true,
        contactId: true,
      },
    })

    // Build CSV content
    const csvRows: string[] = [
      'email,first_name,last_name,business_name,property_address,owner_type,verification_link',
    ]

    // We need to fetch contact data from Ginkgo API to get names, etc.
    // For now, we'll use what we have in the recipient data
    for (const recipient of recipients) {
      // Note: In a production system, you'd want to store contact details
      // in the VerificationRecipient table to avoid extra API calls
      const verificationLink = `${APP_BASE_URL}/verify/${recipient.token}`

      // Escape CSV fields
      const escapeCsvField = (field: string | null | undefined): string => {
        if (!field) return ''
        const fieldStr = String(field)
        if (fieldStr.includes(',') || fieldStr.includes('"') || fieldStr.includes('\n')) {
          return `"${fieldStr.replace(/"/g, '""')}"`
        }
        return fieldStr
      }

      // Build row (note: we don't have all contact details here, would need to enhance)
      const row = [
        escapeCsvField(''), // email (would need to store in DB)
        escapeCsvField(''), // first_name
        escapeCsvField(''), // last_name
        escapeCsvField(''), // business_name
        escapeCsvField(''), // property_address
        escapeCsvField(recipient.primaryType), // owner_type
        escapeCsvField(verificationLink),
      ].join(',')

      csvRows.push(row)
    }

    const csvContent = csvRows.join('\n')

    // Return as downloadable CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv;charset=utf-8',
        'Content-Disposition': `attachment; filename="campaign_${campaignId}_recipients.csv"`,
        'Content-Length': Buffer.byteLength(csvContent).toString(),
      },
    })
  } catch (error) {
    console.error('CSV export error:', error)
    return NextResponse.json(
      { error: 'Failed to export CSV' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
