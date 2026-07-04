
CREATE OR REPLACE FUNCTION public.get_leaderboard(_limit int DEFAULT 100)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  avatar_url text,
  class text,
  country text,
  xp integer,
  level integer,
  streak integer,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    g.id AS user_id,
    COALESCE(NULLIF(p.display_name, ''), 'Student') AS display_name,
    p.avatar_url,
    p.class,
    p.country,
    g.xp,
    g.level,
    g.streak,
    g.updated_at
  FROM public.gamification g
  LEFT JOIN public.profiles p ON p.id = g.id
  WHERE g.xp > 0
  ORDER BY g.xp DESC, g.updated_at ASC
  LIMIT GREATEST(1, LEAST(_limit, 500));
$$;

GRANT EXECUTE ON FUNCTION public.get_leaderboard(int) TO anon, authenticated;
