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
        background: '#0f1b2d',
        color: '#f3f7ff',
        padding: '24px 20px 110px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1
          style={{
            margin: 0,
            marginBottom: 20,
            fontSize: 28,
            lineHeight: 1.1,
          }}
        >
          {title}
        </h1>

        {children}
      </div>

      <BottomNav />
    </main>
  )
}