'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import TelegramAuthBootstrap from './components/TelegramAuthBootstrap'

type Task = {
  id: string
  line_id: string
  project_id: string
  creator_id: string
  assignee_id: string | null
  creator_name: string
  assignee_name: string | null
  title: string
  description: string | null
  reward_cash: number
  reward_project_points: number
  completed_at?: string | null
  created_at?: string
}

type CurrentUser = {
  id: string
  display_name: string
  telegram_id?: number | string
}

type Project = {
  id: string
  title: string
  owner_id: string
}

type ProcessLine = {
  id: string
  title: string
  project_id: string
  owner_id: string
  status?: string
}

type AuthMode = 'checking' | 'telegram' | 'browser'

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentUserId, setCurrentUserId] = useState('')
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [line, setLine] = useState<ProcessLine | null>(null)

  const [authMode, setAuthMode] = useState<AuthMode>('checking')
  const [authStatus, setAuthStatus] = useState<'connecting' | 'ready' | 'failed'>('connecting')
  const [authError, setAuthError] = useState('')
  const [loadingTasks, setLoadingTasks] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [rewardCash, setRewardCash] = useState('')
  const [rewardProjectPoints, setRewardProjectPoints] = useState('')

  useEffect(() => {
    const detectMode = () => {
      const tg = (window as any).Telegram?.WebApp
      const hasTelegramObject = Boolean(tg)
      const hasInitData = Boolean(tg?.initData)

      if (hasTelegramObject || hasInitData) {
        setAuthMode('telegram')
        return
      }

      setAuthMode('browser')
    }

    const timer = setTimeout(detectMode, 500)
    return () => clearTimeout(timer)
  }, [])

  const loadTasks = useCallback(
    async (userId?: string) => {
      setLoadingTasks(true)

      try {
        const headers: Record<string, string> = userId
          ? { 'x-user-id': userId }
          : currentUserId
          ? { 'x-user-id': currentUserId }
          : {}

        const res = await fetch('/api/tasks', { headers })
        const json = await res.json()

        if (!res.ok) {
          console.error('Failed to load tasks:', json.error)
          return
        }

        setTasks(json.tasks || [])
      } catch (error) {
        console.error('Failed to load tasks:', error)
      } finally {
        setLoadingTasks(false)
      }
    },
    [currentUserId]
  )

  const loadContext = useCallback(
    async (userId: string) => {
      try {
        const headers: Record<string, string> = { 'x-user-id': userId }

        const meRes = await fetch('/api/me', { headers })
        const meJson = await meRes.json()

        if (!meRes.ok || !meJson.user) {
          setAuthError(meJson.error || 'Failed to load current user')
          setAuthStatus('failed')
          return
        }

        setCurrentUserId(meJson.user.id)
        setCurrentUser(meJson.user)

        const contextRes = await fetch('/api/context', { headers })
        const contextJson = await contextRes.json()

        if (!contextRes.ok) {
          setAuthError(contextJson.error || 'Failed to load context')
          setAuthStatus('failed')
          return
        }

        setProject(contextJson.project)
        setLine(contextJson.line)
        setAuthStatus('ready')

        await loadTasks(userId)
      } catch (error) {
        setAuthError(
          error instanceof Error ? error.message : 'Failed to load context'
        )
        setAuthStatus('failed')
      }
    },
    [loadTasks]
  )

  useEffect(() => {
    if (authMode !== 'browser') return
    if (process.env.NODE_ENV === 'production') return

    const bootstrapLocalUser = async () => {
      try {
        const meRes = await fetch('/api/me')
        const meJson = await meRes.json()

        if (!meRes.ok || !meJson.user) {
          setAuthError(meJson.error || 'Failed to bootstrap local user')
          setAuthStatus('failed')
          return
        }

        await loadContext(meJson.user.id)
      } catch (error) {
        setAuthError(
          error instanceof Error
            ? error.message
            : 'Failed to bootstrap local context'
        )
        setAuthStatus('failed')
      }
    }

    bootstrapLocalUser()
  }, [authMode, loadContext])

  const handleTelegramAuthed = useCallback(
    (userId: string) => {
      setAuthError('')
      loadContext(userId)
    },
    [loadContext]
  )

  const handleTelegramFailed = useCallback((reason?: string) => {
    setAuthError(reason || 'Unknown Telegram auth error')
    setAuthStatus('failed')
  }, [])

  const handleCreateTask = async () => {
    if (!currentUserId || !currentUser) {
      alert('User is not connected yet')
      return
    }

    if (!project || !line) {
      alert('Project context is not loaded yet')
      return
    }

    if (!title.trim()) {
      alert('Task title is required')
      return
    }

    try {
      setSubmitting(true)

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUserId,
        },
        body: JSON.stringify({
          project_id: project.id,
          line_id: line.id,
          title: title.trim(),
          description: description.trim() || null,
          reward_cash: rewardCash ? Number(rewardCash) : 0,
          reward_project_points: rewardProjectPoints
            ? Number(rewardProjectPoints)
            : 0,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        alert(json.error || 'Failed to create task')
        return
      }

      setTitle('')
      setDescription('')
      setRewardCash('')
      setRewardProjectPoints('')

      await loadTasks(currentUserId)
    } finally {
      setSubmitting(false)
    }
  }

  const handleTakeTask = async (taskId: string) => {
    const res = await fetch(`/api/tasks/${taskId}/take`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': currentUserId,
      },
    })

    const json = await res.json()

    if (!res.ok) {
      alert(json.error || 'Failed to take task')
      return
    }

    await loadTasks(currentUserId)
  }

  const handleCompleteTask = async (taskId: string) => {
    const res = await fetch(`/api/tasks/${taskId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': currentUserId,
      },
    })

    const json = await res.json()

    if (!res.ok) {
      alert(json.error || 'Failed to complete task')
      return
    }

    await loadTasks(currentUserId)
  }

  const userCard = useMemo(() => {
    if (!currentUser) return null

    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-lg font-semibold">{currentUser.display_name}</p>
        <p className="mt-1 text-sm text-white/50">
          {authMode === 'telegram' ? 'Connected via Telegram' : 'Connected locally'}
        </p>
      </div>
    )
  }, [currentUser, authMode])

  const tasksInCurrentLine = tasks.filter((task) =>
    line ? task.line_id === line.id : true
  )

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white md:px-6">
      {authMode === 'telegram' && authStatus !== 'ready' && (
        <TelegramAuthBootstrap
          onAuthed={handleTelegramAuthed}
          onFailed={handleTelegramFailed}
        />
      )}

      <div className="mx-auto max-w-6xl space-y-8">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Clouds MVP 88888</h1>
          <p className="text-base text-white/65">
            Create flows, assign tasks, complete processes///
          </p>
          <p className="text-base text-white/65">TEST BUILD V999</p>
        </header>

        {(authMode === 'checking' || authStatus === 'connecting') && (
          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-white/70">Connecting...</p>
          </section>
        )}

        {authStatus === 'failed' && (
          <section className="rounded-3xl border border-red-500/20 bg-red-500/10 p-5">
            <p className="text-white/85">
              Could not connect to Telegram.{' '}
              {authError || 'Please reopen the app from CloudsFlowBot.'}
            </p>
          </section>
        )}

        {authStatus === 'ready' && currentUser && (
          <>
            <section className="grid gap-4 xl:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <h2 className="mb-4 text-xl font-semibold">Current user</h2>
                {userCard}
              </div>

              {project && (
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                  <h2 className="mb-4 text-xl font-semibold">Current project</h2>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-lg font-semibold">{project.title}</p>
                    <p className="mt-1 text-sm text-white/50">Project space</p>
                  </div>
                </div>
              )}

              {line && (
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                  <h2 className="mb-4 text-xl font-semibold">Current process line</h2>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-lg font-semibold">{line.title}</p>
                      <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-white/75">
                        {line.status || '—'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-white/50">Active working lane</p>
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <h2 className="mb-4 text-2xl font-semibold">Create task</h2>
              <div className="grid gap-3">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title"
                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 outline-none placeholder:text-white/35"
                />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description"
                  className="min-h-28 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 outline-none placeholder:text-white/35"
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={rewardCash}
                    onChange={(e) => setRewardCash(e.target.value)}
                    placeholder="Cash reward"
                    type="number"
                    className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 outline-none placeholder:text-white/35"
                  />
                  <input
                    value={rewardProjectPoints}
                    onChange={(e) => setRewardProjectPoints(e.target.value)}
                    placeholder="Project points reward"
                    type="number"
                    className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 outline-none placeholder:text-white/35"
                  />
                </div>
                <button
                  onClick={handleCreateTask}
                  disabled={submitting}
                  className="rounded-2xl bg-white px-4 py-3 font-medium text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Creating...' : 'Create task'}
                </button>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-2xl font-semibold">Tasks in current line</h2>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/60">
                  {tasksInCurrentLine.length} tasks
                </span>
              </div>

              {loadingTasks ? (
                <p className="text-white/60">Loading tasks...</p>
              ) : tasksInCurrentLine.length === 0 ? (
                <p className="text-white/60">No tasks yet.</p>
              ) : (
                <div className="grid gap-4">
                  {tasksInCurrentLine.map((task) => {
                    const isOpen = !task.assignee_id
                    const isCompleted = Boolean(task.completed_at)
                    const isInProgress = Boolean(task.assignee_id) && !task.completed_at
                    const statusLabel = isCompleted
                      ? 'Done'
                      : isInProgress
                      ? 'In progress'
                      : 'Open'

                    return (
                      <div
                        key={task.id}
                        className="rounded-3xl border border-white/10 bg-white/5 p-5"
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="min-w-0 flex-1 space-y-3">
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-3">
                                <h3 className="text-2xl font-semibold leading-tight">
                                  {task.title}
                                </h3>
                                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm text-white/85">
                                  {statusLabel}
                                </span>
                              </div>

                              {task.description && (
                                <p className="max-w-3xl text-white/70">
                                  {task.description}
                                </p>
                              )}
                            </div>

                            <div className="grid gap-3 text-sm text-white/65 md:grid-cols-2">
                              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                                <p className="text-white/45">Created by</p>
                                <p className="mt-1 font-medium text-white">
                                  {task.creator_name}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                                <p className="text-white/45">Assigned to</p>
                                <p className="mt-1 font-medium text-white">
                                  {task.assignee_name || '—'}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                                <p className="text-white/45">Cash reward</p>
                                <p className="mt-1 font-medium text-white">
                                  {task.reward_cash ?? 0}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                                <p className="text-white/45">Project points</p>
                                <p className="mt-1 font-medium text-white">
                                  {task.reward_project_points ?? 0}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex shrink-0 gap-3">
                            {isOpen && (
                              <button
                                onClick={() => handleTakeTask(task.id)}
                                className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 font-medium transition hover:bg-white/15"
                              >
                                Take task
                              </button>
                            )}

                            {isInProgress && (
                              <button
                                onClick={() => handleCompleteTask(task.id)}
                                className="rounded-2xl bg-white px-4 py-3 font-medium text-black transition hover:opacity-90"
                              >
                                Complete task
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  )
}