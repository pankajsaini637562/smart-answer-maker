
CREATE TABLE public.cbt_exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  description text,
  subject text,
  instructions text,
  duration_minutes int NOT NULL DEFAULT 60,
  starts_at timestamptz,
  ends_at timestamptz,
  max_attempts int NOT NULL DEFAULT 1,
  marks_correct numeric NOT NULL DEFAULT 4,
  marks_wrong numeric NOT NULL DEFAULT 1,
  marks_unanswered numeric NOT NULL DEFAULT 0,
  allow_revisit boolean NOT NULL DEFAULT true,
  result_policy text NOT NULL DEFAULT 'immediate',
  result_release_at timestamptz,
  results_released boolean NOT NULL DEFAULT false,
  show_answers boolean NOT NULL DEFAULT true,
  show_explanations boolean NOT NULL DEFAULT true,
  eligible_classes text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft',
  created_by uuid,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cbt_exams_status_chk CHECK (status IN ('draft','published','cancelled')),
  CONSTRAINT cbt_exams_policy_chk CHECK (result_policy IN ('immediate','scheduled','manual'))
);
CREATE TABLE public.cbt_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES public.cbt_exams(id) ON DELETE CASCADE,
  name text NOT NULL,
  position int NOT NULL DEFAULT 0
);
CREATE TABLE public.cbt_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES public.cbt_exams(id) ON DELETE CASCADE,
  section_id uuid REFERENCES public.cbt_sections(id) ON DELETE SET NULL,
  position int NOT NULL DEFAULT 0,
  text text NOT NULL DEFAULT '',
  image_url text,
  options jsonb NOT NULL DEFAULT '["","","",""]'::jsonb,
  multi boolean NOT NULL DEFAULT false,
  marks numeric,
  negative numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.cbt_questions(exam_id, position);
CREATE TABLE public.cbt_answer_keys (
  question_id uuid PRIMARY KEY REFERENCES public.cbt_questions(id) ON DELETE CASCADE,
  exam_id uuid NOT NULL REFERENCES public.cbt_exams(id) ON DELETE CASCADE,
  correct int[] NOT NULL DEFAULT '{}',
  explanation text
);
CREATE TABLE public.cbt_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES public.cbt_exams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  attempt_no int NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  deadline timestamptz NOT NULL,
  submitted_at timestamptz,
  status text NOT NULL DEFAULT 'in_progress',
  UNIQUE (exam_id, user_id, attempt_no),
  CONSTRAINT cbt_attempt_status_chk CHECK (status IN ('in_progress','submitted','auto_submitted'))
);
CREATE UNIQUE INDEX cbt_one_active_attempt ON public.cbt_attempts(exam_id, user_id) WHERE status = 'in_progress';
CREATE TABLE public.cbt_responses (
  attempt_id uuid NOT NULL REFERENCES public.cbt_attempts(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.cbt_questions(id) ON DELETE CASCADE,
  selected int[] NOT NULL DEFAULT '{}',
  marked boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (attempt_id, question_id)
);
CREATE TABLE public.cbt_results (
  attempt_id uuid PRIMARY KEY REFERENCES public.cbt_attempts(id) ON DELETE CASCADE,
  exam_id uuid NOT NULL REFERENCES public.cbt_exams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  total_questions int NOT NULL,
  attempted int NOT NULL,
  correct int NOT NULL,
  wrong int NOT NULL,
  unanswered int NOT NULL,
  positive_marks numeric NOT NULL,
  negative_marks numeric NOT NULL,
  score numeric NOT NULL,
  max_marks numeric NOT NULL,
  percentage numeric NOT NULL,
  accuracy numeric NOT NULL,
  question_results jsonb NOT NULL DEFAULT '[]'::jsonb,
  computed_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.cbt_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid REFERENCES public.cbt_exams(id) ON DELETE CASCADE,
  attempt_id uuid,
  user_id uuid,
  event text NOT NULL,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cbt_exams, public.cbt_sections, public.cbt_questions, public.cbt_answer_keys TO authenticated;
GRANT SELECT ON public.cbt_attempts, public.cbt_responses, public.cbt_results, public.cbt_audit_events TO authenticated;
GRANT ALL ON public.cbt_exams, public.cbt_sections, public.cbt_questions, public.cbt_answer_keys, public.cbt_attempts, public.cbt_responses, public.cbt_results, public.cbt_audit_events TO service_role;

ALTER TABLE public.cbt_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbt_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbt_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbt_answer_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbt_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbt_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbt_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbt_audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage exams" ON public.cbt_exams FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Students read published exams" ON public.cbt_exams FOR SELECT TO authenticated USING (status = 'published');
CREATE POLICY "Admins manage sections" ON public.cbt_sections FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins manage questions" ON public.cbt_questions FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins manage keys" ON public.cbt_answer_keys FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Own or admin attempts" ON public.cbt_attempts FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Own or admin responses" ON public.cbt_responses FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.cbt_attempts a WHERE a.id = attempt_id AND (a.user_id = auth.uid() OR public.is_admin(auth.uid()))));
CREATE POLICY "Admins read results" ON public.cbt_results FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins read audit" ON public.cbt_audit_events FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['cbt_exams','cbt_sections','cbt_questions','cbt_answer_keys','cbt_attempts','cbt_responses','cbt_results','cbt_audit_events'] LOOP
    EXECUTE format('CREATE POLICY "Block guest sessions" ON public.%I AS RESTRICTIVE FOR ALL TO authenticated USING (COALESCE((auth.jwt()->>''is_anonymous'')::boolean, false) = false) WITH CHECK (COALESCE((auth.jwt()->>''is_anonymous'')::boolean, false) = false)', t);
  END LOOP;
