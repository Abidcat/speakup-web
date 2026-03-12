'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts'

type SessionRow = { created_at: string; wpm_avg: number | null; confidence: number | null; filler_count: number; grade: string | null; duration_sec: number }

const mono = { fontFamily: 'var(--font-dm-mono)' } as const
const syne = { fontFamily: 'var(--font-syne)', fontWeight: 800 } as const
const tooltipStyle = { background: '#101013', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, color: '#f0f0f2', fontSize: 12 }

function ChartCard({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '24px 28px', background: '#101013' }}>
      <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: 9.5, color: '#22c55e', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 } as React.CSSProperties}>{label}</div>
      <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 18, letterSpacing: '-0.03em', marginBottom: 20 }}>{title}</div>
      {children}
    </div>
  )
}

export default function TrendCharts({ sessions }: { sessions: SessionRow[] }) {
  if (sessions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 40px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', background: '#101013' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>📈</div>
        <p style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.025em', marginBottom: 8 }}>No data yet</p>
        <p style={{ fontFamily: 'var(--font-dm-mono)', fontSize: 11, color: '#424252', letterSpacing: '0.04em' }}>Complete a few sessions to see your trends</p>
      </div>
    )
  }

  const data = sessions.map(s => ({
    date: new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    wpm: s.wpm_avg ?? 0,
    confidence: s.confidence ?? 0,
    fillers: s.filler_count,
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ChartCard label="Pace" title="Words per minute">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="date" tick={{ fill: '#424252', fontSize: 11 }} />
            <YAxis tick={{ fill: '#424252', fontSize: 11 }} domain={[60, 200]} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="wpm" stroke="#22c55e" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard label="Clarity" title="Confidence score">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="date" tick={{ fill: '#424252', fontSize: 11 }} />
            <YAxis tick={{ fill: '#424252', fontSize: 11 }} domain={[0, 100]} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="confidence" stroke="#86efac" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard label="Fillers" title="Filler words per session">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="date" tick={{ fill: '#424252', fontSize: 11 }} />
            <YAxis tick={{ fill: '#424252', fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="fillers" fill="#f97316" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
