import { NextRequest, NextResponse } from 'next/server'
import { submitVerification } from '@/lib/actions/verify'
import { verifyFormSchema } from '@/lib/validation/verify'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = verifyFormSchema.parse(body)

    // Call server action
    const result = await submitVerification(validatedData)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      redirectUrl: result.redirectUrl,
    })
  } catch (error) {
    console.error('Verify submit error:', error)
    return NextResponse.json(
      { error: 'Failed to process verification' },
      { status: 400 }
    )
  }
}