END $$;

CREATE TRIGGER cbt_exams_touch BEFORE UPDATE ON public.cbt_exams FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Lock paper once published
CREATE OR REPLACE FUNCTION public.cbt_guard_paper() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _exam uuid; _st text;
BEGIN
  _exam := COALESCE(NEW.exam_id, OLD.exam_id);
  IF TG_OP = 'UPDATE' THEN _exam := OLD.exam_id; END IF;
  SELECT status INTO _st FROM public.cbt_exams WHERE id = _exam;
  IF _st IS NOT NULL AND _st <> 'draft' THEN
    RAISE EXCEPTION 'Unpublish the exam (to draft) before editing its questions';
  END IF;
  RETURN COALESCE(NEW, OLD);
END $$;
CREATE TRIGGER cbt_guard_questions BEFORE INSERT OR UPDATE OR DELETE ON public.cbt_questions FOR EACH ROW EXECUTE FUNCTION public.cbt_guard_paper();
CREATE TRIGGER cbt_guard_keys BEFORE INSERT OR UPDATE OR DELETE ON public.cbt_answer_keys FOR EACH ROW EXECUTE FUNCTION public.cbt_guard_paper();
CREATE TRIGGER cbt_guard_sections BEFORE INSERT OR UPDATE OR DELETE ON public.cbt_sections FOR EACH ROW EXECUTE FUNCTION public.cbt_guard_paper();

CREATE OR REPLACE FUNCTION public.cbt_guard_exam() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF OLD.status = 'published' AND NEW.status = 'published' AND (
     NEW.duration_minutes IS DISTINCT FROM OLD.duration_minutes OR NEW.starts_at IS DISTINCT FROM OLD.starts_at
     OR NEW.marks_correct IS DISTINCT FROM OLD.marks_correct OR NEW.marks_wrong IS DISTINCT FROM OLD.marks_wrong
     OR NEW.marks_unanswered IS DISTINCT FROM OLD.marks_unanswered OR NEW.max_attempts < OLD.max_attempts
     OR NEW.eligible_classes IS DISTINCT FROM OLD.eligible_classes OR NEW.allow_revisit IS DISTINCT FROM OLD.allow_revisit) THEN
    RAISE EXCEPTION 'This exam is published. Unpublish it to change timing, marking or eligibility.';
  END IF;
  IF NEW.status = 'draft' AND OLD.status = 'published' AND EXISTS (SELECT 1 FROM public.cbt_attempts WHERE exam_id = OLD.id) THEN
    RAISE EXCEPTION 'Students have already started this exam; it cannot be unpublished. Cancel it instead.';
  END IF;
  IF NEW.status = 'published' AND OLD.status <> 'published' AND current_setting('cbt.publishing', true) IS DISTINCT FROM 'on' THEN
    RAISE EXCEPTION 'Use Publish to validate and publish the exam';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER cbt_guard_exam BEFORE UPDATE ON public.cbt_exams FOR EACH ROW EXECUTE FUNCTION public.cbt_guard_exam();

