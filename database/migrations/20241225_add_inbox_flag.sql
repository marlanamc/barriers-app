-- Migration: Add inbox flag for uncategorized tasks
-- Tasks in the inbox are saved but not scheduled for a specific day

-- Add inbox column to focus_items
ALTER TABLE focus_items
ADD COLUMN IF NOT EXISTS in_inbox BOOLEAN DEFAULT FALSE;

-- Add comment explaining the inbox system
COMMENT ON COLUMN focus_items.in_inbox IS
'True if task is in inbox (captured but not scheduled for a specific day). Inbox tasks can be promoted to today or planned for future.';

-- Create index for filtering inbox items
CREATE INDEX IF NOT EXISTS idx_focus_items_inbox ON focus_items(user_id, in_inbox) WHERE in_inbox = TRUE;

-- Add the same column to planned_items for consistency
ALTER TABLE planned_items
ADD COLUMN IF NOT EXISTS in_inbox BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN planned_items.in_inbox IS
'True if planned item is in inbox (not yet scheduled)';

CREATE INDEX IF NOT EXISTS idx_planned_items_inbox ON planned_items(user_id, in_inbox) WHERE in_inbox = TRUE;
