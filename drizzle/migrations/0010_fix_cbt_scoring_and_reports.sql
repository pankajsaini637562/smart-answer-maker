ALTER TABLE public.cbt_exams
  ADD CONSTRAINT cbt_exams_nonnegative_marking CHECK (marks_correct >= 0 AND marks_wrong >= 0);
ALTER TABLE public.cbt_questions
  ADD CONSTRAINT cbt_questions_nonnegative_marking CHECK ((marks IS NULL OR marks >= 0) AND (negative IS NULL OR negative >= 0));
ALTER TABLE public.cbt_question_bank
  ADD CONSTRAINT cbt_bank_nonnegative_marking CHECK ((marks IS NULL OR marks >= 0) AND (negative IS NULL OR negative >= 0));

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
    _mc := COALESCE(r.marks, e.marks_correct); _mw := abs(COALESCE(r.negative, e.marks_wrong));
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

CREATE OR REPLACE FUNCTION public.cbt_admin_report(_exam uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE e public.cbt_exams;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Admins only'; END IF;
  SELECT * INTO e FROM public.cbt_exams WHERE id = _exam;
  IF e.id IS NULL THEN RAISE EXCEPTION 'Exam not found'; END IF;
  PERFORM public.cbt_finalize(a.id, true) FROM public.cbt_attempts a WHERE a.exam_id = _exam AND a.status = 'in_progress' AND now() > a.deadline + interval '30 seconds';
  RETURN jsonb_build_object(
    'eligible', (SELECT count(*) FROM public.cbt_students s WHERE public.cbt_is_eligible(e, s.user_id)),
    'started_students', (SELECT count(DISTINCT user_id) FROM public.cbt_attempts WHERE exam_id = _exam),
    'in_progress', (SELECT count(*) FROM public.cbt_attempts WHERE exam_id = _exam AND status = 'in_progress'),
    'submitted', (SELECT count(*) FROM public.cbt_attempts WHERE exam_id = _exam AND status <> 'in_progress'),
    'results', COALESCE((SELECT jsonb_agg(jsonb_build_object('attempt_id', r.attempt_id, 'name', COALESCE(s.full_name, p.display_name, 'Student'), 'class', COALESCE(s.class, p.class),
        'attempt_no', a.attempt_no, 'status', a.status, 'submitted_at', a.submitted_at, 'score', r.score, 'max_marks', r.max_marks,
        'percentage', r.percentage, 'accuracy', r.accuracy, 'correct', r.correct, 'wrong', r.wrong, 'unanswered', r.unanswered) ORDER BY r.score DESC)
      FROM public.cbt_results r
      JOIN public.cbt_attempts a ON a.id = r.attempt_id
      LEFT JOIN public.cbt_students s ON s.user_id = r.user_id
      LEFT JOIN public.profiles p ON p.id = r.user_id
      WHERE r.exam_id = _exam), '[]'::jsonb),
    'questions', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', q.id, 'position', q.position, 'text', left(q.text, 120),
        'correct', (SELECT count(*) FROM public.cbt_results r, jsonb_array_elements(r.question_results) x WHERE r.exam_id = _exam AND x->>'question_id' = q.id::text AND x->>'status' = 'correct'),
        'wrong', (SELECT count(*) FROM public.cbt_results r, jsonb_array_elements(r.question_results) x WHERE r.exam_id = _exam AND x->>'question_id' = q.id::text AND x->>'status' IN ('wrong','partial')),
        'unanswered', (SELECT count(*) FROM public.cbt_results r, jsonb_array_elements(r.question_results) x WHERE r.exam_id = _exam AND x->>'question_id' = q.id::text AND x->>'status' = 'unanswered')) ORDER BY q.position)
      FROM public.cbt_questions q WHERE q.exam_id = _exam), '[]'::jsonb));
END $$;
REVOKE ALL ON FUNCTION public.cbt_admin_report(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cbt_admin_report(uuid) TO authenticated;