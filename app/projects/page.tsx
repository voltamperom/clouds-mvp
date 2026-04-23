import AppShell from '../components/AppShell'

export default function ProjectsPage() {
  return (
    <AppShell title="Projects">
      <div
        style={{
          display: 'grid',
          gap: 12,
        }}
      >
        <div
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20,
            padding: 18,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
            No projects yet
          </div>
          <div style={{ opacity: 0.85 }}>
            The first project will appear here.
          </div>
        </div>
      </div>
    </AppShell>
  )
}