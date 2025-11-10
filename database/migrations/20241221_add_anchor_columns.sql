-- Migration: Add anchor_type and anchor_value columns to focus_items table
-- These columns allow focus items to be anchored to time or context (at, while, before, after)

-- Add anchor columns if they don't exist
DO $$ 
BEGIN
    -- Add anchor_type column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'focus_items' AND column_name = 'anchor_type'
    ) THEN
        ALTER TABLE focus_items 
        ADD COLUMN anchor_type TEXT CHECK (anchor_type IN ('at', 'while', 'before', 'after'));
    END IF;

    -- Add anchor_value column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'focus_items' AND column_name = 'anchor_value'
    ) THEN
        ALTER TABLE focus_items 
        ADD COLUMN anchor_value TEXT;
    END IF;
END $$;

-- Add index for anchor queries if needed
CREATE INDEX IF NOT EXISTS idx_focus_items_anchor_type ON focus_items(anchor_type) WHERE anchor_type IS NOT NULL;

