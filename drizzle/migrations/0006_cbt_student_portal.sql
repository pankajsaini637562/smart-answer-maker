CREATE SEQUENCE public.cbt_roll_sequence;
CREATE TABLE public.cbt_students (
 user_id uuid PRIMARY KEY REFERENCES public.profiles(id), roll_number text UNIQUE NOT NULL DEFAULT ('STL-' || extract(year FROM now())::int || '-' || lpad(nextval('public.cbt_roll_sequence')::text,6,'0')),
 full_name text NOT NULL, class text NOT NULL, stream text NOT NULL, institute text NOT NULL, academic_session text NOT NULL, batch text NOT NULL,
 guardian_name text, school text, course text, city text, extra_details jsonb NOT NULL DEFAULT '{}', status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','suspended')),
 admin_note text, reviewed_by uuid, reviewed_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cbt_students TO authenticated; GRANT ALL ON public.cbt_students TO service_role;
ALTER TABLE public.cbt_students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own registration or admin" ON public.cbt_students FOR SELECT TO authenticated USING(user_id=auth.uid() OR public.is_admin(auth.uid()));
CREATE TABLE public.cbt_batches(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL UNIQUE, institute text, academic_session text, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT,INSERT,UPDATE,DELETE ON public.cbt_batches TO authenticated; GRANT ALL ON public.cbt_batches TO service_role;
ALTER TABLE public.cbt_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage batches" ON public.cbt_batches FOR ALL TO authenticated USING(public.is_admin(auth.uid())) WITH CHECK(public.is_admin(auth.uid()));
CREATE POLICY "Students see batches" ON public.cbt_batches FOR SELECT TO authenticated USING(auth.uid() IS NOT NULL AND NOT COALESCE((auth.jwt()->>'is_anonymous')::boolean,false));
CREATE TABLE public.cbt_assignments(exam_id uuid REFERENCES public.cbt_exams(id) NOT NULL, user_id uuid REFERENCES public.cbt_students(user_id) NOT NULL, assigned_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(exam_id,user_id));
GRANT SELECT,INSERT,DELETE ON public.cbt_assignments TO authenticated; GRANT ALL ON public.cbt_assignments TO service_role;
ALTER TABLE public.cbt_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage assignments" ON public.cbt_assignments FOR ALL TO authenticated USING(public.is_admin(auth.uid())) WITH CHECK(public.is_admin(auth.uid()));
CREATE POLICY "Own assignments" ON public.cbt_assignments FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE TABLE public.cbt_notifications(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, title text NOT NULL, body text NOT NULL DEFAULT '', exam_id uuid REFERENCES public.cbt_exams(id), read_at timestamptz, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.cbt_notifications TO authenticated; GRANT ALL ON public.cbt_notifications TO service_role;
ALTER TABLE public.cbt_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own notifications" ON public.cbt_notifications FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE TABLE public.cbt_admit_cards(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), exam_id uuid REFERENCES public.cbt_exams(id) NOT NULL, user_id uuid REFERENCES public.cbt_students(user_id) NOT NULL, reference text NOT NULL UNIQUE DEFAULT ('STL-AC-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,16))), version int NOT NULL DEFAULT 1, snapshot jsonb NOT NULL, revoked boolean NOT NULL DEFAULT false, generated_by uuid, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.cbt_admit_cards TO authenticated; GRANT ALL ON public.cbt_admit_cards TO service_role;
ALTER TABLE public.cbt_admit_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own cards or admin" ON public.cbt_admit_cards FOR SELECT TO authenticated USING(user_id=auth.uid() OR public.is_admin(auth.uid()));
CREATE UNIQUE INDEX cbt_current_card ON public.cbt_admit_cards(exam_id,user_id) WHERE NOT revoked;
CREATE TABLE public.cbt_question_bank(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), subject text NOT NULL DEFAULT '', topic text NOT NULL DEFAULT '', text text NOT NULL, options jsonb NOT NULL, correct int[] NOT NULL, multi boolean NOT NULL DEFAULT false, explanation text, image_url text, marks numeric, negative numeric, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT,INSERT,UPDATE,DELETE ON public.cbt_question_bank TO authenticated; GRANT ALL ON public.cbt_question_bank TO service_role;
ALTER TABLE public.cbt_question_bank ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage bank" ON public.cbt_question_bank FOR ALL TO authenticated USING(public.is_admin(auth.uid())) WITH CHECK(public.is_admin(auth.uid()));
CREATE TABLE public.cbt_organization(id boolean PRIMARY KEY DEFAULT true CHECK(id), name text NOT NULL DEFAULT 'SAINI TECHLABS', tagline text NOT NULL DEFAULT 'Analyze. Evaluate. Improve.', logo_url text, extra_fields jsonb NOT NULL DEFAULT '[]', show_student_photo boolean NOT NULL DEFAULT false, qr_enabled boolean NOT NULL DEFAULT false);
GRANT SELECT,INSERT,UPDATE ON public.cbt_organization TO authenticated; GRANT ALL ON public.cbt_organization TO service_role;
ALTER TABLE public.cbt_organization ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage branding" ON public.cbt_organization FOR ALL TO authenticated USING(public.is_admin(auth.uid())) WITH CHECK(public.is_admin(auth.uid()));
CREATE POLICY "Signed in branding" ON public.cbt_organization FOR SELECT TO authenticated USING(auth.uid() IS NOT NULL);
CREATE TABLE public.cbt_login_limits(key text PRIMARY KEY, window_start timestamptz NOT NULL DEFAULT now(), requests int NOT NULL DEFAULT 0);
GRANT ALL ON public.cbt_login_limits TO service_role; ALTER TABLE public.cbt_login_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbt_exams ADD COLUMN code text, ADD COLUMN reporting_at timestamptz, ADD COLUMN eligible_streams text[] NOT NULL DEFAULT '{}', ADD COLUMN eligible_institutes text[] NOT NULL DEFAULT '{}', ADD COLUMN eligible_batches text[] NOT NULL DEFAULT '{}', ADD COLUMN assignment_only boolean NOT NULL DEFAULT false;
CREATE UNIQUE INDEX cbt_exam_code_unique ON public.cbt_exams(lower(code)) WHERE code IS NOT NULL AND code<>'';
ALTER TABLE public.cbt_questions ADD COLUMN subject text, ADD COLUMN topic text;
CREATE OR REPLACE FUNCTION public.cbt_register(_details jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE uid uuid:=public.cbt_require_user(); s public.cbt_students; field text;
BEGIN
 IF EXISTS(SELECT 1 FROM public.cbt_students WHERE user_id=uid) THEN RAISE EXCEPTION 'You already have a CBT registration'; END IF;
 FOREACH field IN ARRAY ARRAY['full_name','class','stream','institute','academic_session','batch'] LOOP
 IF length(trim(COALESCE(_details->>field,'')))=0 OR length(_details->>field)>200 THEN RAISE EXCEPTION 'Complete all required registration details'; END IF;
 END LOOP;
 INSERT INTO public.cbt_students(user_id,full_name,class,stream,institute,academic_session,batch,guardian_name,school,course,city,extra_details)
 VALUES(uid,trim(_details->>'full_name'),trim(_details->>'class'),trim(_details->>'stream'),trim(_details->>'institute'),trim(_details->>'academic_session'),trim(_details->>'batch'),_details->>'guardian_name',_details->>'school',_details->>'course',_details->>'city',COALESCE(_details->'extra_details','{}')) RETURNING * INTO s;
 INSERT INTO public.cbt_notifications(user_id,title,body) VALUES(uid,'Registration received','Your roll number is '||s.roll_number||'. Awaiting administrator approval.');
 INSERT INTO public.cbt_audit_events(user_id,event,details) VALUES(uid,'registration_received',jsonb_build_object('roll_number',s.roll_number));
 RETURN to_jsonb(s);
END $$;
REVOKE ALL ON FUNCTION public.cbt_register(jsonb) FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.cbt_register(jsonb) TO authenticated;
CREATE OR REPLACE FUNCTION public.cbt_review_student(_user uuid,_status text,_note text,_batch text DEFAULT NULL) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Admins only'; END IF;
 IF _status NOT IN ('pending','approved','rejected','suspended') THEN RAISE EXCEPTION 'Invalid status'; END IF;
 UPDATE public.cbt_students SET status=_status,admin_note=_note, batch=COALESCE(NULLIF(trim(_batch),''),batch),reviewed_by=auth.uid(),reviewed_at=now() WHERE user_id=_user;
 IF NOT FOUND THEN RAISE EXCEPTION 'Student not found'; END IF;
 INSERT INTO public.cbt_notifications(user_id,title,body) VALUES(_user,'Registration '||_status,COALESCE(_note,''));
 INSERT INTO public.cbt_audit_events(user_id,event,details) VALUES(auth.uid(),'student_'||_status,jsonb_build_object('student_id',_user));
END $$;
REVOKE ALL ON FUNCTION public.cbt_review_student(uuid,text,text,text) FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.cbt_review_student(uuid,text,text,text) TO authenticated;
CREATE OR REPLACE FUNCTION public.cbt_is_eligible(_e public.cbt_exams,_uid uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT EXISTS(SELECT 1 FROM public.cbt_students s WHERE s.user_id=_uid AND s.status='approved'
 AND (cardinality(_e.eligible_classes)=0 OR s.class=ANY(_e.eligible_classes))
 AND (cardinality(_e.eligible_streams)=0 OR s.stream=ANY(_e.eligible_streams))
 AND (cardinality(_e.eligible_institutes)=0 OR s.institute=ANY(_e.eligible_institutes))
 AND (cardinality(_e.eligible_batches)=0 OR s.batch=ANY(_e.eligible_batches))
 AND (NOT _e.assignment_only OR EXISTS(SELECT 1 FROM public.cbt_assignments a WHERE a.user_id=_uid AND a.exam_id=_e.id)))
$$;
CREATE OR REPLACE FUNCTION public.cbt_assignment_event() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 INSERT INTO public.cbt_notifications(user_id,title,body,exam_id) VALUES(NEW.user_id,'Examination assigned',(SELECT title FROM public.cbt_exams WHERE id=NEW.exam_id),NEW.exam_id);
 INSERT INTO public.cbt_audit_events(exam_id,user_id,event,details) VALUES(NEW.exam_id,auth.uid(),'student_assigned',jsonb_build_object('student_id',NEW.user_id));
 RETURN NEW;
END $$;
CREATE TRIGGER cbt_assignment_notice AFTER INSERT ON public.cbt_assignments FOR EACH ROW EXECUTE FUNCTION public.cbt_assignment_event();
CREATE OR REPLACE FUNCTION public.cbt_notify(_title text,_body text,_users uuid[] DEFAULT NULL,_exam uuid DEFAULT NULL) RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE n int;
BEGIN
 IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Admins only'; END IF;
 IF length(trim(_title))=0 OR length(_title)>200 OR length(_body)>10000 THEN RAISE EXCEPTION 'Invalid announcement'; END IF;
 INSERT INTO public.cbt_notifications(user_id,title,body,exam_id) SELECT s.user_id,_title,_body,_exam FROM public.cbt_students s WHERE (_users IS NULL OR s.user_id=ANY(_users));
 GET DIAGNOSTICS n=ROW_COUNT;
 INSERT INTO public.cbt_audit_events(user_id,event,details) VALUES(auth.uid(),'announcement_sent',jsonb_build_object('recipients',n,'title',_title)); RETURN n;
END $$;
REVOKE ALL ON FUNCTION public.cbt_notify(text,text,uuid[],uuid) FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.cbt_notify(text,text,uuid[],uuid) TO authenticated;
CREATE OR REPLACE FUNCTION public.cbt_read_notification(_id uuid) RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$ UPDATE public.cbt_notifications SET read_at=now() WHERE id=_id AND user_id=auth.uid() $$;
REVOKE ALL ON FUNCTION public.cbt_read_notification(uuid) FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.cbt_read_notification(uuid) TO authenticated;
CREATE OR REPLACE FUNCTION public.cbt_generate_cards(_exam uuid,_users uuid[] DEFAULT NULL) RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE e public.cbt_exams; s public.cbt_students; n int:=0; v int; org jsonb;
BEGIN
 IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Admins only'; END IF;
 SELECT * INTO e FROM public.cbt_exams WHERE id=_exam FOR UPDATE;
 IF e.id IS NULL OR e.status<>'published' THEN RAISE EXCEPTION 'Publish the exam first'; END IF;
 SELECT to_jsonb(o) INTO org FROM public.cbt_organization o LIMIT 1;
 FOR s IN SELECT * FROM public.cbt_students WHERE (_users IS NULL OR user_id=ANY(_users)) AND public.cbt_is_eligible(e,user_id) LOOP
 SELECT COALESCE(max(version),0)+1 INTO v FROM public.cbt_admit_cards WHERE exam_id=_exam AND user_id=s.user_id;
 UPDATE public.cbt_admit_cards SET revoked=true WHERE exam_id=_exam AND user_id=s.user_id AND NOT revoked;
 INSERT INTO public.cbt_admit_cards(exam_id,user_id,version,generated_by,snapshot) VALUES(_exam,s.user_id,v,auth.uid(),jsonb_build_object('student',to_jsonb(s)-'admin_note'-'reviewed_by','exam',jsonb_build_object('title',e.title,'code',e.code,'starts_at',e.starts_at,'ends_at',e.ends_at,'reporting_at',e.reporting_at,'duration_minutes',e.duration_minutes,'instructions',e.instructions),'organization',org,'photo_url',CASE WHEN COALESCE((org->>'show_student_photo')::boolean,false) THEN (SELECT avatar_url FROM public.profiles WHERE id=s.user_id) ELSE NULL END));
 INSERT INTO public.cbt_notifications(user_id,title,body,exam_id) VALUES(s.user_id,'Admit card available',e.title,_exam); n:=n+1;
 END LOOP;
 INSERT INTO public.cbt_audit_events(exam_id,user_id,event,details) VALUES(_exam,auth.uid(),'admit_cards_generated',jsonb_build_object('count',n)); RETURN n;
END $$;
REVOKE ALL ON FUNCTION public.cbt_generate_cards(uuid,uuid[]) FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.cbt_generate_cards(uuid,uuid[]) TO authenticated;
CREATE OR REPLACE FUNCTION public.cbt_verify_card(_reference text) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT COALESCE((SELECT jsonb_build_object('valid',NOT c.revoked AND e.status='published' AND public.cbt_is_eligible(e,c.user_id),'reference',c.reference,'exam',c.snapshot->'exam'->>'title','version',c.version) FROM public.cbt_admit_cards c JOIN public.cbt_exams e ON e.id=c.exam_id WHERE c.reference=_reference),jsonb_build_object('valid',false))
$$;
REVOKE ALL ON FUNCTION public.cbt_verify_card(text) FROM PUBLIC; GRANT EXECUTE ON FUNCTION public.cbt_verify_card(text) TO anon,authenticated;
CREATE OR REPLACE FUNCTION public.cbt_login_allow(_key text) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE n int;
BEGIN
 INSERT INTO public.cbt_login_limits(key,requests) VALUES(_key,1) ON CONFLICT(key) DO UPDATE SET requests=CASE WHEN cbt_login_limits.window_start<now()-interval '15 minutes' THEN 1 ELSE cbt_login_limits.requests+1 END,window_start=CASE WHEN cbt_login_limits.window_start<now()-interval '15 minutes' THEN now() ELSE cbt_login_limits.window_start END RETURNING requests INTO n;
 RETURN n<=10;
END $$;
REVOKE ALL ON FUNCTION public.cbt_login_allow(text) FROM PUBLIC,anon,authenticated; GRANT EXECUTE ON FUNCTION public.cbt_login_allow(text) TO service_role;
CREATE OR REPLACE FUNCTION public.cbt_exam_notice() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE label text;
BEGIN
 IF NEW.status IS DISTINCT FROM OLD.status THEN label:='Examination '||NEW.status;
 ELSIF NEW.starts_at IS DISTINCT FROM OLD.starts_at OR NEW.ends_at IS DISTINCT FROM OLD.ends_at THEN label:='Examination schedule updated';
 ELSIF NEW.results_released IS DISTINCT FROM OLD.results_released AND NEW.results_released THEN label:='Results published'; END IF;
 INSERT INTO public.cbt_audit_events(exam_id,user_id,event,details) VALUES(NEW.id,auth.uid(),'exam_updated',jsonb_build_object('status',NEW.status));
 IF label IS NOT NULL THEN INSERT INTO public.cbt_notifications(user_id,title,body,exam_id) SELECT s.user_id,label,NEW.title,NEW.id FROM public.cbt_students s WHERE public.cbt_is_eligible(NEW,s.user_id); END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER cbt_exam_notifications AFTER UPDATE ON public.cbt_exams FOR EACH ROW EXECUTE FUNCTION public.cbt_exam_notice();
CREATE OR REPLACE FUNCTION public.cbt_eligibility_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF OLD.status<>'draft' AND (NEW.eligible_streams IS DISTINCT FROM OLD.eligible_streams OR NEW.eligible_institutes IS DISTINCT FROM OLD.eligible_institutes OR NEW.eligible_batches IS DISTINCT FROM OLD.eligible_batches OR NEW.assignment_only IS DISTINCT FROM OLD.assignment_only OR NEW.reporting_at IS DISTINCT FROM OLD.reporting_at) THEN RAISE EXCEPTION 'Unpublish before changing eligibility or reporting time'; END IF;
 IF NEW.reporting_at IS NOT NULL AND NEW.starts_at IS NOT NULL AND NEW.reporting_at>NEW.starts_at THEN RAISE EXCEPTION 'Reporting time must not be after start time'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER cbt_extended_exam_guard BEFORE UPDATE ON public.cbt_exams FOR EACH ROW EXECUTE FUNCTION public.cbt_eligibility_guard();