CREATE OR REPLACE FUNCTION public.group_member_count(_group_id uuid)
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _is_public boolean;
BEGIN
  SELECT is_public INTO _is_public FROM public.groups WHERE id = _group_id;

  -- Hide existence and counts of private groups from non-members
  IF _is_public IS NULL THEN
    RETURN 0;
  END IF;

  IF NOT _is_public AND NOT public.is_group_member(_group_id, auth.uid()) THEN
    RETURN 0;
  END IF;

  RETURN (SELECT COUNT(*)::int FROM public.group_members WHERE group_id = _group_id);
END;
$function$;