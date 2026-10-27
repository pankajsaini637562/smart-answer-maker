CREATE OR REPLACE FUNCTION public.cbt_attempt_access_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE e public.cbt_exams;
BEGIN
 SELECT * INTO e FROM public.cbt_exams WHERE id=NEW.exam_id;
 IF TG_OP='INSERT' THEN
 IF NOT public.cbt_is_eligible(e,NEW.user_id) OR e.status<>'published' OR now()<e.starts_at OR now()>=e.ends_at THEN RAISE EXCEPTION 'An approved, eligible registration and an open exam are required'; END IF;
 END IF; RETURN NEW;
END $$;
CREATE TRIGGER cbt_attempt_access BEFORE INSERT ON public.cbt_attempts FOR EACH ROW EXECUTE FUNCTION public.cbt_attempt_access_guard();
CREATE OR REPLACE FUNCTION public.cbt_response_access_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE a public.cbt_attempts; e public.cbt_exams;
BEGIN
 SELECT * INTO a FROM public.cbt_attempts WHERE id=NEW.attempt_id FOR UPDATE;
 SELECT * INTO e FROM public.cbt_exams WHERE id=a.exam_id;
 IF a.status<>'in_progress' OR now()>=a.deadline OR e.status<>'published' OR NOT public.cbt_is_eligible(e,a.user_id) THEN RAISE EXCEPTION 'Time expired or exam access withdrawn'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER cbt_response_access BEFORE INSERT OR UPDATE ON public.cbt_responses FOR EACH ROW EXECUTE FUNCTION public.cbt_response_access_guard();
CREATE OR REPLACE FUNCTION public.cbt_start_attempt(_exam uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE uid uuid:=public.cbt_require_user(); e public.cbt_exams; aid uuid; n int;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended(uid::text||_exam::text,0));
 PERFORM public.cbt_finalize_expired(uid);
 SELECT * INTO e FROM public.cbt_exams WHERE id=_exam FOR SHARE;
 IF e.id IS NULL OR e.status<>'published' THEN RAISE EXCEPTION 'This exam is not available'; END IF;
 IF NOT public.cbt_is_eligible(e,uid) THEN RAISE EXCEPTION 'Administrator approval and exam eligibility are required'; END IF;
 IF now()<e.starts_at OR now()>=e.ends_at THEN RAISE EXCEPTION 'The examination window is not open'; END IF;
 SELECT id INTO aid FROM public.cbt_attempts WHERE exam_id=_exam AND user_id=uid AND status='in_progress';
 IF aid IS NOT NULL THEN RETURN aid; END IF;
 SELECT count(*) INTO n FROM public.cbt_attempts WHERE exam_id=_exam AND user_id=uid;
 IF n>=e.max_attempts THEN RAISE EXCEPTION 'You have used all allowed attempts'; END IF;
 INSERT INTO public.cbt_attempts(exam_id,user_id,attempt_no,deadline) VALUES(_exam,uid,n+1,LEAST(now()+make_interval(mins=>e.duration_minutes),e.ends_at)) RETURNING id INTO aid;
 INSERT INTO public.cbt_audit_events(exam_id,attempt_id,user_id,event) VALUES(_exam,aid,uid,'started'); RETURN aid;
