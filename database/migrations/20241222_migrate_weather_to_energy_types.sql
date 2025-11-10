-- Migration: Convert old weather keys to new energy type keys
-- This is OPTIONAL - old keys still work with legacy support in the app
-- Run this only if you want to migrate existing data to the new energy type keys

-- Mapping:
-- clear → steady (both mean focused, consistent)
-- cloudy → foggy (both mean hard to focus, unclear)
-- rainy → flowing (both mean moving but slow)
-- stormy → sparky (stormy = overwhelmed/scattered, sparky = high energy/scattered - close match)
-- quiet → resting (both mean low energy, need recovery)

BEGIN;

-- Update checkins table
UPDATE checkins
SET 
  internal_weather = CASE 
    WHEN internal_weather = 'clear' THEN 'steady'
    WHEN internal_weather = 'cloudy' THEN 'foggy'
    WHEN internal_weather = 'rainy' THEN 'flowing'
    WHEN internal_weather = 'stormy' THEN 'sparky'
    WHEN internal_weather = 'quiet' THEN 'resting'
    ELSE internal_weather  -- Keep any other values unchanged
  END,
  weather_icon = CASE 
    WHEN internal_weather = 'clear' THEN '☀️'
    WHEN internal_weather = 'cloudy' THEN '🌫️'
    WHEN internal_weather = 'rainy' THEN '🌊'
    WHEN internal_weather = 'stormy' THEN '🔥'
    WHEN internal_weather = 'quiet' THEN '🛌'
    ELSE weather_icon  -- Keep existing icon if not migrating
  END
WHERE internal_weather IN ('clear', 'cloudy', 'rainy', 'stormy', 'quiet');

-- Update user_calendar_entries table (if it has data)
UPDATE user_calendar_entries
SET 
  internal_weather = CASE 
    WHEN internal_weather = 'clear' THEN 'steady'
    WHEN internal_weather = 'cloudy' THEN 'foggy'
    WHEN internal_weather = 'rainy' THEN 'flowing'
    WHEN internal_weather = 'stormy' THEN 'sparky'
    WHEN internal_weather = 'quiet' THEN 'resting'
    ELSE internal_weather
  END,
  weather_icon = CASE 
    WHEN internal_weather = 'clear' THEN '☀️'
    WHEN internal_weather = 'cloudy' THEN '🌫️'
    WHEN internal_weather = 'rainy' THEN '🌊'
    WHEN internal_weather = 'stormy' THEN '🔥'
    WHEN internal_weather = 'quiet' THEN '🛌'
    ELSE weather_icon
  END
WHERE internal_weather IN ('clear', 'cloudy', 'rainy', 'stormy', 'quiet');

COMMIT;

-- Note: After running this migration, old weather keys will be converted to new energy type keys.
-- The app will continue to work because it supports both old and new keys.
-- If you want to remove legacy support later, you can remove the old key mappings from the app code.

