import { NextRequest, NextResponse } from 'next/server'
import { parse } from '@tma.js/init-data-node'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  try {
    const { initData } = await req.json()

    if (!initData || typeof initData !== 'string') {
      return NextResponse.json({ error: 'Missing initData' }, { status: 400 })
    }

    const parsed = parse(initData)
    const tgUser = parsed.user

    if (!tgUser) {
      return NextResponse.json(
        { error: 'No Telegram user found in initData' },
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
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ user: createdUser })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Telegram auth failed'

    return NextResponse.json({ error: message }, { status: 401 })
  }
}