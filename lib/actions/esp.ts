'use server'

import { PrismaClient } from '@prisma/client'
import { espConnectionSchema, type EspConnectionInput } from '@/lib/validation/esp'

const prisma = new PrismaClient()

/**
 * Save or update ESP connection
 */
export async function saveEspConnection(input: EspConnectionInput): Promise<{
  success: boolean
  error?: string
  connection?: {
    id: string
    provider: string
    listId: string
  }
}> {
  try {
    // Validate input
    const validatedData = espConnectionSchema.parse(input)

    // Check if connection already exists for this tenant
    const existing = await prisma.espConnection.findFirst({
      where: {
        tenantId: validatedData.tenantId,
        provider: validatedData.provider,
      },
    })

    let connection

    if (existing) {
      // Update existing
      connection = await prisma.espConnection.update({
        where: { id: existing.id },
        data: {
          accessKey: validatedData.accessKey,
          accessSecret: validatedData.accessSecret,
          listId: validatedData.listId,
          meta: {
            updatedAt: new Date().toISOString(),
          },
        },
      })
    } else {
      // Create new
      connection = await prisma.espConnection.create({
        data: {
          tenantId: validatedData.tenantId,
          provider: validatedData.provider,
          accessKey: validatedData.accessKey,
          accessSecret: validatedData.accessSecret,
          listId: validatedData.listId,
          meta: {
            createdAt: new Date().toISOString(),
          },
        },
      })
    }

    return {
      success: true,
      connection: {
        id: connection.id,
        provider: connection.provider,
        listId: connection.listId || '',
      },
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error('ESP connection save error:', errorMsg)
    return {
      success: false,
      error: errorMsg,
    }
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Get ESP connection for a tenant
 */
export async function getEspConnection(
  tenantId: string,
  provider: 'mailchimp' | 'constant_contact'
): Promise<{
  success: boolean
  connection?: {
    id: string
    provider: string
    accessKey: string
    accessSecret: string | null
    listId: string | null
  }
  error?: string
}> {
  try {
    const connection = await prisma.espConnection.findFirst({
      where: {
        tenantId,
        provider,
      },
    })

    if (!connection) {
      return {
        success: false,
        error: 'No ESP connection found',
      }
    }

    return {
      success: true,
      connection: {
        id: connection.id,
        provider: connection.provider,
        accessKey: connection.accessKey,
        accessSecret: connection.accessSecret,
        listId: connection.listId,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch ESP connection',
    }
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * List ESP connections for a tenant
 */
export async function listEspConnections(tenantId: string): Promise<
  Array<{
    id: string
    provider: string
    listId: string | null
    createdAt: Date
  }>
> {
  try {
    const connections = await prisma.espConnection.findMany({
      where: { tenantId },
      select: {
        id: true,
        provider: true,
        listId: true,
        createdAt: true,
      },
    })

    return connections
  } catch (error) {
    console.error('ESP list error:', error)
    return []
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Delete ESP connection
 */
export async function deleteEspConnection(connectionId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    await prisma.espConnection.delete({
      where: { id: connectionId },
    })

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to delete connection',
    }
  } finally {
    await prisma.$disconnect()
  }
}
