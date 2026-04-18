import 'server-only'
import crypto from 'crypto'

const SESSION_COOKIE_NAME = 'clouds_session'
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30 // 30 days

export type SessionPayload = {
  userId: string
  telegramId: number
  exp: number
}

function getSessionSecret(): string {
  const value = process.env.APP_SESSION_SECRET
  if (!value) {
    throw new Error('Missing environment variable: APP_SESSION_SECRET')
  }
  return value
}

function base64UrlEncode(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function base64UrlDecode(input: string): string {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
  return Buffer.from(padded, 'base64').toString('utf8')
}

function sign(value: string): string {
  return base64UrlEncode(
    crypto.createHmac('sha256', getSessionSecret()).update(value).digest()
  )
}

export function createSessionToken(data: {
  userId: string
  telegramId: number
}): string {
  const payload: SessionPayload = {
    userId: data.userId,
    telegramId: data.telegramId,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  }

  const payloadEncoded = base64UrlEncode(JSON.stringify(payload))
  const signature = sign(payloadEncoded)

  return `${payloadEncoded}.${signature}`
}

export function verifySessionToken(token: string): SessionPayload | null {
  const [payloadEncoded, signature] = token.split('.')

  if (!payloadEncoded || !signature) {
    return null
  }

  const expectedSignature = sign(payloadEncoded)
  const signatureBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expectedSignature)

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null
  }

  try {
    const payload = JSON.parse(base64UrlDecode(payloadEncoded)) as SessionPayload

    if (!payload.userId || !payload.telegramId || !payload.exp) {
      return null
    }

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

export function getSessionCookieName(): string {
  return SESSION_COOKIE_NAME
}

export function getSessionMaxAge(): number {
  return SESSION_TTL_SECONDS
}