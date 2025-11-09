-- Migration: Add life_area_selections table
-- This allows users to track life areas separately from barriers

CREATE TABLE IF NOT EXISTS life_area_selections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    check_in_id UUID NOT NULL REFERENCES daily_check_ins(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Reference to the life_area in content_pages (by slug)
    life_area_slug TEXT NOT NULL,
    life_area_name TEXT NOT NULL, -- Denormalized for easier querying
    
    -- User's note about this life area
    note TEXT,

    -- When this life area was selected
    selected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_life_area_per_check_in UNIQUE(check_in_id, life_area_slug)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_life_area_selections_user_id ON life_area_selections(user_id);
CREATE INDEX IF NOT EXISTS idx_life_area_selections_check_in ON life_area_selections(check_in_id);
CREATE INDEX IF NOT EXISTS idx_life_area_selections_slug ON life_area_selections(life_area_slug);

-- Row Level Security
ALTER TABLE life_area_selections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own life_area selections" ON life_area_selections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own life_area selections" ON life_area_selections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own life_area selections" ON life_area_selections
    FOR DELETE USING (auth.uid() = user_id);

-- Add comment for documentation
COMMENT ON TABLE life_area_selections IS 'Tracks user selections of life areas for each check-in';
COMMENT ON COLUMN life_area_selections.note IS 'User-specified note about this life area';

