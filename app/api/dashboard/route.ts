import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { DEMO_TELEGRAM_ID } from '@/lib/mock-auth'

export async function GET() {
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('telegram_id', DEMO_TELEGRAM_ID)
    .single()

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const { data: tasks } = await supabaseAdmin
    .from('tasks')
    .select('*')
    .or(`creator_id.eq.${user.id},assignee_id.eq.${user.id}`)

  const { data: points } = await supabaseAdmin
    .from('project_points_ledger')
    .select('points_amount')
    .eq('user_id', user.id)

  const totalProjectPoints =
    points?.reduce((sum, row) => sum + Number(row.points_amount || 0), 0) || 0

  const burningNow =
    tasks
      ?.filter((task) => task.status !== 'completed')
      .sort((a, b) => {
        const order = { overdue: 0, warning: 1, normal: 2 }
        return (
          order[a.urgency_state as keyof typeof order] -
          order[b.urgency_state as keyof typeof order]
        )
      })
      .slice(0, 10) || []

  const ongoingTasks = tasks?.filter((t) => t.status !== 'completed').length || 0

  return NextResponse.json({
    user,
    stats: {
      xp: user.xp_total,
      completedTasks: user.completed_tasks_count,
      completedLines: user.completed_lines_count,
      earnedMoney: user.earned_money_total,
      totalProjectPoints,
      ongoingTasks,
    },
    burningNow,
  })
}