import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getRequestUser } from '@/lib/request-user'

type Params = {
  params: Promise<{
    taskId: string
  }>
}

export async function POST(_req: Request, { params }: Params) {
  const { taskId } = await params
  const user = await getRequestUser()

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const { data: task, error: taskError } = await supabaseAdmin
    .from('tasks')
    .select('id, creator_id, status')
    .eq('id', taskId)
    .single()

  if (taskError || !task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  if (task.creator_id !== user.id) {
    return NextResponse.json(
      { error: 'Only creator can send task back for revision' },
      { status: 403 }
    )
  }

  if (task.status !== 'in_review') {
    return NextResponse.json(
      { error: 'Task is not in review' },
      { status: 400 }
    )
  }

  const { data, error } = await supabaseAdmin
    .from('tasks')
    .update({
      status: 'needs_revision',
      completed_at: null,
    })
    .eq('id', taskId)
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ task: data })
}