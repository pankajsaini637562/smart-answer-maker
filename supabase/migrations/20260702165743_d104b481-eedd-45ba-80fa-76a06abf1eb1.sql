
-- 1) Fix realtime.messages policy: enforce group membership for postgres_changes too
DROP POLICY IF EXISTS "Group members can subscribe to group channels" ON realtime.messages;

CREATE POLICY "Group members can subscribe to group channels"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() IS NOT NULL
  AND (
    public.is_group_member(
      (NULLIF(split_part(realtime.topic(), ':', 2), ''))::uuid,
      auth.uid()
    )
    OR public.is_group_member(
      CASE WHEN realtime.topic() ~ '^[0-9a-f-]{36}$' THEN (realtime.topic())::uuid ELSE NULL::uuid END,
      auth.uid()
    )
  )
);

-- 2) Gamification: add INSERT/UPDATE policies scoped to owner
CREATE POLICY "Users can insert their own gamification"
ON public.gamification
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own gamification"
ON public.gamification
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3) Storage: add UPDATE policy for group-files (owner-uploader within a group)
CREATE POLICY "Group members can update group files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'group-files'
  AND public.is_group_member(((storage.foldername(name))[1])::uuid, auth.uid())
)
WITH CHECK (
  bucket_id = 'group-files'
  AND public.is_group_member(((storage.foldername(name))[1])::uuid, auth.uid())
);

-- 4) Tighten storage policies: restrict from public/anon → authenticated only.
--    Public bucket URLs (avatars) still serve publicly via CDN regardless of RLS.
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Group members can read group files" ON storage.objects;
DROP POLICY IF EXISTS "Group members can upload group files" ON storage.objects;
DROP POLICY IF EXISTS "Group members can delete group files" ON storage.objects;

-- Avatars: owner-scoped writes only. Reads happen via public CDN URL (no policy needed).
--    We also allow authenticated users to read their own avatar object row for management flows.
CREATE POLICY "Users can read their own avatar object"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (auth.uid())::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'avatars'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Group files (private bucket): authenticated + group membership
CREATE POLICY "Group members can read group files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'group-files'
  AND public.is_group_member(((storage.foldername(name))[1])::uuid, auth.uid())
);

CREATE POLICY "Group members can upload group files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'group-files'
  AND public.is_group_member(((storage.foldername(name))[1])::uuid, auth.uid())
);

CREATE POLICY "Group members can delete group files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'group-files'
  AND public.is_group_member(((storage.foldername(name))[1])::uuid, auth.uid())
);

-- 5) Lock down SECURITY DEFINER functions.
--    Revoke from PUBLIC and anon on all; keep authenticated only where the client legitimately calls them.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.add_group_creator_as_member() FROM PUBLIC, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.get_group_by_invite(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.join_group_via_invite(text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_group_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.group_member_count(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_group_member_profiles(uuid[]) FROM PUBLIC, anon;
