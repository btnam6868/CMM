-- Add new columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS full_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS department VARCHAR(255),
ADD COLUMN IF NOT EXISTS position VARCHAR(255);

-- Update role column to support new roles
-- Note: We keep the existing constraint but will validate in application code
COMMENT ON COLUMN users.role IS 'User role: admin, user, clerk (văn thư), controller (kiểm soát)';