-- Helpers
CREATE OR REPLACE FUNCTION public.cbt_sorted(_a int[]) RETURNS int[] LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT COALESCE(array_agg(DISTINCT x ORDER BY x), '{}') FROM unnest(COALESCE(_a,'{}')) x
$$;

CREATE OR REPLACE FUNCTION public.cbt_require_user() RETURNS uuid LANGUAGE plpgsql STABLE SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Must be signed in'; END IF;
  IF COALESCE((auth.jwt()->>'is_anonymous')::boolean, false) THEN RAISE EXCEPTION 'Create an account to take CBT exams'; END IF;
  RETURN auth.uid();
END $$;

CREATE OR REPLACE FUNCTION public.cbt_is_released(_e public.cbt_exams) RETURNS boolean LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT _e.results_released OR _e.result_policy = 'immediate'
    OR (_e.result_policy = 'scheduled' AND _e.result_release_at IS NOT NULL AND now() >= _e.result_release_at)
$$;

CREATE OR REPLACE FUNCTION public.cbt_is_eligible(_e public.cbt_exams, _uid uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT cardinality(_e.eligible_classes) = 0
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = _uid AND p.class = ANY(_e.eligible_classes))
$$;

-- Finalize & score (internal)
CREATE OR REPLACE FUNCTION public.cbt_finalize(_attempt uuid, _auto boolean) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE a public.cbt_attempts; e public.cbt_exams; r record;
  _sel int[]; _key int[]; _mc numeric; _mw numeric; _st text; _m numeric;
  _tot int := 0; _cor int := 0; _wr int := 0; _un int := 0;
  _pos numeric := 0; _neg numeric := 0; _score numeric := 0; _max numeric := 0;
  _qr jsonb := '[]'::jsonb;
BEGIN
  SELECT * INTO a FROM public.cbt_attempts WHERE id = _attempt FOR UPDATE;
  IF a.id IS NULL OR a.status <> 'in_progress' THEN RETURN; END IF;
  SELECT * INTO e FROM public.cbt_exams WHERE id = a.exam_id;
  FOR r IN SELECT q.id, q.multi, q.marks, q.negative, k.correct, resp.selected
           FROM public.cbt_questions q
           LEFT JOIN public.cbt_answer_keys k ON k.question_id = q.id
           LEFT JOIN public.cbt_responses resp ON resp.question_id = q.id AND resp.attempt_id = a.id
           WHERE q.exam_id = a.exam_id ORDER BY q.position LOOP
    _tot := _tot + 1;
    _sel := public.cbt_sorted(r.selected); _key := public.cbt_sorted(r.correct);
    _mc := COALESCE(r.marks, e.marks_correct); _mw := COALESCE(r.negative, e.marks_wrong);
    _max := _max + _mc;
    IF cardinality(_sel) = 0 THEN
      _st := 'unanswered'; _m := e.marks_unanswered; _un := _un + 1;
    ELSIF _sel = _key THEN
      _st := 'correct'; _m := _mc; _cor := _cor + 1; _pos := _pos + _mc;
    ELSIF r.multi AND _sel <@ _key THEN
      _st := 'partial'; _m := 0; _wr := _wr + 1;
    ELSE
      _st := 'wrong'; _m := -_mw; _wr := _wr + 1; _neg := _neg + _mw;
    END IF;
    _score := _score + _m;
    _qr := _qr || jsonb_build_object('question_id', r.id, 'status', _st, 'marks', _m);
  END LOOP;
  UPDATE public.cbt_attempts SET status = CASE WHEN _auto THEN 'auto_submitted' ELSE 'submitted' END,
    submitted_at = LEAST(now(), deadline + interval '30 seconds') WHERE id = a.id;
  INSERT INTO public.cbt_results (attempt_id, exam_id, user_id, total_questions, attempted, correct, wrong, unanswered,
    positive_marks, negative_marks, score, max_marks, percentage, accuracy, question_results)
  VALUES (a.id, a.exam_id, a.user_id, _tot, _cor + _wr, _cor, _wr, _un, _pos, _neg, _score, _max,
    CASE WHEN _max > 0 THEN round(_score * 100 / _max, 2) ELSE 0 END,
    CASE WHEN (_cor + _wr) > 0 THEN round(_cor * 100.0 / (_cor + _wr), 2) ELSE 0 END, _qr)
  ON CONFLICT (attempt_id) DO NOTHING;
  INSERT INTO public.cbt_audit_events (exam_id, attempt_id, user_id, event) VALUES (a.exam_id, a.id, a.user_id, CASE WHEN _auto THEN 'auto_submitted' ELSE 'submitted' END);
