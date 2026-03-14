-- ============================================================
-- Job.Bar Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Users / Profiles ───────────────────────────────────────────────────────
-- This extends Supabase's built-in auth.users table
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT,
  avatar_url    TEXT,
  phone         TEXT,
  location      TEXT,
  linkedin_url  TEXT,
  github_url    TEXT,
  portfolio_url TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Resumes ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.resumes (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name      TEXT NOT NULL,
  file_url       TEXT,
  raw_text       TEXT,
  parsed_name    TEXT,
  parsed_email   TEXT,
  parsed_phone   TEXT,
  parsed_skills  TEXT[],
  parsed_education JSONB,
  parsed_experience JSONB,
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Job Listings (Cache) ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.job_listings (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id    TEXT UNIQUE,
  source         TEXT DEFAULT 'adzuna',
  title          TEXT NOT NULL,
  company        TEXT,
  location       TEXT,
  description    TEXT,
  salary_min     NUMERIC,
  salary_max     NUMERIC,
  salary_currency TEXT DEFAULT 'USD',
  apply_url      TEXT,
  skills_required TEXT[],
  job_type       TEXT,
  is_remote      BOOLEAN DEFAULT FALSE,
  posted_at      TIMESTAMPTZ,
  fetched_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Applications ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.applications (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_listing_id   UUID REFERENCES public.job_listings(id) ON DELETE SET NULL,

  -- Denormalized for fast reads
  company          TEXT NOT NULL,
  role             TEXT NOT NULL,
  location         TEXT,
  apply_url        TEXT,

  -- Status
  status           TEXT NOT NULL DEFAULT 'Applied'
                     CHECK (status IN ('Applied', 'Under Review', 'Interview', 'Offer', 'Rejected')),

  -- AI-generated docs
  generated_resume TEXT,
  cover_letter     TEXT,

  -- Automation
  auto_applied     BOOLEAN DEFAULT FALSE,
  auto_apply_notes TEXT,

  -- Timestamps
  applied_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── AI Chat History ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Triggers: updated_at ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER resumes_updated_at
  BEFORE UPDATE ON public.resumes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Trigger: auto-create profile on signup ──────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── Row Level Security ──────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only read/write their own
CREATE POLICY "profiles_own" ON public.profiles
  USING (auth.uid() = id);

-- Resumes: users can only access their own
CREATE POLICY "resumes_own" ON public.resumes
  USING (auth.uid() = user_id);

-- Applications: users can only access their own
CREATE POLICY "applications_own" ON public.applications
  USING (auth.uid() = user_id);

-- Chat messages: users can only access their own
CREATE POLICY "chat_own" ON public.chat_messages
  USING (auth.uid() = user_id);

-- Job listings: publicly readable
CREATE POLICY "jobs_read" ON public.job_listings
  FOR SELECT USING (TRUE);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_resumes_user ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_user ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_chat_user ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_external ON public.job_listings(external_id);
