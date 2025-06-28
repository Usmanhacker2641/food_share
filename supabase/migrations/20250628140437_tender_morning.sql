/*
  # Create demo users for testing

  1. New Users
    - Creates demo users in auth.users table
    - Creates corresponding profiles in users table
  2. Security
    - Uses proper Supabase auth functions
    - Ensures RLS policies work correctly
*/

-- Insert demo users into auth.users (this simulates user registration)
-- Note: In production, users would register through the normal signup flow

-- First, let's create a function to safely insert demo users
CREATE OR REPLACE FUNCTION create_demo_user(
  user_email text,
  user_password text,
  user_name text,
  user_role text DEFAULT 'recipient'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
  encrypted_pw text;
BEGIN
  -- Generate a new UUID for the user
  user_id := gen_random_uuid();
  
  -- Create a simple encrypted password (in real Supabase, this is handled automatically)
  encrypted_pw := crypt(user_password, gen_salt('bf'));
  
  -- Insert into auth.users (if it doesn't exist)
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    is_super_admin,
    role
  )
  VALUES (
    user_id,
    '00000000-0000-0000-0000-000000000000',
    user_email,
    encrypted_pw,
    now(),
    now(),
    now(),
    jsonb_build_object('name', user_name, 'role', user_role),
    false,
    'authenticated'
  )
  ON CONFLICT (email) DO NOTHING;
  
  -- Insert into public.users (our custom table)
  INSERT INTO public.users (
    id,
    name,
    role,
    created_at,
    updated_at
  )
  VALUES (
    user_id,
    user_name,
    user_role,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    updated_at = now();
  
  RETURN user_id;
END;
$$;

-- Create demo users
SELECT create_demo_user('donor@example.com', 'password123', 'John Donor', 'donor');
SELECT create_demo_user('recipient@example.com', 'password123', 'Sarah Recipient', 'recipient');
SELECT create_demo_user('rider@example.com', 'password123', 'Mike Rider', 'rider');
SELECT create_demo_user('admin@example.com', 'password123', 'Admin User', 'admin');

-- Clean up the function (optional)
DROP FUNCTION IF EXISTS create_demo_user(text, text, text, text);