import 'server-only'
import crypto from 'crypto'

export type TelegramWebAppUser = {
  id: number
  username?: string
  first_name?: string
  last_name?: string
  photo_url?: string
}

export type ParsedTelegramInitData = {
  user: TelegramWebAppUser
  authDate: number | null
  queryId: string | null
  raw: string
}

function getBotToken(): string {
  const value = process.env.TELEGRAM_BOT_TOKEN
  if (!value) {
    throw new Error('Missing environment variable: TELEGRAM_BOT_TOKEN')
  }
  return value
}

function buildDataCheckString(params: URLSearchParams): string {
  const pairs: string[] = []

  for (const [key, value] of params.entries()) {
    if (key === 'hash') continue
    pairs.push(`${key}=${value}`)
  }

  return pairs.sort().join('\n')
}

function buildSecretKey(botToken: string): Buffer {
  return crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest()
}

function isHashValid(initData: string, botToken: string): boolean {
  const params = new URLSearchParams(initData)
  const receivedHash = params.get('hash')

  if (!receivedHash) {
    return false
  }

  const dataCheckString = buildDataCheckString(params)
  const secretKey = buildSecretKey(botToken)

  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex')

  try {
    return crypto.timingSafeEqual(
      Buffer.from(calculatedHash, 'hex'),
      Buffer.from(receivedHash, 'hex')
    )
  } catch {
    return false
  }
}

export function parseAndValidateTelegramInitData(
  initData: string
): ParsedTelegramInitData {
  if (!initData || typeof initData !== 'string') {
    throw new Error('initData is required')
  }

  const botToken = getBotToken()

  if (!isHashValid(initData, botToken)) {
    throw new Error('Invalid Telegram initData hash')
  }

  const params = new URLSearchParams(initData)
  const userRaw = params.get('user')

  if (!userRaw) {
    throw new Error('Telegram initData does not contain user')
  }

  let user: TelegramWebAppUser
  try {
    user = JSON.parse(userRaw) as TelegramWebAppUser
  } catch {
    throw new Error('Telegram user payload is invalid JSON')
  }

  if (!user?.id) {
    throw new Error('Telegram user id is missing')
  }

  const authDateRaw = params.get('auth_date')
  const authDate = authDateRaw ? Number(authDateRaw) : null

  if (authDate && Number.isFinite(authDate)) {
    const now = Math.floor(Date.now() / 1000)
    const maxAgeSeconds = 60 * 60 * 24 // 24h

    if (now - authDate > maxAgeSeconds) {
      throw new Error('Telegram initData is too old')
    }
  }

  return {
    user,
    authDate,
    queryId: params.get('query_id'),
    raw: initData,
  }
}

export function buildDisplayName(user: TelegramWebAppUser): string {
  const first = user.first_name?.trim() ?? ''
  const last = user.last_name?.trim() ?? ''
  const combined = `${first} ${last}`.trim()

  if (combined) return combined
  if (user.username?.trim()) return user.username.trim()

  return `Telegram user ${user.id}`
}