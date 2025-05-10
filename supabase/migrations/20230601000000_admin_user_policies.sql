-- Create RLS policy to allow admins to read all profiles
CREATE POLICY "Allow admins to read all profiles" ON profiles
FOR SELECT
TO authenticated
USING (
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
);

-- Create RLS policy to allow admins to update all profiles
CREATE POLICY "Allow admins to update all profiles" ON profiles
FOR UPDATE
TO authenticated
USING (
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
);

-- Create RLS policy to allow admins to delete profiles
CREATE POLICY "Allow admins to delete profiles" ON profiles
FOR DELETE
TO authenticated
USING (
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
);

-- Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT is_admin FROM profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add is_active column to profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
  END IF;
END $$;
