import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getRequestUser } from '@/lib/request-user'

export async function GET() {
  const user = await getRequestUser()

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  let { data: project, error: projectError } = await supabaseAdmin
    .from('projects')
    .select('id, title, owner_id')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (projectError) {
    return NextResponse.json({ error: projectError.message }, { status: 500 })
  }

  if (!project) {
    const { data: createdProject, error: createProjectError } =
      await supabaseAdmin
        .from('projects')
        .insert({
          owner_id: user.id,
          title: 'My first project',
        })
        .select('id, title, owner_id')
        .single()

    if (createProjectError || !createdProject) {
      return NextResponse.json(
        { error: createProjectError?.message || 'Failed to create project' },
        { status: 500 }
      )
    }

    project = createdProject
  }

  let { data: line, error: lineError } = await supabaseAdmin
    .from('process_lines')
    .select('id, title, project_id, owner_id, status')
    .eq('project_id', project.id)
    .order('created_at', { ascending: false })
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
        owner_id: user.id,
        title: 'Main Line',
        status: 'draft',
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