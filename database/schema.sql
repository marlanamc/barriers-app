-- ADHD Barrier Tracker Database Schema
-- This schema creates user-specific tables for the Barrier Tracker app
-- It READS from existing content tables (barriers_content, tasks_content) shared with ADHD First Aid Kit
-- It CREATES new tables for user data, check-ins, and tracking

-- NOTE: This assumes the content tables from ADHD First Aid already exist:
-- - content_types
-- - content_pages (which includes barriers and tasks)
-- The barrier tracker will query these existing tables

-- Enable UUID extension (may already be enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- USER PROFILES
-- ==========================================
-- Extended user profile information beyond auth.users
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    timezone TEXT DEFAULT 'UTC',
    preferences JSONB DEFAULT '{}', -- UI preferences, notification settings, etc.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_user_profile UNIQUE(user_id)
);

-- ==========================================
-- INTERNAL WEATHER CHECK-IN TABLES
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

-- Up to five focus items per check-in
create table if not exists focus_items (
    id uuid primary key default gen_random_uuid(),
    checkin_id uuid not null references checkins(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    description text not null,
    categories text[] not null default '{}',
    sort_order integer not null default 0,
    anchor_type text check (anchor_type in ('at', 'while', 'before', 'after')),
    anchor_value text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
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
-- NOTE: Legacy daily_check_ins, barrier_selections, and task_selections
-- tables have been removed. This schema focuses on the internal weather
-- check-in flow using the checkins, focus_items, and focus_barriers tables.
-- ==========================================

-- ==========================================
-- CALENDAR ENTRIES (Aggregated view)
-- ==========================================
-- Pre-computed calendar view for performance
-- This table is automatically updated by triggers
CREATE TABLE IF NOT EXISTS user_calendar_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,

    -- Focus item count (how many things mattered that day)
    focus_count INTEGER NOT NULL DEFAULT 0,

    -- Internal weather tracking
    internal_weather TEXT,
    weather_icon TEXT,

    -- Check-in completion status
    has_check_in BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_calendar_entry UNIQUE(user_id, date)
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
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

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_calendar_entries_user_id ON user_calendar_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_entries_date ON user_calendar_entries(date DESC);
CREATE INDEX IF NOT EXISTS idx_calendar_entries_user_date ON user_calendar_entries(user_id, date DESC);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================
-- Enable RLS on all user tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE barrier_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_barriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_calendar_entries ENABLE ROW LEVEL SECURITY;

-- User profiles: Users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Calendar entries: Users can only access their own calendar
CREATE POLICY "Users can view own calendar" ON user_calendar_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calendar entries" ON user_calendar_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calendar entries" ON user_calendar_entries
    FOR UPDATE USING (auth.uid() = user_id);

-- Barrier types & tips: Read-only for authenticated users
CREATE POLICY "Users can read barrier types" ON barrier_types
    FOR SELECT USING (true);

CREATE POLICY "Users can read tips" ON tips
    FOR SELECT USING (true);

-- Checkins policies
CREATE POLICY "Users can view own weather checkins" ON checkins
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weather checkins" ON checkins
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weather checkins" ON checkins
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weather checkins" ON checkins
    FOR DELETE USING (auth.uid() = user_id);

-- Focus item policies
CREATE POLICY "Users can view own focus items" ON focus_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own focus items" ON focus_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own focus items" ON focus_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own focus items" ON focus_items
    FOR DELETE USING (auth.uid() = user_id);

-- Focus barrier policies
CREATE POLICY "Users can view own focus barriers" ON focus_barriers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own focus barriers" ON focus_barriers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own focus barriers" ON focus_barriers
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own focus barriers" ON focus_barriers
    FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- TRIGGERS & FUNCTIONS
-- ==========================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checkins_updated_at BEFORE UPDATE ON checkins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_focus_items_updated_at BEFORE UPDATE ON focus_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_focus_barriers_updated_at BEFORE UPDATE ON focus_barriers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_check_ins_updated_at BEFORE UPDATE ON daily_check_ins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_entries_updated_at BEFORE UPDATE ON user_calendar_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create or update a check-in with nested focus data atomically
-- Supports upsert: updates existing check-in if one exists for the user/date, otherwise creates new
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
    existing_checkin_id UUID;
    focus_record JSONB;
    barrier_record JSONB;
    new_focus_item_id UUID;
    formatted_categories TEXT[];
    barrier_type_identifier UUID;
    description TEXT;
    sort_position INTEGER;
    anchor_selection TEXT;
    anchor_text TEXT;
BEGIN
    -- Try to find existing check-in for this user/date
    SELECT id INTO existing_checkin_id
    FROM checkins
    WHERE user_id = p_user_id
      AND checkin_date = COALESCE(p_checkin_date, CURRENT_DATE)
    LIMIT 1;

    IF existing_checkin_id IS NOT NULL THEN
        -- Update existing check-in
        UPDATE checkins
        SET 
            internal_weather = p_internal_weather,
            weather_icon = p_weather_icon,
            forecast_note = p_forecast_note,
            updated_at = NOW()
        WHERE id = existing_checkin_id;
        
        new_checkin_id := existing_checkin_id;
        
        -- Delete existing focus items and barriers (cascade will handle barriers)
        DELETE FROM focus_items
        WHERE checkin_id = existing_checkin_id;
    ELSE
        -- Insert new check-in
        INSERT INTO checkins (user_id, checkin_date, internal_weather, weather_icon, forecast_note)
        VALUES (
            p_user_id,
            COALESCE(p_checkin_date, CURRENT_DATE),
            p_internal_weather,
            p_weather_icon,
            p_forecast_note
        )
        RETURNING id INTO new_checkin_id;
    END IF;

    -- Insert focus items (works for both new and updated check-ins)
    IF p_focus_items IS NOT NULL AND jsonb_array_length(p_focus_items) > 0 THEN
        FOR focus_record IN SELECT * FROM jsonb_array_elements(p_focus_items)
    LOOP
        description := COALESCE(trim(focus_record->>'description'), '');
        IF description = '' THEN
            CONTINUE;
        END IF;

        sort_position := COALESCE((focus_record->>'sortOrder')::INT, 0);
        anchor_selection := lower(trim(COALESCE(focus_record->>'anchorType', '')));
        anchor_text := NULLIF(trim(COALESCE(focus_record->>'anchorValue', '')), '');

        IF anchor_selection NOT IN ('at', 'while', 'before', 'after') THEN
            anchor_selection := NULL;
        END IF;

        IF anchor_selection IS NULL THEN
            anchor_text := NULL;
        END IF;

        SELECT COALESCE(
            ARRAY(
                SELECT value::TEXT
                FROM jsonb_array_elements_text(
                    COALESCE(focus_record->'categories', '[]'::JSONB)
                ) AS value
            ),
            ARRAY[]::TEXT[]
        ) INTO formatted_categories;

        INSERT INTO focus_items (
            checkin_id,
            user_id,
            description,
            categories,
            sort_order,
            anchor_type,
            anchor_value
        )
        VALUES (
            new_checkin_id,
            p_user_id,
            description,
            formatted_categories,
            sort_position,
            anchor_selection,
            anchor_text
        )
        RETURNING id INTO new_focus_item_id;

        barrier_record := focus_record->'barrier';
        barrier_type_identifier := NULL;

        IF barrier_record IS NOT NULL THEN
            IF barrier_record ? 'barrierTypeId' THEN
                BEGIN
                    barrier_type_identifier := (barrier_record->>'barrierTypeId')::UUID;
                EXCEPTION
                    WHEN invalid_text_representation THEN
                        barrier_type_identifier := NULL;
                END;
            END IF;

            IF barrier_type_identifier IS NULL AND barrier_record ? 'barrierTypeSlug' THEN
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

-- Function to automatically update calendar entries when check-ins are created/updated
CREATE OR REPLACE FUNCTION sync_calendar_from_checkin()
RETURNS TRIGGER AS $$
DECLARE
    focus_ct INTEGER;
BEGIN
    -- Count focus items for this check-in
    SELECT COUNT(*) INTO focus_ct
    FROM focus_items
    WHERE checkin_id = NEW.id;

    -- Upsert calendar entry
    INSERT INTO user_calendar_entries (
        user_id,
        date,
        focus_count,
        internal_weather,
        weather_icon,
        has_check_in
    )
    VALUES (
        NEW.user_id,
        NEW.checkin_date,
        focus_ct,
        NEW.internal_weather,
        NEW.weather_icon,
        true
    )
    ON CONFLICT (user_id, date) DO UPDATE SET
        focus_count = focus_ct,
        internal_weather = NEW.internal_weather,
        weather_icon = NEW.weather_icon,
        has_check_in = true,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_calendar_from_checkin_trigger
AFTER INSERT OR UPDATE ON checkins
FOR EACH ROW EXECUTE FUNCTION sync_calendar_from_checkin();

-- ==========================================
-- HELPFUL VIEWS
-- ==========================================

-- View: Internal weather frequency per user
CREATE OR REPLACE VIEW user_internal_weather_stats AS
SELECT
    user_id,
    internal_weather,
    COUNT(*) AS occurrence_count,
    MIN(created_at::date) AS first_logged,
    MAX(created_at::date) AS last_logged
FROM checkins
GROUP BY user_id, internal_weather;
