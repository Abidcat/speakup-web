'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const mono = { fontFamily: 'var(--font-dm-mono)' } as const
const syne = { fontFamily: 'var(--font-syne)', fontWeight: 800 } as const

type Props = { onClose: () => void }

export default function AuthModal({ onClose }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function signInWithGoogle() {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        background: 'rgba(9,9,11,0.82)', backdropFilter: 'blur(12px)',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        width: '100%', maxWidth: 420, position: 'relative',
        background: 'var(--surface)', border: '1px solid var(--border-h)',
        borderRadius: 20, padding: '44px 40px 36px',
        boxShadow: '0 40px 80px rgba(0,0,0,.6)',
      }}>
        {/* Close */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16,
          width: 28, height: 28, borderRadius: 7,
          border: '1px solid var(--border)', background: 'transparent',
          color: 'var(--muted)', fontSize: 16, lineHeight: 1,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>×</button>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#09090b', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-dm-sans)' }}>S</span>
          </div>
          <span style={{ ...syne, fontSize: 16, letterSpacing: '-0.03em' }}>SpeakUp</span>
        </div>

        <h2 style={{ ...syne, fontSize: 28, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 8 }}>
          Welcome back.
        </h2>
        <p style={{ ...mono, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 32 }}>
          Sign in to download the app and<br />access your dashboard.
        </p>

        {error && (
          <div style={{
            ...mono, fontSize: 12,
            background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.18)',
            color: '#ef4444', borderRadius: 8, padding: '10px 14px', marginBottom: 16,
          }}>{error}</div>
        )}

        <button
          onClick={signInWithGoogle}
          disabled={loading}
          style={{
            width: '100%', padding: '13px 20px', borderRadius: 10, border: '1px solid var(--border-h)',
            background: 'var(--surface2)', color: 'var(--text)',
            fontFamily: 'var(--font-dm-sans)', fontSize: 14, fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .6 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            transition: 'border-color .15s, background .15s',
          }}
          onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface2)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,.18)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface2)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-h)' }}
        >
          {!loading && <GoogleIcon />}
          <span>{loading ? 'Redirecting…' : 'Continue with Google'}</span>
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ ...mono, fontSize: 10, color: 'var(--muted)', letterSpacing: '0.06em' }}>OR</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {/* Email placeholder (non-functional — shows intent) */}
        <div style={{
          width: '100%', padding: '13px 16px', borderRadius: 10,
          border: '1px solid var(--border)', background: 'var(--bg)',
          ...mono, fontSize: 12, color: 'var(--muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          opacity: .5,
        }}>
          <span>Email sign-in coming soon</span>
          <span style={{ fontSize: 10, letterSpacing: '0.06em' }}>SOON</span>
        </div>

        <p style={{ ...mono, fontSize: 10.5, color: 'var(--muted)', textAlign: 'center', marginTop: 24, lineHeight: 1.7 }}>
          By continuing you agree to our{' '}
          <span style={{ color: 'var(--text2)', cursor: 'pointer' }}>Terms of Service</span>
          {' '}and{' '}
          <span style={{ color: 'var(--text2)', cursor: 'pointer' }}>Privacy Policy</span>.
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18Z"/>
      <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17Z"/>
      <path fill="#FBBC05" d="M4.5 10.48A4.8 4.8 0 0 1 4.5 7.5V5.43H1.83a8 8 0 0 0 0 7.14L4.5 10.48Z"/>
      <path fill="#EA4335" d="M8.98 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A8 8 0 0 0 1.83 5.43L4.5 7.5a4.77 4.77 0 0 1 4.48-3.92Z"/>
    </svg>
  )
}