END $$;
CREATE OR REPLACE FUNCTION public.cbt_import_questions(_exam uuid,_questions jsonb) RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE q jsonb; qid uuid; sid uuid; pos int; opts jsonb; keys int[]; n int:=0; subject_name text;
BEGIN
 IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Admins only'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.cbt_exams WHERE id=_exam AND status='draft') THEN RAISE EXCEPTION 'Only draft exams can import questions'; END IF;
 IF jsonb_typeof(_questions)<>'array' OR jsonb_array_length(_questions) NOT BETWEEN 1 AND 500 THEN RAISE EXCEPTION 'Import 1 to 500 questions'; END IF;
 SELECT COALESCE(max(position),0) INTO pos FROM public.cbt_questions WHERE exam_id=_exam;
 FOR q IN SELECT value FROM jsonb_array_elements(_questions) LOOP
 opts:=q->'options'; SELECT array_agg(x::int) INTO keys FROM jsonb_array_elements_text(q->'correct') x;
 IF length(trim(q->>'text'))=0 OR jsonb_array_length(opts) NOT BETWEEN 4 AND 5 OR EXISTS(SELECT 1 FROM jsonb_array_elements_text(opts) o WHERE length(trim(o))=0) OR COALESCE(cardinality(keys),0)=0 OR EXISTS(SELECT 1 FROM unnest(keys) k WHERE k<0 OR k>=jsonb_array_length(opts)) OR (NOT COALESCE((q->>'multi')::boolean,false) AND cardinality(keys)<>1) THEN RAISE EXCEPTION 'Invalid question in import'; END IF;
 IF COALESCE((q->>'marks')::numeric,0)<0 OR COALESCE((q->>'negative')::numeric,0)<0 THEN RAISE EXCEPTION 'Marks must not be negative'; END IF;
 sid:=NULL; subject_name:=NULLIF(trim(q->>'subject'),'');
 IF subject_name IS NOT NULL THEN SELECT id INTO sid FROM public.cbt_sections WHERE exam_id=_exam AND name=subject_name LIMIT 1;
 IF sid IS NULL THEN INSERT INTO public.cbt_sections(exam_id,name,position) VALUES(_exam,subject_name,(SELECT count(*) FROM public.cbt_sections WHERE exam_id=_exam)) RETURNING id INTO sid; END IF; END IF;
 pos:=pos+1;
 INSERT INTO public.cbt_questions(exam_id,section_id,position,text,options,multi,marks,negative,subject,topic,image_url) VALUES(_exam,sid,pos,q->>'text',opts,COALESCE((q->>'multi')::boolean,false),(q->>'marks')::numeric,(q->>'negative')::numeric,subject_name,q->>'topic',q->>'image_url') RETURNING id INTO qid;
 INSERT INTO public.cbt_answer_keys(question_id,exam_id,correct,explanation) VALUES(qid,_exam,public.cbt_sorted(keys),q->>'explanation'); n:=n+1;
 END LOOP;
 INSERT INTO public.cbt_audit_events(exam_id,user_id,event,details) VALUES(_exam,auth.uid(),'questions_imported',jsonb_build_object('count',n)); RETURN n;
END $$;
REVOKE ALL ON FUNCTION public.cbt_import_questions(uuid,jsonb) FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.cbt_import_questions(uuid,jsonb) TO authenticated;
CREATE OR REPLACE FUNCTION public.cbt_card_access(_exam uuid,_user uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS(SELECT 1 FROM public.cbt_exams e WHERE e.id=_exam AND e.status='published' AND public.cbt_is_eligible(e,_user)) $$;
CREATE POLICY "Valid student card access" ON public.cbt_admit_cards AS RESTRICTIVE FOR SELECT TO authenticated USING(public.is_admin(auth.uid()) OR (NOT revoked AND public.cbt_card_access(exam_id,auth.uid())));
CREATE OR REPLACE FUNCTION public.cbt_bank_guard() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF jsonb_array_length(NEW.options) NOT BETWEEN 4 AND 5 OR cardinality(NEW.correct)=0 OR EXISTS(SELECT 1 FROM unnest(NEW.correct) c WHERE c<0 OR c>=jsonb_array_length(NEW.options)) OR (NOT NEW.multi AND cardinality(NEW.correct)<>1) OR trim(NEW.text)='' THEN RAISE EXCEPTION 'Invalid bank question'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER cbt_bank_validation BEFORE INSERT OR UPDATE ON public.cbt_question_bank FOR EACH ROW EXECUTE FUNCTION public.cbt_bank_guard();