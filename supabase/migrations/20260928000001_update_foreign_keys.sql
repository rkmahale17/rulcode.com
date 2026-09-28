-- Fix the foreign keys to reference public.profiles instead of auth.users
-- This allows PostgREST to automatically resolve the relation for `.select('*, profiles(*)')`

-- 1. Fix community_solutions
ALTER TABLE public.community_solutions 
  DROP CONSTRAINT IF EXISTS community_solutions_user_id_fkey;
  
ALTER TABLE public.community_solutions 
  ADD CONSTRAINT community_solutions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 2. Fix discussions
ALTER TABLE public.discussions 
  DROP CONSTRAINT IF EXISTS discussions_user_id_fkey;

ALTER TABLE public.discussions 
  ADD CONSTRAINT discussions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
