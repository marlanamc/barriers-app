-- RESET AND SETUP Script
-- This drops all existing policies and triggers, then runs the clean schema
-- Use this if you're getting "already exists" errors

-- ==========================================
-- 1. DROP ALL POLICIES
-- ==========================================

-- Drop all policies if they exist
DO $$
BEGIN
    -- User profiles policies
    DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

    -- Calendar policies
    DROP POLICY IF EXISTS "Users can view own calendar" ON user_calendar_entries;
    DROP POLICY IF EXISTS "Users can insert own calendar entries" ON user_calendar_entries;
    DROP POLICY IF EXISTS "Users can update own calendar entries" ON user_calendar_entries;

    -- Barrier types & tips policies
    DROP POLICY IF EXISTS "Users can read barrier types" ON barrier_types;
    DROP POLICY IF EXISTS "Users can read tips" ON tips;

    -- Checkins policies
    DROP POLICY IF EXISTS "Users can view own weather checkins" ON checkins;
    DROP POLICY IF EXISTS "Users can insert own weather checkins" ON checkins;
    DROP POLICY IF EXISTS "Users can update own weather checkins" ON checkins;
    DROP POLICY IF EXISTS "Users can delete own weather checkins" ON checkins;

    -- Focus items policies
    DROP POLICY IF EXISTS "Users can view own focus items" ON focus_items;
    DROP POLICY IF EXISTS "Users can insert own focus items" ON focus_items;
    DROP POLICY IF EXISTS "Users can update own focus items" ON focus_items;
    DROP POLICY IF EXISTS "Users can delete own focus items" ON focus_items;

    -- Focus barriers policies
    DROP POLICY IF EXISTS "Users can view own focus barriers" ON focus_barriers;
    DROP POLICY IF EXISTS "Users can insert own focus barriers" ON focus_barriers;
    DROP POLICY IF EXISTS "Users can update own focus barriers" ON focus_barriers;
    DROP POLICY IF EXISTS "Users can delete own focus barriers" ON focus_barriers;

    -- Old policies (if they exist)
    DROP POLICY IF EXISTS "Users can view own check-ins" ON daily_check_ins;
    DROP POLICY IF EXISTS "Users can insert own check-ins" ON daily_check_ins;
    DROP POLICY IF EXISTS "Users can update own check-ins" ON daily_check_ins;
    DROP POLICY IF EXISTS "Users can delete own check-ins" ON daily_check_ins;
    DROP POLICY IF EXISTS "Users can view own barrier selections" ON barrier_selections;
    DROP POLICY IF EXISTS "Users can insert own barrier selections" ON barrier_selections;
    DROP POLICY IF EXISTS "Users can delete own barrier selections" ON barrier_selections;
    DROP POLICY IF EXISTS "Users can view own task selections" ON task_selections;
    DROP POLICY IF EXISTS "Users can insert own task selections" ON task_selections;
    DROP POLICY IF EXISTS "Users can update own task selections" ON task_selections;
    DROP POLICY IF EXISTS "Users can delete own task selections" ON task_selections;
EXCEPTION
    WHEN undefined_table THEN
        NULL; -- Table doesn't exist, skip
END $$;

-- ==========================================
-- 2. DROP OLD TRIGGERS
-- ==========================================

DROP TRIGGER IF EXISTS update_daily_check_ins_updated_at ON daily_check_ins;
DROP TRIGGER IF EXISTS sync_calendar_on_check_in ON daily_check_ins;
DROP TRIGGER IF EXISTS sync_calendar_from_checkin_trigger ON checkins;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_checkins_updated_at ON checkins;
DROP TRIGGER IF EXISTS update_focus_items_updated_at ON focus_items;
DROP TRIGGER IF EXISTS update_focus_barriers_updated_at ON focus_barriers;
DROP TRIGGER IF EXISTS update_calendar_entries_updated_at ON user_calendar_entries;

-- ==========================================
-- 3. DROP OLD VIEWS
-- ==========================================

DROP VIEW IF EXISTS user_barrier_patterns;
DROP VIEW IF EXISTS user_task_completion_rates;
DROP VIEW IF EXISTS recent_check_ins_detailed;
DROP VIEW IF EXISTS user_internal_weather_stats;

-- ==========================================
-- 4. DROP OLD TABLES (if they exist)
-- ==========================================

DROP TABLE IF EXISTS barrier_selections CASCADE;
DROP TABLE IF EXISTS task_selections CASCADE;
DROP TABLE IF EXISTS daily_check_ins CASCADE;

-- ==========================================
-- 5. NOW RUN THE CLEAN SCHEMA
-- ==========================================
-- After this completes, copy and paste the ENTIRE contents of schema.sql
-- and run it in the SQL editor

-- The schema.sql file will create:
-- - All tables with IF NOT EXISTS
-- - All indexes
-- - All RLS policies (fresh, no conflicts)
-- - All triggers and functions
-- - All views

SELECT 'Ready! Now run schema.sql in the SQL editor.' AS status;