END $$;
REVOKE EXECUTE ON FUNCTION public.cbt_finalize(uuid, boolean) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.cbt_finalize_expired(_uid uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _id uuid;
BEGIN
  FOR _id IN SELECT id FROM public.cbt_attempts WHERE user_id = _uid AND status = 'in_progress' AND now() > deadline + interval '30 seconds' LOOP
    PERFORM public.cbt_finalize(_id, true);
  END LOOP;
END $$;
REVOKE EXECUTE ON FUNCTION public.cbt_finalize_expired(uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.cbt_server_time() RETURNS timestamptz LANGUAGE sql STABLE AS $$ SELECT now() $$;

CREATE OR REPLACE FUNCTION public.cbt_list_exams() RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := public.cbt_require_user();
BEGIN
  PERFORM public.cbt_finalize_expired(_uid);
  RETURN jsonb_build_object('server_now', now(), 'exams', COALESCE((
    SELECT jsonb_agg(jsonb_build_object(
      'id', e.id, 'title', e.title, 'description', e.description, 'subject', e.subject, 'instructions', e.instructions,
      'duration_minutes', e.duration_minutes, 'starts_at', e.starts_at, 'ends_at', e.ends_at, 'max_attempts', e.max_attempts,
      'marks_correct', e.marks_correct, 'marks_wrong', e.marks_wrong, 'marks_unanswered', e.marks_unanswered,
      'allow_revisit', e.allow_revisit, 'result_policy', e.result_policy, 'result_release_at', e.result_release_at,
      'results_released', public.cbt_is_released(e),
      'question_count', (SELECT count(*) FROM public.cbt_questions q WHERE q.exam_id = e.id),
      'attempts_used', (SELECT count(*) FROM public.cbt_attempts a WHERE a.exam_id = e.id AND a.user_id = _uid),
      'active_attempt_id', (SELECT a.id FROM public.cbt_attempts a WHERE a.exam_id = e.id AND a.user_id = _uid AND a.status = 'in_progress' LIMIT 1),
      'last_attempt_id', (SELECT a.id FROM public.cbt_attempts a WHERE a.exam_id = e.id AND a.user_id = _uid AND a.status <> 'in_progress' ORDER BY a.attempt_no DESC LIMIT 1)
    ) ORDER BY e.starts_at)
    FROM public.cbt_exams e
    WHERE (e.status = 'published' AND public.cbt_is_eligible(e, _uid))
       OR EXISTS (SELECT 1 FROM public.cbt_attempts a WHERE a.exam_id = e.id AND a.user_id = _uid)
  ), '[]'::jsonb));
END $$;

CREATE OR REPLACE FUNCTION public.cbt_start_attempt(_exam uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := public.cbt_require_user(); e public.cbt_exams; _id uuid; _n int;
BEGIN
  PERFORM public.cbt_finalize_expired(_uid);
  SELECT * INTO e FROM public.cbt_exams WHERE id = _exam FOR SHARE;
  IF e.id IS NULL OR e.status <> 'published' THEN RAISE EXCEPTION 'This exam is not available'; END IF;
  SELECT id INTO _id FROM public.cbt_attempts WHERE exam_id = _exam AND user_id = _uid AND status = 'in_progress';
  IF _id IS NOT NULL THEN RETURN _id; END IF;
  IF NOT public.cbt_is_eligible(e, _uid) THEN RAISE EXCEPTION 'You are not eligible for this exam'; END IF;
  IF now() < e.starts_at THEN RAISE EXCEPTION 'This exam has not started yet'; END IF;
  IF now() >= e.ends_at THEN RAISE EXCEPTION 'This exam window has closed'; END IF;
  SELECT count(*) INTO _n FROM public.cbt_attempts WHERE exam_id = _exam AND user_id = _uid;
  IF _n >= e.max_attempts THEN RAISE EXCEPTION 'You have used all allowed attempts'; END IF;
  INSERT INTO public.cbt_attempts (exam_id, user_id, attempt_no, deadline)
  VALUES (_exam, _uid, _n + 1, LEAST(now() + make_interval(mins => e.duration_minutes), e.ends_at))
  RETURNING id INTO _id;
  INSERT INTO public.cbt_audit_events (exam_id, attempt_id, user_id, event) VALUES (_exam, _id, _uid, 'started');
  RETURN _id;
END $$;

CREATE OR REPLACE FUNCTION public.cbt_get_paper(_attempt uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := public.cbt_require_user(); a public.cbt_attempts; e public.cbt_exams;
BEGIN
  SELECT * INTO a FROM public.cbt_attempts WHERE id = _attempt AND user_id = _uid;
  IF a.id IS NULL THEN RAISE EXCEPTION 'Attempt not found'; END IF;
  IF a.status = 'in_progress' AND now() > a.deadline + interval '30 seconds' THEN
    PERFORM public.cbt_finalize(a.id, true);
    SELECT * INTO a FROM public.cbt_attempts WHERE id = _attempt;
  END IF;
  SELECT * INTO e FROM public.cbt_exams WHERE id = a.exam_id;
  IF a.status <> 'in_progress' THEN
    RETURN jsonb_build_object('status', a.status, 'exam_id', e.id, 'title', e.title, 'server_now', now());
  END IF;
  RETURN jsonb_build_object(
    'status', a.status, 'attempt_id', a.id, 'exam_id', e.id, 'title', e.title, 'started_at', a.started_at, 'deadline', a.deadline,
    'server_now', now(), 'allow_revisit', e.allow_revisit,
    'questions', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', q.id, 'position', q.position, 'section', s.name,
        'text', q.text, 'image_url', q.image_url, 'options', q.options, 'multi', q.multi,
        'marks', COALESCE(q.marks, e.marks_correct), 'negative', COALESCE(q.negative, e.marks_wrong)) ORDER BY s.position NULLS FIRST, q.position)
      FROM public.cbt_questions q LEFT JOIN public.cbt_sections s ON s.id = q.section_id WHERE q.exam_id = e.id), '[]'::jsonb),
    'responses', COALESCE((SELECT jsonb_agg(jsonb_build_object('question_id', r.question_id, 'selected', r.selected, 'marked', r.marked))
      FROM public.cbt_responses r WHERE r.attempt_id = a.id), '[]'::jsonb));
