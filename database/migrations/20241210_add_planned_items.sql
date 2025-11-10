-- Migration: Add planned_items table for Plan Ahead feature
-- This allows users to create one-time or recurring focus items for future dates

-- ==========================================
-- PLANNED ITEMS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS planned_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Item details
    description TEXT NOT NULL,
    categories TEXT[] NOT NULL DEFAULT '{}',

    -- Recurrence settings
    recurrence_type TEXT NOT NULL CHECK (recurrence_type IN ('once', 'daily', 'weekly', 'monthly')),
    start_date DATE NOT NULL,
    end_date DATE, -- NULL means no end date
    recurrence_days INTEGER[], -- For weekly: [0=Sun, 1=Mon, ..., 6=Sat]. NULL for daily/monthly/once

    -- Optional barrier planning
    barrier_type_id UUID REFERENCES barrier_types(id) ON DELETE SET NULL,
    custom_barrier TEXT,

    -- Optional anchoring
    anchor_type TEXT CHECK (anchor_type IN ('at', 'while', 'before', 'after')),
    anchor_value TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_planned_items_user_id ON planned_items(user_id);
CREATE INDEX IF NOT EXISTS idx_planned_items_start_date ON planned_items(start_date);
CREATE INDEX IF NOT EXISTS idx_planned_items_end_date ON planned_items(end_date);
CREATE INDEX IF NOT EXISTS idx_planned_items_recurrence ON planned_items(recurrence_type);

-- ==========================================
-- ROW LEVEL SECURITY
-- ==========================================
ALTER TABLE planned_items ENABLE ROW LEVEL SECURITY;

-- Users can only see their own planned items
CREATE POLICY "Users can view their own planned items"
    ON planned_items
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own planned items
CREATE POLICY "Users can create their own planned items"
    ON planned_items
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own planned items
CREATE POLICY "Users can update their own planned items"
    ON planned_items
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own planned items
CREATE POLICY "Users can delete their own planned items"
    ON planned_items
    FOR DELETE
    USING (auth.uid() = user_id);

-- ==========================================
-- TRIGGER: Update updated_at timestamp
-- ==========================================
CREATE OR REPLACE FUNCTION update_planned_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_planned_items_updated_at
    BEFORE UPDATE ON planned_items
    FOR EACH ROW
    EXECUTE FUNCTION update_planned_items_updated_at();
