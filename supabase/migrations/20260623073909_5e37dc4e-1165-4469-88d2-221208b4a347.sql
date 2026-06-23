-- 1) Restrict EXECUTE on SECURITY DEFINER functions exposed via PostgREST.
-- Trigger functions never need to be callable directly.
REVOKE EXECUTE ON FUNCTION public.handle_new_user_role() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_profile() FROM PUBLIC, anon, authenticated;

-- has_role is used inside RLS policies, so authenticated callers need EXECUTE,
-- but anonymous callers and PUBLIC should not be able to invoke it directly.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- 2) Sales: add UPDATE and DELETE policies scoped to the owner of the row.
CREATE POLICY "Users can update own sales"
ON public.sales
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sales"
ON public.sales
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 3) user_roles: close the privilege-escalation hole.
-- The previous INSERT policy let any existing owner assign any role to ANY user_id.
-- Owner rows are created automatically by the handle_new_user_role trigger
-- (SECURITY DEFINER, bypasses RLS), so we no longer need a client-side INSERT policy.
-- Remove it entirely; privileged role management must go through service_role.
DROP POLICY IF EXISTS "Owners can insert roles" ON public.user_roles;

-- Tighten the DELETE policy: an owner cannot remove their own owner row
-- (which would lock them out) and cannot affect rows for users that don't exist.
DROP POLICY IF EXISTS "Owners can delete roles" ON public.user_roles;
CREATE POLICY "Owners can delete non-self roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'owner')
  AND user_id <> auth.uid()
);