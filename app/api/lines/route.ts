import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getRequestUser } from '@/lib/request-user'

export async function GET() {
  const user = await getRequestUser()

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const { data: lines, error } = await supabaseAdmin
    .from('process_lines')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ lines: lines ?? [] })
}

export async function POST(req: NextRequest) {
  const user = await getRequestUser()

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const body = await req.json()

  const { project_id, title, status } = body

  if (!project_id || typeof project_id !== 'string') {
    return NextResponse.json(
      { error: 'project_id is required' },
      { status: 400 }
    )
  }

  if (!title || typeof title !== 'string' || !title.trim()) {
    return NextResponse.json(
      { error: 'title is required' },
      { status: 400 }
    )
  }

  const { data: line, error } = await supabaseAdmin
    .from('process_lines')
    .insert({
      project_id,
      owner_id: user.id,
      title: title.trim(),
      status: status || 'draft',
    })
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ line })
}