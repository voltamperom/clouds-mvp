import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getRequestUser } from '@/lib/request-user'

type Params = {
  params: Promise<{
    taskId: string
  }>
}

export async function POST(req: NextRequest, { params }: Params) {
  const { taskId } = await params
  const user = await getRequestUser()

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const body = await req.json().catch(() => ({}))
  const resultDestinationLink =
    typeof body.result_destination_link === 'string'
      ? body.result_destination_link.trim()
      : null

  const { data: task, error: taskError } = await supabaseAdmin
    .from('tasks')
    .select('id, creator_id, assignee_id, status')
    .eq('id', taskId)
    .single()

  if (taskError || !task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  if (task.assignee_id !== user.id) {
    return NextResponse.json(
      { error: 'Only assignee can submit task for review' },
      { status: 403 }
    )
  }

  if (!['in_progress', 'needs_revision'].includes(task.status)) {
    return NextResponse.json(
      { error: 'Task is not ready for review submission' },
      { status: 400 }
    )
  }

  const { data, error } = await supabaseAdmin
    .from('tasks')
    .update({
      status: 'in_review',
      result_destination_link: resultDestinationLink || null,
    })
    .eq('id', taskId)
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ task: data })
}