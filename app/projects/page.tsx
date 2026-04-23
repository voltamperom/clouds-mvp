import AppShell from '../components/AppShell'

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 24,
  padding: 18,
}

export default function ProjectsPage() {
  return (
    <AppShell title="Projects">
      <div style={{ display: 'grid', gap: 12 }}>
        <div style={cardStyle}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
            No projects yet
          </div>
          <div style={{ opacity: 0.8, lineHeight: 1.5 }}>
            The first project will appear here.
          </div>
        </div>
      </div>
    </AppShell>
  )
}