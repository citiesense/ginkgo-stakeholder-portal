import { z } from 'zod'

export const createTenantSchema = z.object({
  companyId: z
    .number({ message: 'Company ID must be a number' })
    .int('Company ID must be an integer')
    .positive('Company ID must be a positive number'),
  name: z
    .string({ message: 'Tenant name is required' })
    .min(1, 'Tenant name is required')
    .max(255, 'Tenant name must be less than 255 characters'),
  apiBaseUrl: z
    .string({ message: 'API Base URL is required' })
    .url('API Base URL must be a valid URL')
    .optional()
    .default('https://api.ginkgo.city'),
  apiKey: z
    .string({ message: 'API key is required' })
    .min(1, 'API key is required')
    .max(1000, 'API key must be less than 1000 characters'),
})

export type CreateTenantInput = z.infer<typeof createTenantSchema>
