'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Profile = { full_name: string | null; email: string; avatar_url: string | null } | null
type Subscription = { plan: string; status: string; current_period_end: string | null; stripe_customer_id: string | null } | null

export default function SettingsClient({ profile, subscription }: { profile: Profile; subscription: Subscription }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [upgradeLoading, setUpgradeLoading] = useState(false)

  const plan = subscription?.plan ?? 'free'
  const isPro = plan === 'pro' && subscription?.status === 'active'

  async function openBillingPortal() {
    setPortalLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.functions.invoke('create-portal')
    if (error || !data?.url) { setPortalLoading(false); return }
    window.open(data.url, '_blank')
    setPortalLoading(false)
  }

  async function startCheckout() {
    setUpgradeLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.functions.invoke('create-checkout')
    if (error || !data?.url) { setUpgradeLoading(false); return }
    window.open(data.url, '_blank')
    setUpgradeLoading(false)
  }

  async function deleteAccount() {
    if (!confirm('This will permanently delete your account and all session data. Are you sure?')) return
    setDeleting(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="space-y-6">
      {/* Profile */}
      <Section title="Profile">
        <div className="space-y-1">
          <Row label="Name" value={profile?.full_name ?? '—'} />
          <Row label="Email" value={profile?.email ?? '—'} />
        </div>
      </Section>

      {/* Plan */}
      <Section title="Plan">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold capitalize">{plan}</span>
              {isPro && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,255,136,0.15)', color: 'var(--green)' }}>
                  Active
                </span>
              )}
            </div>
            {isPro && subscription?.current_period_end && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                Renews {new Date(subscription.current_period_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            )}
            {!isPro && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>3 sessions/month</p>
            )}
          </div>
          {isPro ? (
            <button
              onClick={openBillingPortal}
              disabled={portalLoading}
              className="text-sm px-4 py-2 rounded-lg font-medium cursor-pointer disabled:opacity-50"
              style={{ background: 'var(--border)', color: 'var(--text)' }}
            >
              {portalLoading ? 'Loading…' : 'Manage billing'}
            </button>
          ) : (
            <button
              onClick={startCheckout}
              disabled={upgradeLoading}
              className="text-sm px-4 py-2 rounded-lg font-semibold cursor-pointer disabled:opacity-50"
              style={{ background: 'var(--green)', color: '#000' }}
            >
              {upgradeLoading ? 'Loading…' : 'Upgrade to Pro — $14/mo'}
            </button>
          )}
        </div>
      </Section>

      {/* Danger zone */}
      <Section title="Danger zone">
        <button
          onClick={deleteAccount}
          disabled={deleting}
          className="text-sm px-4 py-2 rounded-lg font-medium cursor-pointer disabled:opacity-50"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          {deleting ? 'Signing out…' : 'Delete account'}
        </button>
        <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>
          Contact support to permanently delete your data.
        </p>
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--muted)' }}>{title.toUpperCase()}</h3>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
      <span className="text-sm" style={{ color: 'var(--muted)' }}>{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  )
}
