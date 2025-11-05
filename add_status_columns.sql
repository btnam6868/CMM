-- Add status and account_status columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'offline';
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) DEFAULT 'active';

-- Add check constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check;
ALTER TABLE users ADD CONSTRAINT users_status_check CHECK (status IN ('online', 'offline'));

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_account_status_check;
ALTER TABLE users ADD CONSTRAINT users_account_status_check CHECK (account_status IN ('active', 'inactive'));

-- Update existing users to have default values
UPDATE users SET status = 'offline' WHERE status IS NULL;
UPDATE users SET account_status = 'active' WHERE account_status IS NULL;
