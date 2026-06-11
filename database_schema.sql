-- Student Life OS Database Schema (Clerk Auth Integration)

-- Users table (Custom users table, since we use Clerk, not Supabase Auth)
CREATE TABLE public.users (
  id TEXT PRIMARY KEY, -- Clerk User ID (string, not UUID)
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Budget Tracker
CREATE TABLE public.budget_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  entry_type TEXT CHECK (entry_type IN ('income', 'expense')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habits Tracker
CREATE TABLE public.habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  frequency TEXT NOT NULL, -- e.g., 'daily', 'weekly'
  streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habit Logs (for tracking completion per day)
CREATE TABLE public.habit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Notes
CREATE TABLE public.notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT, -- Markdown string
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Clerk Integration Function to extract User ID from JWT
CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS TEXT AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
$$ LANGUAGE SQL STABLE;

-- RLS Policies mapping to Clerk User ID
CREATE POLICY "Users can manage own profile" ON public.users FOR ALL USING (requesting_user_id() = id) WITH CHECK (requesting_user_id() = id);
CREATE POLICY "Users can manage own budget" ON public.budget_entries FOR ALL USING (requesting_user_id() = user_id) WITH CHECK (requesting_user_id() = user_id);
CREATE POLICY "Users can manage own habits" ON public.habits FOR ALL USING (requesting_user_id() = user_id) WITH CHECK (requesting_user_id() = user_id);
CREATE POLICY "Users can manage own habit logs" ON public.habit_logs FOR ALL USING (requesting_user_id() = user_id) WITH CHECK (requesting_user_id() = user_id);
CREATE POLICY "Users can manage own notes" ON public.notes FOR ALL USING (requesting_user_id() = user_id) WITH CHECK (requesting_user_id() = user_id);
