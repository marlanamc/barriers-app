-- Migration: Fix focus items upsert to prevent data loss (v2 - with task_type and complexity support)
-- Instead of DELETE + INSERT, we now UPDATE existing items and only modify what changed
-- This prevents the appearance of check-ins "disappearing" during save operations
-- This version properly includes task_type, complexity, and anchors array support

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
    anchors_array JSONB;
    item_task_type TEXT;
    item_complexity TEXT;
    item_completed BOOLEAN;
    existing_item_ids UUID[];
    incoming_item_ids TEXT[];
BEGIN
    -- Validate and normalize the checkin date
    IF p_checkin_date IS NULL THEN
        p_checkin_date := CURRENT_DATE;
    END IF;

    -- Log the save operation for debugging
    RAISE NOTICE 'Saving check-in for user % on date %', p_user_id, p_checkin_date;

    -- Try to find existing check-in for this user/date
    SELECT id INTO existing_checkin_id
    FROM checkins
    WHERE user_id = p_user_id
      AND checkin_date = p_checkin_date
    LIMIT 1;

    IF existing_checkin_id IS NOT NULL THEN
        -- Update existing check-in metadata
        UPDATE checkins
        SET
            internal_weather = p_internal_weather,
            weather_icon = p_weather_icon,
            forecast_note = p_forecast_note,
            updated_at = NOW()
        WHERE id = existing_checkin_id;

        new_checkin_id := existing_checkin_id;

        RAISE NOTICE 'Updating existing check-in %', existing_checkin_id;

        -- Collect all incoming item IDs (these are temporary client-side UUIDs)
        SELECT array_agg(value->>'id') INTO incoming_item_ids
        FROM jsonb_array_elements(p_focus_items);

        -- Collect all existing item IDs from database
        SELECT array_agg(id) INTO existing_item_ids
        FROM focus_items
        WHERE checkin_id = existing_checkin_id;

        -- Delete focus items that are no longer in the incoming list
        -- We match by sort_order and description to identify "same" items
        DELETE FROM focus_items fi
        WHERE fi.checkin_id = existing_checkin_id
        AND NOT EXISTS (
            SELECT 1
            FROM jsonb_array_elements(p_focus_items) AS incoming
            WHERE fi.description = COALESCE(trim(incoming->>'description'), '')
            AND fi.sort_order = COALESCE((incoming->>'sortOrder')::INT, 0)
        );

        RAISE NOTICE 'Deleted removed focus items for check-in %', existing_checkin_id;
    ELSE
        -- Insert new check-in
        INSERT INTO checkins (user_id, checkin_date, internal_weather, weather_icon, forecast_note)
        VALUES (
            p_user_id,
            p_checkin_date,
            p_internal_weather,
            p_weather_icon,
            p_forecast_note
        )
        RETURNING id INTO new_checkin_id;

        RAISE NOTICE 'Created new check-in %', new_checkin_id;
    END IF;

    -- Process focus items (upsert logic)
    IF p_focus_items IS NOT NULL AND jsonb_array_length(p_focus_items) > 0 THEN
        FOR focus_record IN SELECT * FROM jsonb_array_elements(p_focus_items)
        LOOP
            description := COALESCE(trim(focus_record->>'description'), '');
            IF description = '' THEN
                CONTINUE;
            END IF;

            sort_position := COALESCE((focus_record->>'sortOrder')::INT, 0);

            -- Handle multiple anchors format (new) or single anchor format (old, for backward compatibility)
            IF focus_record ? 'anchors' THEN
                anchors_array := COALESCE(focus_record->'anchors', '[]'::JSONB);
            ELSIF focus_record ? 'anchorType' AND focus_record ? 'anchorValue' THEN
                -- Old format: single anchor (backward compatibility)
                DECLARE
                    anchor_selection TEXT;
                    anchor_text TEXT;
                BEGIN
                    anchor_selection := lower(trim(COALESCE(focus_record->>'anchorType', '')));
                    anchor_text := NULLIF(trim(COALESCE(focus_record->>'anchorValue', '')), '');

                    IF anchor_selection IN ('at', 'while', 'before', 'after') AND anchor_text IS NOT NULL THEN
                        anchors_array := jsonb_build_array(
                            jsonb_build_object('type', anchor_selection, 'value', anchor_text)
                        );
                    ELSE
                        anchors_array := '[]'::JSONB;
                    END IF;
                END;
            ELSE
                anchors_array := '[]'::JSONB;
            END IF;

            -- Get task type and complexity (default to 'focus' and 'medium' if not provided)
            item_task_type := COALESCE(focus_record->>'taskType', 'focus');
            item_complexity := COALESCE(focus_record->>'complexity', 'medium');

            -- Get completed status (default to false if not provided)
            BEGIN
                item_completed := COALESCE((focus_record->>'completed')::BOOLEAN, FALSE);
            EXCEPTION
                WHEN OTHERS THEN
                    item_completed := FALSE;
            END;

            -- Validate task_type and complexity
            IF item_task_type NOT IN ('focus', 'life') THEN
                item_task_type := 'focus';
            END IF;

            IF item_complexity NOT IN ('quick', 'medium', 'deep') THEN
                item_complexity := 'medium';
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

            -- Try to find existing focus item by description and sort order
            SELECT id INTO new_focus_item_id
            FROM focus_items
            WHERE checkin_id = new_checkin_id
              AND description = description
              AND sort_order = sort_position
            LIMIT 1;

            IF new_focus_item_id IS NOT NULL THEN
                -- Update existing focus item
                UPDATE focus_items
                SET
                    categories = formatted_categories,
                    anchors = anchors_array,
                    task_type = item_task_type,
                    complexity = item_complexity,
                    completed = item_completed,
                    updated_at = NOW()
                WHERE id = new_focus_item_id;

                RAISE NOTICE 'Updated existing focus item %', new_focus_item_id;

                -- Delete old barriers for this focus item
                DELETE FROM focus_barriers WHERE focus_item_id = new_focus_item_id;
            ELSE
                -- Insert new focus item
                INSERT INTO focus_items (
                    checkin_id,
                    user_id,
                    description,
                    categories,
                    sort_order,
                    anchors,
                    task_type,
                    complexity,
                    completed
                )
                VALUES (
                    new_checkin_id,
                    p_user_id,
                    description,
                    formatted_categories,
                    sort_position,
                    anchors_array,
                    item_task_type,
                    item_complexity,
                    item_completed
                )
                RETURNING id INTO new_focus_item_id;

                RAISE NOTICE 'Inserted new focus item %', new_focus_item_id;
            END IF;

            -- Handle barriers (always recreate to keep it simple)
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

    RAISE NOTICE 'Completed save operation for check-in %', new_checkin_id;
    RETURN new_checkin_id;
END;
$$;

-- Add a comment explaining the improvement
COMMENT ON FUNCTION create_checkin_with_focus IS
'Upserts a check-in with focus items. Uses intelligent upsert logic that updates existing items instead of delete+recreate to prevent data loss and improve performance. Supports task_type (focus/life), complexity (quick/medium/deep), and multiple anchors.';
