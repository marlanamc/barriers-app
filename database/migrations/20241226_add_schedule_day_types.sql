-- Migration: Add day-type support for energy schedules
-- Allows different schedules for specific days without assuming traditional work week

-- Add day_type column to energy_schedules
ALTER TABLE energy_schedules
ADD COLUMN IF NOT EXISTS day_type TEXT DEFAULT 'all' CHECK (day_type IN ('all', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'));

-- Drop old unique constraint and create new one that includes day_type
ALTER TABLE energy_schedules
DROP CONSTRAINT IF EXISTS unique_user_time_slot;

ALTER TABLE energy_schedules
ADD CONSTRAINT unique_user_time_day UNIQUE(user_id, start_time_minutes, day_type);

-- Add wake/bedtime settings to user metadata per day
-- These are stored in auth.users metadata jsonb field
-- Example: {
--   "wake_times": { "monday": "07:00", "tuesday": "07:00", "sunday": "09:00" },
--   "bedtimes": { "monday": "22:00", "tuesday": "22:00", "sunday": "01:00" }
-- }

-- Create a helper function to get wake time for a given day
CREATE OR REPLACE FUNCTION get_wake_time_for_day(p_user_id UUID, p_day_name TEXT)
RETURNS TEXT AS $$
DECLARE
    v_user_metadata JSONB;
    v_wake_time TEXT;
BEGIN
    -- Get user metadata
    SELECT raw_user_meta_data INTO v_user_metadata
    FROM auth.users
    WHERE id = p_user_id;

    -- Get wake time for specific day, fallback to default
    IF v_user_metadata ? 'wake_times' AND v_user_metadata->'wake_times' ? p_day_name THEN
        v_wake_time := v_user_metadata->'wake_times'->>p_day_name;
    ELSIF v_user_metadata ? 'wake_time' THEN
        v_wake_time := v_user_metadata->>'wake_time';
    ELSE
        v_wake_time := '08:00'; -- Default
    END IF;

    RETURN v_wake_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a helper function to get bedtime for a given day
CREATE OR REPLACE FUNCTION get_bedtime_for_day(p_user_id UUID, p_day_name TEXT)
RETURNS TEXT AS $$
DECLARE
    v_user_metadata JSONB;
    v_bedtime TEXT;
BEGIN
    -- Get user metadata
    SELECT raw_user_meta_data INTO v_user_metadata
    FROM auth.users
    WHERE id = p_user_id;

    -- Get bedtime for specific day, fallback to default
    IF v_user_metadata ? 'bedtimes' AND v_user_metadata->'bedtimes' ? p_day_name THEN
        v_bedtime := v_user_metadata->'bedtimes'->>p_day_name;
    ELSIF v_user_metadata ? 'bedtime' THEN
        v_bedtime := v_user_metadata->>'bedtime';
    ELSE
        v_bedtime := '22:00'; -- Default 10pm
    END IF;

    RETURN v_bedtime;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update indexes to include day_type
DROP INDEX IF EXISTS idx_energy_schedules_active;
CREATE INDEX IF NOT EXISTS idx_energy_schedules_active ON energy_schedules(user_id, day_type, is_active) WHERE is_active = true;

-- Add comments
COMMENT ON COLUMN energy_schedules.day_type IS 'Day type for this schedule: all or specific day (monday-sunday). No weekday/weekend grouping - users choose their own patterns.';
COMMENT ON FUNCTION get_wake_time_for_day IS 'Returns wake time for user based on day name';
COMMENT ON FUNCTION get_bedtime_for_day IS 'Returns bedtime for user based on day name';
