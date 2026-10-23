CREATE OR REPLACE FUNCTION public.enforce_purchase_insert_integrity()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  _price int; _referred_by uuid; _paid_count int;
  _credit_pct int := 0; _welcome_pct int := 0; _final_pct int := 0;
BEGIN
  NEW.status := 'pending'; NEW.approved_by := NULL; NEW.approved_at := NULL;
  NEW.receipt_no := NULL; NEW.admin_note := NULL;
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Must be signed in'; END IF;
  NEW.user_id := auth.uid();
  SELECT price_inr INTO _price FROM public.materials WHERE id = NEW.material_id;
  IF _price IS NULL THEN RAISE EXCEPTION 'Invalid material'; END IF;
  NEW.amount_inr := _price;
  SELECT referred_by INTO _referred_by FROM public.profiles WHERE id = NEW.user_id;
  SELECT count(*) INTO _paid_count FROM public.purchases
    WHERE user_id = NEW.user_id AND status IN ('approved','pending');
  IF _referred_by IS NOT NULL AND _paid_count = 0 THEN
    _welcome_pct := 50; NEW.referrer_user_id := _referred_by;
  ELSE
    NEW.referrer_user_id := NULL;
  END IF;
  -- Use only ONE unused coupon (oldest) per purchase, and only if the welcome discount isn't already applied
  IF _welcome_pct = 0 THEN
    SELECT percent INTO _credit_pct FROM public.referral_credits
      WHERE user_id = NEW.user_id AND used_purchase_id IS NULL
      ORDER BY created_at ASC LIMIT 1;
    _credit_pct := COALESCE(_credit_pct, 0);
  END IF;
  _final_pct := LEAST(_welcome_pct + _credit_pct, 50);
  NEW.discount_percent := _final_pct;
  NEW.final_amount_inr := GREATEST(1, ROUND(_price * (100 - _final_pct) / 100.0)::int);
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.on_purchase_approved()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    IF NEW.receipt_no IS NULL THEN
      NEW.receipt_no := 'RCP-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(md5(NEW.id::text),1,6));
    END IF;
    IF NEW.approved_at IS NULL THEN NEW.approved_at := now(); END IF;
    -- Consume exactly one coupon, only if this purchase used one (no welcome discount)
    IF NEW.discount_percent > 0 AND NEW.referrer_user_id IS NULL THEN
      UPDATE public.referral_credits SET used_purchase_id = NEW.id
       WHERE id = (SELECT id FROM public.referral_credits
                    WHERE user_id = NEW.user_id AND used_purchase_id IS NULL
                    ORDER BY created_at ASC LIMIT 1);
    END IF;
    IF NEW.referrer_user_id IS NOT NULL AND NEW.final_amount_inr > 0 THEN
      INSERT INTO public.referral_credits (user_id, source_purchase_id, percent)
      VALUES (NEW.referrer_user_id, NEW.id, 10);
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;