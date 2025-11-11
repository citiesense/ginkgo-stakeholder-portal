import { z } from 'zod'

export const createCampaignSchema = z.object({
  tenantId: z.string({ message: 'Tenant ID is required' }),
  name: z
    .string({ message: 'Campaign name is required' })
    .min(1, 'Campaign name is required')
    .max(255, 'Campaign name must be less than 255 characters'),
  audienceType: z.enum(['property_owners', 'business_owners', 'both'], {
    message: 'Invalid audience type',
  }),
  filtersJson: z
    .record(z.any())
    .optional()
    .default({}),
  deliveryMethod: z.enum(['csv_export', 'esp_push'], {
    message: 'Invalid delivery method',
  }),
})

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>

export interface VerificationRecipientData {
  campaignId: string
  contactId: number
  primaryType: 'Property' | 'Business'
  primaryRecordId: number
  token: string
  tokenExpiresAt: Date
  email: string
  firstName?: string
  lastName?: string
  businessName?: string
  propertyAddress?: string
}
