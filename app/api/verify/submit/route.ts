import { NextRequest, NextResponse } from 'next/server'
import { submitVerification } from '@/lib/actions/verify'
import { verifyFormSchema } from '@/lib/validation/verify'
import { verifyFormLimiter, getClientIp, checkRateLimit } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10 requests per minute per IP
    const clientIp = getClientIp(request.headers)
    const { allowed, headers } = checkRateLimit(verifyFormLimiter, clientIp)

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers,
        }
      )
    }

    const body = await request.json()

    // Validate input
    const validatedData = verifyFormSchema.parse(body)

    // Call server action
    const result = await submitVerification(validatedData)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400, headers })
    }

    return NextResponse.json(
      {
        success: true,
        redirectUrl: result.redirectUrl,
      },
      { headers }
    )
  } catch (error) {
    console.error('Verify submit error:', error)
    return NextResponse.json(
      { error: 'Failed to process verification' },
      { status: 400 }
    )
  }
}
