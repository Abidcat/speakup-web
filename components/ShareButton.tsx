'use client'

import { useState } from 'react'

const mono = { fontFamily: 'var(--font-dm-mono)' } as const

export default function ShareButton({ sessionId }: { sessionId: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')
  const [url, setUrl] = useState('')
  const [copied, setCopied] = useState(false)

  async function share() {
    setState('loading')
    try {
      const res = await fetch(`/api/sessions/${sessionId}/share`, { method: 'POST' })
      const { token, error } = await res.json()
      if (error || !token) { setState('idle'); return }
      const shareUrl = `${window.location.origin}/share/${token}`
      setUrl(shareUrl)
      setState('done')
    } catch {
      setState('idle')
    }
  }

  function copy() {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (state === 'done') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input
          readOnly
          value={url}
          style={{
            ...mono, fontSize: 10, padding: '6px 10px', borderRadius: 7,
            border: '1px solid var(--border)', background: 'var(--surface)',
            color: 'var(--muted)', width: 260, outline: 'none',
          }}
        />
        <button
          onClick={copy}
          style={{
            ...mono, fontSize: 11, padding: '7px 14px', borderRadius: 7, cursor: 'pointer',
            border: `1px solid ${copied ? 'rgba(34,197,94,0.4)' : 'var(--border)'}`,
            background: copied ? 'rgba(34,197,94,0.08)' : 'var(--surface)',
            color: copied ? 'var(--accent)' : 'var(--text2)', letterSpacing: '0.04em',
          }}
        >
          {copied ? 'COPIED ✓' : 'COPY'}
        </button>
        <button
          onClick={() => setState('idle')}
          style={{ ...mono, fontSize: 10, padding: '6px 8px', borderRadius: 6, cursor: 'pointer', border: '1px solid var(--border)', background: 'transparent', color: 'var(--muted)' }}
        >
          ✕
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={share}
      disabled={state === 'loading'}
      style={{
        ...mono, fontSize: 11, padding: '7px 16px', borderRadius: 8, cursor: state === 'loading' ? 'default' : 'pointer',
        border: '1px solid var(--border)', background: 'var(--surface)',
        color: 'var(--text2)', letterSpacing: '0.04em', opacity: state === 'loading' ? 0.6 : 1,
      }}
    >
      {state === 'loading' ? 'SHARING…' : 'SHARE'}
    </button>
  )
}
