-- Add new columns to existing ideas table
ALTER TABLE ideas
ADD COLUMN IF NOT EXISTS persona VARCHAR(500),
ADD COLUMN IF NOT EXISTS industry VARCHAR(500),
ADD COLUMN IF NOT EXISTS idea TEXT,
ADD COLUMN IF NOT EXISTS is_used BOOLEAN DEFAULT FALSE;

-- Create index for is_used
CREATE INDEX IF NOT EXISTS idx_ideas_is_used ON ideas(is_used);

-- Add comments
COMMENT ON COLUMN ideas.persona IS 'Target persona for the idea';
COMMENT ON COLUMN ideas.industry IS 'Industry/niche for the idea';
COMMENT ON COLUMN ideas.idea IS 'The actual idea content (can be used instead of description)';
COMMENT ON COLUMN ideas.is_used IS 'Whether this idea has been used to create a brief';
