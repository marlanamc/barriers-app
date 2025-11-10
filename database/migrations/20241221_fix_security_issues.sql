-- Migration: Fix security vulnerabilities in database functions
-- This addresses critical security issues:
-- 1. SECURITY DEFINER function must validate user_id matches auth.uid()
-- 2. Add input validation and length limits
-- 3. Prevent privilege escalation attacks

-- ==========================================
-- SECURE create_checkin_with_focus FUNCTION
-- ==========================================
-- CRITICAL: SECURITY DEFINER functions must validate that the caller
-- can only access/modify their own data. This prevents privilege escalation.

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
    current_user_id UUID;
    max_focus_items CONSTANT INTEGER := 5;
    max_description_length CONSTANT INTEGER := 500;
    max_forecast_note_length CONSTANT INTEGER := 1000;
    max_anchor_value_length CONSTANT INTEGER := 200;
    max_custom_barrier_length CONSTANT INTEGER := 200;
BEGIN
    -- SECURITY: Validate that the caller can only modify their own data
    -- This prevents privilege escalation attacks
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;
    
    IF p_user_id IS NULL OR p_user_id != current_user_id THEN
        RAISE EXCEPTION 'Access denied: Cannot modify data for other users';
    END IF;
    
    -- INPUT VALIDATION: Validate internal_weather
    IF p_internal_weather IS NULL OR trim(p_internal_weather) = '' THEN
        RAISE EXCEPTION 'internal_weather is required';
    END IF;
    
    -- INPUT VALIDATION: Validate forecast_note length
    IF p_forecast_note IS NOT NULL AND length(p_forecast_note) > max_forecast_note_length THEN
        RAISE EXCEPTION 'forecast_note exceeds maximum length of % characters', max_forecast_note_length;
    END IF;
    
    -- INPUT VALIDATION: Validate focus_items array size
    IF p_focus_items IS NOT NULL AND jsonb_array_length(p_focus_items) > max_focus_items THEN
        RAISE EXCEPTION 'Maximum of % focus items allowed', max_focus_items;
    END IF;
    
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
            weather_icon = NULLIF(trim(p_weather_icon), ''),
            forecast_note = NULLIF(trim(p_forecast_note), ''),
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
            NULLIF(trim(p_weather_icon), ''),
            NULLIF(trim(p_forecast_note), '')
        )
        RETURNING id INTO new_checkin_id;
    END IF;

    -- Insert focus items (works for both new and updated check-ins)
    IF p_focus_items IS NOT NULL AND jsonb_array_length(p_focus_items) > 0 THEN
        FOR focus_record IN SELECT * FROM jsonb_array_elements(p_focus_items)
        LOOP
            description := COALESCE(trim(focus_record->>'description'), '');
            
            -- INPUT VALIDATION: Skip empty descriptions
            IF description = '' THEN
                CONTINUE;
            END IF;
            
            -- INPUT VALIDATION: Validate description length
            IF length(description) > max_description_length THEN
                RAISE EXCEPTION 'Focus item description exceeds maximum length of % characters', max_description_length;
            END IF;

            sort_position := COALESCE((focus_record->>'sortOrder')::INT, 0);
            
            -- INPUT VALIDATION: Validate sort_position range
            IF sort_position < 0 OR sort_position >= max_focus_items THEN
                sort_position := 0;
            END IF;
            
            anchor_selection := lower(trim(COALESCE(focus_record->>'anchorType', '')));
            anchor_text := NULLIF(trim(COALESCE(focus_record->>'anchorValue', '')), '');

            -- INPUT VALIDATION: Validate anchor_type enum
            IF anchor_selection NOT IN ('at', 'while', 'before', 'after') THEN
                anchor_selection := NULL;
            END IF;

            IF anchor_selection IS NULL THEN
                anchor_text := NULL;
            END IF;
            
            -- INPUT VALIDATION: Validate anchor_value length
            IF anchor_text IS NOT NULL AND length(anchor_text) > max_anchor_value_length THEN
                RAISE EXCEPTION 'Anchor value exceeds maximum length of % characters', max_anchor_value_length;
            END IF;

            -- INPUT VALIDATION: Validate categories array
            SELECT COALESCE(
                ARRAY(
                    SELECT value::TEXT
                    FROM jsonb_array_elements_text(
                        COALESCE(focus_record->'categories', '[]'::JSONB)
                    ) AS value
                    WHERE value IS NOT NULL AND trim(value) != ''
                    LIMIT 10  -- Limit to 10 categories per item
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
                -- INPUT VALIDATION: Validate barrier_type_id UUID format
                IF barrier_record ? 'barrierTypeId' THEN
                    BEGIN
                        barrier_type_identifier := (barrier_record->>'barrierTypeId')::UUID;
                    EXCEPTION
                        WHEN invalid_text_representation THEN
                            barrier_type_identifier := NULL;
                    END;
                END IF;

                -- INPUT VALIDATION: Lookup barrier by slug if ID not provided
                IF barrier_type_identifier IS NULL AND barrier_record ? 'barrierTypeSlug' THEN
                    SELECT id
                    INTO barrier_type_identifier
                    FROM barrier_types
                    WHERE slug = trim(barrier_record->>'barrierTypeSlug')
                    LIMIT 1;
                END IF;

                -- INPUT VALIDATION: Validate custom_barrier length
                IF barrier_record ? 'custom' THEN
                    DECLARE
                        custom_value TEXT := trim(COALESCE(barrier_record->>'custom', ''));
                    BEGIN
                        IF custom_value != '' THEN
                            IF length(custom_value) > max_custom_barrier_length THEN
                                RAISE EXCEPTION 'Custom barrier exceeds maximum length of % characters', max_custom_barrier_length;
                            END IF;
                        END IF;
                    END;
                END IF;

                IF barrier_type_identifier IS NOT NULL OR (barrier_record ? 'custom' AND trim(COALESCE(barrier_record->>'custom', '')) != '') THEN
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
                        NULLIF(trim(COALESCE(barrier_record->>'custom', '')), '')
                    );
                END IF;
            END IF;
        END LOOP;
    END IF;

    RETURN new_checkin_id;
END;
$$;

-- Add comment explaining security measures
COMMENT ON FUNCTION create_checkin_with_focus IS 
'Securely creates or updates a check-in with focus items. Validates that user_id matches auth.uid() to prevent privilege escalation. Includes input validation and length limits.';

