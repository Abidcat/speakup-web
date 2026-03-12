import { createClient } from '@/lib/supabase/server'
import SettingsClient from '@/components/SettingsClient'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: subscription }] = await Promise.all([
    supabase.from('profiles').select('full_name,email,avatar_url').eq('id', user!.id).single(),
    supabase.from('subscriptions').select('plan,status,current_period_end,stripe_customer_id').eq('user_id', user!.id).single(),
  ])

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: 10, color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 } as React.CSSProperties}>Settings</div>
        <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 'clamp(32px,4vw,48px)', letterSpacing: '-0.04em', lineHeight: 0.97 } as React.CSSProperties}>Account</h1>
      </div>
      <SettingsClient profile={profile} subscription={subscription} />
    </div>
  )
}
