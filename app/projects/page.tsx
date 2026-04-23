'use client'

import { useEffect, useState } from 'react'
import AppShell from '../components/AppShell'

type Project = {
  id: string
  title: string
  description: string
  created_at: string
  members_count: number
  lines_count: number
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 24,
  padding: 18,
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadProjects() {
    try {
      setIsLoading(true)
      setError(null)

      const res = await fetch('/api/projects', {
        method: 'GET',
        credentials: 'include',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to load projects')
      }

      setProjects(data.projects ?? [])
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load projects'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault()

    if (!title.trim()) return

    try {
      setIsCreating(true)
      setError(null)

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title,
          description,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to create project')
      }

      setTitle('')
      setDescription('')
      await loadProjects()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create project'
      setError(message)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <AppShell title="Projects">
      <div style={{ display: 'grid', gap: 12 }}>
        <form onSubmit={handleCreateProject} style={cardStyle}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            Create project
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Project title"
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Project description"
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
              disabled={isCreating || !title.trim()}
              style={{
                border: 'none',
                borderRadius: 16,
                padding: '14px 16px',
                background:
                  'linear-gradient(180deg, #f8fbff 0%, #dbeafe 100%)',
                color: '#081224',
                fontWeight: 700,
                cursor: isCreating || !title.trim() ? 'default' : 'pointer',
                opacity: isCreating || !title.trim() ? 0.7 : 1,
              }}
            >
              {isCreating ? 'Creating...' : 'Create project'}
            </button>
          </div>
        </form>

        {error ? (
          <div style={cardStyle}>
            <div style={{ color: '#ffb4b4' }}>{error}</div>
          </div>
        ) : null}

        {isLoading ? (
          <div style={cardStyle}>Loading projects...</div>
        ) : projects.length === 0 ? (
          <div style={cardStyle}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
              No projects yet
            </div>
            <div style={{ opacity: 0.8, lineHeight: 1.5 }}>
              Your first project will appear here.
            </div>
          </div>
        ) : (
          projects.map((project) => (
            <div key={project.id} style={cardStyle}>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  marginBottom: 8,
                  letterSpacing: '-0.02em',
                }}
              >
                {project.title}
              </div>

              <div
                style={{
                  opacity: 0.82,
                  lineHeight: 1.6,
                  marginBottom: 14,
                }}
              >
                {project.description || 'No description yet.'}
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
                <span>{project.members_count} members</span>
                <span>{project.lines_count} lines</span>
              </div>
            </div>
          ))
        )}
      </div>
    </AppShell>
  )
}