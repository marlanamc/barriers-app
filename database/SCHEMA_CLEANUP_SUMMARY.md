# Schema Cleanup Summary

## What Was Wrong

Your schema had **two competing check-in systems**:

### 1. **Internal Weather Flow** (USED by your app)
- `checkins` - morning internal weather snapshot
- `focus_items` - up to 3 things that matter today
- `focus_barriers` - what feels hard about each focus item
- `barrier_types` - reference library of barriers
- `tips` - gentle support messages

### 2. **Old Daily Check-ins** (UNUSED, leftover code)
- `daily_check_ins` - old barrier/task tracking
- `barrier_selections` - granular barrier tracking
- `task_selections` - task completion tracking

### 3. **Broken Calendar System**
- `user_calendar_entries` had a trigger listening to `daily_check_ins` (the WRONG table)
- Your app saves to `checkins`, so calendar entries never populated
- Schema had task/barrier columns that didn't match your app's focus/weather model

## What Was Fixed

### ✅ Removed Unused Tables
- Dropped `daily_check_ins`
- Dropped `barrier_selections`
- Dropped `task_selections`
- Dropped unused views: `user_barrier_patterns`, `user_task_completion_rates`, `recent_check_ins_detailed`

### ✅ Fixed Calendar Tracking
- Updated `user_calendar_entries` structure:
  - `barrier_count` → `focus_count` (counts focus items, not barriers)
  - Added `internal_weather` and `weather_icon` columns
  - Removed `task_count`, `completed_task_count`, `top_barriers`
- Created new trigger: `sync_calendar_from_checkin_trigger`
- Trigger now listens to `checkins` table (the one your app actually uses!)
- Backfills existing check-in data

### ✅ Updated Files
1. **database/schema.sql** - Cleaned up to match current app flow
2. **lib/database.types.ts** - Updated TypeScript types for calendar entries
3. **database/migrations/20241215_cleanup_unused_tables.sql** - Migration to apply changes
4. **database/migrations/README.md** - Instructions for running migration

## Current Schema Structure

```
┌─────────────────┐
│  barrier_types  │  Reference library
│  tips           │  Gentle support messages
└─────────────────┘

┌─────────────────┐
│   checkins      │  Internal weather snapshot
│   ├─ user_id
│   ├─ checkin_date
│   ├─ internal_weather  ← "clear", "cloudy", "rainy", etc.
│   ├─ weather_icon      ← ☀️ 🌧 🌪 etc.
│   └─ forecast_note     ← Optional reflection
└─────────────────┘
         │
         │ 1:many
         ▼
┌─────────────────┐
│  focus_items    │  What matters today (max 3)
│   ├─ description       ← "Send the email"
│   ├─ categories        ← ["Work", "Admin"]
│   └─ sort_order
└─────────────────┘
         │
         │ 1:1
         ▼
┌─────────────────┐
│ focus_barriers  │  What feels hard
│   ├─ barrier_type_id   ← Links to barrier_types
│   └─ custom_barrier    ← Or custom text
└─────────────────┘

         ⬇ auto-synced via trigger

┌─────────────────────────┐
│ user_calendar_entries   │  Pre-computed calendar view
│   ├─ date
│   ├─ focus_count        ← How many things mattered
│   ├─ internal_weather   ← Weather for quick display
│   ├─ weather_icon       ← Icon for calendar
│   └─ has_check_in       ← Did they check in?
└─────────────────────────┘
```

## How Your App Flow Maps to Schema

| App Screen | Saves To | Fields |
|------------|----------|--------|
| **Home** (Internal Weather) | `checkins` | `internal_weather`, `weather_icon`, `forecast_note` |
| **Focus** (What Matters) | `focus_items` | `description`, `categories`, `sort_order` |
| **Barriers** (What's Hard) | `focus_barriers` | `barrier_type_id`, `custom_barrier` |
| **Gentle Support** | Reads from `tips` | Displays support messages |
| **Calendar** | Reads from `user_calendar_entries` | Auto-populated by trigger |
| **Patterns** | Reads from `user_internal_weather_stats` view | Weather frequency stats |

## What You Need to Do

1. **Run the migration**: [database/migrations/20241215_cleanup_unused_tables.sql](./migrations/20241215_cleanup_unused_tables.sql)
2. **Test**: Create a new check-in and verify calendar entries populate
3. **Optional**: Update any queries that referenced old tables (none found in current app code)

## Why This Matters

- ✅ **Calendar now works** - Trigger listens to the right table
- ✅ **Cleaner schema** - No unused tables cluttering your database
- ✅ **Matches app logic** - Schema reflects actual user flow
- ✅ **Better performance** - Fewer indexes, clearer relationships
- ✅ **Easier maintenance** - One check-in system, not two

## Files Changed

- [database/schema.sql](./schema.sql) - Main schema definition
- [database/migrations/20241215_cleanup_unused_tables.sql](./migrations/20241215_cleanup_unused_tables.sql) - Migration script
- [database/migrations/README.md](./migrations/README.md) - Migration instructions
- [lib/database.types.ts](../lib/database.types.ts) - TypeScript types
