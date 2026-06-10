
-- 1) Restrict group_members self-insert to public groups only
DROP POLICY IF EXISTS "Users can join groups themselves" ON public.group_members;

CREATE POLICY "Users can join public groups themselves"
ON public.group_members
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.groups g
    WHERE g.id = group_id AND g.is_public = true
  )
);

-- 2) Tighten messages DELETE to require current membership
DROP POLICY IF EXISTS "Senders can delete own messages" ON public.messages;

CREATE POLICY "Senders can delete own messages"
ON public.messages
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
  AND public.is_group_member(group_id, auth.uid())
);

-- 3) Add RLS policy on realtime.messages so only group members can subscribe
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Group members can subscribe to group channels" ON realtime.messages;

CREATE POLICY "Group members can subscribe to group channels"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  -- Allow postgres_changes on public schema tables (already protected by their own RLS)
  (realtime.messages.extension = 'postgres_changes')
  OR
  -- Broadcast/presence: topic must be a group UUID the user is a member of
  (
    realtime.topic() IS NOT NULL
    AND (
      -- Topic format: "group:<uuid>" or just "<uuid>"
      public.is_group_member(
        NULLIF(split_part(realtime.topic(), ':', 2), '')::uuid,
        auth.uid()
      )
      OR public.is_group_member(
        (CASE WHEN realtime.topic() ~ '^[0-9a-f-]{36}$' THEN realtime.topic()::uuid ELSE NULL END),
        auth.uid()
      )
    )
  )
);
