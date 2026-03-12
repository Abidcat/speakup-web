const mono = { fontFamily: 'var(--font-dm-mono)' } as const
const syne = { fontFamily: 'var(--font-syne)', fontWeight: 800 } as const

type Session = {
  id: string; session_type: string; goal: string | null; duration_sec: number
  wpm_avg: number | null; confidence: number | null; filler_count: number
  grade: string | null; created_at: string
}

const GRADE_COLOR: Record<string, string> = { S: '#22c55e', A: '#22c55e', B: '#86efac', C: '#f97316', D: '#ef4444' }

function fmt(sec: number) {
  return `${Math.floor(sec / 60)}m ${String(sec % 60).padStart(2,'0')}s`
}

export default function SessionCard({ session: s }: { session: Session }) {
  const grade = s.grade ?? '—'
  const date = new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, background: 'var(--surface)' }}>
      {/* Grade */}
      <div style={{ width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'var(--bg)', border: '1px solid var(--border)' }}>
        <span style={{ ...syne, fontSize: 18, letterSpacing: '-0.04em', color: GRADE_COLOR[grade] ?? 'var(--muted)' }}>{grade}</span>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 500, textTransform: 'capitalize' }}>{s.session_type}</span>
          {s.goal && <span style={{ ...mono, fontSize: 9.5, color: 'var(--muted)', background: 'var(--surface2)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: 100, letterSpacing: '0.04em' }}>{s.goal}</span>}
        </div>
        <div style={{ ...mono, fontSize: 10.5, color: 'var(--muted)', letterSpacing: '0.03em' }}>{date} · {fmt(s.duration_sec)}</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 24, flexShrink: 0 }}>
        {[
          { label: 'WPM',  val: s.wpm_avg?.toFixed(0) ?? '—', warn: false },
          { label: 'CONF', val: s.confidence?.toFixed(0) ?? '—', warn: false },
          { label: 'FILL', val: String(s.filler_count), warn: s.filler_count > 5 },
        ].map(stat => (
          <div key={stat.label} style={{ textAlign: 'center' }}>
            <div style={{ ...mono, fontSize: 9, color: 'var(--muted)', letterSpacing: '0.07em', marginBottom: 3 }}>{stat.label}</div>
            <div style={{ ...syne, fontSize: 16, letterSpacing: '-0.03em', color: stat.warn ? 'var(--orange)' : 'var(--text)' }}>{stat.val}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
