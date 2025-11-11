import { z } from 'zod'

export const verifyFormSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be less than 255 characters'),
  email: z
    .string()
    .email('Must be a valid email')
    .max(255, 'Email must be less than 255 characters'),
  phone: z
    .string()
    .max(20, 'Phone must be less than 20 characters')
    .optional()
    .default(''),
  mailing_address: z
    .string()
    .max(500, 'Mailing address must be less than 500 characters')
    .optional()
    .default(''),
  i_am_owner: z.boolean().optional().default(false),
  preferred_channel: z
    .enum(['email', 'phone', 'none'], { message: 'Invalid preferred channel' })
    .optional()
    .default('email'),
  allow_updates: z.boolean().optional().default(false),
})

export type VerifyFormInput = z.infer<typeof verifyFormSchema>

export interface VerificationSummary {
  contactId: number
  contactName?: string
  businessName?: string
  businessAddress?: string
  propertyAddress?: string
  propertyOwner?: string
  primaryType: 'Property' | 'Business'
}
