'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const mono = { fontFamily: 'var(--font-dm-mono)' } as const
const syne = { fontFamily: 'var(--font-syne)', fontWeight: 800 } as const

type Script = {
  id: string
  title: string
  content: string
  tags: string[]
  created_at: string
  updated_at: string
}

export default function ScriptsClient({ initial }: { initial: Script[] }) {
  const [scripts, setScripts] = useState<Script[]>(initial)
  const [creating, setCreating] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const supabase = createClient()

  async function save() {
    if (!title.trim() || !content.trim()) return
    setSaving(true)
    if (editId) {
      const { data } = await supabase
        .from('scripts')
        .update({ title: title.trim(), content: content.trim(), updated_at: new Date().toISOString() })
        .eq('id', editId)
        .select()
        .single()
      if (data) setScripts(prev => prev.map(s => s.id === editId ? data : s))
    } else {
      const { data } = await supabase
        .from('scripts')
        .insert({ title: title.trim(), content: content.trim() })
        .select()
        .single()
      if (data) setScripts(prev => [data, ...prev])
    }
    setSaving(false)
    setCreating(false)
    setEditId(null)
    setTitle('')
    setContent('')
  }

  function startEdit(s: Script) {
    setEditId(s.id)
    setTitle(s.title)
    setContent(s.content)
    setCreating(true)
    setExpandedId(null)
  }

  function cancel() {
    setCreating(false)
    setEditId(null)
    setTitle('')
    setContent('')
  }

  async function remove(id: string) {
    await supabase.from('scripts').delete().eq('id', id)
    setScripts(prev => prev.filter(s => s.id !== id))
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
  }

  const wordCount = (text: string) => text.trim() ? text.trim().split(/\s+/).length : 0

  return (
    <div>
      {/* Header actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ ...mono, fontSize: 9.5, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {scripts.length} script{scripts.length !== 1 ? 's' : ''}
        </div>
        {!creating && (
          <button
            onClick={() => { setCreating(true); setEditId(null); setTitle(''); setContent('') }}
            style={{
              ...mono, fontSize: 11, padding: '7px 16px', borderRadius: 8, cursor: 'pointer',
              border: '1px solid var(--accent)', background: 'rgba(34,197,94,0.08)',
              color: 'var(--accent)', letterSpacing: '0.06em',
            }}
          >
            + NEW SCRIPT
          </button>
        )}
      </div>

      {/* Create / Edit form */}
      {creating && (
        <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 24, background: 'var(--surface)', marginBottom: 16 }}>
          <div style={{ ...mono, fontSize: 9.5, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
            {editId ? 'Edit script' : 'New script'}
          </div>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Script title..."
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 8, marginBottom: 12,
              border: '1px solid var(--border)', background: 'var(--bg)',
              color: 'var(--text)', fontFamily: 'var(--font-syne)', fontWeight: 600, fontSize: 15,
              outline: 'none',
            }}
          />
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Paste your script here..."
            rows={10}
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 8, marginBottom: 16,
              border: '1px solid var(--border)', background: 'var(--bg)',
              color: 'var(--text)', fontFamily: 'var(--font-dm-mono)', fontSize: 13, lineHeight: 1.75,
              outline: 'none', resize: 'vertical',
            }}
          />
          {content.trim() && (
            <div style={{ ...mono, fontSize: 10, color: 'var(--muted)', marginBottom: 12 }}>
              {wordCount(content)} words · ~{Math.round(wordCount(content) / 140)} min at 140 wpm
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={save}
              disabled={!title.trim() || !content.trim() || saving}
              style={{
                ...mono, fontSize: 12, padding: '9px 20px', borderRadius: 8, cursor: 'pointer',
                border: 'none', background: title.trim() && content.trim() ? 'var(--accent)' : 'var(--surface)',
                color: title.trim() && content.trim() ? '#09090b' : 'var(--muted)', fontWeight: 600,
              }}
            >
              {saving ? 'SAVING…' : 'SAVE'}
            </button>
            <button
              onClick={cancel}
              style={{ ...mono, fontSize: 12, padding: '9px 20px', borderRadius: 8, cursor: 'pointer', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Script list */}
      {scripts.length === 0 && !creating ? (
        <div style={{ textAlign: 'center', padding: '80px 40px', border: '1px solid var(--border)', borderRadius: 16, background: 'var(--surface)' }}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>≡</div>
          <p style={{ ...syne, fontSize: 17, letterSpacing: '-0.02em', marginBottom: 8 }}>No scripts yet</p>
          <p style={{ ...mono, fontSize: 11, color: 'var(--muted)', letterSpacing: '0.04em' }}>Save your scripts here — load them in the desktop app</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {scripts.map(s => (
            <div
              key={s.id}
              style={{ border: '1px solid var(--border)', borderRadius: 12, background: 'var(--surface)', overflow: 'hidden' }}
            >
              <div
                style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ ...syne, fontSize: 15, letterSpacing: '-0.02em', marginBottom: 3 }}>{s.title}</div>
                  <div style={{ ...mono, fontSize: 10, color: 'var(--muted)' }}>
                    {wordCount(s.content)} words · updated {new Date(s.updated_at).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={e => { e.stopPropagation(); copyToClipboard(s.content) }} style={{ ...mono, fontSize: 10, padding: '5px 10px', borderRadius: 6, cursor: 'pointer', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)' }}>
                    COPY
                  </button>
                  <button onClick={e => { e.stopPropagation(); startEdit(s) }} style={{ ...mono, fontSize: 10, padding: '5px 10px', borderRadius: 6, cursor: 'pointer', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)' }}>
                    EDIT
                  </button>
                  <button onClick={e => { e.stopPropagation(); remove(s.id) }} style={{ ...mono, fontSize: 10, padding: '5px 10px', borderRadius: 6, cursor: 'pointer', border: '1px solid var(--border)', background: 'transparent', color: 'var(--muted)' }}>
                    ✕
                  </button>
                </div>
                <div style={{ ...mono, fontSize: 11, color: 'var(--muted)', transition: 'transform 0.15s', transform: expandedId === s.id ? 'rotate(180deg)' : 'none' }}>▾</div>
              </div>
              {expandedId === s.id && (
                <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border)' }}>
                  <pre style={{ ...mono, fontSize: 12, color: 'var(--text2)', lineHeight: 1.75, whiteSpace: 'pre-wrap', margin: '16px 0 0', padding: 16, background: 'var(--bg)', borderRadius: 8, maxHeight: 280, overflow: 'auto' }}>
                    {s.content}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
