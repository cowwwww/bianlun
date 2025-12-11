-- Add WeChat ID and phone number columns to users table
ALTER TABLE users
ADD COLUMN wechat_id VARCHAR(255) UNIQUE,
ADD COLUMN phone VARCHAR(20) UNIQUE;

-- Create index for faster lookups
CREATE INDEX idx_users_wechat_id ON users(wechat_id);
CREATE INDEX idx_users_phone ON users(phone); 