END $$;

CREATE OR REPLACE FUNCTION public.cbt_save_response(_attempt uuid, _question uuid, _selected int[], _marked boolean) RETURNS timestamptz LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := public.cbt_require_user(); a public.cbt_attempts; q public.cbt_questions; _sel int[]; _n int; _t timestamptz;
BEGIN
  SELECT * INTO a FROM public.cbt_attempts WHERE id = _attempt AND user_id = _uid;
  IF a.id IS NULL THEN RAISE EXCEPTION 'Attempt not found'; END IF;
  IF a.status <> 'in_progress' THEN RAISE EXCEPTION 'This attempt is already submitted'; END IF;
  IF now() > a.deadline + interval '30 seconds' THEN RAISE EXCEPTION 'Time is up'; END IF;
  SELECT * INTO q FROM public.cbt_questions WHERE id = _question AND exam_id = a.exam_id;
  IF q.id IS NULL THEN RAISE EXCEPTION 'Invalid question'; END IF;
  _sel := public.cbt_sorted(_selected); _n := jsonb_array_length(q.options);
  IF EXISTS (SELECT 1 FROM unnest(_sel) x WHERE x < 0 OR x >= _n) THEN RAISE EXCEPTION 'Invalid option'; END IF;
  IF NOT q.multi AND cardinality(_sel) > 1 THEN RAISE EXCEPTION 'Only one option allowed'; END IF;
  INSERT INTO public.cbt_responses (attempt_id, question_id, selected, marked, updated_at)
  VALUES (a.id, q.id, _sel, COALESCE(_marked, false), now())
  ON CONFLICT (attempt_id, question_id) DO UPDATE SET selected = EXCLUDED.selected, marked = EXCLUDED.marked, updated_at = now()
  RETURNING updated_at INTO _t;
  RETURN _t;
