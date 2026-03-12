type Session = {
  id: string
  session_type: string
  goal: string | null
  duration_sec: number
  wpm_avg: number | null
  confidence: number | null
  filler_count: number
  grade: string | null
  created_at: string
}

const GRADE_COLOR: Record<string, string> = {
  S: '#00FF88', A: '#00FF88', B: '#86efac', C: '#facc15', D: '#ef4444',
}

function fmt(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}m ${s.toString().padStart(2, '0')}s`
}

export default function SessionCard({ session: s }: { session: Session }) {
  const date = new Date(s.created_at)
  const grade = s.grade ?? '—'

  return (
    <div
      className="rounded-xl p-5 flex items-center gap-5"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      {/* Grade */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0"
        style={{ background: 'rgba(0,0,0,0.3)', color: GRADE_COLOR[grade] ?? 'var(--muted)' }}
      >
        {grade}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium capitalize">{s.session_type}</span>
          {s.goal && (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--muted)' }}
            >
              {s.goal}
            </span>
          )}
        </div>
        <div className="text-xs flex gap-4 flex-wrap" style={{ color: 'var(--muted)' }}>
          <span>{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          <span>{fmt(s.duration_sec)}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="hidden sm:flex items-center gap-6 text-sm flex-shrink-0">
        <Stat label="WPM" value={s.wpm_avg?.toFixed(0) ?? '—'} />
        <Stat label="CONF" value={s.confidence?.toFixed(0) ?? '—'} />
        <Stat label="FILL" value={String(s.filler_count)} warn={s.filler_count > 5} />
      </div>
    </div>
  )
}

function Stat({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="text-center">
      <div className="text-xs mb-0.5" style={{ color: 'var(--muted)' }}>{label}</div>
      <div className="font-semibold" style={{ color: warn ? '#facc15' : 'var(--text)' }}>{value}</div>
    </div>
  )
}
