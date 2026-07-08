CREATE OR REPLACE FUNCTION public.on_purchase_approved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    IF NEW.receipt_no IS NULL THEN
      NEW.receipt_no := 'RCP-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(md5(NEW.id::text),1,6));
    END IF;
    IF NEW.approved_at IS NULL THEN NEW.approved_at := now(); END IF;

    -- Mark buyer's unused referral credits as consumed by this purchase
    UPDATE public.referral_credits
       SET used_purchase_id = NEW.id
     WHERE user_id = NEW.user_id
       AND used_purchase_id IS NULL;

    IF NEW.referrer_user_id IS NOT NULL AND NEW.final_amount_inr > 0 THEN
      INSERT INTO public.referral_credits (user_id, source_purchase_id, percent)
      VALUES (NEW.referrer_user_id, NEW.id, 10);
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;