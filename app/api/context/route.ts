import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getRequestUser } from '@/lib/request-user'

export async function GET() {
  const user = await getRequestUser()

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const { data: membership, error: membershipError } = await supabaseAdmin
    .from('project_members')
    .select('project_id, role')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (membershipError) {
    return NextResponse.json({ error: membershipError.message }, { status: 500 })
  }

  if (!membership) {
    return NextResponse.json({ error: 'No accessible project found' }, { status: 404 })
  }

  const { data: project, error: projectError } = await supabaseAdmin
    .from('projects')
    .select('id, title, owner_id')
    .eq('id', membership.project_id)
    .single()

  if (projectError || !project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  let { data: line, error: lineError } = await supabaseAdmin
    .from('process_lines')
    .select('id, title, project_id, owner_id, status')
    .eq('project_id', project.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (lineError) {
    return NextResponse.json({ error: lineError.message }, { status: 500 })
  }

  if (!line) {
    const { data: createdLine, error: createLineError } = await supabaseAdmin
      .from('process_lines')
      .insert({
        project_id: project.id,
        owner_id: project.owner_id,
        title: 'Main Line',
        status: 'active',
      })
      .select('id, title, project_id, owner_id, status')
      .single()

    if (createLineError || !createdLine) {
      return NextResponse.json(
        { error: createLineError?.message || 'Failed to create process line' },
        { status: 500 }
      )
    }

    line = createdLine
  }

  return NextResponse.json({ project, line })
}