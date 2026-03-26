'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const mono = { fontFamily: 'var(--font-dm-mono)' } as const
const syne = { fontFamily: 'var(--font-syne)', fontWeight: 800 } as const

type Member = {
  id: string
  email: string
  role: string
  status: string
  invited_at: string
  joined_at?: string
}

type Team = {
  id: string
  name: string
  owner_id: string
}

type Props = {
  team: Team | null
  members: Member[]
  isOwner: boolean
  plan: string
}

export default function TeamClient({ team: initialTeam, members: initialMembers, isOwner, plan }: Props) {
  const [team, setTeam] = useState<Team | null>(initialTeam)
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [teamName, setTeamName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [creating, setCreating] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const supabase = createClient()

  async function createTeam() {
    if (!teamName.trim()) return
    setCreating(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setCreating(false); return }
    const { data } = await supabase
      .from('teams')
      .insert({ name: teamName.trim(), owner_id: user.id })
      .select()
      .single()
    if (data) setTeam(data)
    setCreating(false)
  }

  async function invite() {
    if (!inviteEmail.trim() || !team) return
    setInviting(true)
    const { data } = await supabase
      .from('team_members')
      .insert({ team_id: team.id, email: inviteEmail.trim().toLowerCase(), role: 'member', status: 'pending' })
      .select()
      .single()
    if (data) setMembers(prev => [...prev, data])
    setInviteEmail('')
    setInviting(false)
  }

  async function removeMember(id: string) {
    setRemoving(id)
    await supabase.from('team_members').delete().eq('id', id)
    setMembers(prev => prev.filter(m => m.id !== id))
    setRemoving(null)
  }

  // No team plan
  if (plan === 'free' || plan === 'pro') {
    return (
      <div style={{ border: '1px solid rgba(77,158,255,0.2)', borderRadius: 16, padding: '40px 36px', background: 'rgba(77,158,255,0.04)', textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 16 }}>👥</div>
        <h2 style={{ ...syne, fontSize: 24, letterSpacing: '-0.03em', marginBottom: 8 }}>Team plan required</h2>
        <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 24, maxWidth: 420, margin: '0 auto 24px' }}>
          The Team plan gives you up to 5 seats, a shared analytics dashboard, and admin seat management — starting at $39/mo.
        </p>
        <a
          href="/dashboard/settings"
          style={{ display: 'inline-block', padding: '11px 28px', borderRadius: 9, background: 'var(--accent)', color: '#09090b', fontWeight: 600, fontSize: 14, textDecoration: 'none', fontFamily: 'var(--font-dm-sans)' }}
        >
          Upgrade to Team →
        </a>
      </div>
    )
  }

  // Has team plan but no team yet
  if (!team) {
    return (
      <div style={{ border: '1px solid var(--border)', borderRadius: 16, padding: '40px 36px', background: 'var(--surface)', maxWidth: 480 }}>
        <div style={{ ...mono, fontSize: 10, color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Create your team</div>
        <h2 style={{ ...syne, fontSize: 24, letterSpacing: '-0.03em', marginBottom: 20 }}>Name your workspace</h2>
        <input
          value={teamName}
          onChange={e => setTeamName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && createTeam()}
          placeholder="e.g. Acme Sales Team"
          style={{
            width: '100%', padding: '11px 14px', borderRadius: 8, marginBottom: 12,
            border: '1px solid var(--border)', background: 'var(--bg)',
            color: 'var(--text)', fontFamily: 'var(--font-dm-sans)', fontSize: 14, outline: 'none',
          }}
        />
        <button
          onClick={createTeam}
          disabled={!teamName.trim() || creating}
          style={{
            width: '100%', padding: 12, borderRadius: 8, cursor: 'pointer',
            border: 'none', background: teamName.trim() ? 'var(--accent)' : 'var(--surface)',
            color: teamName.trim() ? '#09090b' : 'var(--muted)',
            fontFamily: 'var(--font-dm-sans)', fontSize: 14, fontWeight: 600,
          }}
        >
          {creating ? 'Creating…' : 'Create team'}
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Team header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px', border: '1px solid var(--border)', borderRadius: 12, background: 'var(--surface)', marginBottom: 24 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
          👥
        </div>
        <div>
          <div style={{ ...syne, fontSize: 18, letterSpacing: '-0.025em' }}>{team.name}</div>
          <div style={{ ...mono, fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
            {members.length} member{members.length !== 1 ? 's' : ''} · Team plan
          </div>
        </div>
      </div>

      {/* Invite form */}
      {isOwner && members.length < 5 && (
        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px', background: 'var(--surface)', marginBottom: 16 }}>
          <div style={{ ...mono, fontSize: 9.5, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            Invite member ({members.length}/5 seats used)
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && invite()}
              placeholder="colleague@company.com"
              type="email"
              style={{
                flex: 1, padding: '9px 14px', borderRadius: 8,
                border: '1px solid var(--border)', background: 'var(--bg)',
                color: 'var(--text)', fontFamily: 'var(--font-dm-mono)', fontSize: 12, outline: 'none',
              }}
            />
            <button
              onClick={invite}
              disabled={!inviteEmail.includes('@') || inviting}
              style={{
                ...mono, fontSize: 11, padding: '9px 20px', borderRadius: 8, cursor: 'pointer',
                border: 'none', background: inviteEmail.includes('@') ? 'var(--accent)' : 'var(--surface)',
                color: inviteEmail.includes('@') ? '#09090b' : 'var(--muted)', fontWeight: 600,
              }}
            >
              {inviting ? 'SENDING…' : 'INVITE'}
            </button>
          </div>
        </div>
      )}

      {members.length >= 5 && isOwner && (
        <div style={{ ...mono, fontSize: 11, color: 'var(--orange)', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(249,115,22,0.2)', background: 'rgba(249,115,22,0.04)', marginBottom: 16 }}>
          Seat limit reached (5/5). Remove a member to invite someone new.
        </div>
      )}

      {/* Member list */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', background: 'var(--surface)' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px', gap: 8 }}>
          {['Email', 'Role', 'Status', ''].map(h => (
            <div key={h} style={{ ...mono, fontSize: 9, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</div>
          ))}
        </div>
        {members.length === 0 ? (
          <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--font-dm-mono)', fontSize: 12 }}>
            No members yet — invite your team
          </div>
        ) : (
          members.map(m => (
            <div key={m.id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px', gap: 8, alignItems: 'center' }}>
              <div style={{ fontSize: 13, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.email}</div>
              <div style={{ ...mono, fontSize: 10, color: m.role === 'admin' ? 'var(--accent)' : 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.role}</div>
              <div>
                <span style={{
                  ...mono, fontSize: 9, padding: '3px 8px', borderRadius: 100, letterSpacing: '0.06em',
                  background: m.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(249,115,22,0.1)',
                  color: m.status === 'active' ? 'var(--accent)' : 'var(--orange)',
                  border: `1px solid ${m.status === 'active' ? 'rgba(34,197,94,0.2)' : 'rgba(249,115,22,0.2)'}`,
                }}>
                  {m.status}
                </span>
              </div>
              {isOwner && (
                <button
                  onClick={() => removeMember(m.id)}
                  disabled={removing === m.id}
                  style={{ ...mono, fontSize: 10, padding: '4px 8px', borderRadius: 5, cursor: 'pointer', border: '1px solid var(--border)', background: 'transparent', color: 'var(--muted)' }}
                >
                  {removing === m.id ? '…' : 'Remove'}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
