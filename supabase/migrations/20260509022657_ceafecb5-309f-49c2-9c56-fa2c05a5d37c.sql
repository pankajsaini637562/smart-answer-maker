DROP TRIGGER IF EXISTS trg_add_group_creator_as_member ON public.groups;
CREATE TRIGGER trg_add_group_creator_as_member
AFTER INSERT ON public.groups
FOR EACH ROW
EXECUTE FUNCTION public.add_group_creator_as_member();