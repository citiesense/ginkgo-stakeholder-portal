'use server'

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { encrypt } from '@/lib/encrypt'
import { createTenantSchema, type CreateTenantInput } from '@/lib/validation/tenant'

export async function createTenant(input: CreateTenantInput) {
  try {
    // Validate input
    const validatedData = createTenantSchema.parse(input)

    // Encrypt the API key
    const apiKeyCiphertext = encrypt(validatedData.apiKey)

    // Create the tenant
    const tenant = await prisma.tenant.create({
      data: {
        companyId: validatedData.companyId,
        name: validatedData.name,
        apiBaseUrl: validatedData.apiBaseUrl,
        apiKeyCiphertext,
      },
    })

    // Redirect to sync page with tenant ID
    redirect(`/admin/sync?tenantId=${tenant.id}`)
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('redirect')) {
        throw error // Re-throw redirect errors
      }
      return {
        success: false,
        error: error.message,
      }
    }
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}
