
-- 1) Restrict admin_emails SELECT to admins only
DROP POLICY IF EXISTS "Anyone authenticated can read admin emails list" ON public.admin_emails;
CREATE POLICY "Only admins can read admin emails list"
  ON public.admin_emails FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

-- 2) Fix mutable search_path on touch_updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
