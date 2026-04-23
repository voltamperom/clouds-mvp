import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getSessionCookieName, verifySessionToken } from '@/lib/session'

async function getCurrentUserId(request: NextRequest) {
  const token = request.cookies.get(getSessionCookieName())?.value
  if (!token) return null

  const session = verifySessionToken(token)
  if (!session) return null

  return session.userId
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const userId = await getCurrentUserId(request)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = await context.params

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project id is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('projects')
      .select('id, owner_id, title, description, created_at, updated_at')
      .eq('id', projectId)
      .eq('owner_id', userId)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({ project: data })
  } catch (error) {
    console.error('GET /api/projects/[projectId] route error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load project' },
      { status: 500 }
    )
  }
}