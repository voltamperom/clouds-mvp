import { NextRequest, NextResponse } from 'next/server'
import { validate, parse } from '@tma.js/init-data-node'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  try {
    const { initData } = await req.json()

    console.log('telegram-auth initData received:', initData)

    if (!initData || typeof initData !== 'string') {
      return NextResponse.json({ error: 'Missing initData' }, { status: 400 })
    }

    validate(initData, process.env.TELEGRAM_BOT_TOKEN!)
    console.log('telegram-auth validate passed')

    const parsed = parse(initData)
    const tgUser = parsed.user

    console.log('telegram-auth parsed user:', tgUser)

    if (!tgUser) {
      return NextResponse.json(
        { error: 'No Telegram user found' },
        { status: 400 }
      )
    }

    const telegramId = String(tgUser.id)
    const displayName =
      tgUser.username ||
      [tgUser.firstName, tgUser.lastName].filter(Boolean).join(' ') ||
      `tg_${tgUser.id}`

    const { data: existingUser, error: existingUserError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('telegram_id', telegramId)
      .maybeSingle()

    if (existingUserError) {
      console.error('existing user lookup error:', existingUserError)
      return NextResponse.json(
        { error: existingUserError.message },
        { status: 500 }
      )
    }

    if (existingUser) {
      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          display_name: displayName,
        })
        .eq('id', existingUser.id)
        .select('*')
        .single()

      if (updateError) {
        console.error('update user error:', updateError)
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        )
      }

      return NextResponse.json({ user: updatedUser })
    }

    const { data: createdUser, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        telegram_id: telegramId,
        display_name: displayName,
      })
      .select('*')
      .single()

    if (insertError) {
      console.error('insert user error:', insertError)
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ user: createdUser })
  } catch (error) {
    console.error('telegram-auth fatal error:', error)

    const message =
      error instanceof Error ? error.message : 'Telegram auth failed'

    return NextResponse.json({ error: message }, { status: 401 })
  }
}