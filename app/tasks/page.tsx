import AppShell from '../components/AppShell'

export default function TasksPage() {
  return (
    <AppShell title="Tasks & Lines">
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
            My Tasks
          </div>
          <div style={{ opacity: 0.85 }}>No tasks yet.</div>
        </div>

        <div
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20,
            padding: 18,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
            My Lines
          </div>
          <div style={{ opacity: 0.85 }}>No process lines yet.</div>
        </div>
      </div>
    </AppShell>
  )
}