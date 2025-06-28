/*
  # Complete User Management Setup

  1. New Tables
    - `users` (extends auth.users with additional profile data)
      - `id` (uuid, references auth.users)
      - `name` (text)
      - `role` (text)
      - `location_address` (text)
      - `location_lat` (numeric)
      - `location_lng` (numeric)
      - `profile_image` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on users table
    - Add policies for user management
    - Update donations table to reference users properly

  3. Functions
    - Auto-create user profile on signup
    - Helper function to get user ID
*/

-- Create users table to extend auth.users
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'recipient' CHECK (role IN ('donor', 'recipient', 'rider', 'admin')),
  location_address text,
  location_lat numeric,
  location_lng numeric,
  profile_image text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'recipient')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Update donations table foreign keys to reference users table
DO $$
BEGIN
  -- Drop existing foreign key constraints if they exist
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'donations_donor_id_fkey') THEN
    ALTER TABLE donations DROP CONSTRAINT donations_donor_id_fkey;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'donations_recipient_id_fkey') THEN
    ALTER TABLE donations DROP CONSTRAINT donations_recipient_id_fkey;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'donations_rider_id_fkey') THEN
    ALTER TABLE donations DROP CONSTRAINT donations_rider_id_fkey;
  END IF;
END $$;

-- Add new foreign key constraints
ALTER TABLE donations 
ADD CONSTRAINT donations_donor_id_fkey 
FOREIGN KEY (donor_id) REFERENCES users(id);

ALTER TABLE donations 
ADD CONSTRAINT donations_recipient_id_fkey 
FOREIGN KEY (recipient_id) REFERENCES users(id);

ALTER TABLE donations 
ADD CONSTRAINT donations_rider_id_fkey 
FOREIGN KEY (rider_id) REFERENCES users(id);

-- Helper function to get current user ID (for policies)
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;