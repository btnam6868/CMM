-- Drop old login_history table
DROP TABLE IF EXISTS login_history;

-- Create new login_history table - only stores latest login per user
CREATE TABLE login_history (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  login_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ip_address VARCHAR(45),
  mac_address VARCHAR(17),
  user_agent TEXT,
  api_calls_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_login_history_login_time ON login_history(login_time DESC);
