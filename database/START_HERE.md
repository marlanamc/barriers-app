# START HERE - Database Setup

## You're Getting: "relation 'checkins' does not exist"

**This means you have NO tables yet. Perfect!**

## Simple 2-Step Setup

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run schema.sql
1. Open [schema.sql](./schema.sql) in your code editor
2. Copy **ALL 400+ lines**
3. Paste into Supabase SQL Editor
4. Click **RUN** (green play button)
5. Wait ~5 seconds for completion

### Step 3: Verify Success
Run this to check tables were created:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

You should see:
- ✅ barrier_types
- ✅ checkins
- ✅ focus_barriers
- ✅ focus_items
- ✅ tips
- ✅ user_calendar_entries
- ✅ user_profiles

## Done! 🎉

Now test your app - the "checkins" error should be gone!

---

## Optional: Add Sample Barriers

```sql
INSERT INTO barrier_types (slug, label, icon, description) VALUES
  ('low-energy', 'Low Energy', '🔋', 'Feeling drained or tired'),
  ('overwhelm', 'Overwhelmed', '🌊', 'Too many things at once'),
  ('unclear', 'Unclear Next Step', '❓', 'Not sure where to start'),
  ('focus', 'Hard to Focus', '🎯', 'Mind wandering'),
  ('waiting', 'Waiting on Someone', '⏳', 'Blocked by others'),
  ('boring', 'Task Feels Boring', '😴', 'Hard to engage'),
  ('anxiety', 'Anxiety or Stress', '😰', 'Worried or nervous'),
  ('perfectionism', 'Perfectionism', '✨', 'Stuck on perfect'),
  ('time-pressure', 'Time Pressure', '⏰', 'Feeling rushed'),
  ('sensitivity', 'Sensory Sensitivity', '🔊', 'Overwhelmed by environment')
ON CONFLICT (slug) DO NOTHING;
```

---

## Still Getting Errors?

### "policy already exists"
You have partial tables. Delete them first:

```sql
DROP TABLE IF EXISTS focus_barriers CASCADE;
DROP TABLE IF EXISTS focus_items CASCADE;
DROP TABLE IF EXISTS checkins CASCADE;
DROP TABLE IF EXISTS barrier_types CASCADE;
DROP TABLE IF EXISTS tips CASCADE;
DROP TABLE IF EXISTS user_calendar_entries CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
```

Then run schema.sql again.

### Other issues?
- See [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) for detailed guide
- See [QUICK_START.md](./QUICK_START.md) for troubleshooting
