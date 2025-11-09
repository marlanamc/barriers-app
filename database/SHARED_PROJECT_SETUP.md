# Setup for Shared Supabase Project

## You Have ADHD First Aid Kit Already Running

Since you're sharing a Supabase project with ADHD First Aid Kit, you already have:
- ✅ `daily_check_ins` (old schema)
- ✅ `barrier_selections` (old schema)
- ✅ `task_selections` (old schema)
- ✅ `user_calendar_entries` (existing, will be updated)
- ✅ `barriers_content` (ADHD First Aid content)
- ✅ Many other ADHD First Aid tables

## What You Need to Add

The **Internal Weather Flow** requires these new tables:
- ❌ `barrier_types` - Reference library for barriers
- ❌ `tips` - Gentle support messages
- ❌ `checkins` - Internal weather snapshots
- ❌ `focus_items` - What matters today (up to 3)
- ❌ `focus_barriers` - Barriers linked to focus items

## Simple Setup

### Run This Migration:

**[migrations/20241215_add_internal_weather_to_existing.sql](./migrations/20241215_add_internal_weather_to_existing.sql)**

This migration:
1. ✅ Creates NEW tables (checkins, focus_items, focus_barriers, barrier_types, tips)
2. ✅ Keeps EXISTING tables (daily_check_ins, barrier_selections, task_selections)
3. ✅ Updates user_calendar_entries with new columns (internal_weather, weather_icon, focus_count)
4. ✅ Adds RLS policies, indexes, and triggers
5. ✅ Creates the `create_checkin_with_focus()` function your app uses

### Steps:

1. Open Supabase SQL Editor
2. Copy contents of [migrations/20241215_add_internal_weather_to_existing.sql](./migrations/20241215_add_internal_weather_to_existing.sql)
3. Paste and **RUN**
4. Done! ✨

## What Happens to Your Existing Data?

**Nothing breaks!** The migration:
- Keeps all existing ADHD First Aid tables intact
- Keeps your old `daily_check_ins` data
- Just adds NEW tables for the Internal Weather flow
- Updates `user_calendar_entries` to support both systems

## Your App Flow After Migration

The Barrier Tracker app will use:
- `checkins` table (NEW) - for internal weather check-ins
- `focus_items` table (NEW) - for focus tracking
- `focus_barriers` table (NEW) - for barrier tracking
- `barrier_types` table (NEW) - for barrier options
- `user_calendar_entries` (UPDATED) - shows both old + new data

ADHD First Aid Kit continues using:
- `daily_check_ins` - old barrier/task system
- `barriers_content` - content library
- All other existing tables

## Barrier Content - Already Set Up! ✅

**No need to seed barriers!** The app automatically uses your existing `barriers_content` from ADHD First Aid Kit.

The migration created `barrier_types` and `tips` tables, but your app has smart fallback logic:
- **First tries**: `barrier_types` table (currently empty)
- **Falls back to**: `barriers_content` from ADHD First Aid Kit

This means:
- ✅ Barriers are shared across both apps
- ✅ Updates to ADHD First Aid barriers automatically appear in Barrier Tracker
- ✅ No content duplication or sync issues

You're all set - the barriers from ADHD First Aid Kit will appear in your Barrier Tracker app!

## Verify Setup

Check that new tables exist:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'barrier_types',
  'tips',
  'checkins',
  'focus_items',
  'focus_barriers'
)
ORDER BY table_name;
```

You should see all 5 new tables.

## Test the App

1. Open Barrier Tracker app
2. Home → Select internal weather (☀️ 🌧 🌪 etc.)
3. Focus → Add what matters today
4. Barriers → Describe what's hard
5. Save → Check calendar for entry with weather icon!

## Troubleshooting

### "policy already exists"
The migration uses `DROP POLICY IF EXISTS` before creating, so this shouldn't happen. If it does, the policies are already correct - you can ignore the error.

### "function already exists"
Same as above - the migration replaces functions, so this is fine.

### "column already exists"
Your `user_calendar_entries` already has the new columns - skip the ALTER TABLE statements.

## Future: Clean Up Old Tables?

Once you're confident the new Internal Weather flow works, you can optionally remove the old `daily_check_ins` system. But for now, we keep both to avoid breaking anything.

See [migrations/20241215_cleanup_unused_tables.sql](./migrations/20241215_cleanup_unused_tables.sql) when you're ready to clean up.
