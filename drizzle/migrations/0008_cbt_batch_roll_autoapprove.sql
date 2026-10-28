CREATE OR REPLACE FUNCTION public.cbt_assign_roll() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE code text; n int;
BEGIN
  code := upper(left(regexp_replace(COALESCE(NEW.batch,''),'[^A-Za-z0-9]','','g'),10));
  IF code = '' THEN code := 'CBT'; END IF;
  PERFORM pg_advisory_xact_lock(hashtext('cbt_roll:'||code));
  SELECT COALESCE(max((substring(roll_number from length(code)+2))::int),0)+1 INTO n
    FROM public.cbt_students WHERE roll_number ~ ('^'||code||'-[0-9]+$');
  NEW.roll_number := code||'-'||lpad(n::text,4,'0');
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS cbt_assign_roll ON public.cbt_students;
CREATE TRIGGER cbt_assign_roll BEFORE INSERT ON public.cbt_students FOR EACH ROW EXECUTE FUNCTION public.cbt_assign_roll();

CREATE OR REPLACE FUNCTION public.cbt_register(_details jsonb)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE uid uuid:=public.cbt_require_user(); s public.cbt_students; field text;
BEGIN
 IF EXISTS(SELECT 1 FROM public.cbt_students WHERE user_id=uid) THEN RAISE EXCEPTION 'You already have a CBT registration'; END IF;
 FOREACH field IN ARRAY ARRAY['full_name','class','stream','institute','academic_session','batch','city'] LOOP
 IF length(trim(COALESCE(_details->>field,'')))=0 OR length(_details->>field)>200 THEN RAISE EXCEPTION 'Complete all required registration details'; END IF;
 END LOOP;
 IF length(trim(COALESCE(_details->'extra_details'->>'username','')))=0 OR length(_details->'extra_details'->>'username')>60 THEN RAISE EXCEPTION 'Enter a user name'; END IF;
 INSERT INTO public.cbt_students(user_id,full_name,class,stream,institute,academic_session,batch,guardian_name,school,course,city,extra_details,status,reviewed_at)
 VALUES(uid,trim(_details->>'full_name'),trim(_details->>'class'),trim(_details->>'stream'),trim(_details->>'institute'),trim(_details->>'academic_session'),trim(_details->>'batch'),NULLIF(trim(_details->>'guardian_name'),''),NULLIF(trim(_details->>'school'),''),NULLIF(trim(_details->>'course'),''),trim(_details->>'city'),jsonb_build_object('username',trim(_details->'extra_details'->>'username')),'approved',now()) RETURNING * INTO s;
 INSERT INTO public.cbt_notifications(user_id,title,body) VALUES(uid,'Registration approved','Your roll number is '||s.roll_number||'. Use it with your password to sign in.');
 INSERT INTO public.cbt_audit_events(user_id,event,details) VALUES(uid,'registration_auto_approved',jsonb_build_object('roll_number',s.roll_number));
 RETURN to_jsonb(s);
END $function$;