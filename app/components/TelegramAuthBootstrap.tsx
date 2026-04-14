'use client'

import { useEffect, useRef } from 'react'

type Props = {
  onAuthed: (userId: string) => void
  onFailed: (reason?: string) => void
}

export default function TelegramAuthBootstrap({
  onAuthed,
  onFailed,
}: Props) {
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    let cancelled = false

    const waitForTelegram = async () => {
      const startedAt = Date.now()
      const timeoutMs = 8000

      while (!cancelled && Date.now() - startedAt < timeoutMs) {
        const tg = (window as any).Telegram?.WebApp
        const initData = tg?.initData

        if (tg && initData) {
          try {
            const res = await fetch('/api/telegram-auth', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ initData }),
            })

            const json = await res.json()

            if (res.ok && json.user?.id) {
              onAuthed(json.user.id)
              return
            }

            onFailed(json.error || `telegram-auth failed (${res.status})`)
            return
          } catch (error) {
            onFailed(
              error instanceof Error
                ? error.message
                : 'Telegram bootstrap request failed'
            )
            return
          }
        }

        await new Promise((resolve) => setTimeout(resolve, 300))
      }

      const tg = (window as any).Telegram?.WebApp

      if (!tg) {
        onFailed('Telegram WebApp is missing')
        return
      }

      if (!tg.initData) {
        onFailed('Telegram initData is empty')
        return
      }

      onFailed('Telegram bootstrap timeout')
    }

    waitForTelegram()

    return () => {
      cancelled = true
    }
  }, [])

  return null
}