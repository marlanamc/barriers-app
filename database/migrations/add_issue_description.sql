-- Migration: Add issue_description to barrier_selections
-- This allows users to specify what specifically is the issue for each barrier

ALTER TABLE barrier_selections 
ADD COLUMN IF NOT EXISTS issue_description TEXT;

-- Add comment for documentation
COMMENT ON COLUMN barrier_selections.issue_description IS 'User-specified description of what specifically is the issue with this barrier';

