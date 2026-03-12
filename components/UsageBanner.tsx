const mono = { fontFamily: 'var(--font-dm-mono)' } as const
const syne = { fontFamily: 'var(--font-syne)', fontWeight: 800 } as const

export default function UsageBanner({ count, limit }: { count: number; limit: number }) {
  const remaining = Math.max(0, limit - count)
  const pct = Math.min(100, (count / limit) * 100)
  const atLimit = remaining === 0

  return (
    <div style={{ borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `1px solid ${atLimit ? 'rgba(239,68,68,.2)' : 'rgba(34,197,94,.15)'}`, background: atLimit ? 'rgba(239,68,68,.05)' : 'rgba(34,197,94,.04)' }}>
      <div>
        <p style={{ fontSize: 13.5, fontWeight: 500, color: atLimit ? 'var(--red)' : 'var(--text)', marginBottom: 6 }}>
          {atLimit ? 'Monthly limit reached' : `${remaining} session${remaining !== 1 ? 's' : ''} remaining this month`}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 120, height: 2, borderRadius: 2, background: 'var(--border)' }}>
            <div style={{ height: '100%', borderRadius: 2, width: `${pct}%`, background: atLimit ? 'var(--red)' : 'var(--accent)' }} />
          </div>
          <span style={{ ...mono, fontSize: 10, color: 'var(--muted)' }}>{count}/{limit}</span>
        </div>
      </div>
      <a href="/dashboard/settings" style={{ ...mono, fontSize: 11, letterSpacing: '0.06em', padding: '7px 16px', borderRadius: 8, textDecoration: 'none', background: 'var(--accent)', color: '#09090b', fontWeight: 700 }}>
        UPGRADE
      </a>
    </div>
  )
}
