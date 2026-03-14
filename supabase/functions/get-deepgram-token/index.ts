import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const FREE_LIMIT = 3

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'Unauthorized' }, 401)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // Validate JWT and get user
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return json({ error: 'Unauthorized' }, 401)

  // Check dev flag (bypasses all limits)
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_dev')
    .eq('id', user.id)
    .single()

  const isDev = profile?.is_dev === true

  // Check subscription plan
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', user.id)
    .single()

  const isPro = sub?.plan === 'pro' && sub?.status === 'active'

  // Check monthly usage if on free plan (dev users skip this)
  if (!isPro && !isDev) {
    const month = new Date().toISOString().slice(0, 7)
    const { data: usage } = await supabase
      .from('usage')
      .select('session_count')
      .eq('user_id', user.id)
      .eq('month', month)
      .single()

    const count = usage?.session_count ?? 0
    if (count >= FREE_LIMIT) {
      return json({ error: 'quota_exceeded', message: 'Free plan limit reached. Upgrade to Pro for unlimited sessions.' }, 403)
    }
  }

  // Request a short-lived Deepgram temporary key (TTL = 1 hour)
  const dgProjectId = Deno.env.get('DEEPGRAM_PROJECT_ID')!
  const dgApiKey = Deno.env.get('DEEPGRAM_API_KEY')!

  const dgRes = await fetch(`https://api.deepgram.com/v1/projects/${dgProjectId}/keys`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${dgApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      comment: `session:${user.id}`,
      scopes: ['usage:write'],
      time_to_live_in_seconds: 3600,
    }),
  })

  if (!dgRes.ok) {
    const err = await dgRes.text()
    console.error('[DG] key creation failed:', err)
    return json({ error: 'Failed to create Deepgram token' }, 500)
  }

  const { key } = await dgRes.json()
  return json({ key }, 200)
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
