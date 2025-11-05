-- Add IP and MAC address columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45);
ALTER TABLE users ADD COLUMN IF NOT EXISTS mac_address VARCHAR(17);

-- Note: login_history already has ip_address, just add mac_address
ALTER TABLE login_history ADD COLUMN IF NOT EXISTS mac_address VARCHAR(17);
