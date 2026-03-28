USE hotel_mgmt;

-- Add missing columns if they don't exist
ALTER TABLE guests ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE AFTER email;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS password VARCHAR(255) AFTER username;

-- Update existing guests with default credentials based on their email
-- Using the prefix of the email as the username and 'password123' as default password
UPDATE guests 
SET username = SUBSTRING_INDEX(email, '@', 1),
    password = 'password123'
WHERE username IS NULL OR password IS NULL;
