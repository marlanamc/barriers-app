# Database Setup Instructions

## Current Situation

Your Supabase database appears to be empty or only partially set up. You need to create the tables first.

## Setup Steps

### Option 1: Fresh Setup (Recommended if database is empty)

Run the entire schema file in one go:

1. Open Supabase Dashboard → SQL Editor
2. Create a new query
3. Copy **ALL** contents from [schema.sql](./schema.sql)
4. Click **Run**
5. Verify success - you should see all tables created

This creates:
- ✅ `barrier_types` - Reference library of barriers
- ✅ `tips` - Gentle support messages
- ✅ `checkins` - Internal weather check-ins
- ✅ `focus_items` - What matters today
- ✅ `focus_barriers` - What feels hard
- ✅ `user_calendar_entries` - Calendar view
- ✅ `user_profiles` - Extended user info
- ✅ All indexes, triggers, RLS policies
- ✅ `create_checkin_with_focus()` function

### Option 2: If You Already Have Some Tables

If you already ran part of the schema, run migrations in order:

1. **First**: Run [schema.sql](./schema.sql) - This is idempotent (`IF NOT EXISTS`)
2. **Skip**: `20241215_create_checkin_with_focus.sql` - Already in schema.sql
3. **Skip**: `20241215_cleanup_unused_tables.sql` - Only needed if you had old tables

## Verify Setup

After running the schema, verify tables exist:

```sql
-- Run this query to check:
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

You should see:
- barrier_types
- checkins
- focus_barriers
- focus_items
- tips
- user_calendar_entries
- user_profiles

## Seed Data (Optional)

Add some barrier types for users to choose from:

```sql
INSERT INTO barrier_types (slug, label, icon, description) VALUES
  ('low-energy', 'Low Energy', '🔋', 'Feeling drained, tired, or physically depleted'),
  ('overwhelm', 'Overwhelmed', '🌊', 'Too many things competing for attention'),
  ('unclear', 'Unclear Next Step', '❓', 'Not sure what to do first or how to start'),
  ('focus', 'Hard to Focus', '🎯', 'Mind wandering, hard to concentrate'),
  ('waiting', 'Waiting on Someone', '⏳', 'Blocked by needing a reply or input from others'),
  ('boring', 'Task Feels Boring', '😴', 'Hard to engage with something that feels dull'),
  ('anxiety', 'Anxiety or Stress', '😰', 'Worried, nervous, or stressed about outcome'),
  ('perfectionism', 'Perfectionism', '✨', 'Stuck trying to make it perfect'),
  ('time-pressure', 'Time Pressure', '⏰', 'Feeling rushed or behind schedule'),
  ('sensitivity', 'Sensory Sensitivity', '🔊', 'Overwhelmed by noise, light, or environment')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO tips (barrier_type_id, message, tone)
SELECT
  bt.id,
  CASE bt.slug
    WHEN 'low-energy' THEN 'Your energy is precious. Can you do the tiniest version of this, or save it for when you feel a bit lighter?'
    WHEN 'overwhelm' THEN 'One small thing at a time. You don''t have to fix everything right now. Just the next gentle step.'
    WHEN 'unclear' THEN 'Start anywhere. Even writing a messy list or asking one question counts as progress.'
    WHEN 'focus' THEN 'Your brain is doing its best. Try a short burst (5 minutes) or a different environment. Rest is also productive.'
    WHEN 'waiting' THEN 'This pause isn''t your fault. Can you shift to something else while you wait, or give yourself permission to rest?'
    WHEN 'boring' THEN 'Boring tasks are hard for ADHD brains. Can you pair it with something pleasant—music, a timer game, or a reward after?'
    WHEN 'anxiety' THEN 'Your feelings are valid. Take a breath. You can do this imperfectly, and that''s enough.'
    WHEN 'perfectionism' THEN 'Done is better than perfect. What''s the "good enough" version that lets you move forward?'
    WHEN 'time-pressure' THEN 'You''re not behind. You''re exactly where you are. Focus on the next small step, not the whole mountain.'
    WHEN 'sensitivity' THEN 'Your environment matters. Can you adjust lighting, sounds, or take a sensory break? Your comfort helps you function.'
  END,
  'gentle'
FROM barrier_types bt
ON CONFLICT DO NOTHING;
```

## Test Your Setup

1. Open your app
2. Go through the morning flow:
   - Select internal weather
   - Add a focus item
   - Add a barrier
   - Save check-in
3. Check the calendar - entry should appear with weather icon

## If Something Goes Wrong

### "relation does not exist" error
→ Run [schema.sql](./schema.sql) first to create tables

### "column does not exist" error
→ You might have old tables - check with:
```sql
\d user_calendar_entries
```
If you see `barrier_count` instead of `focus_count`, run the cleanup migration.

### RLS policy errors
→ Make sure you're authenticated in Supabase
→ Check that `auth.uid()` returns your user ID:
```sql
SELECT auth.uid();
```

## Need to Start Over?

**⚠️ WARNING: This deletes all data!**

```sql
DROP TABLE IF EXISTS focus_barriers CASCADE;
DROP TABLE IF EXISTS focus_items CASCADE;
DROP TABLE IF EXISTS checkins CASCADE;
DROP TABLE IF EXISTS barrier_types CASCADE;
DROP TABLE IF EXISTS tips CASCADE;
DROP TABLE IF EXISTS user_calendar_entries CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP VIEW IF EXISTS user_internal_weather_stats CASCADE;
DROP FUNCTION IF EXISTS create_checkin_with_focus CASCADE;
DROP FUNCTION IF EXISTS sync_calendar_from_checkin CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
```

Then run [schema.sql](./schema.sql) again.
