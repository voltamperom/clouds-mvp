import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getRequestUser } from '@/lib/request-user'

export async function GET() {
  const user = await getRequestUser()

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const { data: project, error: projectError } = await supabaseAdmin
    .from('projects')
    .select('id, title, owner_id')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (projectError || !project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  const { data: line, error: lineError } = await supabaseAdmin
    .from('process_lines')
    .select('id, title, project_id, owner_id, status')
    .eq('project_id', project.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (lineError || !line) {
    return NextResponse.json({ error: 'Process line not found' }, { status: 404 })
  }

  return NextResponse.json({ project, line })
}