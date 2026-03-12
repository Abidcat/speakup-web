import { createClient } from '@/lib/supabase/server'
import SessionCard from '@/components/SessionCard'
import UsageBanner from '@/components/UsageBanner'

const mono = { fontFamily: 'var(--font-dm-mono)' }
const syne = { fontFamily: 'var(--font-syne)', fontWeight: 800 }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: sessions }, { data: subscription }, { data: usage }] = await Promise.all([
    supabase.from('sessions').select('*').order('created_at', { ascending: false }).limit(50),
    supabase.from('subscriptions').select('plan,status,current_period_end').eq('user_id', user!.id).single(),
    supabase.from('usage').select('session_count').eq('user_id', user!.id).eq('month', new Date().toISOString().slice(0,7)).single(),
  ])

  const plan = subscription?.plan ?? 'free'
  const count = usage?.session_count ?? 0

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <div style={{ ...mono, fontSize: 10, color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 } as React.CSSProperties}>Sessions</div>
          <h1 style={{ ...syne, fontSize: 'clamp(32px,4vw,48px)', letterSpacing: '-0.04em', lineHeight: 0.97 } as React.CSSProperties}>Your history</h1>
        </div>
        <a href="/dashboard/trends" style={{ fontFamily: 'var(--font-dm-mono)', fontSize: 11, letterSpacing: '0.06em', padding: '8px 16px', borderRadius: 8, textDecoration: 'none', color: 'var(--text2)', border: '1px solid var(--border)', background: 'var(--surface)' }}>
          VIEW TRENDS →
        </a>
      </div>

      {plan === 'free' && <UsageBanner count={count} limit={3} />}

      {!sessions || sessions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 40px', borderRadius: 16, border: '1px solid var(--border)', background: 'var(--surface)' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🎙</div>
          <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.025em', marginBottom: 8 }}>No sessions yet</p>
          <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.04em' }}>Open the SpeakUp app and start your first session</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sessions.map(s => <SessionCard key={s.id} session={s} />)}
        </div>
      )}
    </div>
  )
}
