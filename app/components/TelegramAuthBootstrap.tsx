'use client'

import { useEffect } from 'react'

type Props = {
  onAuthed: (userId: string) => void
  onFailed: () => void
}

export default function TelegramAuthBootstrap({
  onAuthed,
  onFailed,
}: Props) {
  useEffect(() => {
    const run = async () => {
      try {
        const tg = (window as any).Telegram?.WebApp

        console.log('Telegram WebApp object:', tg)

        if (!tg) {
          console.error('Telegram WebApp is missing')
          onFailed()
          return
        }

        const rawInitData = tg.initData

        console.log('Telegram initData:', rawInitData)

        if (!rawInitData) {
          console.error('Telegram initData is empty')
          onFailed()
          return
        }

        const res = await fetch('/api/telegram-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData: rawInitData }),
        })

        const json = await res.json()

        console.log('telegram-auth response:', json)

        if (res.ok && json.user?.id) {
          onAuthed(json.user.id)
        } else {
          console.error('telegram-auth failed:', json)
          onFailed()
        }
      } catch (e) {
        console.error('Telegram bootstrap error:', e)
        onFailed()
      }
    }

    run()
  }, [onAuthed, onFailed])

  return null
}