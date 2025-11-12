'use server'

import { prisma } from '@/lib/prisma'
import { decrypt } from '@/lib/encrypt'

export type Entity = 'contacts' | 'businesses' | 'properties' | 'organizations'

const entityEndpoints: Record<Entity, string> = {
  contacts: 'contacts',
  businesses: 'businesses',
  properties: 'properties',
  organizations: 'organizations',
}

const entityFields: Record<Entity, string[]> = {
  contacts: [
    'name',
    'first_name',
    'last_name',
    'email',
    'phone',
    'cell_phone',
    'contact_type',
    'organization_name',
    'property_address',
    'created_at',
    'updated_at',
  ],
  organizations: [
    'name',
    'email',
    'phone',
    'address',
    'category',
    'status',
    'description',
    'website',
    'created_at',
    'updated_at',
  ],
  properties: [
    'name',
    'address',
    'category',
    'owner',
    'property_class',
    'status',
    'total_bldg_area',
    'lot_area_total',
    'created_at',
    'updated_at',
  ],
  businesses: [
    'name',
    'address',
    'email',
    'phone',
    'category',
    'status',
    'organization_name',
    'lease_start',
    'lease_expiration',
    'created_at',
    'updated_at',
  ],
}

/**
 * Fetches entity records from Ginkgo API with pagination
 * @param apiBaseUrl - Base URL for Ginkgo API
 * @param companyId - Community ID
 * @param entity - Entity type to fetch
 * @param apiKey - Decrypted API key (not logged)
 * @returns Array of entity records
 */
async function fetchEntityRecords(
  apiBaseUrl: string,
  companyId: number,
  entity: Entity,
  apiKey: string
): Promise<any[]> {
  const records: any[] = []
  let page = 1
  const perPage = 20
  let hasMore = true

  const fields = entityFields[entity].join(',')
  const endpoint = entityEndpoints[entity]

  while (hasMore) {
    const url = new URL(`${apiBaseUrl}/community/${companyId}/${endpoint}`)

    // Add location filter (global bounds to get all records)
    url.searchParams.append('location[lon]', '0')
    url.searchParams.append('location[lat]', '0')
    url.searchParams.append('location[radius]', '1000000000000000000000000000000000000')

    // Add pagination
    url.searchParams.append('page', page.toString())
    url.searchParams.append('per_page', perPage.toString())

    // Add sorting and field selection
    url.searchParams.append('order_by', 'updated_at')
    url.searchParams.append('fields', fields)

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'X-API-KEY': apiKey,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API credentials for Ginkgo API')
        }
        if (response.status === 404) {
          throw new Error(`Entity endpoint not found: ${endpoint}`)
        }
        throw new Error(`Ginkgo API returned HTTP ${response.status}`)
      }

      const data = await response.json()

      // Handle different response formats
      let recordArray: any[] = []
      if (Array.isArray(data)) {
        recordArray = data
      } else if (data && typeof data === 'object') {
        // Try common response wrappers
        recordArray = data.data || data.records || data[endpoint] || []
      }

      if (Array.isArray(recordArray) && recordArray.length > 0) {
        records.push(...recordArray)

        // Check if there are more pages
        if (recordArray.length < perPage) {
          hasMore = false
        }
        page++
      } else {
        hasMore = false
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to fetch from Ginkgo API')
    }
  }

  return records
}

/**
 * Fetches all specified entities from Ginkgo API for a tenant
 * - Decrypts tenant API key
 * - Fetches entities with pagination
 * - Returns all records keyed by entity type
 * - Does not log secrets
 * - Throws informative errors
 *
 * @param tenantId - Tenant ID from database
 * @param entities - Array of entity types to fetch
 * @returns Object with entity names as keys and arrays of records as values
 * @throws Error with safe message if operation fails
 */
export async function fetchAllEntities(
  tenantId: string,
  entities: Entity[]
): Promise<Record<Entity, any[]>> {
  try {
    // Fetch tenant from database
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    })

    if (!tenant) {
      throw new Error('Tenant not found')
    }

    // Decrypt API key
    let apiKey: string
    try {
      apiKey = decrypt(tenant.apiKeyCiphertext)
    } catch {
      throw new Error('Failed to decrypt API credentials')
    }

    // Initialize result object
    const result: Record<Entity, any[]> = {
      contacts: [],
      businesses: [],
      properties: [],
      organizations: [],
    }

    // Fetch each entity type
    for (const entity of entities) {
      try {
        const records = await fetchEntityRecords(
          tenant.apiBaseUrl,
          tenant.companyId,
          entity,
          apiKey
        )
        result[entity] = records
      } catch (error) {
        // Log error message safely (without exposing API details)
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        console.error(`Failed to fetch ${entity}: ${errorMsg}`)

        // Continue with other entities, set empty array for this one
        result[entity] = []
      }
    }

    return result
  } catch (error) {
    const safeMessage = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to fetch entities: ${safeMessage}`)
  } finally {
    await prisma.$disconnect()
  }
}
