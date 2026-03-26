import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const mono = { fontFamily: 'var(--font-dm-mono)' } as const
const syne = { fontFamily: 'var(--font-syne)', fontWeight: 800 } as const

const GRADE_COLOR: Record<string, string> = { S: '#22c55e', A: '#22c55e', B: '#86efac', C: '#f97316', D: '#ef4444' }

function fmt(sec: number) {
  return `${Math.floor(sec / 60)}m ${String(sec % 60).padStart(2, '0')}s`
}

type SessionSnapshot = {
  session_type: string
  goal?: string
  grade?: string
  duration_sec: number
  wpm_avg?: number
  confidence?: number
  filler_count?: number
  filler_map?: Record<string, number>
  word_count?: number
  ai_coaching?: {
    summary: string
    strength: { observation: string; quote: string }
    improvement: { observation: string; quote: string }
    drill: string
  }
  tip_history?: string[]
  created_at: string
  meeting_mode?: boolean
  speaker_ratio?: number
}

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()

  const { data: share } = await supabase
    .from('session_shares')
    .select('snapshot, created_at')
    .eq('token', token)
    .single()

  if (!share) notFound()

  const s = share.snapshot as SessionSnapshot
  const grade = s.grade ?? '—'
  const gradeColor = GRADE_COLOR[grade] ?? 'var(--muted, #555)'
  const date = new Date(s.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const fillerMap: Record<string, number> = s.filler_map ?? {}

  const wpmColor = !s.wpm_avg ? '#555' : s.wpm_avg < 120 ? '#4D9EFF' : s.wpm_avg > 160 ? '#ef4444' : '#22c55e'
  const confColor = !s.confidence ? '#555' : s.confidence >= 75 ? '#22c55e' : s.confidence >= 50 ? '#f97316' : '#ef4444'

  return (
    <main style={{ background: '#09090b', color: '#f0eee8', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #1f1f23', padding: '16px 40px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <a href="/" style={{ ...syne, fontSize: 17, letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none', color: '#f0eee8' }}>
          <div style={{ width: 7, height: 7, background: '#22c55e', borderRadius: '50%' }} />
          SpeakUp
        </a>
        <span style={{ ...mono, fontSize: 10, color: '#555', letterSpacing: '0.06em', textTransform: 'uppercase' }}>· shared session</span>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 40px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, marginBottom: 40, paddingBottom: 40, borderBottom: '1px solid #1f1f23' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', flexShrink: 0, border: `2px solid ${gradeColor}`, background: `${gradeColor}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 28px ${gradeColor}20` }}>
            <span style={{ ...syne, fontSize: 36, color: gradeColor, lineHeight: 1 }}>{grade}</span>
          </div>
          <div>
            <div style={{ ...mono, fontSize: 10, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{date}</div>
            <h1 style={{ ...syne, fontSize: 28, letterSpacing: '-0.03em', marginBottom: 8 }}>{s.session_type}</h1>
            {s.goal && (
              <span style={{ ...mono, fontSize: 10, color: '#22c55e', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', padding: '3px 10px', borderRadius: 100, letterSpacing: '0.05em' }}>
                {s.goal}
              </span>
            )}
            <div style={{ ...mono, fontSize: 11, color: '#555', marginTop: 10 }}>
              Duration: {fmt(s.duration_sec)} · {s.word_count ?? 0} words
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
          {[
            { label: 'Avg WPM', value: s.wpm_avg?.toFixed(0) ?? '—', sub: s.wpm_avg ? (s.wpm_avg < 120 ? 'Too slow' : s.wpm_avg > 160 ? 'Too fast' : 'On pace') : 'No data', color: wpmColor },
            { label: 'Confidence', value: s.confidence?.toFixed(0) ?? '—', sub: s.confidence ? (s.confidence >= 75 ? 'Strong' : s.confidence >= 50 ? 'Building' : 'Keep going') : 'No data', color: confColor },
            { label: 'Filler words', value: String(s.filler_count ?? 0), sub: (s.filler_count ?? 0) > 5 ? 'Watch out' : 'Clean', color: (s.filler_count ?? 0) > 5 ? '#f97316' : '#22c55e' },
          ].map(stat => (
            <div key={stat.label} style={{ border: '1px solid #1f1f23', borderRadius: 12, padding: '20px 24px', background: '#111113' }}>
              <div style={{ ...mono, fontSize: 9.5, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{stat.label}</div>
              <div style={{ ...syne, fontSize: 36, letterSpacing: '-0.04em', lineHeight: 1, color: stat.color }}>{stat.value}</div>
              <div style={{ ...mono, fontSize: 10, color: '#555', marginTop: 6 }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* AI Coaching */}
        {s.ai_coaching && (
          <div style={{ border: '1px solid #1f1f23', borderRadius: 12, background: '#111113', marginBottom: 12, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #1f1f23', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ ...mono, fontSize: 9.5, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase' }}>AI Coaching Report</div>
              <span style={{ ...mono, fontSize: 9, color: '#22c55e', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', padding: '2px 8px', borderRadius: 100 }}>claude</span>
            </div>
            <div style={{ padding: 20 }}>
              <p style={{ fontSize: 14, lineHeight: 1.75, color: '#a0a0a8', marginBottom: 20, marginTop: 0 }}>{s.ai_coaching.summary}</p>
              <div style={{ border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, padding: '16px 18px', background: 'rgba(34,197,94,0.04)', marginBottom: 10 }}>
                <div style={{ ...mono, fontSize: 9, color: '#22c55e', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Strength</div>
                <p style={{ fontSize: 13, color: '#a0a0a8', lineHeight: 1.65, margin: '0 0 10px' }}>{s.ai_coaching.strength.observation}</p>
                <blockquote style={{ margin: 0, paddingLeft: 12, borderLeft: '2px solid rgba(34,197,94,0.4)' }}>
                  <p style={{ ...mono, fontSize: 11, color: '#555', fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>&ldquo;{s.ai_coaching.strength.quote}&rdquo;</p>
                </blockquote>
              </div>
              <div style={{ border: '1px solid rgba(249,115,22,0.2)', borderRadius: 10, padding: '16px 18px', background: 'rgba(249,115,22,0.04)', marginBottom: 10 }}>
                <div style={{ ...mono, fontSize: 9, color: '#f97316', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Improve</div>
                <p style={{ fontSize: 13, color: '#a0a0a8', lineHeight: 1.65, margin: '0 0 10px' }}>{s.ai_coaching.improvement.observation}</p>
                <blockquote style={{ margin: 0, paddingLeft: 12, borderLeft: '2px solid rgba(249,115,22,0.4)' }}>
                  <p style={{ ...mono, fontSize: 11, color: '#555', fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>&ldquo;{s.ai_coaching.improvement.quote}&rdquo;</p>
                </blockquote>
              </div>
              <div style={{ border: '1px solid #1f1f23', borderRadius: 10, padding: '16px 18px', background: '#09090b' }}>
                <div style={{ ...mono, fontSize: 9, color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Daily Drill</div>
                <p style={{ fontSize: 13, color: '#a0a0a8', lineHeight: 1.65, margin: 0 }}>{s.ai_coaching.drill}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filler breakdown */}
        {Object.keys(fillerMap).length > 0 && (
          <div style={{ border: '1px solid #1f1f23', borderRadius: 12, padding: 24, background: '#111113', marginBottom: 12 }}>
            <div style={{ ...mono, fontSize: 9.5, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>Filler breakdown</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(fillerMap).sort((a, b) => b[1] - a[1]).map(([word, count]) => {
                const max = Math.max(...Object.values(fillerMap))
                return (
                  <div key={word} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ ...mono, fontSize: 12, color: '#a0a0a8', minWidth: 48 }}>&ldquo;{word}&rdquo;</div>
                    <div style={{ flex: 1, height: 4, background: '#1f1f23', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(count / max) * 100}%`, background: count > 5 ? '#ef4444' : '#22c55e', borderRadius: 2 }} />
                    </div>
                    <div style={{ ...mono, fontSize: 12, color: count > 5 ? '#ef4444' : '#a0a0a8', minWidth: 20, textAlign: 'right' }}>{count}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* CTA */}
        <div style={{ marginTop: 40, textAlign: 'center', padding: '32px', border: '1px solid #1f1f23', borderRadius: 16, background: '#111113' }}>
          <p style={{ ...mono, fontSize: 11, color: '#555', marginBottom: 12 }}>Want your own AI speaking coach?</p>
          <a href="/" style={{ display: 'inline-block', padding: '11px 28px', borderRadius: 9, background: '#22c55e', color: '#09090b', fontWeight: 600, fontSize: 14, textDecoration: 'none', fontFamily: 'var(--font-dm-sans, sans-serif)' }}>
            Try SpeakUp free →
          </a>
        </div>
      </div>
    </main>
  )
}
