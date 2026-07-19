
-- Extend role enum with instructor
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON e.enumtypid = t.oid WHERE t.typname = 'app_role' AND e.enumlabel = 'instructor') THEN
    ALTER TYPE public.app_role ADD VALUE 'instructor';
  END IF;
EXCEPTION WHEN undefined_object THEN
  CREATE TYPE public.app_role AS ENUM ('admin','instructor','user');
END $$;

-- user_roles table (if not already present)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon;

-- Categories
CREATE TABLE public.course_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  icon text,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.course_categories TO anon, authenticated;
GRANT ALL ON public.course_categories TO service_role;
ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories public read" ON public.course_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage categories" ON public.course_categories FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Courses
CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE,
  description text,
  cover_url text,
  category_id uuid REFERENCES public.course_categories(id) ON DELETE SET NULL,
  instructor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  instructor_name text,
  subject text,
  level text,
  price_inr int NOT NULL DEFAULT 0,
  is_free boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT false,
  rating_avg numeric(3,2) NOT NULL DEFAULT 0,
  rating_count int NOT NULL DEFAULT 0,
  enrollment_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.courses TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.courses TO authenticated;
GRANT ALL ON public.courses TO service_role;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published courses are public" ON public.courses FOR SELECT TO anon, authenticated
  USING (is_published = true OR instructor_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Instructors create own courses" ON public.courses FOR INSERT TO authenticated
  WITH CHECK ((instructor_id = auth.uid() AND public.has_role(auth.uid(),'instructor')) OR public.is_admin(auth.uid()));
CREATE POLICY "Instructors update own courses" ON public.courses FOR UPDATE TO authenticated
  USING (instructor_id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (instructor_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Instructors delete own courses" ON public.courses FOR DELETE TO authenticated
  USING (instructor_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE TRIGGER courses_touch BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Chapters
CREATE TABLE public.course_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.course_chapters TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.course_chapters TO authenticated;
GRANT ALL ON public.course_chapters TO service_role;
ALTER TABLE public.course_chapters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Chapters visible with course" ON public.course_chapters FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND (c.is_published OR c.instructor_id = auth.uid() OR public.is_admin(auth.uid()))));
CREATE POLICY "Instructors manage chapters" ON public.course_chapters FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND (c.instructor_id = auth.uid() OR public.is_admin(auth.uid()))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND (c.instructor_id = auth.uid() OR public.is_admin(auth.uid()))));

-- Enrollments (declared before lessons policy references it)
CREATE TABLE public.course_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  source text NOT NULL DEFAULT 'paid',
  amount_inr int NOT NULL DEFAULT 0,
  provider_session_id text,
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);
GRANT SELECT ON public.course_enrollments TO authenticated;
GRANT ALL ON public.course_enrollments TO service_role;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own enrollments" ON public.course_enrollments FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND c.instructor_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.is_enrolled(_course_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.course_enrollments WHERE course_id = _course_id AND user_id = _user_id)
$$;
GRANT EXECUTE ON FUNCTION public.is_enrolled(uuid,uuid) TO authenticated, anon;

-- Lessons
CREATE TABLE public.course_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid NOT NULL REFERENCES public.course_chapters(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  resource_pdf_path text,
  linked_sheet_id uuid REFERENCES public.sheets(id) ON DELETE SET NULL,
  video_url text,
  position int NOT NULL DEFAULT 0,
  is_preview boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.course_lessons TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.course_lessons TO authenticated;
GRANT ALL ON public.course_lessons TO service_role;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lesson metadata visible to all for published course" ON public.course_lessons FOR SELECT TO anon, authenticated
  USING (
    EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND (
      c.is_published OR c.instructor_id = auth.uid() OR public.is_admin(auth.uid())
      OR public.is_enrolled(c.id, auth.uid())
    ))
  );
CREATE POLICY "Instructors manage lessons" ON public.course_lessons FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND (c.instructor_id = auth.uid() OR public.is_admin(auth.uid()))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND (c.instructor_id = auth.uid() OR public.is_admin(auth.uid()))));

-- Lesson progress
CREATE TABLE public.course_lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.course_lesson_progress TO authenticated;
GRANT ALL ON public.course_lesson_progress TO service_role;
ALTER TABLE public.course_lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own progress" ON public.course_lesson_progress FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Reviews
CREATE TABLE public.course_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);
GRANT SELECT ON public.course_reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.course_reviews TO authenticated;
GRANT ALL ON public.course_reviews TO service_role;
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews public read" ON public.course_reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Enrolled users write review" ON public.course_reviews FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.is_enrolled(course_id, auth.uid()));
CREATE POLICY "Users update own review" ON public.course_reviews FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users delete own review" ON public.course_reviews FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Free-course enroll RPC
CREATE OR REPLACE FUNCTION public.enroll_free_course(_course_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _is_free boolean; _id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Must be signed in'; END IF;
  SELECT is_free INTO _is_free FROM public.courses WHERE id = _course_id AND is_published = true;
  IF _is_free IS NULL THEN RAISE EXCEPTION 'Course not available'; END IF;
  IF NOT _is_free THEN RAISE EXCEPTION 'Course is not free'; END IF;
  INSERT INTO public.course_enrollments (user_id, course_id, source, amount_inr)
  VALUES (auth.uid(), _course_id, 'free', 0)
  ON CONFLICT (user_id, course_id) DO UPDATE SET source = EXCLUDED.source
  RETURNING id INTO _id;
  UPDATE public.courses SET enrollment_count = enrollment_count + 1 WHERE id = _course_id;
  RETURN _id;
END $$;
GRANT EXECUTE ON FUNCTION public.enroll_free_course(uuid) TO authenticated;

-- Seed categories
INSERT INTO public.course_categories (slug, name, icon, position) VALUES
  ('class-9','Class 9','GraduationCap',1),
  ('class-10','Class 10','GraduationCap',2),
  ('class-11','Class 11','GraduationCap',3),
  ('class-12','Class 12','GraduationCap',4),
  ('jee','JEE','Atom',5),
  ('neet','NEET','Stethoscope',6)
ON CONFLICT (slug) DO NOTHING;
