import { createClient } from '@/lib/supabase/server'
import ScriptsClient from '@/components/ScriptsClient'

const syne = { fontFamily: 'var(--font-syne)', fontWeight: 800 } as const

export default async function ScriptsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: scripts } = await supabase
    .from('scripts')
    .select('*')
    .eq('user_id', user!.id)
    .order('updated_at', { ascending: false })

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: 10, color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 } as React.CSSProperties}>
          Library
        </div>
        <h1 style={{ ...syne, fontSize: 'clamp(28px,4vw,40px)', letterSpacing: '-0.04em', lineHeight: 0.97 } as React.CSSProperties}>
          Scripts
        </h1>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text2)', marginTop: 8, lineHeight: 1.65 } as React.CSSProperties}>
          Save and manage your scripts. Copy any script into the desktop app before a session.
        </p>
      </div>

      <ScriptsClient initial={scripts ?? []} />
    </div>
  )
}
