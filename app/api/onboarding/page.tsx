'use client'

export default function OnboardingPage() {
  async function handleComplete() {
    const res = await fetch('/api/onboarding/complete', {
      method: 'POST',
      credentials: 'include',
    })

    if (!res.ok) {
      alert('Failed to complete onboarding')
      return
    }

    window.location.href = '/dashboard'
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Welcome to Season I – The Fork</h1>
      <p>Projects, lines, tasks, XP and contribution.</p>
      <button onClick={handleComplete}>Enter Season I</button>
    </main>
  )
}