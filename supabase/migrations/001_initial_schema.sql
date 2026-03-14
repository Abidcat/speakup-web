-- SpeakUp v1 Initial Schema
-- Run this in the Supabase SQL Editor (or via supabase db push)

-- ─────────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────────
CREATE TABLE public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  full_name  TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────
-- SUBSCRIPTIONS
-- ─────────────────────────────────────────────
CREATE TABLE public.subscriptions (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_sub_id      TEXT UNIQUE,
  plan               TEXT NOT NULL DEFAULT 'free',    -- 'free' | 'pro'
  status             TEXT NOT NULL DEFAULT 'active',  -- 'active' | 'past_due' | 'canceled'
  current_period_end TIMESTAMPTZ,
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_subscriptions" ON public.subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Auto-create free subscription on signup
CREATE OR REPLACE FUNCTION public.handle_new_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_subscription();

-- ─────────────────────────────────────────────
-- SESSIONS
-- ─────────────────────────────────────────────
CREATE TABLE public.sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL,           -- 'sales' | 'investor' | 'interview' | etc.
  goal         TEXT,
  duration_sec INTEGER NOT NULL,
  wpm_avg      NUMERIC(6,1),
  confidence   NUMERIC(5,1),            -- 0–100
  filler_count INTEGER DEFAULT 0,
  filler_map   JSONB,                   -- { "um": 4, "like": 2, ... }
  word_count   INTEGER,
  grade        TEXT,                    -- 'S' | 'A' | 'B' | 'C' | 'D'
  tip_history  JSONB,                   -- ["Slow down", ...]
  has_script   BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_sessions" ON public.sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX sessions_user_created ON public.sessions(user_id, created_at DESC);

-- ─────────────────────────────────────────────
-- USAGE (free tier quota: 3 sessions/month)
-- ─────────────────────────────────────────────
CREATE TABLE public.usage (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month         TEXT NOT NULL,          -- '2026-03' (YYYY-MM)
  session_count INTEGER DEFAULT 0,
  UNIQUE(user_id, month)
);

ALTER TABLE public.usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_usage" ON public.usage
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX usage_user_month ON public.usage(user_id, month);

-- ─────────────────────────────────────────────
-- increment_usage RPC (called from Electron after each session)
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.increment_usage(p_user_id UUID, p_month TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.usage (user_id, month, session_count)
  VALUES (p_user_id, p_month, 1)
  ON CONFLICT (user_id, month)
  DO UPDATE SET session_count = public.usage.session_count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
