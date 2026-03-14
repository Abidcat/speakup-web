-- 003_dev_user.sql
-- Add is_dev flag to bypass free tier limits (for internal testing)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_dev BOOLEAN DEFAULT FALSE;
