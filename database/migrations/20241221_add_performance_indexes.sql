-- Migration: Add performance indexes for common query patterns
-- This improves query performance for planned_items and checkins tables

-- Composite index for planned_items queries by user and date range
-- Used by getPlannedItemsForDate which filters by user_id, start_date <= date, and (end_date IS NULL OR end_date >= date)
CREATE INDEX IF NOT EXISTS idx_planned_items_user_start_date 
ON planned_items(user_id, start_date DESC);

CREATE INDEX IF NOT EXISTS idx_planned_items_user_end_date 
ON planned_items(user_id, end_date DESC NULLS LAST);

-- Composite index for checkins queries by user and date
-- The unique constraint already provides this, but an explicit index can help with range queries
CREATE INDEX IF NOT EXISTS idx_checkins_user_date 
ON checkins(user_id, checkin_date DESC);

-- Index for barrier_type_id lookups in planned_items (for joins)
CREATE INDEX IF NOT EXISTS idx_planned_items_barrier_type 
ON planned_items(barrier_type_id) 
WHERE barrier_type_id IS NOT NULL;








