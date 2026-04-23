import AppShell from '../components/AppShell'

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 24,
  padding: 18,
}

export default function TasksPage() {
  return (
    <AppShell title="Tasks & Lines">
      <div style={{ display: 'grid', gap: 12 }}>
        <div style={cardStyle}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
            My Tasks
          </div>
          <div style={{ opacity: 0.8, lineHeight: 1.5 }}>No tasks yet.</div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
            My Lines
          </div>
          <div style={{ opacity: 0.8, lineHeight: 1.5 }}>
            No process lines yet.
          </div>
        </div>
      </div>
    </AppShell>
  )
}