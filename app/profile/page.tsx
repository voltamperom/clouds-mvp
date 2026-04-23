import AppShell from '../components/AppShell'

export default function ProfilePage() {
  return (
    <AppShell title="Profile">
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
            Telegram profile
          </div>
          <div style={{ opacity: 0.85 }}>
            Auto-profile from Telegram will live here.
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 12,
          }}
        >
          {[
            ['Completed tasks', '0'],
            ['Completed lines', '0'],
            ['Reliability', '0'],
            ['XP', '0'],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 18,
                padding: 16,
              }}
            >
              <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 8 }}>
                {label}
              </div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  )
}