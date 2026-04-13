'use client'

import { useEffect } from 'react'

type Props = {
  onAuthed: (userId: string) => void
  onFailed: (reason?: string) => void
}

export default function TelegramAuthBootstrap({
  onAuthed,
  onFailed,
}: Props) {
  useEffect(() => {
    const run = async () => {
      try {
        const tg = (window as any).Telegram?.WebApp

        if (!tg) {
          onFailed('Telegram WebApp is missing')
          return
        }

        const rawInitData = tg.initData

        if (!rawInitData) {
          onFailed('Telegram initData is empty')
          return
        }

        const res = await fetch('/api/telegram-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData: rawInitData }),
        })

        const json = await res.json()

        if (res.ok && json.user?.id) {
          onAuthed(json.user.id)
        } else {
          onFailed(json.error || 'telegram-auth failed')
        }
      } catch (e) {
        const message =
          e instanceof Error ? e.message : 'Telegram bootstrap error'
        onFailed(message)
      }
    }

    run()
  }, [onAuthed, onFailed])

  return null
}