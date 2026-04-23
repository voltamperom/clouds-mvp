import AppShell from '../components/AppShell'

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 24,
  padding: 18,
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
}

export default function DashboardPage() {
  return (
    <AppShell title="Dashboard">
      <div
        style={{
          display: 'grid',
          gap: 12,
        }}
      >
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
            Season I – The Fork
          </div>

          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              marginBottom: 10,
              letterSpacing: '-0.03em',
            }}
          >
            Clouds MVP is alive
          </div>

          <div
            style={{
              fontSize: 15,
              lineHeight: 1.6,
              opacity: 0.88,
              maxWidth: 540,
            }}
          >
            This is your command deck for projects, lines, tasks, XP and contribution.
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
            ['Active tasks', '0'],
            ['In review', '0'],
            ['Projects', '0'],
            ['XP', '0'],
          ].map(([label, value]) => (
            <div key={label} style={cardStyle}>
              <div
                style={{
                  fontSize: 13,
                  opacity: 0.66,
                  marginBottom: 10,
                }}
              >
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