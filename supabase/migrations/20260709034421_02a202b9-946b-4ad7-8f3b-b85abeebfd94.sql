CREATE OR REPLACE FUNCTION public.get_my_referrer_code()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.referral_code
  FROM public.profiles p
  JOIN public.profiles r ON r.id = p.referred_by
  WHERE p.id = auth.uid()
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_referrer_code() TO authenticated;