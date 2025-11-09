-- ADHD Barrier Tracker Database Schema
-- This schema creates user-specific tables for the Barrier Tracker app
-- It READS from existing content tables (barriers_content, tasks_content) shared with ADHD First Aid Kit
-- It CREATES new tables for user data, check-ins, and tracking

-- NOTE: This assumes the content tables from ADHD First Aid already exist:
-- - content_types
-- - content_pages (which includes barriers and tasks)
-- The barrier tracker will query these existing tables

-- Enable UUID extension (may already be enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- USER PROFILES
-- ==========================================
-- Extended user profile information beyond auth.users
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    timezone TEXT DEFAULT 'UTC',
    preferences JSONB DEFAULT '{}', -- UI preferences, notification settings, etc.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_user_profile UNIQUE(user_id)
);

-- ==========================================
-- DAILY CHECK-INS
-- ==========================================
-- Main table for daily barrier check-ins
CREATE TABLE IF NOT EXISTS daily_check_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    check_in_date DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Selected barriers (stored as slugs to reference content_pages)
    selected_barriers TEXT[] NOT NULL DEFAULT '{}',

    -- Selected tasks (stored as slugs to reference content_pages)
    selected_tasks TEXT[] NOT NULL DEFAULT '{}',

    -- Optional notes from the user
    notes TEXT,

    -- Mood/energy levels (1-5 scale)
    mood_level INTEGER CHECK (mood_level >= 1 AND mood_level <= 5),
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),

    -- Check-in metadata
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One check-in per user per day
    CONSTRAINT unique_daily_check_in UNIQUE(user_id, check_in_date)
);

-- ==========================================
-- BARRIER SELECTIONS (Granular tracking)
-- ==========================================
-- Detailed tracking of individual barrier selections
-- This allows us to track how often specific barriers are selected
CREATE TABLE IF NOT EXISTS barrier_selections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    check_in_id UUID NOT NULL REFERENCES daily_check_ins(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Reference to the barrier in content_pages (by slug)
    barrier_slug TEXT NOT NULL,
    barrier_name TEXT NOT NULL, -- Denormalized for easier querying

    -- When this barrier was selected
    selected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_barrier_per_check_in UNIQUE(check_in_id, barrier_slug)
);

-- ==========================================
-- TASK SELECTIONS (Granular tracking)
-- ==========================================
-- Detailed tracking of individual task selections
CREATE TABLE IF NOT EXISTS task_selections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    check_in_id UUID NOT NULL REFERENCES daily_check_ins(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Reference to the task in content_pages (by slug)
    task_slug TEXT NOT NULL,
    task_name TEXT NOT NULL, -- Denormalized for easier querying

    -- Task completion status
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,

    -- When this task was selected
    selected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_task_per_check_in UNIQUE(check_in_id, task_slug)
);

