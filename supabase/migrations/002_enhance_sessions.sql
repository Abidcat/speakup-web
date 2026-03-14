-- 002_enhance_sessions.sql
-- Additive migration — safe to run on existing data

-- Sessions: structured transcript, AI coaching, meeting mode, speaker ratio
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS utterances    JSONB,
  ADD COLUMN IF NOT EXISTS ai_coaching   JSONB,
  ADD COLUMN IF NOT EXISTS meeting_mode  BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS speaker_ratio NUMERIC(5,1);

-- Profiles: streak tracking
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS streak_current  INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS streak_max      INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS streak_last_day DATE;

-- Function: update streak after each session
-- Idempotent: multiple sessions in one day don't double-count
CREATE OR REPLACE FUNCTION public.update_streak(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_last  DATE;
  v_today DATE := CURRENT_DATE;
  v_cur   INTEGER;
  v_max   INTEGER;
BEGIN
  SELECT streak_current, streak_max, streak_last_day
    INTO v_cur, v_max, v_last
    FROM public.profiles
   WHERE id = p_user_id;

  IF v_last IS NULL OR v_last < v_today - INTERVAL '1 day' THEN
    v_cur := 1;
  ELSIF v_last = v_today - INTERVAL '1 day' THEN
    v_cur := v_cur + 1;
  ELSIF v_last = v_today THEN
    RETURN; -- already counted today
  END IF;

  v_max := GREATEST(v_max, v_cur);

  UPDATE public.profiles
     SET streak_current  = v_cur,
         streak_max      = v_max,
         streak_last_day = v_today
   WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
