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
    .select('id, creator_id, assignee_id, completed_at')
    .eq('id', taskId)
    .single()

  if (taskError) {
    return NextResponse.json({ error: taskError.message }, { status: 500 })
  }

  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  if (!task.assignee_id) {
    return NextResponse.json(
      { error: 'Task has not been taken yet' },
      { status: 400 }
    )
  }

  if (task.completed_at) {
    return NextResponse.json(
      { error: 'Task is already completed' },
      { status: 400 }
    )
  }

  if (task.assignee_id !== user.id && task.creator_id !== user.id) {
    return NextResponse.json(
      { error: 'You do not have access to complete this task' },
      { status: 403 }
    )
  }

  const { data, error } = await supabaseAdmin
    .from('tasks')
    .update({
      completed_at: new Date().toISOString(),
    })
    .eq('id', taskId)
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ task: data })
}