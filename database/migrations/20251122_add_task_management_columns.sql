-- Add missing columns to focus_items table for task management
-- Adds: complexity, completed status, task_type, and multiple anchors support

-- Add complexity column (quick, medium, deep)
ALTER TABLE focus_items 
ADD COLUMN IF NOT EXISTS complexity TEXT 
CHECK (complexity IN ('quick', 'medium', 'deep'))
DEFAULT 'medium';

-- Add completed column
ALTER TABLE focus_items 
ADD COLUMN IF NOT EXISTS completed BOOLEAN 
DEFAULT false;

-- Add task_type column (focus, life, inbox)
ALTER TABLE focus_items 
ADD COLUMN IF NOT EXISTS task_type TEXT 
CHECK (task_type IN ('focus', 'life', 'inbox'))
DEFAULT 'focus';

-- Add anchors array column (replaces single anchor_type/anchor_value)
ALTER TABLE focus_items 
ADD COLUMN IF NOT EXISTS anchors JSONB 
DEFAULT '[]'::JSONB;

-- Create index on completed for filtering
CREATE INDEX IF NOT EXISTS idx_focus_items_completed 
ON focus_items(completed);

-- Create index on task_type for filtering  
CREATE INDEX IF NOT EXISTS idx_focus_items_task_type 
ON focus_items(task_type);

COMMENT ON COLUMN focus_items.complexity IS 'Task complexity: quick (0-30min), medium (30-60min), deep (1+ hour)';
COMMENT ON COLUMN focus_items.completed IS 'Whether the task has been completed';
COMMENT ON COLUMN focus_items.task_type IS 'Type of task: focus (planned), life (maintenance), inbox (brain dump)';
COMMENT ON COLUMN focus_items.anchors IS 'Array of anchor objects with type and value';
