-- 1. Crear el bucket para la galería
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Crear el bucket para las portadas del blog (opcional, por si usas otro)
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog', 'blog', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Políticas para el bucket 'gallery'
-- Permitir que el staff (admin/coach) suba y borre fotos
CREATE POLICY "Staff can upload gallery images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'gallery' AND 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'coach')
);

CREATE POLICY "Staff can delete gallery images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'gallery' AND 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'coach')
);

-- Permitir que todo el mundo vea las fotos
CREATE POLICY "Gallery is publicly viewable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'gallery');

-- 4. Repetir políticas para el bucket 'blog' (si lo usas)
CREATE POLICY "Staff can upload blog images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog');

CREATE POLICY "Blog images are publicly viewable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'blog');
