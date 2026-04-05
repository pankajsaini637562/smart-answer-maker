
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS class TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS school TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '';

-- Update the trigger function to handle anonymous users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'Student'));
  RETURN NEW;
END;
$function$;

-- Allow anonymous users to access their own profiles
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated, anon USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated, anon USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated, anon WITH CHECK (auth.uid() = id);

-- Update other tables to allow anon access too
DROP POLICY IF EXISTS "Users can CRUD own sheets" ON public.sheets;
CREATE POLICY "Users can CRUD own sheets" ON public.sheets FOR ALL TO authenticated, anon USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can CRUD own attempts" ON public.attempts;
CREATE POLICY "Users can CRUD own attempts" ON public.attempts FOR ALL TO authenticated, anon USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can CRUD own results" ON public.results;
CREATE POLICY "Users can CRUD own results" ON public.results FOR ALL TO authenticated, anon USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can CRUD own gamification" ON public.gamification;
CREATE POLICY "Users can CRUD own gamification" ON public.gamification FOR ALL TO authenticated, anon USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