END $$;

CREATE OR REPLACE FUNCTION public.cbt_submit(_attempt uuid) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := public.cbt_require_user(); _st text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.cbt_attempts WHERE id = _attempt AND user_id = _uid) THEN RAISE EXCEPTION 'Attempt not found'; END IF;
  PERFORM public.cbt_finalize(_attempt, false);
  SELECT status INTO _st FROM public.cbt_attempts WHERE id = _attempt;
  RETURN _st;
END $$;

CREATE OR REPLACE FUNCTION public.cbt_get_result(_attempt uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := public.cbt_require_user(); a public.cbt_attempts; e public.cbt_exams; res public.cbt_results; _adm boolean := public.is_admin(auth.uid());
BEGIN
  SELECT * INTO a FROM public.cbt_attempts WHERE id = _attempt AND (user_id = _uid OR _adm);
  IF a.id IS NULL THEN RAISE EXCEPTION 'Attempt not found'; END IF;
  IF a.status = 'in_progress' AND now() > a.deadline + interval '30 seconds' THEN
    PERFORM public.cbt_finalize(a.id, true); SELECT * INTO a FROM public.cbt_attempts WHERE id = _attempt;
  END IF;
  SELECT * INTO e FROM public.cbt_exams WHERE id = a.exam_id;
  IF a.status = 'in_progress' THEN RETURN jsonb_build_object('status', 'in_progress', 'title', e.title); END IF;
  IF NOT public.cbt_is_released(e) AND NOT _adm THEN
    RETURN jsonb_build_object('status', 'pending', 'title', e.title, 'submitted_at', a.submitted_at,
      'result_policy', e.result_policy, 'result_release_at', e.result_release_at);
  END IF;
  SELECT * INTO res FROM public.cbt_results WHERE attempt_id = a.id;
  RETURN jsonb_build_object('status', 'released', 'title', e.title, 'subject', e.subject, 'submitted_at', a.submitted_at,
    'result', to_jsonb(res) - 'question_results' - 'user_id',
    'questions', COALESCE((SELECT jsonb_agg(jsonb_build_object(
        'id', q.id, 'text', q.text, 'image_url', q.image_url, 'options', q.options, 'multi', q.multi,
        'selected', COALESCE(r.selected, '{}'),
        'status', qr->>'status', 'marks', (qr->>'marks')::numeric,
        'correct', CASE WHEN e.show_answers OR _adm THEN to_jsonb(k.correct) ELSE NULL END,
        'explanation', CASE WHEN e.show_explanations OR _adm THEN k.explanation ELSE NULL END) ORDER BY q.position)
      FROM public.cbt_questions q
      LEFT JOIN public.cbt_answer_keys k ON k.question_id = q.id
      LEFT JOIN public.cbt_responses r ON r.question_id = q.id AND r.attempt_id = a.id
      LEFT JOIN LATERAL (SELECT x AS qr FROM jsonb_array_elements(res.question_results) x WHERE x->>'question_id' = q.id::text LIMIT 1) z ON true
      WHERE q.exam_id = e.id), '[]'::jsonb));
END $$;

CREATE OR REPLACE FUNCTION public.cbt_publish(_exam uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE e public.cbt_exams; _bad int;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Admins only'; END IF;
  SELECT * INTO e FROM public.cbt_exams WHERE id = _exam FOR UPDATE;
  IF e.id IS NULL THEN RAISE EXCEPTION 'Exam not found'; END IF;
  IF e.status <> 'draft' THEN RAISE EXCEPTION 'Only drafts can be published'; END IF;
  IF length(trim(e.title)) = 0 THEN RAISE EXCEPTION 'Add a title'; END IF;
  IF e.duration_minutes <= 0 THEN RAISE EXCEPTION 'Duration must be more than 0'; END IF;
  IF e.starts_at IS NULL OR e.ends_at IS NULL OR e.ends_at <= e.starts_at THEN RAISE EXCEPTION 'Set a start time before the end time'; END IF;
  IF e.ends_at <= now() THEN RAISE EXCEPTION 'The end time is already in the past'; END IF;
  IF e.max_attempts < 1 THEN RAISE EXCEPTION 'Allow at least 1 attempt'; END IF;
  IF e.result_policy = 'scheduled' AND e.result_release_at IS NULL THEN RAISE EXCEPTION 'Set the result release time'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.cbt_questions WHERE exam_id = _exam) THEN RAISE EXCEPTION 'Add at least one question'; END IF;
  SELECT count(*) INTO _bad FROM public.cbt_questions q LEFT JOIN public.cbt_answer_keys k ON k.question_id = q.id
   WHERE q.exam_id = _exam AND (
     length(trim(q.text)) = 0 AND q.image_url IS NULL
     OR jsonb_array_length(q.options) NOT BETWEEN 2 AND 5
     OR EXISTS (SELECT 1 FROM jsonb_array_elements_text(q.options) o WHERE length(trim(o)) = 0)
     OR k.question_id IS NULL OR cardinality(k.correct) = 0
     OR (NOT q.multi AND cardinality(k.correct) <> 1)
     OR EXISTS (SELECT 1 FROM unnest(k.correct) c WHERE c < 0 OR c >= jsonb_array_length(q.options)));
  IF _bad > 0 THEN RAISE EXCEPTION '% question(s) have empty text/options or a missing/invalid answer key', _bad; END IF;
  PERFORM set_config('cbt.publishing', 'on', true);
  UPDATE public.cbt_exams SET status = 'published', published_at = now() WHERE id = _exam;
  PERFORM set_config('cbt.publishing', 'off', true);
  INSERT INTO public.cbt_audit_events (exam_id, user_id, event) VALUES (_exam, auth.uid(), 'published');
END $$;

CREATE OR REPLACE FUNCTION public.cbt_admin_stats() RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Admins only'; END IF;
  RETURN jsonb_build_object(
    'published', (SELECT count(*) FROM public.cbt_exams WHERE status = 'published'),
    'drafts', (SELECT count(*) FROM public.cbt_exams WHERE status = 'draft'),
    'upcoming', (SELECT count(*) FROM public.cbt_exams WHERE status = 'published' AND starts_at > now()),
    'active', (SELECT count(*) FROM public.cbt_exams WHERE status = 'published' AND starts_at <= now() AND ends_at > now()),
    'completed', (SELECT count(*) FROM public.cbt_exams WHERE status = 'published' AND ends_at <= now()),
    'students', (SELECT count(*) FROM public.profiles),
    'recent', COALESCE((SELECT jsonb_agg(x) FROM (SELECT ev.event, ev.created_at, ex.title, COALESCE(p.display_name,'Student') AS name
        FROM public.cbt_audit_events ev LEFT JOIN public.cbt_exams ex ON ex.id = ev.exam_id LEFT JOIN public.profiles p ON p.id = ev.user_id
        ORDER BY ev.created_at DESC LIMIT 10) x), '[]'::jsonb));
END $$;

CREATE OR REPLACE FUNCTION public.cbt_admin_report(_exam uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE e public.cbt_exams;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Admins only'; END IF;
  SELECT * INTO e FROM public.cbt_exams WHERE id = _exam;
  IF e.id IS NULL THEN RAISE EXCEPTION 'Exam not found'; END IF;
  -- finalize expired attempts of this exam
  PERFORM public.cbt_finalize(a.id, true) FROM public.cbt_attempts a WHERE a.exam_id = _exam AND a.status = 'in_progress' AND now() > a.deadline + interval '30 seconds';
  RETURN jsonb_build_object(
    'eligible', (SELECT count(*) FROM public.profiles p WHERE cardinality(e.eligible_classes) = 0 OR p.class = ANY(e.eligible_classes)),
    'started_students', (SELECT count(DISTINCT user_id) FROM public.cbt_attempts WHERE exam_id = _exam),
    'in_progress', (SELECT count(*) FROM public.cbt_attempts WHERE exam_id = _exam AND status = 'in_progress'),
    'submitted', (SELECT count(*) FROM public.cbt_attempts WHERE exam_id = _exam AND status <> 'in_progress'),
    'results', COALESCE((SELECT jsonb_agg(jsonb_build_object('attempt_id', r.attempt_id, 'name', COALESCE(p.display_name,'Student'), 'class', p.class,
        'attempt_no', a.attempt_no, 'status', a.status, 'submitted_at', a.submitted_at, 'score', r.score, 'max_marks', r.max_marks,
        'percentage', r.percentage, 'accuracy', r.accuracy, 'correct', r.correct, 'wrong', r.wrong, 'unanswered', r.unanswered) ORDER BY r.score DESC)
      FROM public.cbt_results r JOIN public.cbt_attempts a ON a.id = r.attempt_id LEFT JOIN public.profiles p ON p.id = r.user_id WHERE r.exam_id = _exam), '[]'::jsonb),
    'questions', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', q.id, 'position', q.position, 'text', left(q.text, 120),
        'correct', (SELECT count(*) FROM public.cbt_results r, jsonb_array_elements(r.question_results) x WHERE r.exam_id = _exam AND x->>'question_id' = q.id::text AND x->>'status' = 'correct'),
        'wrong', (SELECT count(*) FROM public.cbt_results r, jsonb_array_elements(r.question_results) x WHERE r.exam_id = _exam AND x->>'question_id' = q.id::text AND x->>'status' IN ('wrong','partial')),
        'unanswered', (SELECT count(*) FROM public.cbt_results r, jsonb_array_elements(r.question_results) x WHERE r.exam_id = _exam AND x->>'question_id' = q.id::text AND x->>'status' = 'unanswered')) ORDER BY q.position)
      FROM public.cbt_questions q WHERE q.exam_id = _exam), '[]'::jsonb));
END $$;

REVOKE EXECUTE ON FUNCTION public.cbt_list_exams(), public.cbt_start_attempt(uuid), public.cbt_get_paper(uuid), public.cbt_save_response(uuid, uuid, int[], boolean),
  public.cbt_submit(uuid), public.cbt_get_result(uuid), public.cbt_publish(uuid), public.cbt_admin_stats(), public.cbt_admin_report(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cbt_list_exams(), public.cbt_start_attempt(uuid), public.cbt_get_paper(uuid), public.cbt_save_response(uuid, uuid, int[], boolean),
  public.cbt_submit(uuid), public.cbt_get_result(uuid), public.cbt_publish(uuid), public.cbt_admin_stats(), public.cbt_admin_report(uuid), public.cbt_server_time() TO authenticated;
