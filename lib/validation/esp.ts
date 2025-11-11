import { z } from 'zod'

export const espConnectionSchema = z.object({
  tenantId: z.string().min(1, 'Tenant ID is required'),
  provider: z.enum(['mailchimp', 'constant_contact'], {
    message: 'Provider must be mailchimp or constant_contact',
  }),
  accessKey: z
    .string()
    .min(1, 'API key is required')
    .max(1000, 'API key must be less than 1000 characters'),
  accessSecret: z
    .string()
    .max(1000, 'API secret must be less than 1000 characters')
    .optional()
    .default(''),
  listId: z
    .string()
    .min(1, 'List ID is required')
    .max(500, 'List ID must be less than 500 characters'),
})

export type EspConnectionInput = z.infer<typeof espConnectionSchema>

export interface EspSyncRequest {
  tenantId: string
  campaignId: string
  provider: 'mailchimp' | 'constant_contact'
}

export interface EspWebhookPayload {
  type: 'subscribe' | 'unsubscribe' | 'open' | 'click' | 'bounce'
  email?: string
  data?: Record<string, any>
}
