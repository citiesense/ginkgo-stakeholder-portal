import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.ENCRYPTION_KEY || 'dev-secret-change-in-production'

export interface TokenPayload {
  userId: string
  email: string
  role: string
}

export async function createToken(payload: TokenPayload): Promise<string> {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
  })
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload
    return payload
  } catch (error) {
    return null
  }
}

export async function getToken(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  return token || null
}

export async function setToken(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  })
}

export async function clearToken(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('auth_token')
}

export async function getCurrentUser(): Promise<TokenPayload | null> {
  const token = await getToken()
  if (!token) return null
  return verifyToken(token)
}
