'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import AppShell from '../../components/AppShell'

type Project = {
  id: string
  title: string
  description: string
  created_at: string
  updated_at?: string
}

type Line = {
  id: string
  project_id: string
  owner_id: string
  title: string
  description: string
  status: string
  created_at: string
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 24,
  padding: 18,
}

export default function ProjectDetailPage() {
  const params = useParams()

  const projectId = useMemo(() => {
    const raw = params?.projectId

    if (typeof raw === 'string') return raw
    if (Array.isArray(raw) && raw[0]) return raw[0]

    return ''
  }, [params])

  const [project, setProject] = useState<Project | null>(null)
  const [lines, setLines] = useState<Line[]>([])
  const [lineTitle, setLineTitle] = useState('')
  const [lineDescription, setLineDescription] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadProject(currentProjectId: string) {
    const res = await fetch(`/api/projects/${encodeURIComponent(currentProjectId)}`, {
      method: 'GET',
      credentials: 'include',
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data?.error || 'Failed to load project')
    }

    setProject(data.project)
  }

  async function loadLines(currentProjectId: string) {
    const res = await fetch(
      `/api/projects/${encodeURIComponent(currentProjectId)}/lines`,
      {
        method: 'GET',
        credentials: 'include',
      }
    )

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data?.error || 'Failed to load lines')
    }

    setLines(data.lines ?? [])
  }

  async function loadAll(currentProjectId: string) {
    try {
      setIsLoading(true)
      setError(null)

      await Promise.all([
        loadProject(currentProjectId),
        loadLines(currentProjectId),
      ])
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load project'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!projectId) return
    loadAll(projectId)
  }, [projectId])

  async function handleCreateLine(e: React.FormEvent) {
    e.preventDefault()

    if (!lineTitle.trim() || !projectId) return

    try {
      setIsCreating(true)
      setError(null)

      const res = await fetch(
        `/api/projects/${encodeURIComponent(projectId)}/lines`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            title: lineTitle,
            description: lineDescription,
          }),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to create line')
      }

      setLineTitle('')
      setLineDescription('')
      await loadLines(projectId)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create line'
      setError(message)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <AppShell title={project?.title || 'Project'}>
      <div style={{ display: 'grid', gap: 12 }}>
        <div>
          <Link
            href="/projects"
            style={{
              color: 'rgba(238,244,255,0.72)',
              textDecoration: 'none',
              fontSize: 14,
            }}
          >
            ← Back to Projects
          </Link>
        </div>

        {error ? (
          <div style={cardStyle}>
            <div style={{ color: '#ffb4b4' }}>{error}</div>
          </div>
        ) : null}

        {isLoading ? (
          <div style={cardStyle}>Loading project...</div>
        ) : (
          <>
            <div style={cardStyle}>
              <div
                style={{
                  fontSize: 12,
                  opacity: 0.62,
                  marginBottom: 8,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Project
              </div>

              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  marginBottom: 10,
                  letterSpacing: '-0.03em',
                }}
              >
                {project?.title || 'Untitled project'}
              </div>

              <div
                style={{
                  opacity: 0.84,
                  lineHeight: 1.6,
                }}
              >
                {project?.description || 'No description yet.'}
              </div>
            </div>

            <form onSubmit={handleCreateLine} style={cardStyle}>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  marginBottom: 12,
                }}
              >
                Create process line
              </div>

              <div style={{ display: 'grid', gap: 10 }}>
                <input
                  value={lineTitle}
                  onChange={(e) => setLineTitle(e.target.value)}
                  placeholder="Line title"
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.06)',
                    color: '#eef4ff',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 14,
                    padding: '14px 16px',
                    outline: 'none',
                  }}
                />

                <textarea
                  value={lineDescription}
                  onChange={(e) => setLineDescription(e.target.value)}
                  placeholder="Line description"
                  rows={4}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.06)',
                    color: '#eef4ff',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 14,
                    padding: '14px 16px',
                    outline: 'none',
                    resize: 'vertical',
                    font: 'inherit',
                  }}
                />

                <button
                  type="submit"
                  disabled={isCreating || !lineTitle.trim() || !projectId}
                  style={{
                    border: 'none',
                    borderRadius: 16,
                    padding: '14px 16px',
                    background:
                      'linear-gradient(180deg, #f8fbff 0%, #dbeafe 100%)',
                    color: '#081224',
                    fontWeight: 700,
                    cursor:
                      isCreating || !lineTitle.trim() || !projectId
                        ? 'default'
                        : 'pointer',
                    opacity:
                      isCreating || !lineTitle.trim() || !projectId ? 0.7 : 1,
                  }}
                >
                  {isCreating ? 'Creating...' : 'Create process line'}
                </button>
              </div>
            </form>

            {lines.length === 0 ? (
              <div style={cardStyle}>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                  No process lines yet
                </div>
                <div style={{ opacity: 0.8, lineHeight: 1.5 }}>
                  Your first line will appear here.
                </div>
              </div>
            ) : (
              lines.map((line) => (
                <div key={line.id} style={cardStyle}>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      marginBottom: 8,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {line.title}
                  </div>

                  <div
                    style={{
                      opacity: 0.82,
                      lineHeight: 1.6,
                      marginBottom: 14,
                    }}
                  >
                    {line.description || 'No description yet.'}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: 12,
                      flexWrap: 'wrap',
                      fontSize: 13,
                      opacity: 0.65,
                    }}
                  >
                    <span>Status: {line.status}</span>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </AppShell>
  )
}