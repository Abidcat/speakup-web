import { createClient } from '@/lib/supabase/server'
import TeamClient from '@/components/TeamClient'

const syne = { fontFamily: 'var(--font-syne)', fontWeight: 800 } as const

export default async function TeamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: subscription }, { data: ownedTeam }, { data: memberTeam }] = await Promise.all([
    supabase.from('subscriptions').select('plan,status').eq('user_id', user!.id).single(),
    supabase.from('teams').select('*').eq('owner_id', user!.id).single(),
    supabase.from('team_members').select('team_id, teams(*)').eq('user_id', user!.id).eq('status', 'active').single(),
  ])

  const plan = subscription?.plan ?? 'free'
  const team = ownedTeam ?? (memberTeam as { team_id: string; teams: { id: string; name: string; owner_id: string } } | null)?.teams ?? null
  const isOwner = team ? team.owner_id === user!.id : false

  const { data: members } = team
    ? await supabase.from('team_members').select('*').eq('team_id', team.id).order('invited_at', { ascending: true })
    : { data: [] }

  // Team-level analytics (aggregate session stats for all members)
  let teamStats: { email: string; sessions: number; avgGrade: string; avgWpm: number | null }[] = []
  if (team && isOwner && members && members.length > 0) {
    const activeMembers = members.filter(m => m.status === 'active' && m.user_id)
    if (activeMembers.length > 0) {
      const userIds = activeMembers.map(m => m.user_id)
      const { data: sessionData } = await supabase
        .from('sessions')
        .select('user_id, grade, wpm_avg')
        .in('user_id', userIds)
      if (sessionData) {
        teamStats = activeMembers.map(m => {
          const userSessions = sessionData.filter(s => s.user_id === m.user_id)
          const gradeOrder = ['S', 'A', 'B', 'C', 'D']
          const grades = userSessions.map(s => s.grade).filter(Boolean) as string[]
          const avgGradeIdx = grades.length
            ? Math.round(grades.reduce((sum, g) => sum + gradeOrder.indexOf(g), 0) / grades.length)
            : -1
          const wpms = userSessions.map(s => s.wpm_avg).filter(Boolean) as number[]
          return {
            email: m.email,
            sessions: userSessions.length,
            avgGrade: avgGradeIdx >= 0 ? gradeOrder[avgGradeIdx] : '—',
            avgWpm: wpms.length ? Math.round(wpms.reduce((a, b) => a + b, 0) / wpms.length) : null,
          }
        })
      }
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: 10, color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 } as React.CSSProperties}>
          Workspace
        </div>
        <h1 style={{ ...syne, fontSize: 'clamp(28px,4vw,40px)', letterSpacing: '-0.04em', lineHeight: 0.97 } as React.CSSProperties}>
          Team
        </h1>
      </div>

      {/* Team analytics (owner only, active members only) */}
      {isOwner && teamStats.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: 9.5, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 } as React.CSSProperties}>
            Team analytics
          </div>
          <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', background: 'var(--surface)' }}>
            <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px', gap: 8 }}>
              {['Member', 'Sessions', 'Avg Grade', 'Avg WPM'].map(h => (
                <div key={h} style={{ fontFamily: 'var(--font-dm-mono)', fontSize: 9, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase' } as React.CSSProperties}>{h}</div>
              ))}
            </div>
            {teamStats.map(s => (
              <div key={s.email} style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px', gap: 8, alignItems: 'center' }}>
                <div style={{ fontSize: 13, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.email}</div>
                <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: 13, color: 'var(--text)' } as React.CSSProperties}>{s.sessions}</div>
                <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 18, color: s.avgGrade === 'S' || s.avgGrade === 'A' ? 'var(--accent)' : s.avgGrade === 'B' ? '#86efac' : s.avgGrade === 'C' ? 'var(--orange)' : s.avgGrade === 'D' ? 'var(--red)' : 'var(--muted)' } as React.CSSProperties}>
                  {s.avgGrade}
                </div>
                <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: 13, color: 'var(--text2)' } as React.CSSProperties}>
                  {s.avgWpm ?? '—'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <TeamClient
        team={team}
        members={members ?? []}
        isOwner={isOwner}
        plan={plan}
      />
    </div>
  )
}
