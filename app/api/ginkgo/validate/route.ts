import { NextRequest, NextResponse } from 'next/server'

type Entity = 'contacts' | 'businesses' | 'properties'

const entityEndpoints: Record<Entity, string> = {
  contacts: 'contacts',
  businesses: 'businesses',
  properties: 'properties',
}

const entityFields: Record<Entity, string[]> = {
  contacts: ['email', 'name', 'contact_type'],
  businesses: ['name', 'email', 'category'],
  properties: ['name', 'address'],
}

async function getEntityCount(
  apiBaseUrl: string,
  companyId: string,
  entity: Entity,
  apiKey: string
): Promise<number> {
  try {
    const fields = entityFields[entity].join(',')
    const endpoint = entityEndpoints[entity]

    const url = new URL(`${apiBaseUrl}/community/${companyId}/${endpoint}`)

    // Add location filter (global bounds)
    url.searchParams.append('location[lon]', '0')
    url.searchParams.append('location[lat]', '0')
    url.searchParams.append('location[radius]', '1000000000000000000000000000000000000')

    // Get only first page to check if records exist
    url.searchParams.append('page', '1')
    url.searchParams.append('per_page', '1')
    url.searchParams.append('order_by', 'updated_at')
    url.searchParams.append('fields', fields)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-API-KEY': apiKey,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API credentials')
      }
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()

    // Parse response to get total count
    let recordArray: any[] = []
    if (Array.isArray(data)) {
      recordArray = data
    } else if (data && typeof data === 'object') {
      recordArray = data.data || data.records || data[endpoint] || []
    }

    // For pagination info, check response headers or return length
    const totalCount = data.total || data.count || recordArray.length || 0
    return totalCount > 0 ? totalCount : recordArray.length
  } catch (error) {
    console.error(`Error fetching ${entity} count:`, error)
    return 0
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { communityId, apiKey, apiBaseUrl } = body

    if (!communityId || !apiKey || !apiBaseUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: communityId, apiKey, apiBaseUrl' },
        { status: 400 }
      )
    }

    // Validate Community ID is numeric
    if (isNaN(parseInt(communityId))) {
      return NextResponse.json(
        { error: 'Community ID must be a number' },
        { status: 400 }
      )
    }

    // Test the credentials by fetching counts
    const [contactCount, businessCount, propertyCount] = await Promise.all([
      getEntityCount(apiBaseUrl, communityId, 'contacts', apiKey),
      getEntityCount(apiBaseUrl, communityId, 'businesses', apiKey),
      getEntityCount(apiBaseUrl, communityId, 'properties', apiKey),
    ])

    return NextResponse.json(
      {
        success: true,
        counts: {
          contacts: contactCount,
          businesses: businessCount,
          properties: propertyCount,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json(
      { error: 'Failed to validate Ginkgo credentials' },
      { status: 500 }
    )
  }
}
