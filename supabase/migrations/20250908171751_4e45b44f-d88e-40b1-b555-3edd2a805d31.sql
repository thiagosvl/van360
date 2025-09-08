-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can read admin records" ON public.admins;

-- Create a simple, non-recursive policy for admins to read their own record
CREATE POLICY "Admins can read their own record" 
ON public.admins 
FOR SELECT 
TO authenticated 
USING (auth.uid() = auth_uid);

-- Optional: Allow admins to insert their own record (for future admin creation)
CREATE POLICY "Admins can insert their own record" 
ON public.admins 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = auth_uid);

-- Optional: Allow admins to update their own record
CREATE POLICY "Admins can update their own record" 
ON public.admins 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = auth_uid) 
WITH CHECK (auth.uid() = auth_uid);