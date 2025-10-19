import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('Please define JWT_SECRET in .env.local')
}

export interface TokenPayload {
  userId: string
  email: string
}

// Генерирует JWT (HS256) — async в соответствии с "jose" API и совместим с edge runtime
export async function generateToken(payload: TokenPayload): Promise<string> {
  const alg = 'HS256'
  const secret = new TextEncoder().encode(JWT_SECRET)

  const jwt = await new SignJWT((payload as unknown) as Record<string, unknown>)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)

  return jwt
}

// Проверяет JWT и возвращает payload
export async function verifyToken(token: string): Promise<TokenPayload> {
  const secret = new TextEncoder().encode(JWT_SECRET)
  const { payload } = await jwtVerify(token, secret)
  return payload as unknown as TokenPayload
}

export function getTokenFromHeaders(headers: Headers): string | null {
  const authHeader = headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.slice(7)
}