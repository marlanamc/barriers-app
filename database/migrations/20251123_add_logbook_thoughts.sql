-- Migration: Add logbook_thoughts table for ADHD-friendly thought capture
-- This creates a dedicated inbox for racing thoughts

-- Create the logbook_thoughts table
CREATE TABLE IF NOT EXISTS logbook_thoughts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'archived', 'converted')),
  converted_to TEXT CHECK (converted_to IN ('task', 'note') OR converted_to IS NULL),
  converted_item_id UUID, -- Reference to the converted item if applicable
  CONSTRAINT valid_conversion CHECK (
    (status != 'converted' AND converted_to IS NULL) OR
    (status = 'converted' AND converted_to IS NOT NULL)
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_logbook_thoughts_user_id ON logbook_thoughts(user_id);
CREATE INDEX IF NOT EXISTS idx_logbook_thoughts_status ON logbook_thoughts(status);
CREATE INDEX IF NOT EXISTS idx_logbook_thoughts_created_at ON logbook_thoughts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logbook_thoughts_user_status ON logbook_thoughts(user_id, status);

-- Enable Row Level Security
ALTER TABLE logbook_thoughts ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own thoughts
CREATE POLICY "Users can view their own thoughts"
  ON logbook_thoughts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own thoughts"
  ON logbook_thoughts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own thoughts"
  ON logbook_thoughts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own thoughts"
  ON logbook_thoughts FOR DELETE
  USING (auth.uid() = user_id);

-- Add comment for documentation
COMMENT ON TABLE logbook_thoughts IS 'ADHD-friendly thought capture inbox - quick dump for racing thoughts';
COMMENT ON COLUMN logbook_thoughts.status IS 'open = active thought, archived = dismissed, converted = turned into task/note';
COMMENT ON COLUMN logbook_thoughts.converted_to IS 'Type of item the thought was converted to (task or note)';
