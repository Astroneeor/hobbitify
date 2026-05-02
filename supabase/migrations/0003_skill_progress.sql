-- Add persistent progress tracking to skill_trees.
-- Idempotent; safe to re-run.

ALTER TABLE public.skill_trees
  ADD COLUMN IF NOT EXISTS completed_skills TEXT[] NOT NULL DEFAULT '{}';

-- RLS: authenticated users can update their own rows
DROP POLICY IF EXISTS "own trees update progress" ON public.skill_trees;
CREATE POLICY "own trees update progress"
  ON public.skill_trees FOR UPDATE
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Column-level: restrict updates to completed_skills only.
-- This prevents a browser call from overwriting skills/query/source.
-- service_role (used by the Worker) is a superuser-equivalent and bypasses these grants.
REVOKE UPDATE ON public.skill_trees FROM authenticated, anon;
GRANT  UPDATE (completed_skills) ON public.skill_trees TO authenticated;
