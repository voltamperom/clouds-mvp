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

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabaseAdmin
      .from('projects')
      .select(
        `
        id,
        owner_id,
        title,
        description,
        created_at,
        project_members(count),
        process_lines(count)
      `
      )
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('GET /api/projects error:', error)
      return NextResponse.json(
        { error: 'Failed to load projects' },
        { status: 500 }
      )
    }

    const projects = (data ?? []).map((project: any) => ({
      id: project.id,
      owner_id: project.owner_id,
      title: project.title,
      description: project.description,
      created_at: project.created_at,
      members_count: project.project_members?.[0]?.count ?? 0,
      lines_count: project.process_lines?.[0]?.count ?? 0,
    }))

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('GET /api/projects route error:', error)
    return NextResponse.json(
      { error: 'Failed to load projects' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const title = body?.title?.trim()
    const description = body?.description?.trim() ?? ''

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert({
        owner_id: userId,
        title,
        description,
      })
      .select('*')
      .single()

    if (error || !data) {
      console.error('POST /api/projects error:', error)
      return NextResponse.json(
        { error: 'Failed to create project' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, project: data }, { status: 201 })
  } catch (error) {
    console.error('POST /api/projects route error:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}