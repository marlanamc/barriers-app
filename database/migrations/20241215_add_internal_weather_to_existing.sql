-- Migration: Add Internal Weather Flow to Existing ADHD First Aid Project
-- This adds the new checkins/focus_items/focus_barriers tables alongside
-- your existing daily_check_ins tables (which we'll keep for now)

-- ==========================================
-- 1. CREATE NEW TABLES (Internal Weather Flow)
-- ==========================================

-- Reference library for consistent barrier labeling
CREATE TABLE IF NOT EXISTS barrier_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Gentle support messages mapped to barrier types
CREATE TABLE IF NOT EXISTS tips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barrier_type_id UUID REFERENCES barrier_types(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    tone TEXT DEFAULT 'gentle',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Morning snapshot of internal weather
CREATE TABLE IF NOT EXISTS checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
    internal_weather TEXT NOT NULL,
    weather_icon TEXT,
    forecast_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_checkin_per_day UNIQUE(user_id, checkin_date)
);

-- Up to three focus items per check-in
CREATE TABLE IF NOT EXISTS focus_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checkin_id UUID NOT NULL REFERENCES checkins(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    categories TEXT[] NOT NULL DEFAULT '{}',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optional barriers tied to each focus item
CREATE TABLE IF NOT EXISTS focus_barriers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    focus_item_id UUID NOT NULL REFERENCES focus_items(id) ON DELETE CASCADE,
    checkin_id UUID NOT NULL REFERENCES checkins(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    barrier_type_id UUID REFERENCES barrier_types(id) ON DELETE SET NULL,
    custom_barrier TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 2. UPDATE EXISTING user_calendar_entries
-- ==========================================

-- Add new columns for internal weather tracking
ALTER TABLE user_calendar_entries
  ADD COLUMN IF NOT EXISTS internal_weather TEXT,
  ADD COLUMN IF NOT EXISTS weather_icon TEXT,
  ADD COLUMN IF NOT EXISTS focus_count INTEGER DEFAULT 0;

-- Keep existing columns (barrier_count, task_count, etc.) for backward compatibility

-- ==========================================
-- 3. CREATE INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_barrier_types_slug ON barrier_types(slug);
CREATE INDEX IF NOT EXISTS idx_tips_barrier_type ON tips(barrier_type_id);
CREATE INDEX IF NOT EXISTS idx_checkins_user_id ON checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_date ON checkins(checkin_date DESC);
CREATE INDEX IF NOT EXISTS idx_checkins_created_at ON checkins(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_focus_items_checkin ON focus_items(checkin_id);
CREATE INDEX IF NOT EXISTS idx_focus_items_user_id ON focus_items(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_barriers_focus ON focus_barriers(focus_item_id);
CREATE INDEX IF NOT EXISTS idx_focus_barriers_checkin ON focus_barriers(checkin_id);

-- ==========================================
-- 4. ENABLE ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE barrier_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_barriers ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 5. CREATE RLS POLICIES
-- ==========================================

-- Barrier types & tips: Read-only for authenticated users
DROP POLICY IF EXISTS "Users can read barrier types" ON barrier_types;
CREATE POLICY "Users can read barrier types" ON barrier_types
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can read tips" ON tips;
CREATE POLICY "Users can read tips" ON tips
    FOR SELECT USING (true);

-- Checkins policies
DROP POLICY IF EXISTS "Users can view own weather checkins" ON checkins;
CREATE POLICY "Users can view own weather checkins" ON checkins
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own weather checkins" ON checkins;
CREATE POLICY "Users can insert own weather checkins" ON checkins
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own weather checkins" ON checkins;
CREATE POLICY "Users can update own weather checkins" ON checkins
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own weather checkins" ON checkins;
CREATE POLICY "Users can delete own weather checkins" ON checkins
    FOR DELETE USING (auth.uid() = user_id);

-- Focus item policies
DROP POLICY IF EXISTS "Users can view own focus items" ON focus_items;
CREATE POLICY "Users can view own focus items" ON focus_items
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own focus items" ON focus_items;
CREATE POLICY "Users can insert own focus items" ON focus_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own focus items" ON focus_items;
CREATE POLICY "Users can update own focus items" ON focus_items
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own focus items" ON focus_items;
CREATE POLICY "Users can delete own focus items" ON focus_items
    FOR DELETE USING (auth.uid() = user_id);

-- Focus barrier policies
DROP POLICY IF EXISTS "Users can view own focus barriers" ON focus_barriers;
CREATE POLICY "Users can view own focus barriers" ON focus_barriers
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own focus barriers" ON focus_barriers;
CREATE POLICY "Users can insert own focus barriers" ON focus_barriers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own focus barriers" ON focus_barriers;
CREATE POLICY "Users can update own focus barriers" ON focus_barriers
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own focus barriers" ON focus_barriers;
CREATE POLICY "Users can delete own focus barriers" ON focus_barriers
    FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- 6. CREATE TRIGGERS
-- ==========================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to new tables
DROP TRIGGER IF EXISTS update_barrier_types_updated_at ON barrier_types;
CREATE TRIGGER update_barrier_types_updated_at BEFORE UPDATE ON barrier_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_checkins_updated_at ON checkins;
CREATE TRIGGER update_checkins_updated_at BEFORE UPDATE ON checkins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_focus_items_updated_at ON focus_items;
CREATE TRIGGER update_focus_items_updated_at BEFORE UPDATE ON focus_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_focus_barriers_updated_at ON focus_barriers;
CREATE TRIGGER update_focus_barriers_updated_at BEFORE UPDATE ON focus_barriers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 7. CREATE FUNCTION FOR ATOMIC CHECKIN SAVES
-- ==========================================

CREATE OR REPLACE FUNCTION create_checkin_with_focus(
    p_user_id UUID,
    p_internal_weather TEXT,
    p_weather_icon TEXT,
    p_forecast_note TEXT,
    p_focus_items JSONB DEFAULT '[]'::JSONB,
    p_checkin_date DATE DEFAULT CURRENT_DATE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_checkin_id UUID;
    focus_record JSONB;
    barrier_record JSONB;
    new_focus_item_id UUID;
    formatted_categories TEXT[];
    barrier_type_identifier UUID;
    description TEXT;
    sort_position INTEGER;
BEGIN
    INSERT INTO checkins (user_id, checkin_date, internal_weather, weather_icon, forecast_note)
    VALUES (
        p_user_id,
        COALESCE(p_checkin_date, CURRENT_DATE),
        p_internal_weather,
        p_weather_icon,
        p_forecast_note
    )
    RETURNING id INTO new_checkin_id;

    IF p_focus_items IS NULL OR jsonb_array_length(p_focus_items) = 0 THEN
        RETURN new_checkin_id;
    END IF;

    FOR focus_record IN SELECT * FROM jsonb_array_elements(p_focus_items)
    LOOP
        description := COALESCE(trim(focus_record->>'description'), '');
        IF description = '' THEN
            CONTINUE;
        END IF;

        sort_position := COALESCE((focus_record->>'sortOrder')::INT, 0);

        SELECT COALESCE(
            ARRAY(
                SELECT value::TEXT
                FROM jsonb_array_elements_text(
                    COALESCE(focus_record->'categories', '[]'::JSONB)
                ) AS value
            ),
            ARRAY[]::TEXT[]
        ) INTO formatted_categories;

        INSERT INTO focus_items (checkin_id, user_id, description, categories, sort_order)
        VALUES (new_checkin_id, p_user_id, description, formatted_categories, sort_position)
        RETURNING id INTO new_focus_item_id;

        barrier_record := focus_record->'barrier';
        barrier_type_identifier := NULL;

        IF barrier_record IS NOT NULL THEN
            IF barrier_record ? 'barrierTypeSlug' THEN
                SELECT id
                INTO barrier_type_identifier
                FROM barrier_types
                WHERE slug = barrier_record->>'barrierTypeSlug'
                LIMIT 1;
            END IF;

            IF barrier_type_identifier IS NOT NULL OR barrier_record ? 'custom' THEN
                INSERT INTO focus_barriers (
                    focus_item_id,
                    checkin_id,
                    user_id,
                    barrier_type_id,
                    custom_barrier
                )
                VALUES (
                    new_focus_item_id,
                    new_checkin_id,
                    p_user_id,
                    barrier_type_identifier,
                    NULLIF(barrier_record->>'custom', '')
                );
            END IF;
        END IF;
    END LOOP;

    RETURN new_checkin_id;
END;
$$;

-- ==========================================
-- 8. CREATE CALENDAR SYNC TRIGGER
-- ==========================================

CREATE OR REPLACE FUNCTION sync_calendar_from_checkin()
RETURNS TRIGGER AS $$
DECLARE
    focus_ct INTEGER;
BEGIN
    -- Count focus items for this check-in
    SELECT COUNT(*) INTO focus_ct
    FROM focus_items
    WHERE checkin_id = NEW.id;

    -- Update existing calendar entry if it exists
    UPDATE user_calendar_entries
    SET
        focus_count = focus_ct,
        internal_weather = NEW.internal_weather,
        weather_icon = NEW.weather_icon,
        has_check_in = true,
        updated_at = NOW()
    WHERE user_id = NEW.user_id
      AND date = NEW.checkin_date;

    -- If no row was updated, insert a new one
    IF NOT FOUND THEN
        INSERT INTO user_calendar_entries (
            user_id,
            date,
            focus_count,
            internal_weather,
            weather_icon,
            has_check_in,
            barrier_count,
            task_count,
            completed_task_count,
            top_barriers
        )
        VALUES (
            NEW.user_id,
            NEW.checkin_date,
            focus_ct,
            NEW.internal_weather,
            NEW.weather_icon,
            true,
            0, -- Keep existing fields at 0 for backward compatibility
            0,
            0,
            '{}'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_calendar_from_checkin_trigger ON checkins;
CREATE TRIGGER sync_calendar_from_checkin_trigger
AFTER INSERT OR UPDATE ON checkins
FOR EACH ROW EXECUTE FUNCTION sync_calendar_from_checkin();

-- ==========================================
-- 9. CREATE VIEW FOR INTERNAL WEATHER STATS
-- ==========================================

CREATE OR REPLACE VIEW user_internal_weather_stats AS
SELECT
    user_id,
    internal_weather,
    COUNT(*) AS occurrence_count,
    MIN(created_at::date) AS first_logged,
    MAX(created_at::date) AS last_logged
FROM checkins
GROUP BY user_id, internal_weather;

-- ==========================================
-- 10. SUCCESS MESSAGE
-- ==========================================

SELECT 'Migration complete! Internal weather flow tables created.' AS status;
