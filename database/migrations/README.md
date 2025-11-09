# Database Migrations

## ⚠️ Important: Setup vs Migrations

### If Starting Fresh (Recommended)
**Run [../schema.sql](../schema.sql) instead of migrations!**

The main `schema.sql` file contains the complete, cleaned-up schema. Migrations are only needed if you're updating an existing database.

See [../SETUP_INSTRUCTIONS.md](../SETUP_INSTRUCTIONS.md) for full setup guide.

## Migration Order (Only if you have existing tables)

If you already ran an old version of the schema with `daily_check_ins` tables:

1. ~~**20241215_create_checkin_with_focus.sql**~~ - Skip (already in schema.sql)
2. **20241215_cleanup_unused_tables.sql** - Removes legacy tables and fixes calendar tracking

## How to Apply Migrations

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of the migration file
5. Paste into the SQL editor
6. Click **Run**
7. Verify no errors appear

### Option 2: Using Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push

# Or apply a specific migration
psql "your-connection-string" < database/migrations/20241215_cleanup_unused_tables.sql
```

## What the Cleanup Migration Does

### Removes:
- `daily_check_ins` table (old barrier/task tracking)
- `barrier_selections` table (unused)
- `task_selections` table (unused)
- Old views: `user_barrier_patterns`, `user_task_completion_rates`, `recent_check_ins_detailed`
- Old trigger: `sync_calendar_on_check_in`

### Updates:
- **user_calendar_entries** table structure:
  - Removes: `task_count`, `completed_task_count`, `top_barriers`
  - Renames: `barrier_count` → `focus_count`
  - Adds: `internal_weather`, `weather_icon`
- Creates new trigger: `sync_calendar_from_checkin_trigger`
- Backfills existing check-in data into calendar entries

## Schema Now Matches App Flow

Your app flow:
1. **Internal Weather** → `checkins.internal_weather`, `checkins.weather_icon`
2. **Focus Items** → `focus_items.description`, `focus_items.categories`
3. **Barriers** → `focus_barriers` (links to `barrier_types`)
4. **Calendar** → `user_calendar_entries` (auto-populated by trigger)

## After Migration

1. Check that calendar entries populate when you create a new check-in
2. Verify the calendar page shows internal weather icons
3. Confirm focus counts appear correctly

## Rollback (if needed)

If something goes wrong, you can restore from a backup:

```sql
-- This migration is destructive (drops tables)
-- Make sure you have a backup before running!
```

To create a backup before migration:
1. Supabase Dashboard → Database → Backups
2. Click "Create backup"
3. Wait for completion
4. Then run migration
