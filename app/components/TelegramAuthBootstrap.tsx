'use client'

import { useEffect, useState } from 'react'
import CloudsLoader from './CloudsLoader'

type AuthState = 'idle' | 'loading' | 'error'

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
    let cancelled = false

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

        if (cancelled) return

        if (!meData.user.has_completed_onboarding) {
          window.location.href = '/onboarding'
          return
        }

        window.location.href = '/dashboard'
      } catch (err) {
        if (cancelled) return

        const message =
          err instanceof Error ? err.message : 'Something went wrong'

        setError(message)
        setState('error')
      }
    }

    bootstrap()

    return () => {
      cancelled = true
    }
  }, [])

  if (state === 'idle' || state === 'loading') {
    return <CloudsLoader />
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background:
          'radial-gradient(circle at top, rgba(37,99,235,0.12) 0%, rgba(15,23,42,0) 28%), linear-gradient(180deg, #081224 0%, #0b1730 100%)',
        color: '#eef4ff',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24,
          padding: 20,
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 10,
            letterSpacing: '-0.03em',
          }}
        >
          Connection error
        </div>

        <div
          style={{
            fontSize: 15,
            lineHeight: 1.6,
            color: 'rgba(238,244,255,0.78)',
          }}
        >
          {error || 'Authentication error'}
        </div>
      </div>
    </main>
  )
}