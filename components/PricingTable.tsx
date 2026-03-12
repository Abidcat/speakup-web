type Props = { onCtaClick: () => void }

const FREE_FEATURES = [
  '3 sessions per month',
  'Live WPM + filler tracking',
  'Real-time coaching tips',
  'Post-session grade & recap',
  'Session history (last 10)',
]

const PRO_FEATURES = [
  'Unlimited sessions',
  'Live teleprompter',
  'Full session history + trends',
  'Priority support',
  'Everything in Free',
]

export default function PricingTable({ onCtaClick }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Free */}
      <div
        className="rounded-2xl p-8"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div className="text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>Free</div>
        <div className="flex items-end gap-1 mb-6">
          <span className="text-5xl font-bold">$0</span>
          <span className="text-sm mb-2" style={{ color: 'var(--muted)' }}>/month</span>
        </div>
        <ul className="space-y-3 mb-8">
          {FREE_FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm">
              <span style={{ color: 'var(--green)' }}>✓</span>
              <span style={{ color: 'var(--muted)' }}>{f}</span>
            </li>
          ))}
        </ul>
        <button
          onClick={onCtaClick}
          className="w-full py-3 rounded-xl font-semibold text-sm cursor-pointer"
          style={{ background: 'var(--border)', color: 'var(--text)' }}
        >
          Download Free
        </button>
      </div>

      {/* Pro */}
      <div
        className="rounded-2xl p-8 relative overflow-hidden"
        style={{ background: 'var(--surface)', border: '1px solid var(--green)' }}
      >
        <div
          className="absolute top-4 right-4 text-xs font-semibold px-2 py-1 rounded-full"
          style={{ background: 'rgba(0,255,136,0.15)', color: 'var(--green)' }}
        >
          Most popular
        </div>
        <div className="text-sm font-medium mb-1" style={{ color: 'var(--green)' }}>Pro</div>
        <div className="flex items-end gap-1 mb-6">
          <span className="text-5xl font-bold">$14</span>
          <span className="text-sm mb-2" style={{ color: 'var(--muted)' }}>/month</span>
        </div>
        <ul className="space-y-3 mb-8">
          {PRO_FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm">
              <span style={{ color: 'var(--green)' }}>✓</span>
              <span style={{ color: 'var(--muted)' }}>{f}</span>
            </li>
          ))}
        </ul>
        <button
          onClick={onCtaClick}
          className="w-full py-3 rounded-xl font-semibold text-sm cursor-pointer"
          style={{ background: 'var(--green)', color: '#000' }}
        >
          Start Pro — $14/mo
        </button>
        <p className="text-xs text-center mt-3" style={{ color: 'var(--muted)' }}>Cancel anytime</p>
      </div>
    </div>
  )
}
