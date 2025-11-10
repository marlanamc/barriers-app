-- Migration: Update create_checkin_with_focus to support upsert (update existing check-ins)
-- This allows users to add/update focus items throughout the day
-- The unique constraint ensures only one check-in per user per day

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
    END IF;

    RETURN new_checkin_id;
END;
$$;

