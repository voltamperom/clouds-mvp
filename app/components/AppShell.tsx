import BottomNav from './BottomNav'

export default function AppShell({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top, rgba(37,99,235,0.18) 0%, rgba(15,23,42,0) 28%), linear-gradient(180deg, #081224 0%, #0b1730 100%)',
        color: '#eef4ff',
        padding: '28px 20px 110px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: 12,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              opacity: 0.58,
              marginBottom: 8,
            }}
          >
            Clouds
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 34,
              lineHeight: 1.05,
              fontWeight: 700,
              letterSpacing: '-0.03em',
            }}
          >
            {title}
          </h1>
        </div>

        {children}
      </div>

      <BottomNav />
    </main>
  )
}