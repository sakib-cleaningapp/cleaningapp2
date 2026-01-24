-- Add RLS policies for businesses table

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can insert their own business" ON businesses;
DROP POLICY IF EXISTS "Users can read their own business" ON businesses;
DROP POLICY IF EXISTS "Users can update their own business" ON businesses;
DROP POLICY IF EXISTS "Anyone can read businesses" ON businesses;

-- Allow authenticated users to insert their own business
CREATE POLICY "Users can insert their own business" ON businesses
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = owner_id);

-- Allow users to read their own business
CREATE POLICY "Users can read their own business" ON businesses
FOR SELECT TO authenticated
USING (auth.uid() = owner_id);

-- Allow users to update their own business
CREATE POLICY "Users can update their own business" ON businesses
FOR UPDATE TO authenticated
USING (auth.uid() = owner_id);

-- Allow anyone to read businesses (for service discovery)
CREATE POLICY "Anyone can read businesses" ON businesses
FOR SELECT TO anon, authenticated
USING (true);
