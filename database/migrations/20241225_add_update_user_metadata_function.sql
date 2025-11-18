-- Migration: Add RPC function to update user metadata
-- This is a workaround for auth.updateUser() hanging/timing out

CREATE OR REPLACE FUNCTION update_user_metadata(
    p_metadata JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_id UUID;
    current_metadata JSONB;
    new_metadata JSONB;
BEGIN
    -- Get the current authenticated user ID
    current_user_id := auth.uid();

    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Get current user metadata
    SELECT raw_user_meta_data INTO current_metadata
    FROM auth.users
    WHERE id = current_user_id;

    -- Merge new metadata with existing metadata
    new_metadata := COALESCE(current_metadata, '{}'::JSONB) || p_metadata;

    -- Update user metadata
    UPDATE auth.users
    SET
        raw_user_meta_data = new_metadata,
        updated_at = NOW()
    WHERE id = current_user_id;

    RETURN new_metadata;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_user_metadata(JSONB) TO authenticated;

COMMENT ON FUNCTION update_user_metadata IS
'Updates the current authenticated user''s metadata. Merges provided metadata with existing metadata.';
