
-- 1) BEFORE INSERT trigger on purchases
CREATE OR REPLACE FUNCTION public.enforce_purchase_insert_integrity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _price int;
  _referred_by uuid;
  _paid_count int;
  _credit_pct int := 0;
  _welcome_pct int := 0;
  _final_pct int := 0;
BEGIN
  NEW.status := 'pending';
  NEW.approved_by := NULL;
  NEW.approved_at := NULL;
  NEW.receipt_no := NULL;
  NEW.admin_note := NULL;

  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Must be signed in';
  END IF;
  NEW.user_id := auth.uid();

  SELECT price_inr INTO _price FROM public.materials WHERE id = NEW.material_id;
  IF _price IS NULL THEN
    RAISE EXCEPTION 'Invalid material';
  END IF;
  NEW.amount_inr := _price;

  SELECT referred_by INTO _referred_by FROM public.profiles WHERE id = NEW.user_id;
  SELECT count(*) INTO _paid_count FROM public.purchases
    WHERE user_id = NEW.user_id AND status IN ('approved','pending');

  IF _referred_by IS NOT NULL AND _paid_count = 0 THEN
    _welcome_pct := 50;
    NEW.referrer_user_id := _referred_by;
  ELSE
    NEW.referrer_user_id := NULL;
  END IF;

  SELECT COALESCE(SUM(percent), 0) INTO _credit_pct
    FROM public.referral_credits
    WHERE user_id = NEW.user_id AND used_purchase_id IS NULL;

  _final_pct := LEAST(_welcome_pct + _credit_pct, 50);
  NEW.discount_percent := _final_pct;
  NEW.final_amount_inr := GREATEST(1, ROUND(_price * (100 - _final_pct) / 100.0)::int);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_purchase_insert ON public.purchases;
CREATE TRIGGER trg_enforce_purchase_insert
BEFORE INSERT ON public.purchases
FOR EACH ROW EXECUTE FUNCTION public.enforce_purchase_insert_integrity();

-- 2) Enforce safe MIME types on payment-proofs uploads via storage.objects INSERT policy
DROP POLICY IF EXISTS "Users can upload payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "payment_proofs_insert" ON storage.objects;

CREATE POLICY "payment_proofs_insert_safe_images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'payment-proofs'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND lower(COALESCE(metadata->>'mimetype', '')) IN ('image/jpeg','image/png','image/webp')
  AND lower(right(name, 5)) NOT IN ('.svg','.html','.htm ') 
  AND lower(right(name, 4)) NOT IN ('.svg','.htm','.js ','.xml')
);
