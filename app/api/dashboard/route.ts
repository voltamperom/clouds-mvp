import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getRequestUser } from '@/lib/request-user'

export async function GET() {
  const user = await getRequestUser()

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const { count: tasksCreatedCount, error: createdError } = await supabaseAdmin
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('creator_id', user.id)

  if (createdError) {
    return NextResponse.json({ error: createdError.message }, { status: 500 })
  }

  const { count: tasksAssignedCount, error: assignedError } = await supabaseAdmin
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('assignee_id', user.id)

  if (assignedError) {
    return NextResponse.json({ error: assignedError.message }, { status: 500 })
  }

  const { count: tasksCompletedCount, error: completedError } = await supabaseAdmin
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('assignee_id', user.id)
    .not('completed_at', 'is', null)

  if (completedError) {
    return NextResponse.json({ error: completedError.message }, { status: 500 })
  }

  const { data: recentTasks, error: recentError } = await supabaseAdmin
    .from('tasks')
    .select('*')
    .or(`creator_id.eq.${user.id},assignee_id.eq.${user.id}`)
    .order('created_at', { ascending: false })
    .limit(5)

  if (recentError) {
    return NextResponse.json({ error: recentError.message }, { status: 500 })
  }

  const creatorIds = Array.from(
    new Set((recentTasks ?? []).map((task) => task.creator_id).filter(Boolean))
  )

  const assigneeIds = Array.from(
    new Set((recentTasks ?? []).map((task) => task.assignee_id).filter(Boolean))
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

  const enrichedRecentTasks = (recentTasks ?? []).map((task) => ({
    ...task,
    creator_name: usersMap.get(task.creator_id)?.display_name ?? 'Unknown user',
    assignee_name: task.assignee_id
      ? usersMap.get(task.assignee_id)?.display_name ?? 'Unknown user'
      : null,
  }))

  return NextResponse.json({
    stats: {
      tasks_created: tasksCreatedCount ?? 0,
      tasks_assigned: tasksAssignedCount ?? 0,
      tasks_completed: tasksCompletedCount ?? 0,
    },
    recent_tasks: enrichedRecentTasks,
  })
}