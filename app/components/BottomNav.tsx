'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const items = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/tasks', label: 'Tasks & Lines' },
  { href: '/projects', label: 'Projects' },
  { href: '/profile', label: 'Profile' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        padding: '12px 16px calc(12px + env(safe-area-inset-bottom))',
        background: '#101826',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 8,
        zIndex: 50,
      }}
    >
      {items.map((item) => {
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              textAlign: 'center',
              textDecoration: 'none',
              padding: '10px 8px',
              borderRadius: 14,
              fontSize: 13,
              color: isActive ? '#0f1724' : '#e8eefc',
              background: isActive ? '#f3f7ff' : 'transparent',
              fontWeight: isActive ? 700 : 500,
            }}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}