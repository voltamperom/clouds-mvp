import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getSessionCookieName, verifySessionToken } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(getSessionCookieName())?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = verifySessionToken(token)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update({ has_completed_onboarding: true })
      .eq('id', session.userId)
      .select('*')
      .single()

    if (error || !user) {
      console.error('/api/onboarding/complete update error:', error)
      return NextResponse.json(
        { error: 'Failed to complete onboarding' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      user,
    })
  } catch (error) {
    console.error('/api/onboarding/complete route error:', error)
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    )
  }
}