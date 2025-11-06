-- Create briefs table to store generated briefs
CREATE TABLE IF NOT EXISTS briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  idea_id UUID REFERENCES ideas(id) ON DELETE SET NULL,
  persona VARCHAR(500) NOT NULL,
  industry VARCHAR(500) NOT NULL,
  idea TEXT NOT NULL,
  brief TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_briefs_user_id ON briefs(user_id);
CREATE INDEX IF NOT EXISTS idx_briefs_idea_id ON briefs(idea_id);
CREATE INDEX IF NOT EXISTS idx_briefs_created_at ON briefs(created_at DESC);

-- Add comments
COMMENT ON TABLE briefs IS 'Store content briefs generated from ideas';
COMMENT ON COLUMN briefs.idea_id IS 'Reference to the idea this brief was created from (nullable)';
COMMENT ON COLUMN briefs.persona IS 'Target persona for the brief';
COMMENT ON COLUMN briefs.industry IS 'Industry/niche for the brief';
COMMENT ON COLUMN briefs.idea IS 'The original idea content';
COMMENT ON COLUMN briefs.brief IS 'The generated brief content';
