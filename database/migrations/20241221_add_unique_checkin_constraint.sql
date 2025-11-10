-- Migration: Add unique constraint to prevent multiple check-ins per user per day
-- This ensures data integrity and prevents unpredictable behavior when loading check-ins

-- First, handle any existing duplicates by keeping only the most recent check-in per user per day
-- This is idempotent - safe to run multiple times
DO $$
DECLARE
    duplicate_record RECORD;
BEGIN
    -- Find and delete older duplicates, keeping only the most recent check-in per user per day
    FOR duplicate_record IN
        SELECT user_id, checkin_date, array_agg(id ORDER BY created_at DESC) as ids
        FROM checkins
        GROUP BY user_id, checkin_date
        HAVING COUNT(*) > 1
    LOOP
        -- Delete all but the first (most recent) check-in
        DELETE FROM checkins
        WHERE user_id = duplicate_record.user_id
          AND checkin_date = duplicate_record.checkin_date
          AND id != duplicate_record.ids[1];
    END LOOP;
END $$;

-- Add the unique constraint (only if it doesn't already exist)
-- This will fail if duplicates still exist, but the above DO block should have cleaned them up
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_checkin_per_day' 
        AND conrelid = 'checkins'::regclass
    ) THEN
        ALTER TABLE checkins
        ADD CONSTRAINT unique_checkin_per_day UNIQUE(user_id, checkin_date);
    END IF;
END $$;

-- Add a comment explaining the constraint (if it exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_checkin_per_day' 
        AND conrelid = 'checkins'::regclass
    ) THEN
        COMMENT ON CONSTRAINT unique_checkin_per_day ON checkins IS 
        'Ensures only one check-in per user per day, preventing duplicate check-ins and ensuring predictable data loading';
    END IF;
END $$;

