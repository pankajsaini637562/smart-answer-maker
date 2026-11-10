CREATE OR REPLACE FUNCTION public.refresh_gamification()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  _uid uuid := auth.uid();
  _xp integer;
  _level integer;
  _streak integer;
  _last_active text;
  _badges jsonb;
  _exams integer;
  _correct integer;
  _perfect integer;
  _result jsonb;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  WITH own_results AS (
    SELECT r.total_questions, r.correct, r.accuracy, r.time_spent, r.completed_at
    FROM public.results r
    WHERE r.user_id = _uid
  ),
  totals AS (
    SELECT
      count(*)::integer AS exams,
      COALESCE(sum(correct), 0)::integer AS correct_answers,
      count(*) FILTER (WHERE accuracy = 100 AND total_questions >= 5)::integer AS perfect_scores,
      COALESCE(sum(
        10 + correct * 5
        + CASE
            WHEN accuracy >= 90 THEN 50
            WHEN accuracy >= 70 THEN 30
            WHEN accuracy >= 50 THEN 15
            ELSE 0
          END
        + CASE WHEN accuracy = 100 AND total_questions >= 5 THEN 100 ELSE 0 END
        + CASE
            WHEN total_questions > 0 AND time_spent / total_questions < 30 THEN 20
            WHEN total_questions > 0 AND time_spent / total_questions < 60 THEN 10
            ELSE 0
          END
      ), 0)::integer AS total_xp,
      max(completed_at::date) AS last_day
    FROM own_results
  ),
  practice_days AS (
    SELECT DISTINCT completed_at::date AS day FROM own_results
  ),
  grouped_days AS (
    SELECT day, day - (row_number() OVER (ORDER BY day))::integer AS grp
    FROM practice_days
  ),
  streak_windows AS (
    SELECT max(day) AS last_day, count(*)::integer AS length
    FROM grouped_days
    GROUP BY grp
  )
  SELECT
    t.total_xp,
    COALESCE((
      SELECT s.length FROM streak_windows s
      WHERE s.last_day >= CURRENT_DATE - 1
      ORDER BY s.last_day DESC LIMIT 1
    ), 0),
    t.last_day::text,
    t.exams,
    t.correct_answers,
    t.perfect_scores
  INTO _xp, _streak, _last_active, _exams, _correct, _perfect
  FROM totals t;

  SELECT count(*)::integer INTO _level
  FROM unnest(ARRAY[0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 4000, 5000, 6500, 8000, 10000, 12500, 15000, 18000, 22000, 27000, 33000]) AS threshold(value)
  WHERE _xp >= threshold.value;

  WITH earned AS (
    SELECT id FROM (VALUES
      ('first-exam', _exams >= 1),
      ('five-exams', _exams >= 5),
      ('ten-exams', _exams >= 10),
      ('perfect-score', _perfect >= 1),
      ('streak-3', _streak >= 3),
      ('streak-7', _streak >= 7),
      ('streak-30', _streak >= 30),
      ('xp-1000', _xp >= 1000),
      ('xp-5000', _xp >= 5000),
      ('correct-100', _correct >= 100),
      ('level-5', _level >= 5),
      ('level-10', _level >= 10)
    ) AS badge(id, unlocked)
    WHERE unlocked
  )
  SELECT COALESCE(jsonb_agg(id), '[]'::jsonb) INTO _badges FROM earned;

  INSERT INTO public.gamification (id, xp, level, streak, last_active_date, badges, updated_at)
  VALUES (_uid, _xp, _level, _streak, _last_active, _badges, now())
  ON CONFLICT (id) DO UPDATE SET
    xp = EXCLUDED.xp,
    level = EXCLUDED.level,
    streak = EXCLUDED.streak,
    last_active_date = EXCLUDED.last_active_date,
    badges = EXCLUDED.badges,
    updated_at = now();

  SELECT to_jsonb(g) INTO _result FROM public.gamification g WHERE g.id = _uid;
  RETURN _result;
END;
$$;

DROP POLICY IF EXISTS "Users can insert their own gamification" ON public.gamification;
DROP POLICY IF EXISTS "Users can update their own gamification" ON public.gamification;
REVOKE INSERT, UPDATE ON public.gamification FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.refresh_gamification() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.refresh_gamification() TO authenticated;