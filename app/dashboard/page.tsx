import { createClient } from '@/lib/supabase/server'
import SessionList from '@/components/SessionList'
import UsageBanner from '@/components/UsageBanner'

const mono = { fontFamily: 'var(--font-dm-mono)' }
const syne = { fontFamily: 'var(--font-syne)', fontWeight: 800 }

const GRADE_COLOR: Record<string, string> = { S: '#22c55e', A: '#22c55e', B: '#86efac', C: '#f97316', D: '#ef4444' }

function avg(arr: number[]) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: sessions }, { data: subscription }, { data: usage }, { data: profile }] = await Promise.all([
    supabase.from('sessions').select('*').order('created_at', { ascending: false }).limit(200),
    supabase.from('subscriptions').select('plan,status,current_period_end').eq('user_id', user!.id).single(),
    supabase.from('usage').select('session_count').eq('user_id', user!.id).eq('month', new Date().toISOString().slice(0,7)).single(),
    supabase.from('profiles').select('streak_current,streak_max').eq('id', user!.id).single(),
  ])

  const plan = subscription?.plan ?? 'free'
  const count = usage?.session_count ?? 0
  const streak = profile?.streak_current ?? 0
  const streakMax = profile?.streak_max ?? 0

  const ss = sessions ?? []
  const totalSessions = ss.length
  const avgWpm = avg(ss.filter(s => s.wpm_avg).map(s => s.wpm_avg!))
  const avgConf = avg(ss.filter(s => s.confidence).map(s => s.confidence!))
  const bestGrade = ss.reduce((best: string | null, s) => {
    const order = ['S','A','B','C','D']
    if (!s.grade) return best
    if (!best) return s.grade
    return order.indexOf(s.grade) < order.indexOf(best) ? s.grade : best
  }, null)

  const hasStats = totalSessions > 0

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: hasStats ? 24 : 32 }}>
        <div>
          <div style={{ ...mono, fontSize: 10, color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 } as React.CSSProperties}>Sessions</div>
          <h1 style={{ ...syne, fontSize: 'clamp(28px,4vw,40px)', letterSpacing: '-0.04em', lineHeight: 0.97 } as React.CSSProperties}>Your history</h1>
        </div>
        <a href="/dashboard/trends" style={{ fontFamily: 'var(--font-dm-mono)', fontSize: 11, letterSpacing: '0.06em', padding: '8px 16px', borderRadius: 8, textDecoration: 'none', color: 'var(--text2)', border: '1px solid var(--border)', background: 'var(--surface)' }}>
          TRENDS →
        </a>
      </div>

      {/* Summary stats */}
      {hasStats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 24 }}>
          {[
            { label: 'Total sessions', value: String(totalSessions), sub: 'all time' },
            { label: 'Avg WPM', value: avgWpm ? avgWpm.toFixed(0) : '—', sub: avgWpm ? (avgWpm < 120 ? 'too slow' : avgWpm > 160 ? 'too fast' : 'on pace') : 'no data' },
            { label: 'Avg confidence', value: avgConf ? avgConf.toFixed(0) : '—', sub: avgConf ? (avgConf >= 75 ? 'strong' : avgConf >= 50 ? 'building' : 'keep going') : 'no data' },
            { label: 'Best grade', value: bestGrade ?? '—', sub: 'personal best', color: bestGrade ? GRADE_COLOR[bestGrade] : undefined },
          ].map(stat => (
            <div key={stat.label} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', background: 'var(--surface)' }}>
              <div style={{ ...mono, fontSize: 9, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 } as React.CSSProperties}>{stat.label}</div>
              <div style={{ ...syne, fontSize: 28, letterSpacing: '-0.04em', lineHeight: 1, color: stat.color ?? 'var(--text)' } as React.CSSProperties}>{stat.value}</div>
              <div style={{ ...mono, fontSize: 9.5, color: 'var(--muted)', marginTop: 4, letterSpacing: '0.04em' } as React.CSSProperties}>{stat.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Streak banner */}
      {streak > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderRadius: 12, marginBottom: 16, border: '1px solid rgba(34,197,94,0.15)', background: 'linear-gradient(135deg,rgba(34,197,94,0.06),rgba(34,197,94,0.02))' }}>
          <span style={{ fontSize: 24, lineHeight: 1 }}>🔥</span>
          <div>
            <div style={{ ...syne, fontSize: 22, color: '#22c55e', lineHeight: 1 } as React.CSSProperties}>{streak} day streak</div>
            <div style={{ ...mono, fontSize: 10, color: 'var(--muted)', marginTop: 3 } as React.CSSProperties}>Best: {streakMax} days</div>
          </div>
        </div>
      )}

      {plan === 'free' && <UsageBanner count={count} limit={3} />}

      {/* Session list with search/filter */}
      {!sessions || sessions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 40px', borderRadius: 16, border: '1px solid var(--border)', background: 'var(--surface)' }}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>🎙</div>
          <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.025em', marginBottom: 8 }}>No sessions yet</p>
          <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.04em' }}>Open the SpeakUp app and start your first session</p>
        </div>
      ) : (
        <SessionList sessions={ss} />
      )}
    </div>
  )
}
