CREATE POLICY "Group creators can moderate messages"
ON public.messages
FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.groups g WHERE g.id = messages.group_id AND g.created_by = auth.uid()));