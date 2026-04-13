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

        if (!tg) {
          onFailed()
          return
        }

        const rawInitData = tg.initData

        if (!rawInitData) {
          onFailed()
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