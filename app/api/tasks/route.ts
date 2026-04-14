import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getRequestUser } from '@/lib/request-user'

export async function GET() {
  const user = await getRequestUser()

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const { data: tasks, error } = await supabaseAdmin
    .from('tasks')
    .select('*')
    .or(`creator_id.eq.${user.id},assignee_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const creatorIds = Array.from(
    new Set((tasks ?? []).map((task) => task.creator_id).filter(Boolean))
  )

  const assigneeIds = Array.from(
    new Set((tasks ?? []).map((task) => task.assignee_id).filter(Boolean))
  )

  const userIds = Array.from(new Set([...creatorIds, ...assigneeIds]))

  let usersMap = new Map<string, { id: string; display_name: string }>()

  if (userIds.length > 0) {
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, display_name')
      .in('id', userIds)

    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 500 })
    }

    usersMap = new Map(
      (users ?? []).map((user) => [
        user.id,
        { id: user.id, display_name: user.display_name },
      ])
    )
  }

  const enrichedTasks = (tasks ?? []).map((task) => ({
    ...task,
    creator_name: usersMap.get(task.creator_id)?.display_name ?? 'Unknown user',
    assignee_name: task.assignee_id
      ? usersMap.get(task.assignee_id)?.display_name ?? 'Unknown user'
      : null,
  }))

  return NextResponse.json({ tasks: enrichedTasks })
}

export async function POST(req: NextRequest) {
  const user = await getRequestUser()

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const body = await req.json()

  const {
    line_id,
    project_id,
    title,
    description,
    deadline_at,
    reward_cash,
    reward_project_points,
    competency_category,
    competency_subtype,
    expected_result,
    result_destination_link,
  } = body

  if (!title || typeof title !== 'string' || !title.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  const { data: task, error } = await supabaseAdmin
    .from('tasks')
    .insert({
      line_id,
      project_id,
      creator_id: user.id,
      title: title.trim(),
      description: description || null,
      deadline_at: deadline_at || null,
      reward_cash: Number(reward_cash) || 0,
      reward_project_points: Number(reward_project_points) || 0,
      competency_category: competency_category || null,
      competency_subtype: competency_subtype || null,
      expected_result: expected_result || null,
      result_destination_link: result_destination_link || null,
    })
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    task: {
      ...task,
      creator_name: user.display_name,
      assignee_name: null,
    },
  })
}