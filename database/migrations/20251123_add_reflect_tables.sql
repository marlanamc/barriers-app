-- Migration: Add reflect tables for end-of-day check-in
-- Shame-free, sensory-based reflection system

-- Daily reflect entries (main table)
CREATE TABLE IF NOT EXISTS daily_reflects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reflect_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Nervous system signals (array of selected signals)
  nervous_system_signals TEXT[] DEFAULT '{}',

  -- Bandwidth check
  bandwidth TEXT CHECK (bandwidth IN ('a_little', 'not_much', 'running_on_empty')),

  -- Priority review
  priority_outcome TEXT CHECK (priority_outcome IN ('made_progress', 'didnt_get_to_it', 'got_stuck', 'chose_rest')),

  -- Ease tomorrow prep
  tomorrow_prep TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, reflect_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_daily_reflects_user_id ON daily_reflects(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_reflects_date ON daily_reflects(reflect_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_reflects_user_date ON daily_reflects(user_id, reflect_date);

-- Enable RLS
ALTER TABLE daily_reflects ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own reflects"
  ON daily_reflects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reflects"
  ON daily_reflects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reflects"
  ON daily_reflects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reflects"
  ON daily_reflects FOR DELETE
  USING (auth.uid() = user_id);

-- Upsert function for daily reflects
CREATE OR REPLACE FUNCTION upsert_daily_reflect(
  p_user_id UUID,
  p_reflect_date DATE,
  p_nervous_system_signals TEXT[] DEFAULT NULL,
  p_bandwidth TEXT DEFAULT NULL,
  p_priority_outcome TEXT DEFAULT NULL,
  p_tomorrow_prep TEXT DEFAULT NULL
)
RETURNS daily_reflects
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result daily_reflects;
BEGIN
  INSERT INTO daily_reflects (
    user_id,
    reflect_date,
    nervous_system_signals,
    bandwidth,
    priority_outcome,
    tomorrow_prep,
    updated_at
  )
  VALUES (
    p_user_id,
    p_reflect_date,
    COALESCE(p_nervous_system_signals, '{}'),
    p_bandwidth,
    p_priority_outcome,
    p_tomorrow_prep,
    NOW()
  )
  ON CONFLICT (user_id, reflect_date)
  DO UPDATE SET
    nervous_system_signals = COALESCE(EXCLUDED.nervous_system_signals, daily_reflects.nervous_system_signals),
    bandwidth = COALESCE(EXCLUDED.bandwidth, daily_reflects.bandwidth),
    priority_outcome = COALESCE(EXCLUDED.priority_outcome, daily_reflects.priority_outcome),
    tomorrow_prep = COALESCE(EXCLUDED.tomorrow_prep, daily_reflects.tomorrow_prep),
    updated_at = NOW()
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$;

-- Comments
COMMENT ON TABLE daily_reflects IS 'End-of-day reflection entries - sensory-based, shame-free';
COMMENT ON COLUMN daily_reflects.nervous_system_signals IS 'Array of sensory signals like jaw_tight, shoulders_raised, etc';
COMMENT ON COLUMN daily_reflects.bandwidth IS 'Remaining capacity: a_little, not_much, running_on_empty';
COMMENT ON COLUMN daily_reflects.priority_outcome IS 'What happened with daily priority';
COMMENT ON COLUMN daily_reflects.tomorrow_prep IS 'One small thing to ease tomorrow';
