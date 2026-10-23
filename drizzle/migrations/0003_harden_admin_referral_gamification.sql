-- 1. Admin status from user_roles, not unverified email
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::public.app_role
FROM public.admin_emails ae JOIN auth.users u ON lower(u.email) = lower(ae.email)
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.is_admin(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$ SELECT public.has_role(_uid, 'admin'::public.app_role) $$;

-- 2. Referrer can only be set once, shortly after signup, never to yourself
CREATE OR REPLACE FUNCTION public.guard_profile_referral()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF current_user IN ('postgres','service_role','supabase_admin') THEN RETURN NEW; END IF;
  IF TG_OP = 'UPDATE' THEN
    NEW.referral_code := OLD.referral_code;
    IF NEW.referred_by IS DISTINCT FROM OLD.referred_by THEN
      IF OLD.referred_by IS NOT NULL
         OR OLD.created_at < now() - interval '1 hour'
         OR NEW.referred_by = NEW.id
         OR NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = NEW.referred_by) THEN
        NEW.referred_by := OLD.referred_by;
      END IF;
    END IF;
  ELSIF TG_OP = 'INSERT' THEN
    IF NEW.referred_by = NEW.id THEN NEW.referred_by := NULL; END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS guard_profile_referral ON public.profiles;
CREATE TRIGGER guard_profile_referral BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.guard_profile_referral();

-- 3. Bound gamification writes
CREATE OR REPLACE FUNCTION public.guard_gamification()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF current_user IN ('postgres','service_role','supabase_admin') THEN RETURN NEW; END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.xp := LEAST(GREATEST(NEW.xp, 0), 1500);
    NEW.level := LEAST(GREATEST(NEW.level, 1), 3);
    NEW.streak := LEAST(GREATEST(NEW.streak, 0), 1);
  ELSE
    IF OLD.updated_at > now() - interval '30 seconds' AND NEW.xp > OLD.xp THEN
      NEW.xp := OLD.xp;
    END IF;
    NEW.xp := LEAST(GREATEST(NEW.xp, 0), OLD.xp + 800);
    NEW.level := LEAST(GREATEST(NEW.level, 1), OLD.level + 1, 20);
    NEW.streak := LEAST(GREATEST(NEW.streak, 0), OLD.streak + 1);
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS guard_gamification ON public.gamification;
CREATE TRIGGER guard_gamification BEFORE INSERT OR UPDATE ON public.gamification
FOR EACH ROW EXECUTE FUNCTION public.guard_gamification();