'use client'

import type { User } from '@supabase/supabase-js'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const mono = { fontFamily: 'var(--font-dm-mono)' } as const
const syne = { fontFamily: 'var(--font-syne)', fontWeight: 800 } as const

const NAV = [
  { href: '/dashboard', label: 'Sessions' },
  { href: '/dashboard/scripts', label: 'Scripts' },
  { href: '/dashboard/team', label: 'Team' },
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
    <header style={{ position: 'sticky', top: 0, zIndex: 10, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(9,9,11,.7)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <div style={{ ...syne, fontSize: 17, letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 7, height: 7, background: 'var(--accent)', borderRadius: '50%', animation: 'pulse 2s ease-in-out infinite' }} />
          <a href="/dashboard" style={{ color: 'var(--text)', textDecoration: 'none' }}>SpeakUp</a>
        </div>
        <nav style={{ display: 'flex', gap: 2 }}>
          {NAV.map(link => {
            const active = link.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(link.href)
            return (
              <a key={link.href} href={link.href} style={{ fontSize: 13.5, padding: '5px 12px', borderRadius: 7, textDecoration: 'none', color: active ? 'var(--text)' : 'var(--text2)', background: active ? 'var(--surface2)' : 'transparent', border: active ? '1px solid var(--border)' : '1px solid transparent' }}>
                {link.label}
              </a>
            )
          })}
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
