'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const mono = { fontFamily: 'var(--font-dm-mono)' } as const

export default function CoachingLoader({ sessionId }: { sessionId: string }) {
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 5000)
    return () => clearInterval(interval)
  }, [router, sessionId])

  return (
    <div style={{
      border: '1px solid rgba(34,197,94,0.12)',
      borderRadius: 12,
      padding: '20px 24px',
      background: 'rgba(34,197,94,0.02)',
      marginBottom: 12,
      display: 'flex',
      alignItems: 'center',
      gap: 16,
    }}>
      <div style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: 'var(--accent)',
        flexShrink: 0,
        animation: 'cursor-pulse 1.4s ease-in-out infinite',
      }} />
      <div>
        <div style={{ ...mono, fontSize: 9.5, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>
          AI Coaching Report
        </div>
        <p style={{ ...mono, fontSize: 11, color: 'var(--muted)', margin: 0 }}>
          Generating your personalized coaching report — check back in a moment…
        </p>
      </div>
    </div>
  )
}
