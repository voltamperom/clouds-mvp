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
        left: 12,
        right: 12,
        bottom: 12,
        padding: '10px',
        background: 'rgba(8, 15, 30, 0.78)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 22,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 8,
        zIndex: 50,
        boxShadow: '0 12px 40px rgba(0,0,0,0.28)',
        alignItems: 'stretch',
      }}
    >
      {items.map((item) => {
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              minHeight: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              textDecoration: 'none',
              padding: '0 10px',
              borderRadius: 16,
              fontSize: 13,
              lineHeight: 1.15,
              color: isActive ? '#081224' : 'rgba(238,244,255,0.82)',
              background: isActive
                ? 'linear-gradient(180deg, #f8fbff 0%, #dbeafe 100%)'
                : 'transparent',
              fontWeight: isActive ? 700 : 500,
              transition: 'all 0.2s ease',
            }}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}