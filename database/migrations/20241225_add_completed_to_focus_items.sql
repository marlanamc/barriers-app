-- Migration: Add completed field to focus_items table
-- This allows tracking which tasks have been completed during the day

-- Add completed column to focus_items table
ALTER TABLE focus_items
ADD COLUMN IF NOT EXISTS completed BOOLEAN NOT NULL DEFAULT FALSE;

-- Add an index for faster queries filtering by completed status
CREATE INDEX IF NOT EXISTS idx_focus_items_completed
ON focus_items(checkin_id, completed);

-- Add comment explaining the field
COMMENT ON COLUMN focus_items.completed IS
'Tracks whether the focus item has been completed. Updated in real-time as users check off tasks.';
