# Database Setup for ADHD Barrier Tracker

## 🚀 Quick Start

**Getting "relation does not exist" errors?**

→ See [QUICK_START.md](./QUICK_START.md) for 3-step setup

## 📚 Full Documentation

- **[QUICK_START.md](./QUICK_START.md)** - 3-step setup guide
- **[SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)** - Detailed setup with seed data
- **[SCHEMA_CLEANUP_SUMMARY.md](./SCHEMA_CLEANUP_SUMMARY.md)** - What was fixed and why
- **[migrations/README.md](./migrations/README.md)** - Migration instructions (if needed)

## Overview

This is a standalone ADHD companion app focused on **Internal Weather** tracking. It:
- Tracks daily internal weather (clear, cloudy, rainy, stormy, quiet)
- Captures up to 3 focus items per day
- Links barriers to each focus item
- Shows patterns over time in calendar view

**Note**: This app previously shared content with ADHD First Aid Kit, but now uses a self-contained schema.

## Setup Instructions

### 1. Run the Schema

Run [schema.sql](./schema.sql) in your Supabase SQL editor:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Create a new query
4. Copy and paste the contents of `database/schema.sql`
5. Click "Run"

This will create:
- `barrier_types` - Reference library of common barriers
- `tips` - Gentle support messages mapped to barrier types
- `checkins` - Internal weather snapshot per user per day
- `focus_items` - Up to five focus statements per check-in
- `focus_barriers` - Links each focus item to a barrier type or custom description
- `user_calendar_entries` - Pre-computed calendar view (auto-synced)
- `user_profiles` - Extended user information
- Row Level Security policies
- Indexes for performance
- Helpful views and triggers

### 2. Verify Tables Were Created

Run this query to verify:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

You should see:
- `barrier_types`
- `checkins`
- `focus_barriers`
- `focus_items`
- `tips`
- `user_calendar_entries`
- `user_profiles`

### 3. Add Sample Barrier Types (Optional)

See [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) for seed data to populate barrier types and tips.

### 4. Enable Authentication

Make sure Supabase Auth is enabled:

1. Go to Authentication settings
2. Enable Email provider
3. Configure redirect URLs for your app:
   - Development: `http://localhost:3000/**`
   - Production: `https://your-domain.com/**`

## Database Architecture

### Shared Tables (Read-Only)
```
content_types       → Defines content types (barrier, task, etc.)
content_pages       → All content from ADHD First Aid
```

### Barrier Tracker Tables (Read-Write)
```
user_profiles           → User preferences and settings
daily_check_ins         → One record per day per user
barrier_selections      → Granular barrier tracking
task_selections         → Granular task tracking with completion
user_calendar_entries   → Pre-computed calendar aggregations
barrier_types           → Reference list of common barrier themes
tips                    → Gentle support messages tied to barrier types
checkins                → Internal weather snapshots (lavender → aqua flow)
focus_items             → Up to five focus statements per check-in
focus_barriers          → Barrier metadata + custom notes per focus item
```

### Relationships
```
auth.users (Supabase Auth)
    ↓
user_profiles
    ↓
daily_check_ins
    ↓
barrier_selections + task_selections
    ↓
user_calendar_entries (auto-synced via triggers)
```

## Row Level Security (RLS)

All user tables have RLS enabled. Users can only access their own data.

- ✅ Users can CRUD their own profiles
- ✅ Users can CRUD their own check-ins
- ✅ Users can CRUD their own selections
- ✅ Users can READ their own calendar entries
- ❌ Users cannot access other users' data

## Helpful Queries

### Get today's check-in for current user
```sql
SELECT * FROM daily_check_ins
WHERE user_id = auth.uid()
AND check_in_date = CURRENT_DATE;
```

### Get user's barrier patterns
```sql
SELECT * FROM user_barrier_patterns
WHERE user_id = auth.uid()
ORDER BY selection_count DESC;
```

### Get recent check-ins with full details
```sql
SELECT * FROM recent_check_ins_detailed
WHERE user_id = auth.uid()
LIMIT 7;
```

### Get calendar for current month
```sql
SELECT * FROM user_calendar_entries
WHERE user_id = auth.uid()
AND date >= DATE_TRUNC('month', CURRENT_DATE)
AND date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
ORDER BY date;
```

## Maintenance

### Rebuild calendar entries (if needed)
```sql
-- This is usually automatic via triggers, but if you need to rebuild:
TRUNCATE user_calendar_entries;

-- Then trigger the sync by updating check-ins:
UPDATE daily_check_ins SET updated_at = NOW();
```

### View user statistics
```sql
SELECT
  u.email,
  up.display_name,
  COUNT(DISTINCT dci.id) as total_check_ins,
  COUNT(DISTINCT bs.barrier_slug) as unique_barriers,
  COUNT(DISTINCT ts.task_slug) as unique_tasks
FROM auth.users u
JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN daily_check_ins dci ON u.id = dci.user_id
LEFT JOIN barrier_selections bs ON u.id = bs.user_id
LEFT JOIN task_selections ts ON u.id = ts.user_id
GROUP BY u.id, u.email, up.display_name;
```
