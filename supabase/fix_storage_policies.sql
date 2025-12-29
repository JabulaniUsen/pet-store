-- Fix storage policies to use is_admin() function
-- Run this in your Supabase SQL Editor to fix the existing storage policies

-- Drop existing storage policies
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload product videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product videos" ON storage.objects;

-- Recreate policies using is_admin() function
CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' AND
  public.is_admin()
);

CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images' AND
  public.is_admin()
);

CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' AND
  public.is_admin()
);

CREATE POLICY "Admins can upload product videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-videos' AND
  public.is_admin()
);

CREATE POLICY "Admins can update product videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-videos' AND
  public.is_admin()
);

CREATE POLICY "Admins can delete product videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-videos' AND
  public.is_admin()
);

