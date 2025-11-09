-- Handles Supabase RPC for saving a check-in + nested focus items in one transaction
DROP FUNCTION IF EXISTS create_checkin_with_focus(UUID, TEXT, TEXT, TEXT, JSONB, DATE);
DROP FUNCTION IF EXISTS create_checkin_with_focus(UUID, TEXT, TEXT, TEXT, JSONB);

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
