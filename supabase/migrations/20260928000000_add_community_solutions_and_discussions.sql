-- ============================================================
-- Ensure updated_at trigger function exists (idempotent)
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Community Solutions Table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.community_solutions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  algorithm_id  TEXT        NOT NULL,
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title         TEXT        NOT NULL DEFAULT '',
  explanation   TEXT        DEFAULT '',
  code          JSONB       DEFAULT '{}'::jsonb,  -- { "python": "...", "javascript": "..." }
  language      TEXT        NOT NULL DEFAULT 'python',
  upvotes       INTEGER     NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_solutions_algorithm_id ON public.community_solutions(algorithm_id);
CREATE INDEX IF NOT EXISTS idx_community_solutions_user_id      ON public.community_solutions(user_id);
CREATE INDEX IF NOT EXISTS idx_community_solutions_upvotes      ON public.community_solutions(upvotes DESC);

ALTER TABLE public.community_solutions ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Anyone can read community solutions"
  ON public.community_solutions FOR SELECT
  USING (true);

-- Owner write
CREATE POLICY "Owner can insert community solutions"
  ON public.community_solutions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner can update community solutions"
  ON public.community_solutions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner can delete community solutions"
  ON public.community_solutions FOR DELETE
  USING (auth.uid() = user_id);

-- Updated-at trigger
CREATE TRIGGER update_community_solutions_updated_at
  BEFORE UPDATE ON public.community_solutions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Solution Votes Table  (upvote-only, one per user per solution)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.solution_votes (
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  solution_id UUID NOT NULL REFERENCES public.community_solutions(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, solution_id)
);

ALTER TABLE public.solution_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read solution votes"
  ON public.solution_votes FOR SELECT USING (true);

CREATE POLICY "Owner can insert solution vote"
  ON public.solution_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner can delete solution vote"
  ON public.solution_votes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- Discussions Table  (self-referential, arbitrary depth)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.discussions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  algorithm_id TEXT        NOT NULL,
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id    UUID        REFERENCES public.discussions(id) ON DELETE SET NULL,
  depth        INTEGER     NOT NULL DEFAULT 0,   -- 0 = root
  content      TEXT        NOT NULL DEFAULT '',
  upvotes      INTEGER     NOT NULL DEFAULT 0,
  is_deleted   BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discussions_algorithm_id ON public.discussions(algorithm_id);
CREATE INDEX IF NOT EXISTS idx_discussions_parent_id    ON public.discussions(parent_id);
CREATE INDEX IF NOT EXISTS idx_discussions_user_id      ON public.discussions(user_id);

ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;

-- Public read (soft-deleted rows are still returned; UI hides content)
CREATE POLICY "Anyone can read discussions"
  ON public.discussions FOR SELECT
  USING (true);

CREATE POLICY "Owner can insert discussion"
  ON public.discussions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner can update discussion"
  ON public.discussions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Hard delete not allowed from client; only soft-delete via UPDATE is_deleted = true
-- (No DELETE policy is intentional)

-- Updated-at trigger
CREATE TRIGGER update_discussions_updated_at
  BEFORE UPDATE ON public.discussions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Discussion Votes Table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.discussion_votes (
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  discussion_id UUID NOT NULL REFERENCES public.discussions(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, discussion_id)
);

ALTER TABLE public.discussion_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read discussion votes"
  ON public.discussion_votes FOR SELECT USING (true);

CREATE POLICY "Owner can insert discussion vote"
  ON public.discussion_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner can delete discussion vote"
  ON public.discussion_votes FOR DELETE
  USING (auth.uid() = user_id);
