'use client'

import { useState } from 'react'

type Step = 0 | 1 | 2 | 3 | 4

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleEnterSeason() {
    try {
      setIsSubmitting(true)

      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        credentials: 'include',
      })

      if (!res.ok) {
        alert('Failed to complete onboarding')
        return
      }

      window.location.href = '/dashboard'
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleNext() {
    setStep((prev) => Math.min(prev + 1, 4) as Step)
  }

  function handleBack() {
    setStep((prev) => Math.max(prev - 1, 0) as Step)
  }

  const steps = [
    {
      eyebrow: 'Season I',
      title: 'The Fork',
      text: 'Welcome to Clouds. This season is about projects, process lines, tasks, XP and contribution.',
    },
    {
      eyebrow: 'Available now',
      title: 'What you can do',
      text: 'Create projects, build process lines, work with tasks, grow XP, and start shaping contribution inside real flows.',
    },
    {
      eyebrow: 'Coming later',
      title: 'What opens next',
      text: 'Season II will bring the Open Market. Future seasons will unlock competency-based access and deeper progression.',
    },
    {
      eyebrow: 'Optional',
      title: 'Read the origin of Clouds',
      text: 'You will later be able to open the story and philosophy behind Clouds. For now, you can enter the system directly.',
    },
    {
      eyebrow: 'Ready',
      title: 'Enter Season I',
      text: 'Your profile is already created from Telegram. Step in and start building inside The Fork.',
    },
  ] as const

  const current = steps[step]
  const isLastStep = step === 4

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '24px',
        background: '#0f1b2d',
        color: '#f3f7ff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24,
          padding: 24,
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            fontSize: 13,
            opacity: 0.7,
            marginBottom: 12,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {current.eyebrow}
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: 32,
            lineHeight: 1.1,
            marginBottom: 16,
          }}
        >
          {current.title}
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: 16,
            lineHeight: 1.6,
            opacity: 0.92,
            marginBottom: 28,
          }}
        >
          {current.text}
        </p>

        <div
          style={{
            display: 'flex',
            gap: 8,
            marginBottom: 24,
          }}
        >
          {steps.map((_, index) => (
            <div
              key={index}
              style={{
                height: 6,
                flex: 1,
                borderRadius: 999,
                background:
                  index <= step
                    ? 'rgba(255,255,255,0.95)'
                    : 'rgba(255,255,255,0.14)',
              }}
            />
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'space-between',
          }}
        >
          <button
            onClick={handleBack}
            disabled={step === 0 || isSubmitting}
            style={{
              minWidth: 96,
              padding: '12px 16px',
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'transparent',
              color: '#f3f7ff',
              opacity: step === 0 ? 0.4 : 1,
              cursor: step === 0 ? 'default' : 'pointer',
            }}
          >
            Back
          </button>

          {!isLastStep ? (
            <button
              onClick={handleNext}
              style={{
                minWidth: 96,
                padding: '12px 16px',
                borderRadius: 14,
                border: 'none',
                background: '#f3f7ff',
                color: '#0f1b2d',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleEnterSeason}
              disabled={isSubmitting}
              style={{
                minWidth: 140,
                padding: '12px 16px',
                borderRadius: 14,
                border: 'none',
                background: '#f3f7ff',
                color: '#0f1b2d',
                fontWeight: 600,
                cursor: isSubmitting ? 'default' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? 'Entering...' : 'Enter Season I'}
            </button>
          )}
        </div>
      </div>
    </main>
  )
}