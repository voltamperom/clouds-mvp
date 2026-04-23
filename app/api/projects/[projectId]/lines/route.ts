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

    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('owner_id', userId)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const { data, error } = await supabaseAdmin
      .from('process_lines')
      .select('id, project_id, owner_id, title, description, status, created_at')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: error.message || 'Failed to load lines' },
        { status: 500 }
      )
    }

    return NextResponse.json({ lines: data ?? [] })
  } catch (error) {
    console.error('GET /api/projects/[projectId]/lines route error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load lines' },
      { status: 500 }
    )
  }
}

export async function POST(
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

    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('owner_id', userId)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const body = await request.json().catch(() => null)
    const title = body?.title?.trim()
    const description = body?.description?.trim() ?? ''

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('process_lines')
      .insert({
        project_id: projectId,
        owner_id: userId,
        title,
        description,
      })
      .select('*')
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || 'Failed to create line' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, line: data }, { status: 201 })
  } catch (error) {
    console.error('POST /api/projects/[projectId]/lines route error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create line' },
      { status: 500 }
    )
  }
}