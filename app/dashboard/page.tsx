import { createClient } from '@/lib/supabase/server'
import SessionCard from '@/components/SessionCard'
import UsageBanner from '@/components/UsageBanner'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: sessions }, { data: subscription }, { data: usage }] = await Promise.all([
    supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('subscriptions')
      .select('plan, status, current_period_end')
      .eq('user_id', user!.id)
      .single(),
    supabase
      .from('usage')
      .select('session_count')
      .eq('user_id', user!.id)
      .eq('month', new Date().toISOString().slice(0, 7))
      .single(),
  ])

  const plan = subscription?.plan ?? 'free'
  const sessionCount = usage?.session_count ?? 0

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Sessions</h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Your speaking history and performance
          </p>
        </div>
        <a
          href="/dashboard/trends"
          className="text-sm px-4 py-2 rounded-lg font-medium"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
        >
          View trends →
        </a>
      </div>

      {plan === 'free' && (
        <UsageBanner count={sessionCount} limit={3} />
      )}

      {!sessions || sessions.length === 0 ? (
        <div
          className="text-center py-20 rounded-2xl"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div className="text-4xl mb-4">🎙️</div>
          <p className="font-medium mb-2">No sessions yet</p>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Open the SpeakUp app and start your first session
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <SessionCard key={s.id} session={s} />
          ))}
        </div>
      )}
    </div>
  )
}