-- ==========================================
-- CALENDAR ENTRIES (Aggregated view)
-- ==========================================
-- Pre-computed calendar view for performance
-- This table is automatically updated by triggers
CREATE TABLE IF NOT EXISTS user_calendar_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,

    -- Aggregated counts
    barrier_count INTEGER NOT NULL DEFAULT 0,
    task_count INTEGER NOT NULL DEFAULT 0,
    completed_task_count INTEGER NOT NULL DEFAULT 0,

    -- Most common barriers on this day
    top_barriers TEXT[] DEFAULT '{}',

    -- Check-in completion status
    has_check_in BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_calendar_entry UNIQUE(user_id, date)
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_daily_check_ins_user_id ON daily_check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_check_ins_date ON daily_check_ins(check_in_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_check_ins_user_date ON daily_check_ins(user_id, check_in_date DESC);

CREATE INDEX IF NOT EXISTS idx_barrier_selections_user_id ON barrier_selections(user_id);
CREATE INDEX IF NOT EXISTS idx_barrier_selections_check_in ON barrier_selections(check_in_id);
CREATE INDEX IF NOT EXISTS idx_barrier_selections_slug ON barrier_selections(barrier_slug);

CREATE INDEX IF NOT EXISTS idx_task_selections_user_id ON task_selections(user_id);
CREATE INDEX IF NOT EXISTS idx_task_selections_check_in ON task_selections(check_in_id);
CREATE INDEX IF NOT EXISTS idx_task_selections_completed ON task_selections(is_completed);

CREATE INDEX IF NOT EXISTS idx_calendar_entries_user_id ON user_calendar_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_entries_date ON user_calendar_entries(date DESC);
CREATE INDEX IF NOT EXISTS idx_calendar_entries_user_date ON user_calendar_entries(user_id, date DESC);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================
-- Enable RLS on all user tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE barrier_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_calendar_entries ENABLE ROW LEVEL SECURITY;

-- User profiles: Users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Daily check-ins: Users can only access their own check-ins
CREATE POLICY "Users can view own check-ins" ON daily_check_ins
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own check-ins" ON daily_check_ins
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own check-ins" ON daily_check_ins
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own check-ins" ON daily_check_ins
    FOR DELETE USING (auth.uid() = user_id);

-- Barrier selections: Users can only access their own selections
CREATE POLICY "Users can view own barrier selections" ON barrier_selections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own barrier selections" ON barrier_selections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own barrier selections" ON barrier_selections
    FOR DELETE USING (auth.uid() = user_id);

-- Task selections: Users can only access their own selections
CREATE POLICY "Users can view own task selections" ON task_selections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own task selections" ON task_selections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own task selections" ON task_selections
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own task selections" ON task_selections
    FOR DELETE USING (auth.uid() = user_id);

-- Calendar entries: Users can only access their own calendar
CREATE POLICY "Users can view own calendar" ON user_calendar_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calendar entries" ON user_calendar_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calendar entries" ON user_calendar_entries
    FOR UPDATE USING (auth.uid() = user_id);

-- ==========================================
-- TRIGGERS & FUNCTIONS
-- ==========================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_check_ins_updated_at BEFORE UPDATE ON daily_check_ins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_entries_updated_at BEFORE UPDATE ON user_calendar_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically update calendar entries when check-ins are created/updated
CREATE OR REPLACE FUNCTION sync_calendar_entry()
RETURNS TRIGGER AS $$
DECLARE
    barrier_ct INTEGER;
    task_ct INTEGER;
    completed_task_ct INTEGER;
    top_barriers_array TEXT[];
BEGIN
    -- Count barriers and tasks
    SELECT COUNT(*) INTO barrier_ct FROM barrier_selections WHERE check_in_id = NEW.id;
    SELECT COUNT(*) INTO task_ct FROM task_selections WHERE check_in_id = NEW.id;
    SELECT COUNT(*) INTO completed_task_ct FROM task_selections WHERE check_in_id = NEW.id AND is_completed = true;

    -- Get top barriers (limit to 3)
    SELECT ARRAY_AGG(barrier_name ORDER BY selected_at) INTO top_barriers_array
    FROM (
        SELECT barrier_name, selected_at
        FROM barrier_selections
        WHERE check_in_id = NEW.id
        LIMIT 3
    ) sub;

    -- Upsert calendar entry
    INSERT INTO user_calendar_entries (user_id, date, barrier_count, task_count, completed_task_count, top_barriers, has_check_in)
    VALUES (NEW.user_id, NEW.check_in_date, barrier_ct, task_ct, completed_task_ct, COALESCE(top_barriers_array, '{}'), true)
    ON CONFLICT (user_id, date) DO UPDATE SET
        barrier_count = barrier_ct,
        task_count = task_ct,
        completed_task_count = completed_task_ct,
        top_barriers = COALESCE(top_barriers_array, '{}'),
        has_check_in = true,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_calendar_on_check_in
AFTER INSERT OR UPDATE ON daily_check_ins
FOR EACH ROW EXECUTE FUNCTION sync_calendar_entry();

-- ==========================================
-- HELPFUL VIEWS
-- ==========================================

-- View: User barrier patterns over time
CREATE OR REPLACE VIEW user_barrier_patterns AS
SELECT
    bs.user_id,
    bs.barrier_slug,
    bs.barrier_name,
    COUNT(*) as selection_count,
    MIN(dci.check_in_date) as first_selected,
    MAX(dci.check_in_date) as last_selected,
    ARRAY_AGG(DISTINCT dci.check_in_date ORDER BY dci.check_in_date DESC) as dates_selected
FROM barrier_selections bs
JOIN daily_check_ins dci ON bs.check_in_id = dci.id
GROUP BY bs.user_id, bs.barrier_slug, bs.barrier_name;

-- View: User task completion rates
CREATE OR REPLACE VIEW user_task_completion_rates AS
SELECT
    ts.user_id,
    ts.task_slug,
    ts.task_name,
    COUNT(*) as total_selections,
    COUNT(*) FILTER (WHERE ts.is_completed = true) as completed_count,
    ROUND(100.0 * COUNT(*) FILTER (WHERE ts.is_completed = true) / COUNT(*), 1) as completion_rate
FROM task_selections ts
GROUP BY ts.user_id, ts.task_slug, ts.task_name;

-- View: Recent check-ins with details
CREATE OR REPLACE VIEW recent_check_ins_detailed AS
SELECT
    dci.id,
    dci.user_id,
    dci.check_in_date,
    dci.mood_level,
    dci.energy_level,
    dci.notes,
    dci.created_at,
    ARRAY_AGG(DISTINCT bs.barrier_name) FILTER (WHERE bs.barrier_name IS NOT NULL) as barriers,
    ARRAY_AGG(DISTINCT ts.task_name) FILTER (WHERE ts.task_name IS NOT NULL) as tasks,
    COUNT(DISTINCT bs.id) as barrier_count,
    COUNT(DISTINCT ts.id) as task_count,
    COUNT(DISTINCT ts.id) FILTER (WHERE ts.is_completed = true) as completed_task_count
FROM daily_check_ins dci
LEFT JOIN barrier_selections bs ON dci.id = bs.check_in_id
LEFT JOIN task_selections ts ON dci.id = ts.check_in_id
GROUP BY dci.id, dci.user_id, dci.check_in_date, dci.mood_level, dci.energy_level, dci.notes, dci.created_at
ORDER BY dci.check_in_date DESC;
