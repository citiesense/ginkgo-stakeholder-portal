'use server'

import { prisma } from '@/lib/prisma'
import { fetchAllEntities, type Entity } from '@/lib/ginkgoClient'
import { createCampaignSchema, type CreateCampaignInput, type VerificationRecipientData } from '@/lib/validation/campaign'
import { generateVerificationToken, generateTokenExpiry } from '@/lib/token'

interface GinkgoContact {
  id?: number
  name?: string
  first_name?: string
  last_name?: string
  email?: string
  organization_name?: string
  property_address?: string
  contact_type?: string
}

interface GinkgoBusiness {
  id?: number
  name?: string
  email?: string
  organization_name?: string
  address?: string
}

interface GinkgoProperty {
  id?: number
  name?: string
  address?: string
}

/**
 * Matches contacts to businesses/properties based on email and address
 */
function matchContactsToEntities(
  contacts: GinkgoContact[],
  businesses: GinkgoBusiness[],
  properties: GinkgoProperty[],
  audienceType: 'property_owners' | 'business_owners' | 'both',
  _filters: Record<string, any>
): VerificationRecipientData[] {
  const recipients: VerificationRecipientData[] = []
  const tokenExpiry = generateTokenExpiry(60)

  // Filter contacts by email (required)
  const validContacts = contacts.filter(c => c.email && c.email.trim())

  for (const contact of validContacts) {
    // Include business matches
    if (audienceType === 'both' || audienceType === 'business_owners') {
      // Find matching business
      const business = businesses.find(
        b =>
          (b.id && contact.id) ||
          (b.email?.toLowerCase() === contact.email?.toLowerCase()) ||
          (b.organization_name?.toLowerCase() === contact.organization_name?.toLowerCase())
      )

      if (business && business.id) {
        recipients.push({
          campaignId: '', // Will be set after campaign creation
          contactId: contact.id || 0,
          primaryType: 'Business',
          primaryRecordId: business.id,
          token: generateVerificationToken(),
          tokenExpiresAt: tokenExpiry,
          email: contact.email!,
          firstName: contact.first_name,
          lastName: contact.last_name,
          businessName: business.name,
          propertyAddress: business.address,
        })
      }
    }

    // Include property matches
    if (audienceType === 'both' || audienceType === 'property_owners') {
      // Find matching property
      const property = properties.find(
        p =>
          (p.id && contact.id) ||
          (p.address?.toLowerCase() === contact.property_address?.toLowerCase())
      )

      if (property && property.id && !recipients.some(
        r => r.primaryRecordId === property.id && r.primaryType === 'Property'
      )) {
        recipients.push({
          campaignId: '', // Will be set after campaign creation
          contactId: contact.id || 0,
          primaryType: 'Property',
          primaryRecordId: property.id,
          token: generateVerificationToken(),
          tokenExpiresAt: tokenExpiry,
          email: contact.email!,
          firstName: contact.first_name,
          lastName: contact.last_name,
          businessName: contact.organization_name,
          propertyAddress: property.address,
        })
      }
    }

    // If audience is 'both' but no matches, still include contact for broader audience
    if (audienceType === 'both' && !recipients.some(r => r.email === contact.email)) {
      recipients.push({
        campaignId: '',
        contactId: contact.id || 0,
        primaryType: 'Business',
        primaryRecordId: 0, // Generic recipient without specific entity match
        token: generateVerificationToken(),
        tokenExpiresAt: tokenExpiry,
        email: contact.email!,
        firstName: contact.first_name,
        lastName: contact.last_name,
        businessName: contact.organization_name,
        propertyAddress: contact.property_address,
      })
    }
  }

  // Deduplicate by email
  const seen = new Set<string>()
  return recipients.filter(r => {
    if (seen.has(r.email)) return false
    seen.add(r.email)
    return true
  })
}

/**
 * Creates a verification campaign and generates recipients
 * - Fetches contacts, businesses, properties from Ginkgo API
 * - Filters and maps contacts to entities
 * - Creates VerificationCampaign record
 * - Creates VerificationRecipient records with tokens
 * - Returns campaign and recipients for CSV export or ESP push
 */
export async function createCampaign(
  input: CreateCampaignInput,
  userId: string
): Promise<{
  success: boolean
  error?: string
  campaign?: {
    id: string
    name: string
    audienceType: string
    recipientCount: number
  }
  recipients?: VerificationRecipientData[]
}> {
  try {
    // Validate input
    const validatedData = createCampaignSchema.parse(input)

    // Fetch entities from Ginkgo API
    const entitiesToFetch: Entity[] = ['contacts']
    if (validatedData.audienceType !== 'property_owners') {
      entitiesToFetch.push('businesses')
    }
    if (validatedData.audienceType !== 'business_owners') {
      entitiesToFetch.push('properties')
    }

    const entities = await fetchAllEntities(validatedData.tenantId, entitiesToFetch as Entity[])

    // Match contacts to entities
    const recipientData = matchContactsToEntities(
      (entities.contacts || []) as GinkgoContact[],
      (entities.businesses || []) as GinkgoBusiness[],
      (entities.properties || []) as GinkgoProperty[],
      validatedData.audienceType,
      validatedData.filtersJson || {}
    )

    if (recipientData.length === 0) {
      return {
        success: false,
        error: 'No matching recipients found for the selected audience and filters',
      }
    }

    // Create campaign in database
    const campaign = await prisma.verificationCampaign.create({
      data: {
        tenantId: validatedData.tenantId,
        name: validatedData.name,
        audienceType: validatedData.audienceType,
        filtersJson: validatedData.filtersJson || {},
        createdBy: userId,
      },
    })

    // Update recipient data with campaign ID
    const recipientsWithCampaignId = recipientData.map(r => ({
      ...r,
      campaignId: campaign.id,
    }))

    // Create recipients in database
    await prisma.verificationRecipient.createMany({
      data: recipientsWithCampaignId.map(r => ({
        campaignId: r.campaignId,
        contactId: r.contactId,
        primaryType: r.primaryType,
        primaryRecordId: r.primaryRecordId,
        token: r.token,
        tokenExpiresAt: r.tokenExpiresAt,
        status: 'pending',
      })),
    })

    return {
      success: true,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        audienceType: campaign.audienceType,
        recipientCount: recipientsWithCampaignId.length,
      },
      recipients: recipientsWithCampaignId,
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error('Campaign creation failed:', errorMsg)
    return {
      success: false,
      error: errorMsg,
    }
  } finally {
    await prisma.$disconnect()
  }
}
