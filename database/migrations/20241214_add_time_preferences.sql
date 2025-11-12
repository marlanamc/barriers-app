-- Migration: Add time awareness preferences
-- Adds hard stop times and work schedule settings

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    preferences JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON user_profiles
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
    ON user_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
    ON user_profiles
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Add comment explaining preferences structure
COMMENT ON COLUMN user_profiles.preferences IS
'User preferences in JSONB format. Structure:
{
  "timePreferences": {
    "deepWorkStop": "18:00",      // Hard stop for deep work (focus items)
    "lightWorkStop": "20:00",     // Can do life maintenance but no focus
    "fullStop": "22:00",          // Complete shutdown, no work at all
    "startTime": "08:00"          // When work day typically starts
  },
  "weekendSchedule": {
    "enabled": true,
    "deepWorkStop": "16:00",      // Earlier stops on weekends
    "lightWorkStop": "18:00",
    "fullStop": "20:00"
  },
  "medicationTracking": {
    "enabled": false,
    "medicationName": "Adderall XR",
    "doseTimes": ["08:00"],
    "peakDuration": 240           // Minutes (4 hours)
  },
  "customTags": ["work", "personal", "urgent"]
}';

-- Function to get user time preferences with defaults
CREATE OR REPLACE FUNCTION get_user_time_preferences(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_prefs JSONB;
    time_prefs JSONB;
    default_prefs JSONB;
BEGIN
    -- Default time preferences
    default_prefs := jsonb_build_object(
        'deepWorkStop', '18:00',
        'lightWorkStop', '20:00',
        'fullStop', '22:00',
        'startTime', '08:00'
    );

    -- Try to get user's preferences
    SELECT preferences INTO user_prefs
    FROM user_profiles
    WHERE user_id = p_user_id;

    -- Extract time preferences or use defaults
    IF user_prefs IS NOT NULL AND user_prefs ? 'timePreferences' THEN
        time_prefs := user_prefs->'timePreferences';

        -- Merge with defaults (user prefs override defaults)
        RETURN default_prefs || time_prefs;
    ELSE
        RETURN default_prefs;
    END IF;
END;
$$;

COMMENT ON FUNCTION get_user_time_preferences IS
'Gets user time preferences with sensible defaults if not set. Returns JSONB with deepWorkStop, lightWorkStop, fullStop, startTime.';

-- Function to update user time preferences
CREATE OR REPLACE FUNCTION update_user_time_preferences(
    p_user_id UUID,
    p_time_preferences JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    existing_prefs JSONB;
BEGIN
    -- Get existing preferences
    SELECT preferences INTO existing_prefs
    FROM user_profiles
    WHERE user_id = p_user_id;

    IF existing_prefs IS NULL THEN
        -- Create new profile with time preferences
        INSERT INTO user_profiles (user_id, preferences)
        VALUES (
            p_user_id,
            jsonb_build_object('timePreferences', p_time_preferences)
        )
        ON CONFLICT (user_id) DO UPDATE
        SET preferences = jsonb_build_object('timePreferences', p_time_preferences),
            updated_at = NOW();
    ELSE
        -- Update existing preferences
        UPDATE user_profiles
        SET preferences = jsonb_set(
            COALESCE(preferences, '{}'::JSONB),
            '{timePreferences}',
            p_time_preferences
        ),
        updated_at = NOW()
        WHERE user_id = p_user_id;
    END IF;

    RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION update_user_time_preferences IS
'Updates user time preferences. Creates profile if it does not exist. Input should be JSONB with keys: deepWorkStop, lightWorkStop, fullStop, startTime.';

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
