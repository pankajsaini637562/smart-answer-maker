-- Allow creators to read groups immediately, even before membership rows are created
DROP POLICY IF EXISTS "Members can view their groups" ON public.groups;

CREATE POLICY "Creators and members can view their groups"
ON public.groups
FOR SELECT
TO anon, authenticated
USING (
  auth.uid() = created_by
  OR public.is_group_member(id, auth.uid())
);

-- Ensure new group creators are always added as members
DROP TRIGGER IF EXISTS add_group_creator_as_member_trigger ON public.groups;

CREATE TRIGGER add_group_creator_as_member_trigger
AFTER INSERT ON public.groups
FOR EACH ROW
EXECUTE FUNCTION public.add_group_creator_as_member();

-- Make sure the helper function can be used by signed-in anonymous/authenticated app users
GRANT EXECUTE ON FUNCTION public.is_group_member(uuid, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.join_group_via_invite(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_group_by_invite(text) TO anon, authenticated;