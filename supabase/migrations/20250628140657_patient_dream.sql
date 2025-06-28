/*
  # Create Demo User Profiles

  1. User Profiles
    - Creates demo user profiles in the public.users table
    - These will be linked to auth users when they sign up

  Note: The actual auth users need to be created through Supabase Auth API or dashboard.
  This migration only creates the profile data that will be linked when users sign up.
*/

-- Insert demo user profiles
-- These will be linked to auth.users when the actual users sign up

INSERT INTO public.users (
  id,
  name,
  role,
  location_address,
  location_lat,
  location_lng,
  profile_image,
  created_at,
  updated_at
) VALUES 
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'John Donor',
    'donor',
    '123 Donation St, New York, NY',
    40.7128,
    -74.0060,
    'https://i.pravatar.cc/150?img=1',
    now(),
    now()
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    'Sarah Recipient',
    'recipient',
    '456 Need Ave, New York, NY',
    40.7228,
    -73.9860,
    'https://i.pravatar.cc/150?img=5',
    now(),
    now()
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003',
    'Mike Rider',
    'rider',
    '789 Delivery Rd, New York, NY',
    40.7328,
    -73.9960,
    'https://i.pravatar.cc/150?img=8',
    now(),
    now()
  ),
  (
    '550e8400-e29b-41d4-a716-446655440004',
    'Admin User',
    'admin',
    '321 Admin Blvd, New York, NY',
    40.7428,
    -74.0160,
    'https://i.pravatar.cc/150?img=12',
    now(),
    now()
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  location_address = EXCLUDED.location_address,
  location_lat = EXCLUDED.location_lat,
  location_lng = EXCLUDED.location_lng,
  profile_image = EXCLUDED.profile_image,
  updated_at = now();

-- Update the handle_new_user function to handle existing profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Check if user profile already exists
  IF EXISTS (SELECT 1 FROM public.users WHERE id = new.id) THEN
    -- Update existing profile with auth data
    UPDATE public.users 
    SET 
      name = COALESCE(new.raw_user_meta_data->>'name', name),
      role = COALESCE(new.raw_user_meta_data->>'role', role),
      updated_at = now()
    WHERE id = new.id;
  ELSE
    -- Create new profile
    INSERT INTO public.users (id, name, role)
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
      COALESCE(new.raw_user_meta_data->>'role', 'recipient')
    );
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;