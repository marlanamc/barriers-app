# Task Completion Persistence Fix - Migration Instructions

## Problem
- Task checkboxes (focus and maintenance) don't persist after page refresh
- Tasks appear unchecked even though you checked them off

## Root Cause
The `completed` field was missing from the database schema and the RPC function didn't save/load completion status.

## Solution
Two migrations need to be applied to your Supabase database:

### Step 1: Add `completed` column to `focus_items` table

Copy and run this SQL in your Supabase SQL Editor:

```sql
-- Migration: Add completed field to focus_items table
-- This allows tracking which tasks have been completed during the day

-- Add completed column to focus_items table
ALTER TABLE focus_items
ADD COLUMN IF NOT EXISTS completed BOOLEAN NOT NULL DEFAULT FALSE;

-- Add an index for faster queries filtering by completed status
CREATE INDEX IF NOT EXISTS idx_focus_items_completed
ON focus_items(checkin_id, completed);

-- Add comment explaining the field
COMMENT ON COLUMN focus_items.completed IS
'Tracks whether the focus item has been completed. Updated in real-time as users check off tasks.';
```

### Step 2: Update `create_checkin_with_focus` RPC function

Copy and run the entire contents of:
**`database/migrations/20241225_update_rpc_for_completed.sql`**

This updates the database function to:
- Read the `completed` field from the JSON payload
- Save it when inserting new focus items
- Update it when modifying existing focus items
- Add debug logging to track completion status

## How to Apply Migrations

### Option 1: Via Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the SQL from Step 1 above, paste it, and click "Run"
5. Create another new query
6. Copy the entire contents of `database/migrations/20241225_update_rpc_for_completed.sql`, paste it, and click "Run"

### Option 2: Via Supabase CLI (if linked)
```bash
# Apply the completed column migration
cat database/migrations/20241225_add_completed_to_focus_items.sql | npx supabase db execute

# Apply the RPC function update
cat database/migrations/20241225_update_rpc_for_completed.sql | npx supabase db execute
```

## Testing After Migration

1. **Refresh the page** to clear any cached data
2. Create a new focus task
3. Check it off as completed
4. Refresh the page
5. ✅ The task should remain checked

Do the same for maintenance tasks:
1. Create a maintenance task
2. Check it off
3. Refresh the page
4. ✅ The task should remain checked

## What Changed in the Code

### Database Changes
- **`focus_items` table**: Added `completed BOOLEAN NOT NULL DEFAULT FALSE` column
- **`create_checkin_with_focus` function**: Updated to handle `completed` field in payload

### Application Code Changes
- **`lib/supabase.ts`**: Added `completed?: boolean` to `FocusItemPayload` type
- **`app/command-center/page.tsx`**:
  - Loads `completed` status from database (line 142)
  - Saves `completed` status when toggling tasks (line 206)
- **`lib/useSupabaseUser.ts`**: Fixed to refresh user data when metadata changes (for the bedtime timeline fix)

## Rollback Plan

If you need to rollback these changes:

```sql
-- Remove the completed column
ALTER TABLE focus_items DROP COLUMN IF EXISTS completed;

-- Restore previous version of the function
-- Run the CREATE OR REPLACE FUNCTION from database/migrations/20241224_fix_focus_items_upsert_v2.sql
```

## Additional Fix: Bedtime Timeline Reactivity

The second issue (evening timeline not updating when bedtime changes) was also fixed in `lib/useSupabaseUser.ts`. This doesn't require a database migration - it's purely a frontend fix. After you refresh the page, when you change your bedtime in settings, the timeline should update immediately.

## Support

If tasks are still not persisting after applying these migrations:
1. Check browser console for any errors
2. Check Supabase logs for NOTICE messages (should show "with completed=true/false")
3. Verify the migrations were applied successfully in the Supabase SQL Editor
