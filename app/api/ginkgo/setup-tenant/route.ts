import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { encrypt } from '@/lib/encrypt'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { communityId, apiKey, apiBaseUrl, tenantName } = body

    if (!communityId || !apiKey || !apiBaseUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Encrypt the API key
    const encryptedApiKey = encrypt(apiKey)

    // Check if tenant already exists with this company ID
    const existingTenant = await prisma.tenant.findFirst({
      where: { companyId: parseInt(communityId) },
    })

    if (existingTenant) {
      return NextResponse.json(
        {
          success: true,
          tenantId: existingTenant.id,
          message: 'Using existing tenant configuration',
        },
        { status: 200 }
      )
    }

    // Create new tenant
    const tenant = await prisma.tenant.create({
      data: {
        companyId: parseInt(communityId),
        name: tenantName || `Community ${communityId}`,
        apiBaseUrl,
        apiKeyCiphertext: encryptedApiKey,
      },
    })

    return NextResponse.json(
      {
        success: true,
        tenantId: tenant.id,
        message: 'Tenant created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Setup tenant error:', error)
    return NextResponse.json(
      { error: 'Failed to set up tenant' },
      { status: 500 }
    )
  }
}
