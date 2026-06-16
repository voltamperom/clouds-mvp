import { NextRequest, NextResponse } from 'next/server'

const BOT_TOKEN = process.env.RIDDLEQUEST_BOT_TOKEN

async function sendTelegramMessage(chatId: number, text: string) {
  if (!BOT_TOKEN) {
    throw new Error('RIDDLEQUEST_BOT_TOKEN is not set')
  }

  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Сыграем?',
              callback_data: 'start_default_riddle',
            },
          ],
        ],
      },
    }),
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`Telegram error: ${errorText}`)
  }
}

export async function POST(request: NextRequest) {
  try {
    const update = await request.json()

    const message = update.message
    const callbackQuery = update.callback_query

    if (message?.text === '/start') {
      await sendTelegramMessage(
        message.chat.id,
        'У тебя есть Загадка.\n\nРазгадать её можешь только ты.'
      )
    }

    if (callbackQuery?.data === 'start_default_riddle') {
      await sendTelegramMessage(
        callbackQuery.message.chat.id,
        'Беги побегом росток,\n\nвдруг остановись\n\nи увидишь вокруг,\n\nгде загадку ловить.'
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('RiddleQuest bot error:', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    bot: 'riddlequest',
    tokenExists: !!process.env.RIDDLEQUEST_BOT_TOKEN,
  })
}