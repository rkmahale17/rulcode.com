'use client';

import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Flashlight, TrendingUp, Clock } from 'lucide-react';
import { useCommunitySolutions } from '@/hooks/useCommunitySolutions';
import { CommunitySolutionCard } from './CommunitySolutionCard';
import { SolutionEditorModal } from './SolutionEditorModal';
import type { CommunitySolution, NewCommunitySolution } from '@/types/community';
import type { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface CommunitySolutionsTabProps {
  algorithmId: string;
  user?: User | null;
}

export function CommunitySolutionsTab({
  algorithmId,
  user,
}: CommunitySolutionsTabProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSolution, setEditingSolution] =
    useState<CommunitySolution | null>(null);

  const {
    solutions,
    loading,
    sortOrder,
    setSortOrder,
    postSolution,
    updateSolution,
    deleteSolution,
    voteSolution,
  } = useCommunitySolutions({ algorithmId, userId: user?.id });

  const handleOpenNew = () => {
    if (!user) {
      toast.info('Sign in to share your solution.');
      return;
    }
    setEditingSolution(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (sol: CommunitySolution) => {
    setEditingSolution(sol);
    setModalOpen(true);
  };

  const handleSubmit = async (payload: NewCommunitySolution) => {
    try {
      if (editingSolution) {
        await updateSolution(editingSolution.id, {
          title: payload.title,
          explanation: payload.explanation,
          code: payload.code,
          language: payload.language,
        });
        toast.success('Solution updated!');
      } else {
        await postSolution(payload);
        toast.success('Solution posted!');
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
      throw err;
    }
  };

  const handleDelete = async (solutionId: string) => {
    try {
      await deleteSolution(solutionId);
      toast.success('Solution deleted.');
    } catch {
      toast.error('Failed to delete.');
    }
  };

  const handleVote = async (solutionId: string) => {
    if (!user) {
      toast.info('Sign in to upvote solutions.');
      return;
    }
    await voteSolution(solutionId);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-border/50 bg-background/50">
        {/* Sort */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSortOrder('most_voted')}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full transition-colors ${
              sortOrder === 'most_voted'
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Most Voted
          </button>
          <button
            onClick={() => setSortOrder('newest')}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full transition-colors ${
              sortOrder === 'newest'
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Newest
          </button>
        </div>

        {/* Post button */}
        <Button
          size="sm"
          variant={user ? 'default' : 'outline'}
          className="h-7 text-xs gap-1.5"
          onClick={handleOpenNew}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Share Solution
        </Button>
      </div>

      {/* Solution list */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div
                key={i}
                className="border border-border/40 rounded-xl p-4 space-y-3"
              >
                <div className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              </div>
            ))
          ) : solutions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <Flashlight className="w-10 h-10 mb-3 opacity-20" />
              <p className="text-sm font-medium">No solutions yet</p>
              <p className="text-xs mt-1">
                {user
                  ? 'Be the first to share your approach!'
                  : 'Sign in to be the first to share your approach!'}
              </p>
              {user && (
                <Button
                  size="sm"
                  className="mt-4 gap-1.5"
                  onClick={handleOpenNew}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Share Solution
                </Button>
              )}
            </div>
          ) : (
            solutions.map((sol) => (
              <CommunitySolutionCard
                key={sol.id}
                solution={sol}
                currentUserId={user?.id}
                onVote={handleVote}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Editor Modal */}
      <SolutionEditorModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        editingSolution={editingSolution}
        algorithmId={algorithmId}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
