/*
  # User Management and Donations Integration

  1. New Tables
    - `users` table to store user profiles
      - `id` (uuid, primary key, references auth.users)
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
    - Update donations table policies for public viewing

  3. Functions
    - Trigger function to create user profiles automatically
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

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can view all profiles for public info" ON users;

-- Users policies - Allow viewing all profiles for public info (like donor names)
CREATE POLICY "Users can view all profiles for public info"
  ON users
  FOR SELECT
  USING (true);

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
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'donations_donor_id_fkey' AND table_name = 'donations') THEN
    ALTER TABLE donations DROP CONSTRAINT donations_donor_id_fkey;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'donations_recipient_id_fkey' AND table_name = 'donations') THEN
    ALTER TABLE donations DROP CONSTRAINT donations_recipient_id_fkey;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'donations_rider_id_fkey' AND table_name = 'donations') THEN
    ALTER TABLE donations DROP CONSTRAINT donations_rider_id_fkey;
  END IF;
END $$;

-- Add new foreign key constraints
ALTER TABLE donations 
ADD CONSTRAINT donations_donor_id_fkey 
FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE donations 
ADD CONSTRAINT donations_recipient_id_fkey 
FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE donations 
ADD CONSTRAINT donations_rider_id_fkey 
FOREIGN KEY (rider_id) REFERENCES users(id) ON DELETE SET NULL;

-- Update donations policies to allow public viewing of available donations
DROP POLICY IF EXISTS "Anyone can view available donations" ON donations;
DROP POLICY IF EXISTS "Authenticated users can create donations" ON donations;
DROP POLICY IF EXISTS "Donors can update their own donations" ON donations;
DROP POLICY IF EXISTS "Users can view their own donations" ON donations;

-- New donations policies
CREATE POLICY "Anyone can view available donations"
  ON donations
  FOR SELECT
  TO public
  USING (status = 'available');

CREATE POLICY "Authenticated users can create donations"
  ON donations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = donor_id);

CREATE POLICY "Donors can update their own donations"
  ON donations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = donor_id)
  WITH CHECK (auth.uid() = donor_id);

CREATE POLICY "Users can view their own donations"
  ON donations
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = donor_id OR
    auth.uid() = recipient_id OR
    auth.uid() = rider_id
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS users_email_idx ON users(id);
CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);