import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const BOT_TOKEN = process.env.RIDDLEQUEST_BOT_TOKEN
const ARTICLE_URL = 'https://dzen.ru/a/YsdHf4J6JFNcU627'
const BOT_USERNAME = 'riddlequestbot'

type UserState =
  | 'WAIT_PASSWORD'
  | 'WAIT_FIRST_VOICE'
  | 'WAIT_PHOTO'
  | 'WAIT_ABUNDANCE_ANSWER'
  | 'WAIT_DREAM_VOICE'
  | 'COMPLETED'
  | 'TERMINAL'
  | 'CREATE_RIDDLE_TITLE'
  | 'CREATE_RIDDLE_TEXT'
  | 'CREATE_RIDDLE_HINT'
  | 'PLAY_USER_RIDDLE'

const userStates = new Map<number, UserState>()
const draftRiddles = new Map<number, { title?: string; text?: string }>()

async function telegram(method: string, body: unknown) {
  if (!BOT_TOKEN) throw new Error('RIDDLEQUEST_BOT_TOKEN is not set')

  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

async function sendMessage(chatId: number, text: string, replyMarkup?: unknown) {
  return telegram('sendMessage', {
    chat_id: chatId,
    text,
    reply_markup: replyMarkup,
  })
}

async function answerCallback(callbackQueryId: string) {
  return telegram('answerCallbackQuery', {
    callback_query_id: callbackQueryId,
  })
}

function inlineKeyboard(buttons: { text: string; callback_data?: string; url?: string }[][]) {
  return { inline_keyboard: buttons }
}

function terminalKeyboard() {
  return {
    keyboard: [[{ text: '🏠 Терминал' }]],
    resize_keyboard: true,
    is_persistent: true,
  }
}

async function showStart(chatId: number) {
  await sendMessage(
    chatId,
    'У тебя есть Загадка.\n\nРазгадать её можешь только ты.',
    inlineKeyboard([[{ text: 'Сыграем?', callback_data: 'play' }]])
  )
}

async function showTerminal(chatId: number) {
  userStates.set(chatId, 'TERMINAL')

  await sendMessage(
    chatId,
    'Если перестать играть,\nкажется, что праздник закончился.\n\nRDLK: 50\n\n🔓 Создать Загадку\n\n🔓 Приглашение\n\n🔒 Projects\nСоздай Загадку, которую пройдёт хотя бы один человек.',
    terminalKeyboard()
  )

  await sendMessage(
    chatId,
    'Выбери дверь:',
    inlineKeyboard([
      [{ text: '🔓 Создать Загадку', callback_data: 'create_riddle' }],
      [{ text: '🔓 Приглашение', callback_data: 'festival_invite' }],
      [{ text: '🔒 Projects', callback_data: 'projects_locked' }],
    ])
  )
}

async function startCreateRiddle(chatId: number) {
  userStates.set(chatId, 'CREATE_RIDDLE_TITLE')
  draftRiddles.set(chatId, {})
  await sendMessage(chatId, 'Назови свою Загадку.')
}

async function createRiddle(chatId: number, hint: string) {
  const draft = draftRiddles.get(chatId)

  if (!draft?.title || !draft?.text) {
    await sendMessage(chatId, 'Черновик Загадки потерялся. Начни ещё раз.')
    userStates.set(chatId, 'TERMINAL')
    return
  }

  const { data, error } = await supabaseAdmin
    .from('riddles')
    .insert({
      author_chat_id: chatId,
      title: draft.title,
      riddle_text: draft.text,
      hint,
    })
    .select('id')
    .single()

  if (error) throw error

  const link = `https://t.me/${BOT_USERNAME}?start=riddle_${data.id}`

  draftRiddles.delete(chatId)
  userStates.set(chatId, 'TERMINAL')

  await sendMessage(
    chatId,
    `Загадка создана.\n\nСтоимость: -10 RDLK\nОстаток: 40 RDLK\n\nОтправь эту ссылку человеку:\n\n${link}`
  )
}

async function startUserRiddle(chatId: number, riddleId: string, playerName?: string) {
  const { data: riddle, error } = await supabaseAdmin
    .from('riddles')
    .select('*')
    .eq('id', riddleId)
    .single()

  if (error || !riddle) {
    await sendMessage(chatId, 'Эта Загадка не найдена.')
    return
  }

  await supabaseAdmin.from('riddle_progress').insert({
    riddle_id: riddle.id,
    player_chat_id: chatId,
  })

  await sendMessage(
    riddle.author_chat_id,
    `${playerName || 'Кто-то'} начал проходить твою Загадку:\n\n«${riddle.title}»`
  )

  userStates.set(chatId, 'PLAY_USER_RIDDLE')

  await sendMessage(
    chatId,
    `Для тебя оставлена Загадка.\n\n«${riddle.title}»\n\n${riddle.riddle_text}`,
    inlineKeyboard([
      [{ text: 'Подсказка', callback_data: `user_hint_${riddle.id}` }],
      [{ text: 'Завершить Загадку', callback_data: `user_complete_${riddle.id}` }],
    ])
  )
}

export async function POST(request: NextRequest) {
  try {
    const update = await request.json()

    const message = update.message
    const callbackQuery = update.callback_query

    if (callbackQuery) {
      await answerCallback(callbackQuery.id)

      const chatId = callbackQuery.message.chat.id
      const data = callbackQuery.data

      if (data === 'play') {
        userStates.set(chatId, 'WAIT_PASSWORD')
        await sendMessage(chatId, 'Введите пароль.')
      }

      if (data === 'show_hint') {
        await sendMessage(
          chatId,
          '🏃 Беги\n\n🚶 Прогуляйся не спеша\n\n📍 Доедь до любимого места',
          inlineKeyboard([[{ text: 'Я в игре', callback_data: 'im_in_game' }]])
        )
      }

      if (data === 'im_in_game') {
        userStates.set(chatId, 'WAIT_FIRST_VOICE')
        await sendMessage(
          chatId,
          'Запоминай знаки по пути.\n\nНе старайся искать их специально.\n\nПусть они сами тебя найдут.\n\nЭто может быть слово случайного прохожего.\n\nНомер автобуса.\n\nНадпись на стене.\n\nПесня из открытого окна.\n\nПопробуй задавать вопрос реальности.\n\nИ замечать ответы.\n\nФотографируй яркие наблюдения.\n\nОставь голосовое наблюдение.'
        )
      }

      if (data === 'read_article') {
        userStates.set(chatId, 'WAIT_ABUNDANCE_ANSWER')
        await sendMessage(chatId, 'После прочтения ответь:\n\nГде прячется изобилие?')
      }

      if (data === 'dream_step') {
        userStates.set(chatId, 'WAIT_DREAM_VOICE')
        await sendMessage(chatId, 'Какую мечту ты не готов разменять на свою рутину?\n\nОставь голосовое послание.')
      }

      if (data === 'dream_action') {
        userStates.set(chatId, 'COMPLETED')
        await sendMessage(
          chatId,
          'Поздравляем.\n\nТы прошёл Загадку.\n\n+50 RDLK',
          inlineKeyboard([[{ text: 'Подсказка', callback_data: 'final_hint' }]])
        )
      }

      if (data === 'final_hint') {
        await sendMessage(
          chatId,
          'Разгадка кроется там, где будет твой прорыв.\n\nПолный вперёд!',
          inlineKeyboard([[{ text: 'Создать свою Загадку', callback_data: 'open_terminal' }]])
        )
      }

      if (data === 'open_terminal') {
        await showTerminal(chatId)
      }

      if (data === 'create_riddle') {
        await startCreateRiddle(chatId)
      }

      if (data === 'festival_invite') {
        await sendMessage(chatId, 'Otkriće\n\nLightLand Park\nЧерногория\n\nЗдесь откроется приглашение.')
      }

      if (data === 'projects_locked') {
        await sendMessage(chatId, 'Projects закрыты.\n\nЧтобы открыть эту дверь, создай Загадку, которую пройдёт хотя бы один человек.')
      }

      if (data?.startsWith('user_hint_')) {
        const riddleId = data.replace('user_hint_', '')

        const { data: riddle, error } = await supabaseAdmin
          .from('riddles')
          .select('*')
          .eq('id', riddleId)
          .single()

        if (!error && riddle) {
          await sendMessage(chatId, riddle.hint || 'Подсказка пока не оставлена.')
          await sendMessage(riddle.author_chat_id, 'Игрок открыл подсказку в твоей Загадке.')
        }
      }

      if (data?.startsWith('user_complete_')) {
        const riddleId = data.replace('user_complete_', '')

        const { data: riddle, error } = await supabaseAdmin
          .from('riddles')
          .select('*')
          .eq('id', riddleId)
          .single()

        if (!error && riddle) {
          await supabaseAdmin
            .from('riddle_progress')
            .update({ completed_at: new Date().toISOString() })
            .eq('riddle_id', riddleId)
            .eq('player_chat_id', chatId)

          await sendMessage(chatId, 'Ты завершил Загадку.\n\n+10 RDLK')
          await sendMessage(riddle.author_chat_id, 'Твою Загадку прошли до конца.\n\n+20 RDLK')
        }
      }

      return NextResponse.json({ ok: true })
    }

    if (message) {
      const chatId = message.chat.id
      const state = userStates.get(chatId)
      const playerName = message.from?.first_name || message.from?.username

      if (message.text?.startsWith('/start riddle_')) {
        const riddleId = message.text.replace('/start riddle_', '').trim()
        await startUserRiddle(chatId, riddleId, playerName)
        return NextResponse.json({ ok: true })
      }

      if (message.text === '/start') {
        await showStart(chatId)
        return NextResponse.json({ ok: true })
      }

      if (message.text === '🏠 Терминал') {
        await showTerminal(chatId)
        return NextResponse.json({ ok: true })
      }

      if (state === 'CREATE_RIDDLE_TITLE') {
        draftRiddles.set(chatId, { title: message.text })
        userStates.set(chatId, 'CREATE_RIDDLE_TEXT')
        await sendMessage(chatId, 'Теперь напиши текст Загадки.')
        return NextResponse.json({ ok: true })
      }

      if (state === 'CREATE_RIDDLE_TEXT') {
        const draft = draftRiddles.get(chatId) || {}
        draftRiddles.set(chatId, { ...draft, text: message.text })
        userStates.set(chatId, 'CREATE_RIDDLE_HINT')
        await sendMessage(chatId, 'Оставь подсказку для игрока.')
        return NextResponse.json({ ok: true })
      }

      if (state === 'CREATE_RIDDLE_HINT') {
        await createRiddle(chatId, message.text || '')
        return NextResponse.json({ ok: true })
      }

      if (state === 'WAIT_PASSWORD') {
        if (message.text?.trim().toLowerCase() === 'праздник всегда с тобой') {
          await sendMessage(
            chatId,
            'БЕГИ ПО/БЕГОМ РОСТ/ОК\n\nВДРУГ ОСТ/АНОВИСЬ\n\nИ УВИДИШЬ ВО/КРУГ,\n\nГДЕ ЗАГАДКУ ЛОВИТЬ',
            inlineKeyboard([[{ text: 'Подсказать', callback_data: 'show_hint' }]])
          )
        } else {
          await sendMessage(chatId, 'Пароль не подходит.\n\nПопробуй ещё раз.')
        }

        return NextResponse.json({ ok: true })
      }

      if (state === 'WAIT_FIRST_VOICE') {
        if (message.voice) {
          userStates.set(chatId, 'WAIT_PHOTO')
          await sendMessage(chatId, 'Отправь ту фотографию, которая ярче всех показала тебе путь сегодня.')
        } else {
          await sendMessage(chatId, 'Здесь нужно оставить голосовое наблюдение.')
        }

        return NextResponse.json({ ok: true })
      }

      if (state === 'WAIT_PHOTO') {
        if (message.photo) {
          await sendMessage(
            chatId,
            'Замри там, куда ты пришёл.\n\nДыши.\n\nМир настолько полон возможностей, что готов подарить тебе любую из них.\n\nНо заметить это можно только из состояния изобилия.\n\nПопробуй почувствовать его через этот текст.',
            inlineKeyboard([[{ text: 'Прочитать статью', url: ARTICLE_URL }, { text: 'Я прочитал', callback_data: 'read_article' }]])
          )
        } else {
          await sendMessage(chatId, 'Здесь нужно отправить фотографию.')
        }

        return NextResponse.json({ ok: true })
      }

      if (state === 'WAIT_ABUNDANCE_ANSWER') {
        if (message.text) {
          await sendMessage(chatId, 'Ответ принят.', inlineKeyboard([[{ text: 'Продолжить', callback_data: 'dream_step' }]]))
        } else {
          await sendMessage(chatId, 'Здесь нужен текстовый ответ.')
        }

        return NextResponse.json({ ok: true })
      }

      if (state === 'WAIT_DREAM_VOICE') {
        if (message.voice) {
          await sendMessage(
            chatId,
            'Сообщение сохранено.\n\nМы напомним тебе об этом через год.',
            inlineKeyboard([[{ text: 'Сделать шаг на пути к мечте', callback_data: 'dream_action' }]])
          )
        } else {
          await sendMessage(chatId, 'Здесь нужно оставить голосовое послание.')
        }

        return NextResponse.json({ ok: true })
      }

      await sendMessage(chatId, 'Напиши /start, чтобы начать Загадку.')
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