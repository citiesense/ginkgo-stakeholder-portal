import { NextRequest, NextResponse } from 'next/server'
import { reportVerificationIssue } from '@/lib/actions/verify'
import { z } from 'zod'

const reportSchema = z.object({
  token: z.string().min(1),
  message: z.string().min(1).max(1000),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, message } = reportSchema.parse(body)

    const result = await reportVerificationIssue(token, message)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Report issue error:', error)
    return NextResponse.json(
      { error: 'Failed to report issue' },
      { status: 400 }
    )
  }
}
