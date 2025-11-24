# Missing Migrations to Apply

Based on the migration check, here are the migrations that need to be applied to your Supabase database:

## Migration Order (Apply in this order)

### 1. `20241213_add_task_type_system.sql`
- **What it does**: Adds two-tier task system (Focus vs Life) with complexity tracking
- **Creates**: 
  - `task_types` table
  - `task_type` and `complexity` columns on `focus_items` and `planned_items`
  - Updates `create_checkin_with_focus` function

### 2. `20241214_add_time_preferences.sql`
- **What it does**: Adds wake time and bedtime preferences to user profiles
- **Creates**: 
  - `preferred_wake_time` column on `user_profiles`
  - `preferred_bedtime` column on `user_profiles`

### 3. `20241215_cleanup_unused_tables.sql`
- **What it does**: Removes legacy tables and updates calendar structure
- **Removes**: 
  - `daily_check_ins` table
  - `barrier_selections` table
  - `task_selections` table
- **Updates**: `user_calendar_entries` table structure

### 4. `20241223_add_anchor_presets.sql`
- **What it does**: Adds preset anchor questions for task anchoring
- **Creates**: `anchor_presets` table

### 5. `20241224_fix_focus_items_upsert.sql`
- **What it does**: Fixes focus items upsert to prevent data loss
- **Updates**: `create_checkin_with_focus` function

### 6. `20241225_add_inbox_flag.sql`
- **What it does**: Adds inbox flag for uncategorized tasks
- **Creates**: 
  - `in_inbox` column on `focus_items`
  - `in_inbox` column on `planned_items`

### 7. `20241225_add_update_user_metadata_function.sql`
- **What it does**: Adds function to update user metadata
- **Creates**: `update_user_metadata` function

### 8. `20241226_add_schedule_day_types.sql`
- **What it does**: Adds day types to energy schedules
- **Creates**: `day_types` column on `energy_schedules`

### 9. `20251123_add_logbook_thoughts.sql`
- **What it does**: Adds logbook thoughts table for ADHD-friendly thought capture
- **Creates**: `logbook_thoughts` table

### 10. `20251123_add_map_modules.sql`
- **What it does**: Adds map modules table for Captain's Map
- **Creates**: 
  - `map_modules` table
  - `upsert_map_module` function
  - `get_user_map_data` function

## How to Apply

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of each migration file (in order)
5. Paste into the SQL editor
6. Click **Run**
7. Verify no errors appear
8. Repeat for each migration

## After Applying

Run the check script again to verify:
```bash
npm run check-migrations
```

All migrations should show as ✅ Applied.

