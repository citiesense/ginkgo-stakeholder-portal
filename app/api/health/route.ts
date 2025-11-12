import { NextRequest, NextResponse } from 'next/server'
import { handleCorsPreflights, applyCorsHeaders, CORS_CONFIG } from '@/lib/cors'

export async function GET(request: NextRequest) {
  const response = NextResponse.json({ ok: true })
  return applyCorsHeaders(response, request.headers.get('origin'), CORS_CONFIG.public)
}

export async function OPTIONS(request: NextRequest) {
  // Handle CORS preflight
  const corsResponse = handleCorsPreflights(request, CORS_CONFIG.public)
  return corsResponse || new NextResponse(null, { status: 405 })
}
