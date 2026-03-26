'use client'

import { useState, useMemo } from 'react'
import SessionCard from './SessionCard'

const mono = { fontFamily: 'var(--font-dm-mono)' } as const

type Session = {
  id: string
  session_type: string
  goal: string | null
  grade?: string
  wpm_avg?: number
  confidence?: number
  filler_count?: number
  duration_sec: number
  created_at: string
  meeting_mode?: boolean
}

const GRADES = ['S', 'A', 'B', 'C', 'D']

function exportCsv(sessions: Session[]) {
  const headers = ['Date', 'Type', 'Goal', 'Grade', 'WPM', 'Confidence', 'Fillers', 'Duration (s)', 'Meeting']
  const rows = sessions.map(s => [
    new Date(s.created_at).toLocaleDateString(),
    s.session_type,
    s.goal ?? '',
    s.grade ?? '',
    s.wpm_avg?.toFixed(0) ?? '',
    s.confidence?.toFixed(0) ?? '',
    s.filler_count ?? 0,
    s.duration_sec,
    s.meeting_mode ? 'Yes' : 'No',
  ])
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `speakup-sessions-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function SessionList({ sessions }: { sessions: Session[] }) {
  const [search, setSearch] = useState('')
  const [gradeFilter, setGradeFilter] = useState<string | null>(null)
  const [sort, setSort] = useState<'newest' | 'oldest' | 'grade'>('newest')

  const filtered = useMemo(() => {
    let list = [...sessions]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(s =>
        s.session_type.toLowerCase().includes(q) ||
        (s.goal ?? '').toLowerCase().includes(q)
      )
    }
    if (gradeFilter) list = list.filter(s => s.grade === gradeFilter)
    if (sort === 'oldest') list.reverse()
    else if (sort === 'grade') {
      const order = ['S', 'A', 'B', 'C', 'D']
      list.sort((a, b) => (order.indexOf(a.grade ?? 'D')) - (order.indexOf(b.grade ?? 'D')))
    }
    return list
  }, [sessions, search, gradeFilter, sort])

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search sessions..."
          style={{
            flex: 1, minWidth: 160, padding: '7px 12px', borderRadius: 8,
            border: '1px solid var(--border)', background: 'var(--surface)',
            color: 'var(--text)', fontFamily: 'var(--font-dm-mono)', fontSize: 12,
            outline: 'none',
          }}
        />

        {/* Grade filter */}
        <div style={{ display: 'flex', gap: 4 }}>
          {GRADES.map(g => (
            <button
              key={g}
              onClick={() => setGradeFilter(gradeFilter === g ? null : g)}
              style={{
                ...mono, fontSize: 11, padding: '5px 10px', borderRadius: 6, cursor: 'pointer',
                border: `1px solid ${gradeFilter === g ? 'var(--accent)' : 'var(--border)'}`,
                background: gradeFilter === g ? 'rgba(34,197,94,0.08)' : 'var(--surface)',
                color: gradeFilter === g ? 'var(--accent)' : 'var(--text2)',
              }}
            >{g}</button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={e => setSort(e.target.value as typeof sort)}
          style={{
            padding: '6px 10px', borderRadius: 8,
            border: '1px solid var(--border)', background: 'var(--surface)',
            color: 'var(--text2)', fontFamily: 'var(--font-dm-mono)', fontSize: 11,
            cursor: 'pointer', outline: 'none',
          }}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="grade">Best grade first</option>
        </select>

        {/* Export */}
        <button
          onClick={() => exportCsv(filtered)}
          style={{
            ...mono, fontSize: 11, padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
            border: '1px solid var(--border)', background: 'var(--surface)',
            color: 'var(--text2)', letterSpacing: '0.04em',
          }}
        >
          EXPORT CSV
        </button>
      </div>

      {/* Results count */}
      <div style={{ ...mono, fontSize: 9.5, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
        {filtered.length} session{filtered.length !== 1 ? 's' : ''}
        {(search || gradeFilter) ? ' · filtered' : ''}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--muted)', fontFamily: 'var(--font-dm-mono)', fontSize: 12 }}>
          No sessions match your filters
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.map(s => <SessionCard key={s.id} session={s} />)}
        </div>
      )}
    </div>
  )
}
