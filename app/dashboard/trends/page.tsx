import { createClient } from '@/lib/supabase/server'
import TrendCharts from '@/components/TrendCharts'

export default async function TrendsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: sessions } = await supabase
    .from('sessions')
    .select('created_at,wpm_avg,confidence,filler_count,grade,duration_sec')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: true })
    .limit(100)

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: 10, color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 } as React.CSSProperties}>Analytics</div>
        <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 'clamp(32px,4vw,48px)', letterSpacing: '-0.04em', lineHeight: 0.97 } as React.CSSProperties}>Trends</h1>
      </div>
      <TrendCharts sessions={sessions ?? []} />
    </div>
  )
}
