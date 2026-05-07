-- 1) Fix: grant execute on the membership helper to all client roles
GRANT EXECUTE ON FUNCTION public.is_group_member(uuid, uuid) TO anon, authenticated;

-- 2) group_files table
CREATE TABLE public.group_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL,
  uploaded_by uuid NOT NULL,
  uploader_name text NOT NULL DEFAULT 'Student',
  file_name text NOT NULL,
  file_path text NOT NULL,
  mime_type text,
  size_bytes bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.group_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view group files"
  ON public.group_files FOR SELECT
  USING (public.is_group_member(group_id, auth.uid()));

CREATE POLICY "Members can upload group files"
  ON public.group_files FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by AND public.is_group_member(group_id, auth.uid()));

CREATE POLICY "Uploader can delete own files"
  ON public.group_files FOR DELETE
  USING (auth.uid() = uploaded_by);

-- realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_files;

-- 3) Storage bucket for group files (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('group-files', 'group-files', false)
ON CONFLICT (id) DO NOTHING;

-- Path layout: <group_id>/<filename>
CREATE POLICY "Group members can read group files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'group-files'
    AND public.is_group_member(((storage.foldername(name))[1])::uuid, auth.uid())
  );

CREATE POLICY "Group members can upload group files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'group-files'
    AND public.is_group_member(((storage.foldername(name))[1])::uuid, auth.uid())
  );

CREATE POLICY "Group members can delete group files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'group-files'
    AND public.is_group_member(((storage.foldername(name))[1])::uuid, auth.uid())
  );

-- 4) Invite links
CREATE TABLE public.group_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL,
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(12), 'hex'),
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

ALTER TABLE public.group_invites ENABLE ROW LEVEL SECURITY;

-- Anyone (even not yet a member) can read an invite by token to preview/join
CREATE POLICY "Anyone can read invites"
  ON public.group_invites FOR SELECT
  USING (true);

CREATE POLICY "Members can create invites"
  ON public.group_invites FOR INSERT
  WITH CHECK (auth.uid() = created_by AND public.is_group_member(group_id, auth.uid()));

CREATE POLICY "Creator can delete invite"
  ON public.group_invites FOR DELETE
  USING (auth.uid() = created_by);

-- 5) Helper function: lookup group by invite token (bypasses groups SELECT RLS so non-members can preview)
CREATE OR REPLACE FUNCTION public.get_group_by_invite(_token text)
RETURNS TABLE (group_id uuid, group_name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT g.id, g.name
  FROM public.group_invites i
  JOIN public.groups g ON g.id = i.group_id
  WHERE i.token = _token
    AND (i.expires_at IS NULL OR i.expires_at > now())
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_group_by_invite(text) TO anon, authenticated;

-- 6) Helper function: join group via invite token
CREATE OR REPLACE FUNCTION public.join_group_via_invite(_token text, _user_name text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _group_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Must be signed in';
  END IF;

  SELECT i.group_id INTO _group_id
  FROM public.group_invites i
  WHERE i.token = _token
    AND (i.expires_at IS NULL OR i.expires_at > now())
  LIMIT 1;

  IF _group_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invite';
  END IF;

  INSERT INTO public.group_members (group_id, user_id, user_name)
  VALUES (_group_id, auth.uid(), COALESCE(NULLIF(_user_name, ''), 'Student'))
  ON CONFLICT DO NOTHING;

  RETURN _group_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.join_group_via_invite(text, text) TO anon, authenticated;