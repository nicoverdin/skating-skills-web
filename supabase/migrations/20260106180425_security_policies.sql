-- --------------------------------------------------------
-- 1. SECURITY HELPERS (Functions used by policies)
-- --------------------------------------------------------

-- Function to check if the current requesting user is an Admin
-- This avoids repeating the subquery in every policy
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --------------------------------------------------------
-- 2. POLICIES FOR 'PROFILES' (Users/Parents)
-- --------------------------------------------------------

-- READ: Users can see their own profile. Admins can see all.
CREATE POLICY "Profiles are viewable by owner or admin" 
ON public.profiles FOR SELECT 
USING ( auth.uid() = id OR is_admin() );

-- UPDATE: Users can edit their own basic info. Admins can edit all.
-- Note: We generally don't let users change their 'role' via this policy. 
-- (Supabase handles column update privileges separately, or we trust the API logic).
CREATE POLICY "Profiles are editable by owner or admin" 
ON public.profiles FOR UPDATE 
USING ( auth.uid() = id OR is_admin() );

-- INSERT: Handled by Supabase Auth Triggers usually, but we allow self-registration
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK ( auth.uid() = id );

-- --------------------------------------------------------
-- 3. POLICIES FOR 'STUDENTS' (Minors)
-- --------------------------------------------------------

-- READ: Guardians see their kids. Admins see everyone.
CREATE POLICY "Guardians can view own students" 
ON public.students FOR SELECT 
USING ( guardian_id = auth.uid() OR is_admin() );

-- WRITE: Guardians can create/update their kids.
CREATE POLICY "Guardians can manage own students" 
ON public.students FOR ALL 
USING ( guardian_id = auth.uid() OR is_admin() );

-- --------------------------------------------------------
-- 4. POLICIES FOR 'COURSES' & 'ENROLLMENTS'
-- --------------------------------------------------------

-- COURSES: Public read (so people can see what to buy), Admin write.
CREATE POLICY "Courses are public to read" 
ON public.courses FOR SELECT 
TO authenticated, anon -- 'anon' allows non-logged in users (Landing Page)
USING ( true );

CREATE POLICY "Admins manage courses" 
ON public.courses FOR ALL 
USING ( is_admin() );

-- ENROLLMENTS: Sensitive! Only the guardian or admin.
CREATE POLICY "Guardians view own enrollments" 
ON public.enrollments FOR SELECT 
USING ( 
  student_id IN (SELECT id FROM public.students WHERE guardian_id = auth.uid())
  OR is_admin() 
);

CREATE POLICY "Guardians can enroll their students" 
ON public.enrollments FOR INSERT 
WITH CHECK ( 
  student_id IN (SELECT id FROM public.students WHERE guardian_id = auth.uid())
  OR is_admin()
);

-- --------------------------------------------------------
-- 5. POLICIES FOR CONTENT (Blog & Gallery)
-- --------------------------------------------------------

-- POSTS: Everyone reads published posts. Admin manages all.
CREATE POLICY "Public reads published posts" 
ON public.posts FOR SELECT 
TO authenticated, anon 
USING ( is_published = true OR is_admin() );

CREATE POLICY "Admins manage posts" 
ON public.posts FOR ALL 
USING ( is_admin() );

-- GALLERY: Similar to posts
CREATE POLICY "Public reads gallery" 
ON public.gallery_images FOR SELECT 
TO authenticated, anon 
USING ( true );

CREATE POLICY "Admins manage gallery" 
ON public.gallery_images FOR ALL 
USING ( is_admin() );
