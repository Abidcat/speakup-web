export default function UsageBanner({ count, limit }: { count: number; limit: number }) {
  const remaining = Math.max(0, limit - count)
  const pct = Math.min(100, (count / limit) * 100)

  if (remaining > 0) {
    return (
      <div
        className="rounded-xl p-4 mb-6 flex items-center justify-between"
        style={{ background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.15)' }}
      >
        <div>
          <p className="text-sm font-medium">
            {remaining} session{remaining !== 1 ? 's' : ''} remaining this month
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="w-32 h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--green)' }} />
            </div>
            <span className="text-xs" style={{ color: 'var(--muted)' }}>{count}/{limit}</span>
          </div>
        </div>
        <a
          href="/dashboard/settings"
          className="text-sm font-semibold px-4 py-2 rounded-lg"
          style={{ background: 'var(--green)', color: '#000' }}
        >
          Upgrade
        </a>
      </div>
    )
  }

  return (
    <div
      className="rounded-xl p-4 mb-6 flex items-center justify-between"
      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
    >
      <div>
        <p className="text-sm font-medium" style={{ color: '#ef4444' }}>Monthly limit reached</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>Upgrade to Pro for unlimited sessions</p>
      </div>
      <a
        href="/dashboard/settings"
        className="text-sm font-semibold px-4 py-2 rounded-lg"
        style={{ background: 'var(--green)', color: '#000' }}
      >
        Upgrade to Pro
      </a>
    </div>
  )
}
