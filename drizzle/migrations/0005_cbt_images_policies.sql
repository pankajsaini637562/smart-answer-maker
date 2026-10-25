
CREATE POLICY "CBT images admin write" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'cbt-images' AND public.is_admin(auth.uid()))
  WITH CHECK (bucket_id = 'cbt-images' AND public.is_admin(auth.uid()) AND lower(storage.extension(name)) IN ('png','jpg','jpeg','webp','gif'));
CREATE POLICY "CBT images read by attempt owners" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'cbt-images' AND EXISTS (
    SELECT 1 FROM public.cbt_attempts a WHERE a.user_id = auth.uid() AND a.exam_id::text = (storage.foldername(name))[1]));
