-- Restrict paid lesson content (video_url, resource_pdf_path) to preview lessons,
-- enrolled students, the instructor, or admins.
DROP POLICY IF EXISTS "Lesson metadata visible to all for published course" ON public.course_lessons;

CREATE POLICY "Lessons readable for preview, enrollees, instructors" ON public.course_lessons
  FOR SELECT TO anon, authenticated
  USING (
    is_preview = true
    OR EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_id
        AND (
          c.instructor_id = auth.uid()
          OR public.is_admin(auth.uid())
          OR public.is_enrolled(c.id, auth.uid())
        )
    )
  );

-- Metadata-only view (no video_url / resource_pdf_path) so the public course
-- detail page can still render the curriculum outline for non-enrolled visitors.
CREATE OR REPLACE VIEW public.course_lessons_public
WITH (security_invoker = false) AS
SELECT id, chapter_id, course_id, title, position, is_preview, created_at
FROM public.course_lessons;

GRANT SELECT ON public.course_lessons_public TO anon, authenticated;