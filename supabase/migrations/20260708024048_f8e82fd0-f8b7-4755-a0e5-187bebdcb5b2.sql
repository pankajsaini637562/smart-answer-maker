CREATE OR REPLACE FUNCTION public.lookup_referrer_by_code(_code text)
RETURNS TABLE(id uuid, display_name text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, COALESCE(NULLIF(p.display_name, ''), 'a friend') AS display_name
  FROM public.profiles p
  WHERE p.referral_code = upper(_code)
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.lookup_referrer_by_code(text) TO anon, authenticated;