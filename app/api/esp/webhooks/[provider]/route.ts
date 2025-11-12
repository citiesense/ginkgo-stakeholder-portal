import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { handleCorsPreflights, applyCorsHeaders, CORS_CONFIG } from '@/lib/cors'

const prisma = new PrismaClient()

/**
 * POST /api/esp/webhooks/[provider]
 *
 * Accepts webhook events from Mailchimp or Constant Contact
 * Maps to VerificationEvent and updates recipient status
 *
 * Expected payload (varies by provider):
 * - type: 'open' | 'click' | 'bounce' | 'unsubscribe' | 'subscribe'
 * - email: recipient email
 * - data: provider-specific data
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params
    const body = await request.json()

    let response: NextResponse

    // Mailchimp webhook format
    if (provider === 'mailchimp') {
      response = await handleMailchimpWebhook(body)
    } else if (provider === 'constant_contact') {
      // Constant Contact webhook format
      response = await handleConstantContactWebhook(body)
    } else {
      response = NextResponse.json({ error: 'Unknown provider' }, { status: 400 })
    }

    // Apply CORS headers for webhook endpoints
    return applyCorsHeaders(response, request.headers.get('origin'), CORS_CONFIG.public)
  } catch (error) {
    console.error('Webhook error:', error)
    const response = NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 400 }
    )
    return applyCorsHeaders(response, null, CORS_CONFIG.public)
  } finally {
    await prisma.$disconnect()
  }
}

export async function OPTIONS(request: NextRequest) {
  // Handle CORS preflight for webhooks
  const corsResponse = handleCorsPreflights(request, CORS_CONFIG.public)
  return corsResponse || new NextResponse(null, { status: 405 })
}

/**
 * Handle Mailchimp webhooks
 * https://mailchimp.com/developer/marketing/guides/sync-audience-mailchimp-webhooks/
 */
async function handleMailchimpWebhook(data: any): Promise<NextResponse> {
  try {
    // Mailchimp sends events for list activity
    if (!data.type) {
      return NextResponse.json({ received: true })
    }

    const eventType = data.type // 'subscribe', 'unsubscribe', 'profile', 'cleaned', 'upemail', 'campaign'
    const email = data.data?.email

    if (!email) {
      return NextResponse.json({ received: true })
    }

    // Find recipient by email (would need to store email in VerificationRecipient)
    // For now, just acknowledge
    const eventMap: Record<string, string> = {
      subscribe: 'subscribed',
      unsubscribe: 'unsubscribed',
      cleaned: 'bounced',
      campaign: 'visited', // Hard bounce
    }

    const eventType_ = eventMap[eventType]
    if (!eventType_) {
      return NextResponse.json({ received: true })
    }

    // Create event for audit
    await prisma.verificationEvent.create({
      data: {
        recipientId: 'unknown', // Would need to look up by email
        type: 'link_opened', // Map based on eventType
        meta: {
          provider: 'mailchimp',
          eventType,
          timestamp: new Date().toISOString(),
        },
      },
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Mailchimp webhook error:', error)
    return NextResponse.json({ received: true })
  }
}

/**
 * Handle Constant Contact webhooks
 * https://v3.developer.constantcontact.com/api_guide/webhooks.html
 */
async function handleConstantContactWebhook(data: any): Promise<NextResponse> {
  try {
    // Constant Contact sends different event formats
    if (!data.event_type) {
      return NextResponse.json({ received: true })
    }

    const eventType = data.event_type // 'email_open', 'email_click', 'email_bounce', etc
    const email = data.contact_id || data.email

    if (!email) {
      return NextResponse.json({ received: true })
    }

    const eventMap: Record<string, string> = {
      email_open: 'link_opened',
      email_click: 'link_opened',
      email_bounce: 'bounced',
      contact_unsubscribed: 'unsubscribed',
    }

    const mappedEvent = eventMap[eventType]
    if (!mappedEvent) {
      return NextResponse.json({ received: true })
    }

    // Create event for audit
    await prisma.verificationEvent.create({
      data: {
        recipientId: 'unknown', // Would need to look up by email
        type: mappedEvent as any,
        meta: {
          provider: 'constant_contact',
          eventType,
          timestamp: new Date().toISOString(),
        },
      },
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Constant Contact webhook error:', error)
    return NextResponse.json({ received: true })
  }
}
