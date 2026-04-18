'use client'

import { useEffect, useState } from 'react'

type AuthState = 'idle' | 'loading' | 'authenticated' | 'error'

type MeResponse = {
  user?: {
    id: string
    display_name: string
    telegram_username: string | null
    has_completed_onboarding: boolean
  } | null
  error?: string
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData?: string
        ready?: () => void
        expand?: () => void
      }
    }
  }
}

export default function TelegramAuthBootstrap() {
  const [state, setState] = useState<AuthState>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function bootstrap() {
      try {
        setState('loading')
        setError(null)

        const telegram = window.Telegram?.WebApp
        telegram?.ready?.()
        telegram?.expand?.()

        const initData = telegram?.initData

        if (!initData) {
          throw new Error(
            'Could not connect to Telegram. Please reopen the app from CloudsFlowBot.'
          )
        }

        const authRes = await fetch('/api/telegram-auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ initData }),
        })

        const authData = await authRes.json()

        if (!authRes.ok) {
          throw new Error(authData?.error || 'Telegram auth failed')
        }

        const meRes = await fetch('/api/me', {
          method: 'GET',
          credentials: 'include',
        })

        const meData: MeResponse = await meRes.json()

        if (!meRes.ok || !meData.user) {
          throw new Error(meData?.error || 'Failed to fetch current user')
        }

        setState('authenticated')

        if (!meData.user.has_completed_onboarding) {
          window.location.href = '/onboarding'
          return
        }

        window.location.href = '/dashboard'
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Something went wrong'
        setError(message)
        setState('error')
      }
    }

    bootstrap()
  }, [])

  if (state === 'loading' || state === 'idle') {
    return <div>Connecting to Telegram...</div>
  }

  if (state === 'error') {
    return <div>{error || 'Authentication error'}</div>
  }

  return <div>Opening Clouds...</div>
}