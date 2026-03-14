import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

type Utterance = {
  speaker: number
  start: number | null
  end: number | null
  text: string | null
  fillers: string[]
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return json(null, 200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'Unauthorized' }, 401)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return json({ error: 'Unauthorized' }, 401)

  const { session_id } = await req.json()
  if (!session_id) return json({ error: 'session_id required' }, 400)

  // Fetch session — verify ownership
  const { data: s, error: fetchErr } = await supabase
    .from('sessions')
    .select('id, user_id, session_type, goal, wpm_avg, confidence, filler_map, filler_count, duration_sec, grade, utterances, meeting_mode, speaker_ratio')
    .eq('id', session_id)
    .eq('user_id', user.id)
    .single()

  if (fetchErr || !s) return json({ error: 'Session not found' }, 404)

  const utterances: Utterance[] = s.utterances ?? []
  const userUtterances = utterances.filter(u => u.text)
  if (userUtterances.length === 0) {
    return json({ error: 'No transcript to analyze' }, 422)
  }

  // Reconstruct plain transcript from utterances
  const transcript = userUtterances.map(u => u.text).join(' ')
  if (transcript.trim().length < 30) {
    return json({ error: 'Transcript too short for coaching' }, 422)
  }

  // Build context strings
  const fillerMap = s.filler_map as Record<string, number> ?? {}
  const fillerList = Object.keys(fillerMap).length > 0
    ? Object.entries(fillerMap).sort((a, b) => b[1] - a[1]).map(([w, c]) => `"${w}" (${c}x)`).join(', ')
    : 'none detected'

  const durationMin = Math.floor((s.duration_sec ?? 0) / 60)
  const durationSec = (s.duration_sec ?? 0) % 60
  const durationStr = `${durationMin}m ${durationSec}s`

  const wpmStr = s.wpm_avg ? `${Math.round(s.wpm_avg)} WPM (target: 120–160)` : 'not measured'
  const confStr = s.confidence ? `${Math.round(s.confidence)}/100` : 'not measured'

  const meetingLine = s.meeting_mode && s.speaker_ratio != null
    ? `\n- Meeting session: user spoke ${s.speaker_ratio}% of the time`
    : ''

  const prompt = `You are a world-class speech coach reviewing a recorded practice session. Your feedback is direct, specific, and actionable.

SESSION DATA:
- Type: ${s.session_type}
- Goal: ${s.goal ?? 'not specified'}
- Grade: ${s.grade}
- Duration: ${durationStr}
- Avg WPM: ${wpmStr}
- Confidence: ${confStr}
- Filler words: ${fillerList}${meetingLine}

FULL TRANSCRIPT:
${transcript.slice(0, 4000)}

Respond ONLY with valid JSON matching this exact schema — no markdown, no explanation, just JSON:
{
  "summary": "2–3 sentences. Reference specific numbers from the session. Be direct about what went well and what didn't.",
  "strength": {
    "observation": "One specific strength. Be concrete.",
    "quote": "A direct quote from the transcript (10–25 words) that demonstrates this strength, or null if the transcript is too short"
  },
  "improvement": {
    "observation": "The single most important thing to work on. Reference a specific pattern you noticed.",
    "quote": "A direct quote from the transcript (10–25 words) that illustrates this issue, or null"
  },
  "drill": "One concrete drill to practice before the next session. Specific, actionable, time-bounded."
}`

  // Call Claude
  const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 700,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!claudeRes.ok) {
    console.error('[Claude] API error:', await claudeRes.text())
    return json({ error: 'AI generation failed' }, 500)
  }

  const claudeData = await claudeRes.json()
  const rawContent = claudeData.content?.[0]?.text ?? ''

  let coaching: Record<string, unknown>
  try {
    const cleaned = rawContent.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
    coaching = JSON.parse(cleaned)
  } catch {
    console.error('[Claude] Failed to parse JSON:', rawContent)
    return json({ error: 'Failed to parse coaching response' }, 500)
  }

  // Save to DB
  const { error: updateErr } = await supabase
    .from('sessions')
    .update({ ai_coaching: coaching })
    .eq('id', session_id)

  if (updateErr) {
    console.error('[DB] Failed to save coaching:', updateErr)
    return json({ error: 'Failed to save coaching report' }, 500)
  }

  // Update streak (non-critical)
  await supabase.rpc('update_streak', { p_user_id: user.id })
    .catch(e => console.warn('[Streak]', e))

  return json({ ok: true, coaching })
})

function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      ...extraHeaders,
    },
  })
}
