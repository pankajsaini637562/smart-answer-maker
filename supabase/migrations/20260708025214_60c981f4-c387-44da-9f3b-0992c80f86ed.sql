
CREATE OR REPLACE FUNCTION public.grant_referrer_credit_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.referred_by IS NOT NULL
     AND (TG_OP = 'INSERT' OR OLD.referred_by IS DISTINCT FROM NEW.referred_by)
     AND NEW.referred_by <> NEW.id THEN
    -- Only grant one signup-based credit per (referrer, referred friend) pair
    IF NOT EXISTS (
      SELECT 1 FROM public.referral_credits
      WHERE user_id = NEW.referred_by
        AND source_signup_user_id = NEW.id
    ) THEN
      INSERT INTO public.referral_credits (user_id, source_signup_user_id, percent)
      VALUES (NEW.referred_by, NEW.id, 50);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Add column to track signup-sourced credits (separate from purchase-sourced ones)
ALTER TABLE public.referral_credits
  ADD COLUMN IF NOT EXISTS source_signup_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS referral_credits_unique_signup
  ON public.referral_credits (user_id, source_signup_user_id)
  WHERE source_signup_user_id IS NOT NULL;

DROP TRIGGER IF EXISTS trg_grant_referrer_credit_ins ON public.profiles;
CREATE TRIGGER trg_grant_referrer_credit_ins
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.grant_referrer_credit_on_signup();

DROP TRIGGER IF EXISTS trg_grant_referrer_credit_upd ON public.profiles;
CREATE TRIGGER trg_grant_referrer_credit_upd
AFTER UPDATE OF referred_by ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.grant_referrer_credit_on_signup();

-- Backfill: grant credits for existing referred users who haven't triggered it yet
INSERT INTO public.referral_credits (user_id, source_signup_user_id, percent)
SELECT p.referred_by, p.id, 50
FROM public.profiles p
WHERE p.referred_by IS NOT NULL
  AND p.referred_by <> p.id
  AND NOT EXISTS (
    SELECT 1 FROM public.referral_credits rc
    WHERE rc.user_id = p.referred_by AND rc.source_signup_user_id = p.id
  );
