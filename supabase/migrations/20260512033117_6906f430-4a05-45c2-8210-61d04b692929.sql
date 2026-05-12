
-- 1. Remove broad profile co-member SELECT, add safe function instead
DROP POLICY IF EXISTS "Group members can view each other profiles" ON public.profiles;

CREATE OR REPLACE FUNCTION public.get_group_member_profiles(_ids uuid[])
RETURNS TABLE(id uuid, display_name text, avatar_url text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.display_name, p.avatar_url
  FROM public.profiles p
  WHERE p.id = ANY(_ids)
    AND (
      p.id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.group_members gm1
        JOIN public.group_members gm2 ON gm1.group_id = gm2.group_id
        WHERE gm1.user_id = auth.uid() AND gm2.user_id = p.id
      )
    );
$$;
REVOKE ALL ON FUNCTION public.get_group_member_profiles(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_group_member_profiles(uuid[]) TO authenticated;

-- 2. Gamification: read-only for users
DROP POLICY IF EXISTS "Users can CRUD own gamification" ON public.gamification;
CREATE POLICY "Users can read own gamification"
  ON public.gamification FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 3. Group invites: only creator can read (RPCs handle invite preview/join)
DROP POLICY IF EXISTS "Anyone can read invites" ON public.group_invites;
CREATE POLICY "Creators can read own invites"
  ON public.group_invites FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

-- 4. Lock down internal SECURITY DEFINER helpers from anon execution
REVOKE EXECUTE ON FUNCTION public.is_group_member(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_group_member(uuid, uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.group_member_count(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.group_member_count(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.join_group_via_invite(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.join_group_via_invite(text, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_group_by_invite(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_group_by_invite(text) TO authenticated;
