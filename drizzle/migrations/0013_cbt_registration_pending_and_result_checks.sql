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
 INSERT INTO public.cbt_students(user_id,full_name,class,stream,institute,academic_session,batch,guardian_name,school,course,city,extra_details,status)
 VALUES(uid,trim(_details->>'full_name'),trim(_details->>'class'),trim(_details->>'stream'),trim(_details->>'institute'),trim(_details->>'academic_session'),trim(_details->>'batch'),NULLIF(trim(_details->>'guardian_name'),''),NULLIF(trim(_details->>'school'),''),NULLIF(trim(_details->>'course'),''),trim(_details->>'city'),jsonb_build_object('username',trim(_details->'extra_details'->>'username')),'pending') RETURNING * INTO s;
 INSERT INTO public.cbt_notifications(user_id,title,body) VALUES(uid,'Registration received','Your roll number is '||s.roll_number||'. An administrator will review your registration.');
 INSERT INTO public.cbt_audit_events(user_id,event,details) VALUES(uid,'registration_submitted',jsonb_build_object('roll_number',s.roll_number));
 RETURN to_jsonb(s);
END $function$;

CREATE OR REPLACE FUNCTION public.validate_result_row()
 RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $$
BEGIN
 IF NEW.total_questions < 0 OR NEW.total_questions > 500
    OR NEW.correct < 0 OR NEW.wrong < 0 OR NEW.unattempted < 0
    OR NEW.correct + NEW.wrong + NEW.unattempted <> NEW.total_questions
    OR NEW.max_score < 0 OR NEW.score > NEW.max_score
    OR NEW.time_spent < 0
    OR abs(NEW.accuracy - CASE WHEN NEW.correct+NEW.wrong>0 THEN NEW.correct*100.0/(NEW.correct+NEW.wrong) ELSE 0 END) > 1
    OR NOT EXISTS (SELECT 1 FROM public.attempts a WHERE a.id=NEW.attempt_id AND a.user_id=NEW.user_id AND a.sheet_id=NEW.sheet_id) THEN
   RAISE EXCEPTION 'Invalid result data';
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS validate_result_row ON public.results;
CREATE TRIGGER validate_result_row BEFORE INSERT OR UPDATE ON public.results FOR EACH ROW EXECUTE FUNCTION public.validate_result_row();