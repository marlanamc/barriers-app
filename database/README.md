# Database Setup for ADHD Barrier Tracker

## Overview

This app **shares a Supabase project** with ADHD First Aid Kit. It:
- **READS** from existing content tables (`content_pages`, `content_types`)
- **CREATES** new user-specific tables for tracking check-ins and patterns

## Prerequisites

1. You must have the ADHD First Aid Kit Supabase project already set up
2. The following tables must exist:
   - `content_types`
   - `content_pages` (with barriers and tasks content)

## Setup Instructions

### 1. Run the Schema Migration

Run `database/schema.sql` in your Supabase SQL editor:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Create a new query
4. Copy and paste the contents of `database/schema.sql`
5. Click "Run"

This will create:
- `user_profiles` - Extended user information
- `daily_check_ins` - Daily barrier/task selections
- `barrier_selections` - Granular barrier tracking
- `task_selections` - Granular task tracking with completion status
- `user_calendar_entries` - Pre-computed calendar view
- Helpful views for analytics
- Row Level Security policies
- Indexes for performance

### 2. Verify Tables Were Created

Run this query to verify:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'user_profiles',
  'daily_check_ins',
  'barrier_selections',
  'task_selections',
  'user_calendar_entries'
)
ORDER BY table_name;
```

You should see all 5 tables listed.

### 3. Test Read Access to Content Tables

Verify the app can read from ADHD First Aid content:

```sql
-- Get content types
SELECT * FROM content_types
WHERE name IN ('barrier', 'task');

-- Get some barriers
SELECT name, slug, emoji
FROM content_pages cp
JOIN content_types ct ON cp.content_type_id = ct.id
WHERE ct.name = 'barrier'
AND cp.is_published = true
LIMIT 5;

-- Get some tasks
SELECT name, slug, emoji
FROM content_pages cp
JOIN content_types ct ON cp.content_type_id = ct.id
WHERE ct.name = 'task'
AND cp.is_published = true
LIMIT 5;
```

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
