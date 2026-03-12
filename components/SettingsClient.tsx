'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const mono = { fontFamily: 'var(--font-dm-mono)' } as const
const syne = { fontFamily: 'var(--font-syne)', fontWeight: 800 } as const

type Profile = { full_name: string | null; email: string; avatar_url: string | null } | null
type Subscription = { plan: string; status: string; current_period_end: string | null; stripe_customer_id: string | null } | null

export default function SettingsClient({ profile, subscription }: { profile: Profile; subscription: Subscription }) {
  const router = useRouter()
  const [portalLoading, setPortalLoading] = useState(false)
  const [upgradeLoading, setUpgradeLoading] = useState(false)

  const isPro = subscription?.plan === 'pro' && subscription?.status === 'active'

  async function openBillingPortal() {
    setPortalLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.functions.invoke('create-portal')
    if (!error && data?.url) window.open(data.url, '_blank')
    setPortalLoading(false)
  }

  async function startCheckout() {
    setUpgradeLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.functions.invoke('create-checkout')
    if (!error && data?.url) window.open(data.url, '_blank')
    setUpgradeLoading(false)
  }

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Profile */}
      <Card label="PROFILE">
        <Row label="Name"  value={profile?.full_name ?? '—'} />
        <Row label="Email" value={profile?.email ?? '—'} />
      </Card>

      {/* Plan */}
      <Card label="PLAN">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ ...syne, fontSize: 18, letterSpacing: '-0.03em', textTransform: 'capitalize' }}>{subscription?.plan ?? 'Free'}</span>
              {isPro && <span style={{ ...mono, fontSize: 9, color: 'var(--accent)', background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.2)', padding: '2px 8px', borderRadius: 100, letterSpacing: '0.06em' }}>ACTIVE</span>}
            </div>
            <p style={{ ...mono, fontSize: 11, color: 'var(--muted)' }}>
              {isPro && subscription?.current_period_end
                ? `Renews ${new Date(subscription.current_period_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                : '3 sessions / month'}
            </p>
          </div>
          {isPro
            ? <button onClick={openBillingPortal} disabled={portalLoading} style={outlineBtn}>{portalLoading ? 'Loading…' : 'Manage billing'}</button>
            : <button onClick={startCheckout} disabled={upgradeLoading} style={accentBtn}>{upgradeLoading ? 'Loading…' : 'Upgrade to Pro — $14/mo'}</button>
          }
        </div>
      </Card>

      {/* Danger */}
      <Card label="ACCOUNT">
        <button onClick={signOut} style={outlineBtn}>Sign out</button>
        <p style={{ ...mono, fontSize: 10.5, color: 'var(--muted)', marginTop: 10 }}>Contact support to permanently delete your data.</p>
      </Card>
    </div>
  )
}

const accentBtn: React.CSSProperties = { padding: '8px 18px', borderRadius: 8, fontFamily: 'var(--font-dm-sans)', fontSize: 13, fontWeight: 500, cursor: 'pointer', background: 'var(--accent)', color: '#09090b', border: 'none' }
const outlineBtn: React.CSSProperties = { padding: '8px 18px', borderRadius: 8, fontFamily: 'var(--font-dm-sans)', fontSize: 13, fontWeight: 400, cursor: 'pointer', background: 'transparent', color: 'var(--text2)', border: '1px solid var(--border)' }

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 14, padding: '24px 24px', background: 'var(--surface)' }}>
      <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: 9.5, color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 16 }}>{label}</div>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.04em' }}>{label.toUpperCase()}</span>
      <span style={{ fontSize: 13.5 }}>{value}</span>
    </div>
  )
}
