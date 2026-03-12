'use client'

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid,
} from 'recharts'

type SessionRow = {
  created_at: string
  wpm_avg: number | null
  confidence: number | null
  filler_count: number
  grade: string | null
  duration_sec: number
}

export default function TrendCharts({ sessions }: { sessions: SessionRow[] }) {
  if (sessions.length === 0) {
    return (
      <div
        className="text-center py-20 rounded-2xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div className="text-4xl mb-4">📈</div>
        <p className="font-medium mb-2">No data yet</p>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>Complete a few sessions to see your trends</p>
      </div>
    )
  }

  const data = sessions.map((s) => ({
    date: new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    wpm: s.wpm_avg ?? 0,
    confidence: s.confidence ?? 0,
    fillers: s.filler_count,
  }))

  const tooltipStyle = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text)',
    fontSize: 12,
  }

  return (
    <div className="space-y-8">
      <ChartCard title="Words per minute" subtitle="Target: 120–160 WPM">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" tick={{ fill: 'var(--muted)', fontSize: 11 }} />
            <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} domain={[60, 200]} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="wpm" stroke="#00FF88" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Confidence score" subtitle="Higher is better (0–100)">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" tick={{ fill: 'var(--muted)', fontSize: 11 }} />
            <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} domain={[0, 100]} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="confidence" stroke="#86efac" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Filler words per session" subtitle="Lower is better">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" tick={{ fill: 'var(--muted)', fontSize: 11 }} />
            <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="fillers" fill="#facc15" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <h3 className="font-semibold mb-0.5">{title}</h3>
      <p className="text-xs mb-5" style={{ color: 'var(--muted)' }}>{subtitle}</p>
      {children}
    </div>
  )
}
