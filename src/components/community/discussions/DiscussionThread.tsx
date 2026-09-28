'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  ThumbsUp,
  MessageSquare,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Trash2,
  Pencil,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CommentComposer } from './CommentComposer';
import type { DiscussionNode, NewDiscussion } from '@/types/community';

interface DiscussionThreadProps {
  node: DiscussionNode;
  algorithmId: string;
  currentUserId?: string;
  /** Maximum depth to show inline before collapsing children */
  maxVisibleDepth?: number;
  onReply: (payload: NewDiscussion) => Promise<void>;
  onVote: (discussionId: string) => Promise<void>;
  onEdit: (discussionId: string, content: string) => Promise<void>;
  onDelete: (discussionId: string) => Promise<void>;
}

// Indentation step per depth level (px)
const INDENT_PX = 20;

export function DiscussionThread({
  node,
  algorithmId,
  currentUserId,
  maxVisibleDepth = 6,
  onReply,
  onVote,
  onEdit,
  onDelete,
}: DiscussionThreadProps) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [editingContent, setEditingContent] = useState<string | null>(null);
  const [childrenCollapsed, setChildrenCollapsed] = useState(node.depth >= maxVisibleDepth);

  const isOwner = currentUserId === node.user_id;
  const authorInitial =
    node.profiles?.username?.charAt(0).toUpperCase() ?? '?';
  const authorName = node.profiles?.username ?? 'Anonymous';

  const formattedDate = new Date(node.created_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleReply = async (content: string) => {
    await onReply({
      algorithm_id: algorithmId,
      parent_id: node.id,
      depth: node.depth + 1,
      content,
    });
    setShowReplyBox(false);
  };

  const handleSaveEdit = async (content: string) => {
    await onEdit(node.id, content);
    setEditingContent(null);
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this comment? It will be replaced with a placeholder.')) {
      await onDelete(node.id);
    }
  };

  const indentLeft = Math.min(node.depth * INDENT_PX, 120);

  // Deleted node — show placeholder, still render children
  if (node.is_deleted) {
    return (
      <div style={{ marginLeft: indentLeft }}>
        <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground italic">
          <span className="border border-dashed border-border/40 rounded px-2 py-1">
            [comment deleted]
          </span>
        </div>
        {node.replies.length > 0 && (
          <div className="border-l border-border/30 pl-3 mt-1 space-y-1">
            {node.replies.map((child) => (
              <DiscussionThread
                key={child.id}
                node={child}
                algorithmId={algorithmId}
                currentUserId={currentUserId}
                maxVisibleDepth={maxVisibleDepth}
                onReply={onReply}
                onVote={onVote}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ marginLeft: indentLeft }}>
      <div className="group flex gap-2.5 py-2">
        {/* Avatar */}
        <Avatar className="h-7 w-7 shrink-0 mt-0.5">
          <AvatarFallback className="text-[11px] bg-primary/10 text-primary">
            {authorInitial}
          </AvatarFallback>
        </Avatar>

        {/* Body */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-semibold">{authorName}</span>
            <span className="text-[10px] text-muted-foreground">{formattedDate}</span>
          </div>

          {/* Content or edit box */}
          {editingContent !== null ? (
            <CommentComposer
              compact
              initialValue={editingContent}
              submitLabel="Save"
              onSubmit={handleSaveEdit}
              onCancel={() => setEditingContent(null)}
            />
          ) : (
            <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words leading-relaxed">
              {node.content}
            </p>
          )}

          {/* Action row */}
          {editingContent === null && (
            <div className="flex items-center gap-3 mt-1.5">
              {/* Upvote */}
              <button
                onClick={() => onVote(node.id)}
                disabled={!currentUserId}
                title={currentUserId ? (node.hasVoted ? 'Remove upvote' : 'Upvote') : 'Sign in to vote'}
                className={`flex items-center gap-1 text-[11px] transition-colors ${
                  node.hasVoted
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <ThumbsUp className="w-3 h-3" />
                <span>{node.upvotes}</span>
              </button>

              {/* Reply */}
              {currentUserId && (
                <button
                  onClick={() => setShowReplyBox((v) => !v)}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MessageSquare className="w-3 h-3" />
                  Reply
                </button>
              )}

              {/* Collapse children */}
              {node.replies.length > 0 && (
                <button
                  onClick={() => setChildrenCollapsed((v) => !v)}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  {childrenCollapsed ? (
                    <ChevronRight className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                  {childrenCollapsed
                    ? `${node.replies.length} ${node.replies.length === 1 ? 'reply' : 'replies'}`
                    : 'Collapse'}
                </button>
              )}

              {/* Owner menu */}
              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-32">
                    <DropdownMenuItem
                      onClick={() => setEditingContent(node.content)}
                      className="gap-2 text-xs"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="gap-2 text-xs text-red-500 focus:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}

          {/* Inline reply composer */}
          {showReplyBox && (
            <div className="mt-2">
              <CommentComposer
                compact
                placeholder={`Reply to ${authorName}…`}
                submitLabel="Reply"
                onSubmit={handleReply}
                onCancel={() => setShowReplyBox(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Recursive children */}
      {node.replies.length > 0 && !childrenCollapsed && (
        <div className="border-l border-border/30 pl-3 space-y-0.5">
          {node.replies.map((child) => (
            <DiscussionThread
              key={child.id}
              node={child}
              algorithmId={algorithmId}
              currentUserId={currentUserId}
              maxVisibleDepth={maxVisibleDepth}
              onReply={onReply}
              onVote={onVote}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
