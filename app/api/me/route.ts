import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getSessionCookieName, verifySessionToken } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(getSessionCookieName())?.value

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const session = verifySessionToken(token)

    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', session.userId)
      .single()

    if (error || !user) {
      console.error('/api/me select error:', error)
      return NextResponse.json({ user: null }, { status: 401 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('/api/me route error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch current user' },
      { status: 500 }
    )
  }
}