-- Migration: Add energy_schedule table
-- Allows users to set time-based energy levels that auto-adjust throughout the day

CREATE TABLE IF NOT EXISTS energy_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Time of day (24-hour format, stored as minutes since midnight for easier comparison)
    -- e.g., 11:00 AM = 660 minutes, 3:00 PM = 900 minutes
    start_time_minutes INTEGER NOT NULL CHECK (start_time_minutes >= 0 AND start_time_minutes < 1440),
    
    -- Energy level (matches internal_weather keys: sparky, steady, flowing, foggy, resting)
    energy_key TEXT NOT NULL CHECK (energy_key IN ('sparky', 'steady', 'flowing', 'foggy', 'resting')),
    
    -- Optional label/note for this time period (e.g., "meds wearing off", "peak focus time")
    label TEXT,
    
    -- Whether notifications are enabled for transitions into this energy level
    notify_on_transition BOOLEAN DEFAULT false,
    
    -- Whether this schedule is active
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure no overlapping schedules for the same user
    CONSTRAINT unique_user_time_slot UNIQUE(user_id, start_time_minutes)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_energy_schedules_user_id ON energy_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_energy_schedules_time ON energy_schedules(start_time_minutes);
CREATE INDEX IF NOT EXISTS idx_energy_schedules_active ON energy_schedules(user_id, is_active) WHERE is_active = true;

-- Row Level Security
ALTER TABLE energy_schedules ENABLE ROW LEVEL SECURITY;

-- Make reruns idempotent by dropping existing policies first
DROP POLICY IF EXISTS "Users can view own energy schedules" ON energy_schedules;
DROP POLICY IF EXISTS "Users can insert own energy schedules" ON energy_schedules;
DROP POLICY IF EXISTS "Users can update own energy schedules" ON energy_schedules;
DROP POLICY IF EXISTS "Users can delete own energy schedules" ON energy_schedules;

CREATE POLICY "Users can view own energy schedules" ON energy_schedules
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own energy schedules" ON energy_schedules
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own energy schedules" ON energy_schedules
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own energy schedules" ON energy_schedules
    FOR DELETE USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS update_energy_schedules_updated_at ON energy_schedules;
CREATE TRIGGER update_energy_schedules_updated_at
    BEFORE UPDATE ON energy_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comment for documentation
COMMENT ON TABLE energy_schedules IS 'Time-based energy level schedules that auto-adjust throughout the day';
COMMENT ON COLUMN energy_schedules.start_time_minutes IS 'Minutes since midnight (0-1439) when this energy level starts';
COMMENT ON COLUMN energy_schedules.energy_key IS 'Energy type key matching internal_weather values';
COMMENT ON COLUMN energy_schedules.notify_on_transition IS 'Whether to send notification when transitioning into this energy level';
