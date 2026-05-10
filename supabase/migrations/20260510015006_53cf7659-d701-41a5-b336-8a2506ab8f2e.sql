-- Add new columns to groups
ALTER TABLE public.groups
  ADD COLUMN IF NOT EXISTS description text DEFAULT '',
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT true;

-- Replace SELECT policy to also allow public discovery
DROP POLICY IF EXISTS "Creators and members can view their groups" ON public.groups;
CREATE POLICY "View public groups or own groups"
ON public.groups
FOR SELECT
TO anon, authenticated
USING (
  is_public = true
  OR auth.uid() = created_by
  OR public.is_group_member(id, auth.uid())
);

-- Allow creator to update their group (name/desc/avatar/public flag)
DROP POLICY IF EXISTS "Creator can update their group" ON public.groups;
CREATE POLICY "Creator can update their group"
ON public.groups
FOR UPDATE
TO anon, authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- Member count helper (security definer to bypass RLS on group_members)
CREATE OR REPLACE FUNCTION public.group_member_count(_group_id uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::int FROM public.group_members WHERE group_id = _group_id;
$$;

GRANT EXECUTE ON FUNCTION public.group_member_count(uuid) TO anon, authenticated;