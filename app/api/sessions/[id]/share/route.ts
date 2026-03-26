import { createClient } from '@/lib/supabase/server'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify ownership
  const { data: session } = await supabase
    .from('sessions')
    .select('id,session_type,goal,grade,duration_sec,wpm_avg,confidence,filler_count,filler_map,word_count,ai_coaching,tip_history,created_at,meeting_mode,speaker_ratio')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!session) return Response.json({ error: 'Not found' }, { status: 404 })

  // Return existing share token if one exists
  const { data: existing } = await supabase
    .from('session_shares')
    .select('token')
    .eq('session_id', id)
    .eq('user_id', user.id)
    .single()

  if (existing) return Response.json({ token: existing.token })

  // Create new share with a snapshot of the session data
  const { data: share, error } = await supabase
    .from('session_shares')
    .insert({ session_id: id, user_id: user.id, snapshot: session })
    .select('token')
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ token: share.token })
}
