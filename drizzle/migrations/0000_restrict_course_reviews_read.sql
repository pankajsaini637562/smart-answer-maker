DROP POLICY IF EXISTS "Reviews public read" ON public.course_reviews;
CREATE POLICY "Reviews readable on published courses" ON public.course_reviews FOR SELECT TO anon, authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND (c.is_published OR c.instructor_id = auth.uid() OR public.is_admin(auth.uid())))
);