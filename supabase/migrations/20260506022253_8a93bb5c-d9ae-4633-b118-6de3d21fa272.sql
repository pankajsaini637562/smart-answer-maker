
-- GROUPS
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- GROUP MEMBERS
CREATE TABLE public.group_members (
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL DEFAULT 'Student',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- MESSAGES
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL DEFAULT 'Student',
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_messages_group_created ON public.messages(group_id, created_at);

-- Helper: is_group_member (security definer to avoid recursive RLS)
CREATE OR REPLACE FUNCTION public.is_group_member(_group_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = _group_id AND user_id = _user_id
  );
$$;

-- Trigger: auto-add creator as member
CREATE OR REPLACE FUNCTION public.add_group_creator_as_member()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  creator_name TEXT;
BEGIN
  SELECT display_name INTO creator_name FROM public.profiles WHERE id = NEW.created_by;
  INSERT INTO public.group_members (group_id, user_id, user_name)
  VALUES (NEW.id, NEW.created_by, COALESCE(creator_name, 'Student'))
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_group_created
AFTER INSERT ON public.groups
FOR EACH ROW EXECUTE FUNCTION public.add_group_creator_as_member();

-- RLS POLICIES

-- groups: members can read; anyone authed can create; creator can delete
CREATE POLICY "Members can view their groups"
ON public.groups FOR SELECT TO authenticated, anon
USING (public.is_group_member(id, auth.uid()));

CREATE POLICY "Authenticated users can create groups"
ON public.groups FOR INSERT TO authenticated, anon
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creator can delete their group"
ON public.groups FOR DELETE TO authenticated, anon
USING (auth.uid() = created_by);

-- group_members: members of a group can see other members; users can add/remove themselves
CREATE POLICY "Members can view co-members"
ON public.group_members FOR SELECT TO authenticated, anon
USING (public.is_group_member(group_id, auth.uid()));

CREATE POLICY "Users can join groups themselves"
ON public.group_members FOR INSERT TO authenticated, anon
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups themselves"
ON public.group_members FOR DELETE TO authenticated, anon
USING (auth.uid() = user_id);

-- messages: only members can read; only members can send (as themselves)
CREATE POLICY "Members can read messages"
ON public.messages FOR SELECT TO authenticated, anon
USING (public.is_group_member(group_id, auth.uid()));

CREATE POLICY "Members can send messages"
ON public.messages FOR INSERT TO authenticated, anon
WITH CHECK (
  auth.uid() = user_id
  AND public.is_group_member(group_id, auth.uid())
);

CREATE POLICY "Senders can delete own messages"
ON public.messages FOR DELETE TO authenticated, anon
USING (auth.uid() = user_id);

-- Realtime
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.groups REPLICA IDENTITY FULL;
ALTER TABLE public.group_members REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.groups;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_members;
