DROP POLICY IF EXISTS "Categories public read" ON public.course_categories;
CREATE POLICY "Categories signed-in read" ON public.course_categories FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
REVOKE SELECT ON public.course_categories FROM anon;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['purchases','referral_credits','course_enrollments','course_lesson_progress','course_reviews','groups','group_members','group_invites','group_files','messages','materials','courses','course_chapters','course_lessons','course_categories','admin_emails','user_roles'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Block guest sessions" ON public.%I', t);
    EXECUTE format('CREATE POLICY "Block guest sessions" ON public.%I AS RESTRICTIVE FOR ALL TO authenticated USING (coalesce((auth.jwt() ->> ''is_anonymous'')::boolean, false) IS NOT TRUE) WITH CHECK (coalesce((auth.jwt() ->> ''is_anonymous'')::boolean, false) IS NOT TRUE)', t);
  END LOOP;
END $$;