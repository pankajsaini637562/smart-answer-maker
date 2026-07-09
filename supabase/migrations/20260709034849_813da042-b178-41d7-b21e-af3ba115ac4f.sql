CREATE OR REPLACE FUNCTION public.get_leaderboard(_limit integer DEFAULT 100)
 RETURNS TABLE(user_id uuid, display_name text, avatar_url text, class text, country text, xp integer, level integer, streak integer, updated_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    p.id AS user_id,
    COALESCE(NULLIF(p.display_name, ''), 'Student') AS display_name,
    p.avatar_url,
    p.class,
    p.country,
    COALESCE(g.xp, 0) AS xp,
    COALESCE(g.level, 1) AS level,
    COALESCE(g.streak, 0) AS streak,
    COALESCE(g.updated_at, p.created_at) AS updated_at
  FROM public.profiles p
  LEFT JOIN public.gamification g ON g.id = p.id
  ORDER BY COALESCE(g.xp, 0) DESC, COALESCE(g.updated_at, p.created_at) ASC
  LIMIT GREATEST(1, LEAST(_limit, 500));
$function$;