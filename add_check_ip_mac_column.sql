-- Add check_ip_mac column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS check_ip_mac BOOLEAN DEFAULT false;

-- Update existing users to have default value
UPDATE users SET check_ip_mac = false WHERE check_ip_mac IS NULL;
