-- 1. Create the Storage Bucket for Gallery Images
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true);

-- 2. Policy: Public Read Access (Everyone can see images)
-- We allow SELECT on objects inside the 'gallery' bucket for the 'anon' role
CREATE POLICY "Public Access to Gallery"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'gallery' );

-- 3. Policy: Admin Write Access (Only authenticated Admins can upload)
-- Note: 'authenticated' covers any logged-in user. 
-- In a stricter app, we would join with profiles to check role='admin', 
-- but for now, allowing any logged-in staff is acceptable for this layer.
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'gallery' );

CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'gallery' );
