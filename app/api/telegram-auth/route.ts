import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import {
  buildDisplayName,
  parseAndValidateTelegramInitData,
} from '@/lib/telegram-auth'
import {
  createSessionToken,
  getSessionCookieName,
  getSessionMaxAge,
} from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const initData = body?.initData

    if (!initData || typeof initData !== 'string') {
      return NextResponse.json(
        { error: 'initData is required' },
        { status: 400 }
      )
    }

    const parsed = parseAndValidateTelegramInitData(initData)
    const telegramUser = parsed.user

    const payload = {
      telegram_id: telegramUser.id,
      telegram_username: telegramUser.username ?? null,
      telegram_first_name: telegramUser.first_name ?? null,
      telegram_last_name: telegramUser.last_name ?? null,
      display_name: buildDisplayName(telegramUser),
      avatar_url: telegramUser.photo_url ?? null,
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .upsert(payload, {
        onConflict: 'telegram_id',
      })
      .select('*')
      .single()

    if (error || !user) {
      console.error('telegram-auth upsert error:', error)
      return NextResponse.json(
        { error: 'Failed to create or update user' },
        { status: 500 }
      )
    }

    const sessionToken = createSessionToken({
      userId: user.id,
      telegramId: user.telegram_id,
    })

    const response = NextResponse.json({
      ok: true,
      user,
    })

    response.cookies.set({
      name: getSessionCookieName(),
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: getSessionMaxAge(),
    })

    return response
  } catch (error) {
    console.error('telegram-auth route error:', error)

    const message =
      error instanceof Error ? error.message : 'Authentication failed'

    return NextResponse.json({ error: message }, { status: 401 })
  }
}