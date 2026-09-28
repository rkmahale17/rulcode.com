import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type {
  CommunitySolution,
  NewCommunitySolution,
} from '@/types/community';

export type SolutionSortOrder = 'most_voted' | 'newest';

interface UseCommunitySolutionsOptions {
  algorithmId: string;
  userId?: string;
}

export function useCommunitySolutions({
  algorithmId,
  userId,
}: UseCommunitySolutionsOptions) {
  const [solutions, setSolutions] = useState<CommunitySolution[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<SolutionSortOrder>('most_voted');
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());

  // ── Fetch solutions ─────────────────────────────────────────────────────────
  const fetchSolutions = useCallback(async () => {
    if (!algorithmId) return;
    setLoading(true);
    try {
      const orderColumn = sortOrder === 'most_voted' ? 'upvotes' : 'created_at';
      const { data, error } = await supabase
        .from('community_solutions')
        .select(`*, profiles(id, username, avatar_url)`)
        .eq('algorithm_id', algorithmId)
        .order(orderColumn, { ascending: false });

      if (error) throw error;

      // Fetch current user's votes if logged in
      let votedIds = new Set<string>();
      if (userId && data && data.length > 0) {
        const ids = data.map((s: any) => s.id);
        const { data: votes } = await supabase
          .from('solution_votes')
          .select('solution_id')
          .eq('user_id', userId)
          .in('solution_id', ids);
        votedIds = new Set((votes || []).map((v: any) => v.solution_id));
        setUserVotes(votedIds);
      }

      setSolutions(
        (data || []).map((s: any) => ({
          ...s,
          code: s.code ?? {},
          hasVoted: votedIds.has(s.id),
        }))
      );
    } catch (err) {
      console.error('[useCommunitySolutions] fetch error', err);
    } finally {
      setLoading(false);
    }
  }, [algorithmId, sortOrder, userId]);

  useEffect(() => {
    fetchSolutions();
  }, [fetchSolutions]);

  // ── Post / update solution ─────────────────────────────────────────────────
  const postSolution = useCallback(
    async (payload: NewCommunitySolution): Promise<CommunitySolution | null> => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('community_solutions')
        .insert({ ...payload, user_id: userId })
        .select(`*, profiles(id, username, avatar_url)`)
        .single();

      if (error) throw error;
      const newSol: CommunitySolution = { ...data, code: data.code ?? {}, hasVoted: false };
      setSolutions((prev) => [newSol, ...prev]);
      return newSol;
    },
    [userId]
  );

  const updateSolution = useCallback(
    async (
      solutionId: string,
      patch: Partial<Pick<CommunitySolution, 'title' | 'explanation' | 'code' | 'language'>>
    ) => {
      const { data, error } = await supabase
        .from('community_solutions')
        .update(patch)
        .eq('id', solutionId)
        .select(`*, profiles(id, username, avatar_url)`)
        .single();

      if (error) throw error;
      const updated: CommunitySolution = {
        ...data,
        code: data.code ?? {},
        hasVoted: userVotes.has(solutionId),
      };
      setSolutions((prev) =>
        prev.map((s) => (s.id === solutionId ? updated : s))
      );
    },
    [userVotes]
  );

  const deleteSolution = useCallback(async (solutionId: string) => {
    const { error } = await supabase
      .from('community_solutions')
      .delete()
      .eq('id', solutionId);
    if (error) throw error;
    setSolutions((prev) => prev.filter((s) => s.id !== solutionId));
  }, []);

  // ── Upvote (toggle) ─────────────────────────────────────────────────────────
  const voteSolution = useCallback(
    async (solutionId: string) => {
      if (!userId) return;
      const hasVoted = userVotes.has(solutionId);

      // Optimistic update
      setUserVotes((prev) => {
        const next = new Set(prev);
        hasVoted ? next.delete(solutionId) : next.add(solutionId);
        return next;
      });
      setSolutions((prev) =>
        prev.map((s) =>
          s.id === solutionId
            ? { ...s, upvotes: s.upvotes + (hasVoted ? -1 : 1), hasVoted: !hasVoted }
            : s
        )
      );

      try {
        if (hasVoted) {
          await supabase
            .from('solution_votes')
            .delete()
            .eq('user_id', userId)
            .eq('solution_id', solutionId);
          await supabase
            .from('community_solutions')
            .update({ upvotes: supabase.rpc as any })  // handled via DB trigger or RPC ideally, but here we recalculate
            .eq('id', solutionId);
          // Re-sync upvote count from DB
          const { data } = await supabase
            .from('solution_votes')
            .select('*', { count: 'exact', head: true })
            .eq('solution_id', solutionId);
          const count = (data as any)?.length ?? 0;
          await supabase
            .from('community_solutions')
            .update({ upvotes: count })
            .eq('id', solutionId);
        } else {
          await supabase
            .from('solution_votes')
            .insert({ user_id: userId, solution_id: solutionId });
          const { count } = await supabase
            .from('solution_votes')
            .select('*', { count: 'exact', head: true })
            .eq('solution_id', solutionId);
          await supabase
            .from('community_solutions')
            .update({ upvotes: count ?? 0 })
            .eq('id', solutionId);
        }
      } catch (err) {
        // Roll back optimistic update
        console.error('[useCommunitySolutions] vote error', err);
        fetchSolutions();
      }
    },
    [userId, userVotes, fetchSolutions]
  );

  return {
    solutions,
    loading,
    sortOrder,
    setSortOrder,
    fetchSolutions,
    postSolution,
    updateSolution,
    deleteSolution,
    voteSolution,
    userVotes,
  };
}
