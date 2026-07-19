
-- Path convention: {course_id}/...
CREATE POLICY "Course files: instructors write own" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'course-content'
  AND EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id::text = (storage.foldername(name))[1]
      AND (c.instructor_id = auth.uid() OR public.is_admin(auth.uid()))
  )
);
CREATE POLICY "Course files: instructors update own" ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'course-content'
  AND EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id::text = (storage.foldername(name))[1]
      AND (c.instructor_id = auth.uid() OR public.is_admin(auth.uid()))
  )
);
CREATE POLICY "Course files: instructors delete own" ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'course-content'
  AND EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id::text = (storage.foldername(name))[1]
      AND (c.instructor_id = auth.uid() OR public.is_admin(auth.uid()))
  )
);
CREATE POLICY "Course files: enrolled read" ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'course-content'
  AND EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id::text = (storage.foldername(name))[1]
      AND (
        c.instructor_id = auth.uid()
        OR public.is_admin(auth.uid())
        OR public.is_enrolled(c.id, auth.uid())
      )
  )
);
