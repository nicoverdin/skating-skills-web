-- =============================================
-- 1. TIPOS Y ENUMS
-- =============================================
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'coach', 'guardian', 'member');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE skater_level AS ENUM ('preclub', 'precompetition', 'competition', 'national');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- 2. TABLAS PRINCIPALES
-- =============================================

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  iban TEXT,
  role user_role DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- STUDENTS
CREATE TABLE IF NOT EXISTS public.students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guardian_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  skating_level skater_level DEFAULT 'preclub',
  medical_conditions TEXT,
  emergency_contact TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- COURSES
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  coach_id UUID REFERENCES public.profiles(id),
  hours_per_week NUMERIC(3, 1) NOT NULL DEFAULT 1.0, 
  capacity INTEGER NOT NULL DEFAULT 20,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- ENROLLMENTS
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'active', 'cancelled', 'waitlist')) DEFAULT 'active',
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- BLOG POSTS
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  excerpt TEXT,
  cover_image_url TEXT,
  author_id UUID REFERENCES public.profiles(id),
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- GALLERY
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  image_url TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 3. VISTAS (VIEWS)
-- =============================================

-- STUDENT BILLING SUMMARY (Corregida)
-- Esta vista calcula el total de horas y la cuota estimada
CREATE OR REPLACE VIEW student_billing_summary AS
SELECT 
    s.id as student_id,
    s.first_name,
    s.last_name,
    s.guardian_id,
    COALESCE(SUM(c.hours_per_week), 0) as total_hours,
    -- Fórmula: 10€ Base + (10€ x Horas Totales)
    10 + (COALESCE(SUM(c.hours_per_week), 0) * 10) as monthly_fee_eur
FROM students s
LEFT JOIN enrollments e ON s.id = e.student_id 
LEFT JOIN courses c ON e.course_id = c.id
GROUP BY s.id;

-- =============================================
-- 4. POLÍTICAS DE SEGURIDAD (RLS)
-- =============================================

-- --- PROFILES ---
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- --- STUDENTS ---
CREATE POLICY "Staff can manage students" ON public.students FOR ALL TO authenticated USING (true);

-- --- COURSES ---
CREATE POLICY "Courses are viewable by everyone" ON public.courses FOR SELECT TO public USING (true);
CREATE POLICY "Staff can manage courses" ON public.courses FOR ALL TO authenticated USING (true);

-- --- ENROLLMENTS (Granular Policies - IMPORTANTE PARA QUE FUNCIONE EL DELETE) ---
CREATE POLICY "Staff can view enrollments" ON public.enrollments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can insert enrollments" ON public.enrollments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Staff can delete enrollments" ON public.enrollments FOR DELETE TO authenticated USING (true);
CREATE POLICY "Staff can update enrollments" ON public.enrollments FOR UPDATE TO authenticated USING (true);

-- --- BLOG & GALLERY ---
CREATE POLICY "Public posts are viewable by everyone" ON public.posts FOR SELECT TO public USING (is_published = true);
CREATE POLICY "Staff can view all posts" ON public.posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can manage posts" ON public.posts FOR ALL TO authenticated USING (true);

CREATE POLICY "Gallery is viewable by everyone" ON public.gallery_images FOR SELECT TO public USING (true);
CREATE POLICY "Staff can manage gallery" ON public.gallery_images FOR ALL TO authenticated USING (true);

-- =============================================
-- 5. PERMISOS DE ACCESO A VISTAS
-- =============================================
GRANT SELECT ON student_billing_summary TO authenticated;
GRANT SELECT ON student_billing_summary TO service_role;
