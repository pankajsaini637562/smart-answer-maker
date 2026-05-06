
REVOKE EXECUTE ON FUNCTION public.is_group_member(UUID, UUID) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.add_group_creator_as_member() FROM PUBLIC, anon, authenticated;
