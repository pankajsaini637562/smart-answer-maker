DROP TRIGGER IF EXISTS add_group_creator_as_member_trigger ON public.groups;
DROP TRIGGER IF EXISTS on_group_created ON public.groups;
DROP TRIGGER IF EXISTS trg_add_group_creator_as_member ON public.groups;

CREATE TRIGGER add_group_creator_as_member_trigger
AFTER INSERT ON public.groups
FOR EACH ROW
EXECUTE FUNCTION public.add_group_creator_as_member();