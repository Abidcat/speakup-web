'use client'

import type { User } from '@supabase/supabase-js'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const NAV_LINKS = [
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
    <header
      className="sticky top-0 z-10"
      style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}
    >
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <a href="/" className="font-bold" style={{ color: 'var(--green)' }}>SpeakUp</a>
          <nav className="hidden sm:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm px-3 py-1.5 rounded-lg"
                style={{
                  color: pathname === link.href ? 'var(--text)' : 'var(--muted)',
                  background: pathname === link.href ? 'var(--surface)' : 'transparent',
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm hidden sm:block" style={{ color: 'var(--muted)' }}>
            {user.email}
          </span>
          <button
            onClick={signOut}
            className="text-sm px-3 py-1.5 rounded-lg cursor-pointer"
            style={{ color: 'var(--muted)', background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
