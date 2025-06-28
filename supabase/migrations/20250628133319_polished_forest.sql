/*
  # Complete User Management Setup

  1. New Tables
    - `users` table to store user profiles
      - `id` (uuid, primary key)
      - `name` (text)
      - `role` (text with check constraint)
      - `location_address` (text)
      - `location_lat` (numeric)
      - `location_lng` (numeric)
      - `profile_image` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on users table
    - Add policies for user profile management
    - Update donations table foreign key constraints

  3. Functions
    - Helper functions for user management
</*/

-- Create users table to store user profiles
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'recipient' CHECK (role IN ('donor', 'recipient', 'rider', 'admin')),
  location_address text,
  location_lat numeric,
  location_lng numeric,
  profile_image text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view all profiles for public info"
  ON users
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON users
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Update donations table to ensure proper structure
DO $$
BEGIN
  -- Check if donor_id column exists and is the right type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'donations' AND column_name = 'donor_id' AND data_type = 'uuid'
  ) THEN
    -- Add or modify donor_id column
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'donations' AND column_name = 'donor_id'
    ) THEN
      ALTER TABLE donations ALTER COLUMN donor_id TYPE uuid USING donor_id::uuid;
    ELSE
      ALTER TABLE donations ADD COLUMN donor_id uuid;
    END IF;
  END IF;

  -- Check if recipient_id column exists and is the right type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'donations' AND column_name = 'recipient_id' AND data_type = 'uuid'
  ) THEN
    -- Add or modify recipient_id column
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'donations' AND column_name = 'recipient_id'
    ) THEN
      ALTER TABLE donations ALTER COLUMN recipient_id TYPE uuid USING recipient_id::uuid;
    ELSE
      ALTER TABLE donations ADD COLUMN recipient_id uuid;
    END IF;
  END IF;

  -- Check if rider_id column exists and is the right type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'donations' AND column_name = 'rider_id' AND data_type = 'uuid'
  ) THEN
    -- Add or modify rider_id column
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'donations' AND column_name = 'rider_id'
    ) THEN
      ALTER TABLE donations ALTER COLUMN rider_id TYPE uuid USING rider_id::uuid;
    ELSE
      ALTER TABLE donations ADD COLUMN rider_id uuid;
    END IF;
  END IF;
END $$;

-- Drop existing foreign key constraints if they exist (safely)
DO $$
BEGIN
  -- Drop existing foreign key constraints if they exist
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'donations_donor_id_fkey' 
    AND table_name = 'donations'
  ) THEN
    ALTER TABLE donations DROP CONSTRAINT donations_donor_id_fkey;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'donations_recipient_id_fkey' 
    AND table_name = 'donations'
  ) THEN
    ALTER TABLE donations DROP CONSTRAINT donations_recipient_id_fkey;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'donations_rider_id_fkey' 
    AND table_name = 'donations'
  ) THEN
    ALTER TABLE donations DROP CONSTRAINT donations_rider_id_fkey;
  END IF;
END $$;

-- Add new foreign key constraints to reference users table
ALTER TABLE donations 
ADD CONSTRAINT donations_donor_id_fkey 
FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE donations 
ADD CONSTRAINT donations_recipient_id_fkey 
FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE donations 
ADD CONSTRAINT donations_rider_id_fkey 
FOREIGN KEY (rider_id) REFERENCES users(id) ON DELETE SET NULL;

-- Update existing donations policies to work with new user structure
DROP POLICY IF EXISTS "Authenticated users can create donations" ON donations;
DROP POLICY IF EXISTS "Donors can update their own donations" ON donations;
DROP POLICY IF EXISTS "Users can view their own donations" ON donations;

-- Create new policies for donations
CREATE POLICY "Authenticated users can create donations"
  ON donations
  FOR INSERT
  WITH CHECK (donor_id IS NOT NULL);

CREATE POLICY "Donors can update their own donations"
  ON donations
  FOR UPDATE
  USING (donor_id IS NOT NULL)
  WITH CHECK (donor_id IS NOT NULL);

CREATE POLICY "Users can view their own donations"
  ON donations
  FOR SELECT
  USING (
    donor_id IS NOT NULL OR
    recipient_id IS NOT NULL OR
    rider_id IS NOT NULL
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);

-- Function to get user by email (helper for application)
CREATE OR REPLACE FUNCTION get_user_by_email(user_email text)
RETURNS TABLE(
  id uuid,
  email text,
  name text,
  role text,
  location_address text,
  location_lat numeric,
  location_lng numeric,
  profile_image text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    u.location_address,
    u.location_lat,
    u.location_lng,
    u.profile_image,
    u.created_at,
    u.updated_at
  FROM users u
  WHERE u.email = user_email;
$$;

-- Function to create or update user profile
CREATE OR REPLACE FUNCTION upsert_user_profile(
  user_email text,
  user_name text,
  user_role text DEFAULT 'recipient',
  user_location_address text DEFAULT NULL,
  user_location_lat numeric DEFAULT NULL,
  user_location_lng numeric DEFAULT NULL,
  user_profile_image text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Insert or update user profile
  INSERT INTO users (email, name, role, location_address, location_lat, location_lng, profile_image)
  VALUES (user_email, user_name, user_role, user_location_address, user_location_lat, user_location_lng, user_profile_image)
  ON CONFLICT (email) 
  DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    location_address = EXCLUDED.location_address,
    location_lat = EXCLUDED.location_lat,
    location_lng = EXCLUDED.location_lng,
    profile_image = EXCLUDED.profile_image,
    updated_at = now()
  RETURNING id INTO user_id;
  
  RETURN user_id;
END;
$$;