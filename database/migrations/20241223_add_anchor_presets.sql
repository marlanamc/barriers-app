-- Add anchor presets table for user-defined anchor suggestions
CREATE TABLE IF NOT EXISTS anchor_presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    anchor_type TEXT NOT NULL CHECK (anchor_type IN ('at', 'while', 'before', 'after')),
    preset_value TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT unique_user_anchor_preset UNIQUE(user_id, anchor_type, preset_value)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_anchor_presets_user_type ON anchor_presets(user_id, anchor_type);

-- Enable RLS
ALTER TABLE anchor_presets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own anchor presets
CREATE POLICY "Users can view their own anchor presets"
    ON anchor_presets FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own anchor presets
CREATE POLICY "Users can insert their own anchor presets"
    ON anchor_presets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own anchor presets
CREATE POLICY "Users can update their own anchor presets"
    ON anchor_presets FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own anchor presets
CREATE POLICY "Users can delete their own anchor presets"
    ON anchor_presets FOR DELETE
    USING (auth.uid() = user_id);

