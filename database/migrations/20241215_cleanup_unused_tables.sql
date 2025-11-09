-- Migration: Clean up unused check-in tables and fix calendar entries
-- This removes the old daily_check_ins system and makes user_calendar_entries
-- work with the actual checkins table (internal weather flow)

-- ==========================================
-- 1. DROP OLD TRIGGERS & FUNCTIONS
-- ==========================================

-- Drop the broken trigger that references daily_check_ins
DROP TRIGGER IF EXISTS sync_calendar_on_check_in ON daily_check_ins;
DROP FUNCTION IF EXISTS sync_calendar_entry();

-- ==========================================
-- 2. DROP UNUSED VIEWS
-- ==========================================

DROP VIEW IF EXISTS user_barrier_patterns;
DROP VIEW IF EXISTS user_task_completion_rates;
DROP VIEW IF EXISTS recent_check_ins_detailed;

-- ==========================================
-- 3. DROP UNUSED TABLES (in dependency order)
-- ==========================================

-- Drop child tables first
DROP TABLE IF EXISTS barrier_selections CASCADE;
DROP TABLE IF EXISTS task_selections CASCADE;

-- Drop parent table
DROP TABLE IF EXISTS daily_check_ins CASCADE;

-- ==========================================
-- 4. UPDATE user_calendar_entries TABLE
-- ==========================================

-- Modify the table structure to match the new checkins-based flow
-- Remove task-related columns that don't apply to internal weather tracking
ALTER TABLE user_calendar_entries
  DROP COLUMN IF EXISTS task_count,
  DROP COLUMN IF EXISTS completed_task_count,
  DROP COLUMN IF EXISTS top_barriers;

-- Add column to store the internal weather for quick calendar display
ALTER TABLE user_calendar_entries
  ADD COLUMN IF NOT EXISTS internal_weather TEXT,
  ADD COLUMN IF NOT EXISTS weather_icon TEXT;

-- Update barrier_count to focus_count since we're tracking focus items now
ALTER TABLE user_calendar_entries
  RENAME COLUMN barrier_count TO focus_count;

-- ==========================================
-- 5. CREATE NEW TRIGGER FUNCTION
-- ==========================================

-- Function to sync calendar entries from checkins table
CREATE OR REPLACE FUNCTION sync_calendar_from_checkin()
RETURNS TRIGGER AS $$
DECLARE
    focus_ct INTEGER;
BEGIN
    -- Count focus items for this check-in
    SELECT COUNT(*) INTO focus_ct
    FROM focus_items
    WHERE checkin_id = NEW.id;

    -- Upsert calendar entry
    INSERT INTO user_calendar_entries (
        user_id,
        date,
        focus_count,
        internal_weather,
        weather_icon,
        has_check_in
    )
    VALUES (
        NEW.user_id,
        NEW.checkin_date,
        focus_ct,
        NEW.internal_weather,
        NEW.weather_icon,
        true
    )
    ON CONFLICT (user_id, date) DO UPDATE SET
        focus_count = focus_ct,
        internal_weather = NEW.internal_weather,
        weather_icon = NEW.weather_icon,
        has_check_in = true,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 6. CREATE NEW TRIGGER
-- ==========================================

CREATE TRIGGER sync_calendar_from_checkin_trigger
AFTER INSERT OR UPDATE ON checkins
FOR EACH ROW EXECUTE FUNCTION sync_calendar_from_checkin();

-- ==========================================
-- 7. BACKFILL EXISTING DATA
-- ==========================================

-- Populate calendar entries from existing checkins
INSERT INTO user_calendar_entries (
    user_id,
    date,
    focus_count,
    internal_weather,
    weather_icon,
    has_check_in
)
SELECT
    c.user_id,
    c.checkin_date,
    COUNT(DISTINCT fi.id) as focus_count,
    c.internal_weather,
    c.weather_icon,
    true
FROM checkins c
LEFT JOIN focus_items fi ON fi.checkin_id = c.id
GROUP BY c.id, c.user_id, c.checkin_date, c.internal_weather, c.weather_icon
ON CONFLICT (user_id, date) DO UPDATE SET
    focus_count = EXCLUDED.focus_count,
    internal_weather = EXCLUDED.internal_weather,
    weather_icon = EXCLUDED.weather_icon,
    has_check_in = EXCLUDED.has_check_in,
    updated_at = NOW();
