-- 1. Actualizar la Vista para que sea la fuente de verdad total
CREATE OR REPLACE VIEW student_billing_summary AS
SELECT 
    s.id as student_id,
    s.first_name,
    s.last_name,
    s.guardian_id,
    p.first_name as guardian_first_name,
    p.last_name as guardian_last_name,
    p.iban as guardian_iban,
    p.phone as guardian_phone,
    COALESCE(SUM(c.hours_per_week), 0) as total_hours,
    -- Tu fórmula de negocio
    10 + (COALESCE(SUM(c.hours_per_week), 0) * 10) as monthly_fee_eur
FROM students s
LEFT JOIN enrollments e ON s.id = e.student_id 
LEFT JOIN courses c ON e.course_id = c.id
LEFT JOIN profiles p ON s.guardian_id = p.id
GROUP BY s.id, p.id;

-- 2. Crear la tabla de facturas (Invoices)
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guardian_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    month_year DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
    iban_snapshot TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Habilitar RLS (Seguridad)
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Seguridad
CREATE POLICY "Admins can manage all invoices" 
ON public.invoices
FOR ALL 
TO authenticated 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Guardians can view their own invoices" 
ON public.invoices
FOR SELECT 
TO authenticated 
USING (guardian_id = auth.uid());
