import AppShell from '../components/AppShell'

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 24,
  padding: 18,
}

export default function ProfilePage() {
  return (
    <AppShell title="Profile">
      <div style={{ display: 'grid', gap: 12 }}>
        <div style={cardStyle}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
            Telegram profile
          </div>
          <div style={{ opacity: 0.8, lineHeight: 1.5 }}>
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
            <div key={label} style={cardStyle}>
              <div style={{ fontSize: 13, opacity: 0.66, marginBottom: 10 }}>
                {label}
              </div>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  )
}