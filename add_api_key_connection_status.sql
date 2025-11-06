-- Add connection status columns to api_keys table
ALTER TABLE api_keys
ADD COLUMN IF NOT EXISTS connection_status VARCHAR(20) DEFAULT 'untested',
ADD COLUMN IF NOT EXISTS last_tested_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS test_message TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN api_keys.connection_status IS 'Status of last connection test: untested, success, failed';
COMMENT ON COLUMN api_keys.last_tested_at IS 'Timestamp of last connection test';
COMMENT ON COLUMN api_keys.test_message IS 'Message from last connection test';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_api_keys_connection_status ON api_keys(connection_status);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_status_usage ON api_keys(user_id, connection_status, usage_count);
