import { NextRequest, NextResponse } from 'next/server'
import { reportVerificationIssue } from '@/lib/actions/verify'
import { verifyReportLimiter, getClientIp, checkRateLimit } from '@/lib/rateLimit'
import { z } from 'zod'

const reportSchema = z.object({
  token: z.string().min(1),
  message: z.string().min(1).max(1000),
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 requests per minute per IP
    const clientIp = getClientIp(request.headers)
    const { allowed, headers } = checkRateLimit(verifyReportLimiter, clientIp)

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
    const { token, message } = reportSchema.parse(body)

    const result = await reportVerificationIssue(token, message)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400, headers })
    }

    return NextResponse.json({ success: true }, { headers })
  } catch (error) {
    console.error('Report issue error:', error)
    return NextResponse.json(
      { error: 'Failed to report issue' },
      { status: 400 }
    )
  }
}
