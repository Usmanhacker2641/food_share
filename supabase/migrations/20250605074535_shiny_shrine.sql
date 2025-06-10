/*
  # Donations Schema Setup

  1. New Tables
    - `donations`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `quantity` (text)
      - `expiry_date` (timestamptz)
      - `pickup_address` (text)
      - `pickup_instructions` (text)
      - `status` (text)
      - `donor_id` (uuid, references auth.users)
      - `recipient_id` (uuid, references auth.users)
      - `rider_id` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `donation_images`
      - `id` (uuid, primary key)
      - `donation_id` (uuid, references donations)
      - `url` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for CRUD operations
*/

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  quantity text NOT NULL,
  expiry_date timestamptz NOT NULL,
  pickup_address text NOT NULL,
  pickup_instructions text,
  status text NOT NULL DEFAULT 'available',
  donor_id uuid REFERENCES auth.users(id),
  recipient_id uuid REFERENCES auth.users(id),
  rider_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create donation_images table
CREATE TABLE IF NOT EXISTS donation_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id uuid REFERENCES donations(id) ON DELETE CASCADE,
  url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_images ENABLE ROW LEVEL SECURITY;

-- Policies for donations table
CREATE POLICY "Anyone can view available donations"
  ON donations
  FOR SELECT
  USING (status = 'available');

CREATE POLICY "Donors can create donations"
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

-- Policies for donation_images table
CREATE POLICY "Anyone can view donation images"
  ON donation_images
  FOR SELECT
  USING (true);

CREATE POLICY "Donors can add images to their donations"
  ON donation_images
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM donations
      WHERE id = donation_id
      AND donor_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS donations_status_idx ON donations(status);
CREATE INDEX IF NOT EXISTS donations_donor_id_idx ON donations(donor_id);
CREATE INDEX IF NOT EXISTS donations_recipient_id_idx ON donations(recipient_id);
CREATE INDEX IF NOT EXISTS donations_rider_id_idx ON donations(rider_id);
CREATE INDEX IF NOT EXISTS donation_images_donation_id_idx ON donation_images(donation_id);