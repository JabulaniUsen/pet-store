-- Storage bucket setup for Supabase
-- Run these commands in Supabase SQL Editor or via Supabase CLI

-- Create product-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create product-videos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-videos',
  'product-videos',
  true,
  52428800, -- 50MB
  ARRAY['video/mp4', 'video/webm', 'video/ogg']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for product-images bucket
-- Allow public read access
CREATE POLICY "Product images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Allow authenticated admins to upload
CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' AND
  public.is_admin()
);

-- Allow authenticated admins to update
CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images' AND
  public.is_admin()
);

-- Allow authenticated admins to delete
CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' AND
  public.is_admin()
);

-- Storage policies for product-videos bucket
-- Allow public read access
CREATE POLICY "Product videos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-videos');

-- Allow authenticated admins to upload
CREATE POLICY "Admins can upload product videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-videos' AND
  public.is_admin()
);

-- Allow authenticated admins to update
CREATE POLICY "Admins can update product videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-videos' AND
  public.is_admin()
);

-- Allow authenticated admins to delete
CREATE POLICY "Admins can delete product videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-videos' AND
  public.is_admin()
);

