-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('admin', 'coach', 'guardian', 'member');
CREATE TYPE skater_level AS ENUM ('preclub', 'precompetition', 'competition', 'national');

-- 2. PROFILES (Users/Guardians/Payers)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  iban TEXT, -- Sensitive!
  role user_role DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. STUDENTS (Skaters)
CREATE TABLE public.students (
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

-- 4. COURSES (Classes)
CREATE TABLE public.courses (
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

-- 5. ENROLLMENTS
CREATE TABLE public.enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'active', 'cancelled', 'waitlist')) DEFAULT 'pending',
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- 6. CONTENT: BLOG POSTS
CREATE TABLE public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE, -- For URLs like /blog/noticia-importante
  content TEXT, -- Markdown or HTML
  excerpt TEXT, -- Short summary for cards
  cover_image_url TEXT, -- Reference to Storage
  author_id UUID REFERENCES public.profiles(id),
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 7. CONTENT: GALLERY
CREATE TABLE public.gallery_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  image_url TEXT NOT NULL, -- Reference to Storage
  category TEXT DEFAULT 'general', -- e.g. 'competition', 'training'
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- 8. BILLING VIEW
CREATE OR REPLACE VIEW student_billing_summary AS
SELECT 
    s.id as student_id,
    s.first_name,
    s.last_name,
    s.guardian_id,
    COALESCE(SUM(c.hours_per_week), 0) as total_hours,
    10 + (COALESCE(SUM(c.hours_per_week), 0) * 10) as monthly_fee_eur
FROM students s
LEFT JOIN enrollments e ON s.id = e.student_id AND e.status = 'active'
LEFT JOIN courses c ON e.course_id = c.id
GROUP BY s.id;

GRANT SELECT ON student_billing_summary TO authenticated;
