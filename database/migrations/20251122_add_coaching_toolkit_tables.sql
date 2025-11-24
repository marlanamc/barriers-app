-- Add coaching toolkit tables for the nautical framework
-- These tables store the Dockside Prep, Navigation, Support, and Reflection data

-- =============================================================================
-- USER TOOLKIT SETTINGS (North Star, Lighthouse, Anchor Question)
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_toolkit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    north_star TEXT,
    lighthouse TEXT,
    lighthouse_timeframe TEXT CHECK (lighthouse_timeframe IN ('3mo', '6mo', '1yr', '5yr')),
    anchor_question TEXT,
    anchor_type TEXT CHECK (anchor_type IN ('preset', 'custom')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_user_toolkit UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_toolkit_user ON user_toolkit(user_id);

ALTER TABLE user_toolkit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own toolkit"
    ON user_toolkit FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own toolkit"
    ON user_toolkit FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own toolkit"
    ON user_toolkit FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- LIFE VEST TOOLS (Personal coping/grounding strategies)
-- =============================================================================

CREATE TABLE IF NOT EXISTS life_vest_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT, -- e.g., 'sensory', 'breathing', 'movement', 'social'
    quick_access BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_life_vest_tools_user ON life_vest_tools(user_id);
CREATE INDEX IF NOT EXISTS idx_life_vest_tools_quick ON life_vest_tools(user_id, quick_access) WHERE quick_access = true;

ALTER TABLE life_vest_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own life vest tools"
    ON life_vest_tools FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own life vest tools"
    ON life_vest_tools FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own life vest tools"
    ON life_vest_tools FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own life vest tools"
    ON life_vest_tools FOR DELETE
    USING (auth.uid() = user_id);

-- =============================================================================
-- FUEL CHECKLIST (Daily regulation tracking)
-- =============================================================================

CREATE TABLE IF NOT EXISTS fuel_checklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    check_date DATE NOT NULL,
    water BOOLEAN NOT NULL DEFAULT false,
    food BOOLEAN NOT NULL DEFAULT false,
    meds BOOLEAN NOT NULL DEFAULT false,
    movement BOOLEAN NOT NULL DEFAULT false,
    sleep BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_user_fuel_date UNIQUE(user_id, check_date)
);

CREATE INDEX IF NOT EXISTS idx_fuel_checklist_user_date ON fuel_checklist(user_id, check_date);

ALTER TABLE fuel_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own fuel checklist"
    ON fuel_checklist FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own fuel checklist"
    ON fuel_checklist FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fuel checklist"
    ON fuel_checklist FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- CREW CONTACTS (Support network)
-- =============================================================================

CREATE TABLE IF NOT EXISTS crew_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    role TEXT, -- e.g., 'accountability buddy', 'cheerleader', 'mentor'
    can_text BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crew_contacts_user ON crew_contacts(user_id);

ALTER TABLE crew_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own crew contacts"
    ON crew_contacts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own crew contacts"
    ON crew_contacts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own crew contacts"
    ON crew_contacts FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own crew contacts"
    ON crew_contacts FOR DELETE
    USING (auth.uid() = user_id);

-- =============================================================================
-- STARLIGHT WINS (Gratitude and wins journal)
-- =============================================================================

CREATE TABLE IF NOT EXISTS starlight_wins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('win', 'gratitude', 'progress')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_starlight_wins_user ON starlight_wins(user_id);
CREATE INDEX IF NOT EXISTS idx_starlight_wins_user_date ON starlight_wins(user_id, created_at DESC);

ALTER TABLE starlight_wins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own starlight wins"
    ON starlight_wins FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own starlight wins"
    ON starlight_wins FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own starlight wins"
    ON starlight_wins FOR DELETE
    USING (auth.uid() = user_id);

-- =============================================================================
-- UPSERT FUNCTION FOR FUEL CHECKLIST
-- =============================================================================

CREATE OR REPLACE FUNCTION upsert_fuel_checklist(
    p_user_id UUID,
    p_check_date DATE,
    p_water BOOLEAN DEFAULT false,
    p_food BOOLEAN DEFAULT false,
    p_meds BOOLEAN DEFAULT false,
    p_movement BOOLEAN DEFAULT false,
    p_sleep BOOLEAN DEFAULT false
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO fuel_checklist (user_id, check_date, water, food, meds, movement, sleep)
    VALUES (p_user_id, p_check_date, p_water, p_food, p_meds, p_movement, p_sleep)
    ON CONFLICT (user_id, check_date)
    DO UPDATE SET
        water = p_water,
        food = p_food,
        meds = p_meds,
        movement = p_movement,
        sleep = p_sleep,
        updated_at = NOW()
    RETURNING id INTO v_id;

    RETURN v_id;
END;
$$;

-- =============================================================================
-- UPSERT FUNCTION FOR USER TOOLKIT
-- =============================================================================

CREATE OR REPLACE FUNCTION upsert_user_toolkit(
    p_user_id UUID,
    p_north_star TEXT DEFAULT NULL,
    p_lighthouse TEXT DEFAULT NULL,
    p_lighthouse_timeframe TEXT DEFAULT NULL,
    p_anchor_question TEXT DEFAULT NULL,
    p_anchor_type TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO user_toolkit (user_id, north_star, lighthouse, lighthouse_timeframe, anchor_question, anchor_type)
    VALUES (p_user_id, p_north_star, p_lighthouse, p_lighthouse_timeframe, p_anchor_question, p_anchor_type)
    ON CONFLICT (user_id)
    DO UPDATE SET
        north_star = COALESCE(p_north_star, user_toolkit.north_star),
        lighthouse = COALESCE(p_lighthouse, user_toolkit.lighthouse),
        lighthouse_timeframe = COALESCE(p_lighthouse_timeframe, user_toolkit.lighthouse_timeframe),
        anchor_question = COALESCE(p_anchor_question, user_toolkit.anchor_question),
        anchor_type = COALESCE(p_anchor_type, user_toolkit.anchor_type),
        updated_at = NOW()
    RETURNING id INTO v_id;

    RETURN v_id;
END;
$$;
