'use client'

import { useState } from 'react'

const mono = { fontFamily: 'var(--font-dm-mono)' } as const

type Utterance = {
  speaker: number
  start: number | null
  end: number | null
  text: string | null
  fillers: string[]
}

const FILLERS = ['um', 'uh', 'like', 'basically', 'you know', 'literally']

function fmtTime(sec: number | null): string {
  if (sec == null) return ''
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

// Render text with filler words as red pill badges (Poised-style)
function renderWithFillerBadges(text: string, fillers: string[]): React.ReactNode[] {
  if (fillers.length === 0) return [text]

  const activeFillers = [...new Set(fillers.map(f => f.toLowerCase()))]
  const pattern = new RegExp(
    `\\b(${activeFillers.map(f => f.replace(/\s+/g, '\\s+')).join('|')})\\b`,
    'gi'
  )
  const parts = text.split(pattern)

  return parts.map((part, i) => {
    const isMatch = activeFillers.some(f => f.toLowerCase() === part.toLowerCase().trim())
    if (!isMatch) return part
    return (
      <span key={i} style={{
        background: 'rgba(239,68,68,0.12)',
        color: '#ef4444',
        borderRadius: 4,
        padding: '1px 5px',
        fontSize: '0.9em',
        fontWeight: 600,
        border: '1px solid rgba(239,68,68,0.25)',
        display: 'inline-block',
        lineHeight: 1.4,
      }}>{part}</span>
    )
  })
}

// Compute timeline segment color based on filler density
function segmentColor(utterance: Utterance): string {
  const wc = utterance.text ? wordCount(utterance.text) : 0
  const rate = wc > 0 ? utterance.fillers.length / wc : 0
  if (rate >= 0.12) return '#ef4444'
  if (rate >= 0.05) return '#f97316'
  return '#22c55e'
}

export default function StructuredTranscript({
  utterances,
  userSpeaker = 0,
}: {
  utterances: Utterance[]
  userSpeaker?: number
}) {
  const [expanded, setExpanded] = useState(false)

  const totalDuration = utterances.reduce((max, u) => u.end ? Math.max(max, u.end) : max, 0) || 1
  const userUtterances = utterances.filter(u => u.speaker === userSpeaker && u.text)
  const displayUtterances = !expanded ? utterances.slice(0, 12) : utterances
  const hasMore = utterances.length > 12

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 12, background: 'var(--surface)', marginBottom: 12, overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ ...mono, fontSize: 9.5, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Transcript · {userUtterances.length} segments
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ ...mono, fontSize: 9, color: 'var(--muted)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '2px 8px', borderRadius: 100 }}>
            fillers highlighted
          </span>
          {hasMore && (
            <button
              onClick={() => setExpanded(e => !e)}
              style={{ ...mono, fontSize: 10, color: 'var(--accent)', background: 'transparent', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 6, padding: '3px 10px', cursor: 'pointer' }}
            >
              {expanded ? 'COLLAPSE' : `SHOW ALL ${utterances.length}`}
            </button>
          )}
        </div>
      </div>

      {/* Timeline bar — colored segments by filler density */}
      <div style={{ height: 6, position: 'relative', background: 'var(--border)', overflow: 'hidden' }}>
        {utterances.map((u, i) => {
          if (!u.start && !u.end) return null
          const start = u.start ?? 0
          const end = u.end ?? start + 1
          const left = (start / totalDuration) * 100
          const width = Math.max(0.5, ((end - start) / totalDuration) * 100)
          const color = u.speaker === userSpeaker ? segmentColor(u) : 'rgba(255,255,255,0.08)'
          return (
            <div key={i} title={u.text ?? 'Other participant'} style={{
              position: 'absolute',
              left: `${left}%`,
              width: `${width}%`,
              height: 6,
              background: color,
              transition: 'opacity .2s',
            }} />
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, padding: '8px 20px', borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)' }}>
        {[
          { color: '#22c55e', label: 'Clean' },
          { color: '#f97316', label: 'Watch out' },
          { color: '#ef4444', label: 'Too many' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
            <span style={{ ...mono, fontSize: 9, color: 'var(--muted)' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Utterance rows */}
      <div style={{ padding: '8px 0' }}>
        {displayUtterances.map((u, i) => (
          u.speaker !== userSpeaker || !u.text ? (
            // Other participant row
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 20px' }}>
              <span style={{ ...mono, fontSize: 10, color: 'var(--muted)', minWidth: 32 }}>
                {fmtTime(u.start)}
              </span>
              <span style={{ ...mono, fontSize: 11, color: 'var(--muted)', fontStyle: 'italic', opacity: 0.5 }}>
                Other participant spoke
              </span>
            </div>
          ) : (
            // User utterance row
            <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 20px', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flexShrink: 0, paddingTop: 2 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: segmentColor(u), flexShrink: 0 }} />
                <span style={{ ...mono, fontSize: 9.5, color: 'var(--muted)', minWidth: 32, textAlign: 'center' }}>
                  {fmtTime(u.start)}
                </span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.75, color: 'var(--text2)', margin: 0 }}>
                {renderWithFillerBadges(u.text, u.fillers)}
              </p>
            </div>
          )
        ))}
        {!expanded && hasMore && (
          <div style={{ padding: '8px 20px', textAlign: 'center' }}>
            <button
              onClick={() => setExpanded(true)}
              style={{ ...mono, fontSize: 10, color: 'var(--accent)', background: 'transparent', border: 'none', cursor: 'pointer', letterSpacing: '0.05em' }}
            >
              + {utterances.length - 12} more segments
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
