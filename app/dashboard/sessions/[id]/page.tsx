import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

const mono = { fontFamily: 'var(--font-dm-mono)' } as const
const syne = { fontFamily: 'var(--font-syne)', fontWeight: 800 } as const

const GRADE_COLOR: Record<string, string> = { S: '#22c55e', A: '#22c55e', B: '#86efac', C: '#f97316', D: '#ef4444' }

function fmt(sec: number) {
  return `${Math.floor(sec / 60)}m ${String(sec % 60).padStart(2, '0')}s`
}

function StatBlock({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px', background: 'var(--surface)' }}>
      <div style={{ ...mono, fontSize: 9.5, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
      <div style={{ ...syne, fontSize: 36, letterSpacing: '-0.04em', lineHeight: 1, color: color ?? 'var(--text)' }}>{value}</div>
      {sub && <div style={{ ...mono, fontSize: 10, color: 'var(--muted)', marginTop: 6, letterSpacing: '0.04em' }}>{sub}</div>}
    </div>
  )
}

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: s } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', id)
    .eq('user_id', user!.id)
    .single()

  if (!s) notFound()

  const grade = s.grade ?? '—'
  const gradeColor = GRADE_COLOR[grade] ?? 'var(--muted)'
  const date = new Date(s.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const time = new Date(s.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  const wpmStatus = !s.wpm_avg ? null : s.wpm_avg < 120 ? 'Too slow' : s.wpm_avg > 160 ? 'Too fast' : 'On pace'
  const wpmColor = !s.wpm_avg ? 'var(--muted)' : s.wpm_avg < 120 ? '#4D9EFF' : s.wpm_avg > 160 ? 'var(--red)' : 'var(--accent)'
  const confColor = !s.confidence ? 'var(--muted)' : s.confidence >= 75 ? 'var(--accent)' : s.confidence >= 50 ? 'var(--orange)' : 'var(--red)'
  const fillColor = (s.filler_count ?? 0) > 5 ? 'var(--orange)' : 'var(--accent)'

  const fillerMap: Record<string, number> = s.filler_map ?? {}
  const tips: string[] = s.tip_history ?? []

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Back */}
      <a href="/dashboard" style={{ ...mono, fontSize: 11, color: 'var(--muted)', textDecoration: 'none', letterSpacing: '0.06em', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>
        ← SESSIONS
      </a>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, marginBottom: 40, paddingBottom: 40, borderBottom: '1px solid var(--border)' }}>
        {/* Grade circle */}
        <div style={{
          width: 88, height: 88, borderRadius: '50%', flexShrink: 0,
          border: `2px solid ${gradeColor}`,
          background: `${gradeColor}10`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 32px ${gradeColor}20`,
        }}>
          <span style={{ ...syne, fontSize: 40, color: gradeColor, lineHeight: 1 }}>{grade}</span>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ ...mono, fontSize: 10, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
            {date} · {time}
          </div>
          <h1 style={{ ...syne, fontSize: 28, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 8 }}>
            {s.session_type}
          </h1>
          {s.goal && (
            <span style={{ ...mono, fontSize: 10, color: 'var(--accent)', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', padding: '3px 10px', borderRadius: 100, letterSpacing: '0.05em' }}>
              {s.goal}
            </span>
          )}
          <div style={{ ...mono, fontSize: 11, color: 'var(--muted)', marginTop: 12, letterSpacing: '0.03em' }}>
            Duration: {fmt(s.duration_sec)} · {s.word_count ?? 0} words {s.has_script ? '· Script used' : ''}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
        <StatBlock
          label="Avg WPM"
          value={s.wpm_avg?.toFixed(0) ?? '—'}
          sub={wpmStatus ?? 'No data'}
          color={wpmColor}
        />
        <StatBlock
          label="Confidence"
          value={s.confidence?.toFixed(0) ?? '—'}
          sub={s.confidence ? (s.confidence >= 75 ? 'Strong' : s.confidence >= 50 ? 'Building' : 'Keep going') : 'No data'}
          color={confColor}
        />
        <StatBlock
          label="Filler words"
          value={String(s.filler_count ?? 0)}
          sub={(s.filler_count ?? 0) > 5 ? 'Watch out' : 'Clean'}
          color={fillColor}
        />
      </div>

      {/* Filler breakdown */}
      {Object.keys(fillerMap).length > 0 && (
        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '24px', background: 'var(--surface)', marginBottom: 12 }}>
          <div style={{ ...mono, fontSize: 9.5, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>Filler breakdown</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(fillerMap).sort((a, b) => b[1] - a[1]).map(([word, count]) => {
              const max = Math.max(...Object.values(fillerMap))
              const pct = (count / max) * 100
              return (
                <div key={word} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ ...mono, fontSize: 12, color: 'var(--text2)', minWidth: 48 }}>&ldquo;{word}&rdquo;</div>
                  <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: count > 5 ? 'var(--red)' : 'var(--accent)', borderRadius: 2 }} />
                  </div>
                  <div style={{ ...mono, fontSize: 12, color: count > 5 ? 'var(--red)' : 'var(--text2)', minWidth: 20, textAlign: 'right' }}>{count}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Coaching tips shown */}
      {tips.length > 0 && (
        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '24px', background: 'var(--surface)', marginBottom: 12 }}>
          <div style={{ ...mono, fontSize: 9.5, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>Coaching tips shown</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tips.map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 14px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--accent)', fontSize: 12, marginTop: 1, flexShrink: 0 }}>◈</span>
                <span style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
