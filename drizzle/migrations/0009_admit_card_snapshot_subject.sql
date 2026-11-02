CREATE OR REPLACE FUNCTION public.cbt_generate_cards(_exam uuid, _users uuid[] DEFAULT NULL::uuid[])
 RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE e public.cbt_exams; s public.cbt_students; n int:=0; v int; org jsonb;
BEGIN
 IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Admins only'; END IF;
 SELECT * INTO e FROM public.cbt_exams WHERE id=_exam FOR UPDATE;
 IF e.id IS NULL OR e.status<>'published' THEN RAISE EXCEPTION 'Publish the exam first'; END IF;
 SELECT to_jsonb(o) INTO org FROM public.cbt_organization o LIMIT 1;
 FOR s IN SELECT * FROM public.cbt_students WHERE (_users IS NULL OR user_id=ANY(_users)) AND public.cbt_is_eligible(e,user_id) LOOP
 SELECT COALESCE(max(version),0)+1 INTO v FROM public.cbt_admit_cards WHERE exam_id=_exam AND user_id=s.user_id;
 UPDATE public.cbt_admit_cards SET revoked=true WHERE exam_id=_exam AND user_id=s.user_id AND NOT revoked;
 INSERT INTO public.cbt_admit_cards(exam_id,user_id,version,generated_by,snapshot) VALUES(_exam,s.user_id,v,auth.uid(),jsonb_build_object('student',to_jsonb(s)-'admin_note'-'reviewed_by','exam',jsonb_build_object('title',e.title,'code',e.code,'subject',e.subject,'starts_at',e.starts_at,'ends_at',e.ends_at,'reporting_at',e.reporting_at,'duration_minutes',e.duration_minutes,'instructions',e.instructions),'organization',org,'photo_url',CASE WHEN COALESCE((org->>'show_student_photo')::boolean,false) THEN (SELECT avatar_url FROM public.profiles WHERE id=s.user_id) ELSE NULL END));
 INSERT INTO public.cbt_notifications(user_id,title,body,exam_id) VALUES(s.user_id,'Admit card available',e.title,_exam); n:=n+1;
 END LOOP;
 INSERT INTO public.cbt_audit_events(exam_id,user_id,event,details) VALUES(_exam,auth.uid(),'admit_cards_generated',jsonb_build_object('count',n)); RETURN n;
END $function$;