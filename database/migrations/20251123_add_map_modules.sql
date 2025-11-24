-- Add map_modules table for the redesigned Captain's Map
-- This table stores text-based module content for identity/foundation items
-- Complex array-based modules use their own tables (life_vest_tools, crew_contacts, starlight_wins)

-- =============================================================================
-- MAP MODULES TABLE (Unified storage for text-based map content)
-- =============================================================================

CREATE TABLE IF NOT EXISTS map_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    module_type TEXT NOT NULL CHECK (module_type IN (
        'destination',      -- Main goal
        'fuel_habits',      -- Regulation habits (what helps you stay fueled)
        'compass_setup',    -- Weekly priorities framework
        'energy_patterns',  -- Sails/Oars - energy rhythm awareness
        'storms',           -- Big repeating challenges
        'drift_sirens',     -- Sneaky distractions
        'lifeboat',         -- Clarity tools and external supports
        'buoy',             -- Reflection cue/question
        'logbook_style'     -- Preferred reflection approach
    )),
    content JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Each user can only have one entry per module type
    CONSTRAINT unique_user_module UNIQUE(user_id, module_type)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_map_modules_user ON map_modules(user_id);
CREATE INDEX IF NOT EXISTS idx_map_modules_user_type ON map_modules(user_id, module_type);

-- Enable Row Level Security
ALTER TABLE map_modules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own map modules"
    ON map_modules FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own map modules"
    ON map_modules FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own map modules"
    ON map_modules FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own map modules"
    ON map_modules FOR DELETE
    USING (auth.uid() = user_id);

-- =============================================================================
-- UPSERT FUNCTION FOR MAP MODULES
-- =============================================================================

CREATE OR REPLACE FUNCTION upsert_map_module(
    p_user_id UUID,
    p_module_type TEXT,
    p_content JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO map_modules (user_id, module_type, content)
    VALUES (p_user_id, p_module_type, p_content)
    ON CONFLICT (user_id, module_type)
    DO UPDATE SET
        content = p_content,
        updated_at = NOW()
    RETURNING id INTO v_id;

    RETURN v_id;
END;
$$;

-- =============================================================================
-- HELPER FUNCTION TO GET ALL MAP DATA FOR A USER
-- Returns all module content in a single query
-- =============================================================================

CREATE OR REPLACE FUNCTION get_user_map_data(p_user_id UUID)
RETURNS TABLE (
    module_type TEXT,
    content JSONB,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.module_type,
        m.content,
        m.updated_at
    FROM map_modules m
    WHERE m.user_id = p_user_id;
END;
$$;

-- =============================================================================
-- COMMENT ON TABLES AND COLUMNS
-- =============================================================================

COMMENT ON TABLE map_modules IS 'Stores text-based content for Captain''s Map modules (identity, foundation, tools)';
COMMENT ON COLUMN map_modules.module_type IS 'Type of map module (destination, storms, drift_sirens, etc.)';
COMMENT ON COLUMN map_modules.content IS 'JSON content specific to each module type';
