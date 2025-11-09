# Quick Start - Database Setup

## Common Errors

### Error 1: "relation 'checkins' does not exist"
**→ You need to create tables first!** See **Starting Fresh** below.

### Error 2: "policy already exists"
**→ You have old policies!** See **Already Have Policies** below.

---

## Starting Fresh (No Existing Tables)

### 1️⃣ Open Supabase SQL Editor
Go to: https://supabase.com/dashboard/project/YOUR-PROJECT/sql/new

### 2️⃣ Run the Schema
1. Open [schema.sql](./schema.sql) in your editor
2. Copy **ALL** contents (~400 lines)
3. Paste into Supabase SQL Editor
4. Click **RUN** ▶️

---

## Already Have Policies/Tables?

If you see `policy "Users can view own profile" already exists`:

### Step 1: Reset (Clean Slate)
1. Open [RESET_AND_SETUP.sql](./RESET_AND_SETUP.sql)
2. Copy ALL contents
3. Paste into Supabase SQL Editor
4. Click **RUN** ▶️ (This removes old policies/triggers)

### Step 2: Run Schema
1. Open [schema.sql](./schema.sql)
2. Copy **ALL** contents
3. Paste into Supabase SQL Editor
4. Click **RUN** ▶️

### 3️⃣ Add Sample Barriers (Optional)
```sql
INSERT INTO barrier_types (slug, label, icon, description) VALUES
  ('low-energy', 'Low Energy', '🔋', 'Feeling drained, tired, or physically depleted'),
  ('overwhelm', 'Overwhelmed', '🌊', 'Too many things competing for attention'),
  ('unclear', 'Unclear Next Step', '❓', 'Not sure what to do first or how to start'),
  ('focus', 'Hard to Focus', '🎯', 'Mind wandering, hard to concentrate'),
  ('waiting', 'Waiting on Someone', '⏳', 'Blocked by needing a reply or input'),
  ('boring', 'Task Feels Boring', '😴', 'Hard to engage with something dull'),
  ('anxiety', 'Anxiety or Stress', '😰', 'Worried, nervous, or stressed'),
  ('perfectionism', 'Perfectionism', '✨', 'Stuck trying to make it perfect'),
  ('time-pressure', 'Time Pressure', '⏰', 'Feeling rushed or behind schedule'),
  ('sensitivity', 'Sensory Sensitivity', '🔊', 'Overwhelmed by environment')
ON CONFLICT (slug) DO NOTHING;
```

## ✅ Done!

Now test your app:
1. Home → Select internal weather
2. Focus → Add what matters today
3. Barriers → Describe what's hard
4. Save → Check calendar for entry

## Need More Help?

- **Detailed setup**: [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)
- **Schema explanation**: [SCHEMA_CLEANUP_SUMMARY.md](./SCHEMA_CLEANUP_SUMMARY.md)
- **Migrations**: [migrations/README.md](./migrations/README.md)

## Already Have Tables?

If you previously set up the database with the old schema, see:
- [migrations/20241215_cleanup_unused_tables.sql](./migrations/20241215_cleanup_unused_tables.sql)
