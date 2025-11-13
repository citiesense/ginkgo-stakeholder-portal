import { clearToken } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Clear the auth token
    await clearToken()

    // Return success response
    return NextResponse.json(
      { success: true },
      { status: 200 }
    )
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}
