import { createClient } from '@/lib/supabase/server'
import TrendCharts from '@/components/TrendCharts'

export default async function TrendsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: sessions } = await supabase
    .from('sessions')
    .select('created_at, wpm_avg, confidence, filler_count, grade, duration_sec')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: true })
    .limit(100)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Trends</h1>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>Your performance over time</p>
      </div>
      <TrendCharts sessions={sessions ?? []} />
    </div>
  )
}
