'use client'

import type { User } from '@supabase/supabase-js'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const mono = { fontFamily: 'var(--font-dm-mono)' } as const
const syne = { fontFamily: 'var(--font-syne)', fontWeight: 800 } as const

const NAV = [
  { href: '/dashboard', label: 'Sessions' },
  { href: '/dashboard/trends', label: 'Trends' },
  { href: '/dashboard/settings', label: 'Settings' },
]

export default function DashboardNav({ user }: { user: User }) {
  const pathname = usePathname()
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 10, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', borderBottom: '1px solid var(--border)', background: 'rgba(9,9,11,.85)', backdropFilter: 'blur(24px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <div style={{ ...syne, fontSize: 17, letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 7, height: 7, background: 'var(--accent)', borderRadius: '50%', animation: 'pulse 2s ease-in-out infinite' }} />
          <a href="/dashboard" style={{ color: 'var(--text)', textDecoration: 'none' }}>SpeakUp</a>
        </div>
        <nav style={{ display: 'flex', gap: 2 }}>
          {NAV.map(link => (
            <a key={link.href} href={link.href} style={{ fontSize: 13.5, padding: '5px 12px', borderRadius: 7, textDecoration: 'none', color: pathname === link.href ? 'var(--text)' : 'var(--text2)', background: pathname === link.href ? 'var(--surface2)' : 'transparent', border: pathname === link.href ? '1px solid var(--border)' : '1px solid transparent' }}>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ ...mono, fontSize: 11, color: 'var(--muted)' }}>{user.email}</span>
        <button onClick={signOut} style={{ ...mono, fontSize: 11, padding: '6px 14px', borderRadius: 7, cursor: 'pointer', background: 'transparent', color: 'var(--text2)', border: '1px solid var(--border)', letterSpacing: '0.04em' }}>
          SIGN OUT
        </button>
      </div>
    </header>
  )
}
