import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type {
  Discussion,
  DiscussionNode,
  NewDiscussion,
} from '@/types/community';
import { buildDiscussionTree } from '@/types/community';

interface UseDiscussionsOptions {
  algorithmId: string;
  userId?: string;
}

export function useDiscussions({ algorithmId, userId }: UseDiscussionsOptions) {
  const [discussions, setDiscussions] = useState<DiscussionNode[]>([]);
  const [flatDiscussions, setFlatDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(false);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchDiscussions = useCallback(async () => {
    if (!algorithmId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('discussions')
        .select(`*, profiles(id, username, avatar_url)`)
        .eq('algorithm_id', algorithmId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const flat: Discussion[] = (data || []).map((d: any) => ({
        ...d,
        hasVoted: false,
      }));

      // Fetch current user's votes
      if (userId && flat.length > 0) {
        const ids = flat.map((d) => d.id);
        const { data: votes } = await supabase
          .from('discussion_votes')
          .select('discussion_id')
          .eq('user_id', userId)
          .in('discussion_id', ids);
        const voted = new Set((votes || []).map((v: any) => v.discussion_id));
        setUserVotes(voted);
        flat.forEach((d) => { d.hasVoted = voted.has(d.id); });
      }

      setFlatDiscussions(flat);
      setDiscussions(buildDiscussionTree(flat));
    } catch (err) {
      console.error('[useDiscussions] fetch error', err);
    } finally {
      setLoading(false);
    }
  }, [algorithmId, userId]);

  useEffect(() => {
    fetchDiscussions();
  }, [fetchDiscussions]);

  // ── Post comment ────────────────────────────────────────────────────────────
  const postComment = useCallback(
    async (payload: NewDiscussion): Promise<Discussion | null> => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('discussions')
        .insert({ ...payload, user_id: userId })
        .select(`*, profiles(id, username, avatar_url)`)
        .single();

      if (error) throw error;
      const newNode: Discussion = { ...data, hasVoted: false };
      const updated = [...flatDiscussions, newNode];
      setFlatDiscussions(updated);
      setDiscussions(buildDiscussionTree(updated));
      return newNode;
    },
    [userId, flatDiscussions]
  );

  // ── Edit comment ────────────────────────────────────────────────────────────
  const updateComment = useCallback(
    async (discussionId: string, content: string) => {
      const { data, error } = await supabase
        .from('discussions')
        .update({ content })
        .eq('id', discussionId)
        .select(`*, profiles(id, username, avatar_url)`)
        .single();

      if (error) throw error;
      const updated = flatDiscussions.map((d) =>
        d.id === discussionId
          ? { ...data, hasVoted: userVotes.has(discussionId) }
          : d
      );
      setFlatDiscussions(updated);
      setDiscussions(buildDiscussionTree(updated));
    },
    [flatDiscussions, userVotes]
  );

  // ── Soft-delete ─────────────────────────────────────────────────────────────
  const deleteComment = useCallback(
    async (discussionId: string) => {
      const { error } = await supabase
        .from('discussions')
        .update({ is_deleted: true, content: '' })
        .eq('id', discussionId);
      if (error) throw error;
      const updated = flatDiscussions.map((d) =>
        d.id === discussionId ? { ...d, is_deleted: true, content: '' } : d
      );
      setFlatDiscussions(updated);
      setDiscussions(buildDiscussionTree(updated));
    },
    [flatDiscussions]
  );

  // ── Upvote (toggle) ─────────────────────────────────────────────────────────
  const voteComment = useCallback(
    async (discussionId: string) => {
      if (!userId) return;
      const hasVoted = userVotes.has(discussionId);

      // Optimistic
      setUserVotes((prev) => {
        const next = new Set(prev);
        hasVoted ? next.delete(discussionId) : next.add(discussionId);
        return next;
      });
      const applyVote = (d: Discussion) =>
        d.id === discussionId
          ? { ...d, upvotes: d.upvotes + (hasVoted ? -1 : 1), hasVoted: !hasVoted }
          : d;
      const updated = flatDiscussions.map(applyVote);
      setFlatDiscussions(updated);
      setDiscussions(buildDiscussionTree(updated));

      try {
        if (hasVoted) {
          await supabase
            .from('discussion_votes')
            .delete()
            .eq('user_id', userId)
            .eq('discussion_id', discussionId);
        } else {
          await supabase
            .from('discussion_votes')
            .insert({ user_id: userId, discussion_id: discussionId });
        }
        // Sync count
        const { count } = await supabase
          .from('discussion_votes')
          .select('*', { count: 'exact', head: true })
          .eq('discussion_id', discussionId);
        await supabase
          .from('discussions')
          .update({ upvotes: count ?? 0 })
          .eq('id', discussionId);
      } catch (err) {
        console.error('[useDiscussions] vote error', err);
        fetchDiscussions();
      }
    },
    [userId, userVotes, flatDiscussions, fetchDiscussions]
  );

  return {
    discussions,
    loading,
    fetchDiscussions,
    postComment,
    updateComment,
    deleteComment,
    voteComment,
    userVotes,
  };
}
