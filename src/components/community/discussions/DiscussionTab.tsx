'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare } from 'lucide-react';
import { useDiscussions } from '@/hooks/useDiscussions';
import { CommentComposer } from './CommentComposer';
import { DiscussionThread } from './DiscussionThread';
import type { User } from '@supabase/supabase-js';

interface DiscussionTabProps {
  algorithmId: string;
  user?: User | null;
}

export function DiscussionTab({ algorithmId, user }: DiscussionTabProps) {
  const {
    discussions,
    loading,
    postComment,
    updateComment,
    deleteComment,
    voteComment,
  } = useDiscussions({ algorithmId, userId: user?.id });

  const handleRootPost = async (content: string) => {
    await postComment({
      algorithm_id: algorithmId,
      parent_id: null,
      depth: 0,
      content,
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Composer */}
      <div className="shrink-0 p-3 border-b border-border/50">
        <CommentComposer
          placeholder="Start a discussion or ask a question…"
          submitLabel="Post"
          onSubmit={handleRootPost}
          disabled={!user}
        />
        {!user && (
          <p className="text-[11px] text-muted-foreground mt-2 text-center">
            <a href="/login" className="underline underline-offset-2 hover:text-primary">
              Sign in
            </a>{' '}
            to join the discussion.
          </p>
        )}
      </div>

      {/* Thread list */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          {loading ? (
            <div className="space-y-4 py-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-2.5">
                  <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : discussions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <MessageSquare className="w-10 h-10 mb-3 opacity-20" />
              <p className="text-sm font-medium">No discussions yet</p>
              <p className="text-xs mt-1">Be the first to start a conversation!</p>
            </div>
          ) : (
            discussions.map((node) => (
              <DiscussionThread
                key={node.id}
                node={node}
                algorithmId={algorithmId}
                currentUserId={user?.id}
                onReply={postComment}
                onVote={voteComment}
                onEdit={updateComment}
                onDelete={deleteComment}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
