/*
  # Fix RLS Policy for Donations Table

  1. Security Updates
    - Update INSERT policy to properly handle authenticated users
    - Ensure donor_id is automatically set to the authenticated user's ID
    - Fix policy conditions to work with Supabase auth

  2. Changes
    - Drop existing INSERT policy that was causing issues
    - Create new INSERT policy that allows authenticated users to create donations
    - Ensure the policy properly validates the donor_id matches auth.uid()
*/

-- Drop the existing INSERT policy that's causing issues
DROP POLICY IF EXISTS "Donors can create donations" ON donations;

-- Create a new INSERT policy that properly handles authenticated users
CREATE POLICY "Authenticated users can create donations"
  ON donations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = donor_id);

-- Also ensure the UPDATE policy is correct
DROP POLICY IF EXISTS "Donors can update their own donations" ON donations;

CREATE POLICY "Donors can update their own donations"
  ON donations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = donor_id)
  WITH CHECK (auth.uid() = donor_id);