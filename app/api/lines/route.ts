import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { DEMO_TELEGRAM_ID } from '@/lib/mock-auth'

export async function GET() {
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('telegram_id', DEMO_TELEGRAM_ID)
    .single()

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const { data: ownedLines, error: ownedError } = await supabaseAdmin
    .from('process_lines')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  const { data: invitedLinks, error: invitedError } = await supabaseAdmin
    .from('line_participants')
    .select('line_id, role, visibility_mode, status')
    .eq('user_id', user.id)

  if (ownedError || invitedError) {
    return NextResponse.json(
      { error: ownedError?.message || invitedError?.message },
      { status: 500 }
    )
  }

  const invitedLineIds = invitedLinks?.map((x) => x.line_id) || []

  let invitedLines: any[] = []
  if (invitedLineIds.length > 0) {
    const { data } = await supabaseAdmin
      .from('process_lines')
      .select('*')
      .in('id', invitedLineIds)
      .order('created_at', { ascending: false })

    invitedLines = data || []
  }

  return NextResponse.json({
    myLines: ownedLines || [],
    invitedLines,
    invitedMeta: invitedLinks || [],
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  const { title, description, projectTitle, projectDescription } = body

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('telegram_id', DEMO_TELEGRAM_ID)
    .single()

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const { data: project, error: projectError } = await supabaseAdmin
    .from('projects')
    .insert({
      owner_id: user.id,
      title: projectTitle || title,
      description: projectDescription || null,
    })
    .select('*')
    .single()

  if (projectError) {
    return NextResponse.json({ error: projectError.message }, { status: 500 })
  }

  const { data: line, error: lineError } = await supabaseAdmin
    .from('process_lines')
    .insert({
      project_id: project.id,
      owner_id: user.id,
      title,
      description: description || null,
      status: 'draft',
      progress_percent: 0,
    })
    .select('*')
    .single()

  if (lineError) {
    return NextResponse.json({ error: lineError.message }, { status: 500 })
  }

  return NextResponse.json({ line, project })
}