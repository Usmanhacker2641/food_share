/*
  # Create automatic user profile creation

  1. New Functions
    - `handle_new_user()` - Automatically creates a user profile when someone signs up
  
  2. New Triggers
    - Trigger on auth.users insert to create profile in public.users table
  
  3. Security
    - Ensures every authenticated user has a corresponding profile
    - Maintains data consistency between auth and profile tables
*/

-- Create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'recipient')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically create user profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();