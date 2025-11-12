-- Migration: Add support for multiple anchors per focus item
-- Allows combinations like "at 3pm while listening to music" or "after lunch before opening email"

-- Add new JSONB column to store multiple anchors
ALTER TABLE focus_items
ADD COLUMN IF NOT EXISTS anchors JSONB DEFAULT '[]'::JSONB;

-- Add comment explaining the structure
COMMENT ON COLUMN focus_items.anchors IS
'Array of anchor objects, each with type and value. Example: [{"type":"at","value":"3pm"},{"type":"while","value":"listening to music"}]';

-- Migrate existing single anchor data to new format
UPDATE focus_items
SET anchors = CASE
    WHEN anchor_type IS NOT NULL AND anchor_value IS NOT NULL THEN
        jsonb_build_array(
            jsonb_build_object('type', anchor_type, 'value', anchor_value)
        )
    ELSE
        '[]'::JSONB
END
WHERE anchors = '[]'::JSONB OR anchors IS NULL;

-- Keep old columns for backward compatibility (we'll remove them in a future migration after testing)
-- This allows rollback if needed

-- Add index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_focus_items_anchors ON focus_items USING GIN (anchors);

-- Add the same column to planned_items table
ALTER TABLE planned_items
ADD COLUMN IF NOT EXISTS anchors JSONB DEFAULT '[]'::JSONB;

COMMENT ON COLUMN planned_items.anchors IS
'Array of anchor objects, each with type and value. Example: [{"type":"at","value":"3pm"},{"type":"while","value":"listening to music"}]';

-- Migrate existing planned_items anchor data
UPDATE planned_items
SET anchors = CASE
    WHEN anchor_type IS NOT NULL AND anchor_value IS NOT NULL THEN
        jsonb_build_array(
            jsonb_build_object('type', anchor_type, 'value', anchor_value)
        )
    ELSE
        '[]'::JSONB
END
WHERE anchors = '[]'::JSONB OR anchors IS NULL;

CREATE INDEX IF NOT EXISTS idx_planned_items_anchors ON planned_items USING GIN (anchors);

-- Update the create_checkin_with_focus function to handle multiple anchors
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
    anchors_array JSONB;
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

        -- Delete focus items that are no longer in the incoming list
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

            -- Handle both old single anchor format and new multiple anchors format
            IF focus_record ? 'anchors' THEN
                -- New format: multiple anchors
                anchors_array := COALESCE(focus_record->'anchors', '[]'::JSONB);
            ELSIF focus_record ? 'anchorType' AND focus_record ? 'anchorValue' THEN
                -- Old format: single anchor (backward compatibility)
                anchor_selection := lower(trim(COALESCE(focus_record->>'anchorType', '')));
                anchor_text := NULLIF(trim(COALESCE(focus_record->>'anchorValue', '')), '');

                IF anchor_selection IN ('at', 'while', 'before', 'after') AND anchor_text IS NOT NULL THEN
                    anchors_array := jsonb_build_array(
                        jsonb_build_object('type', anchor_selection, 'value', anchor_text)
                    );
                ELSE
                    anchors_array := '[]'::JSONB;
                END IF;
            ELSE
                anchors_array := '[]'::JSONB;
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
                    anchors
                )
                VALUES (
                    new_checkin_id,
                    p_user_id,
                    description,
                    formatted_categories,
                    sort_position,
                    anchors_array
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

COMMENT ON FUNCTION create_checkin_with_focus IS
'Upserts a check-in with focus items. Supports both single anchor (legacy) and multiple anchors per focus item.';
