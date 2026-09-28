'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  ThumbsUp,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { LazyCodeEditor } from '@/components/CodeRunner/LazyCodeEditor';
import type { CommunitySolution } from '@/types/community';

const LANGUAGE_LABELS: Record<string, string> = {
  python: 'Python',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  cpp: 'C++',
  java: 'Java',
  sql: 'SQL',
};

interface CommunitySolutionCardProps {
  solution: CommunitySolution;
  currentUserId?: string;
  onVote: (solutionId: string) => Promise<void>;
  onEdit: (solution: CommunitySolution) => void;
  onDelete: (solutionId: string) => Promise<void>;
}

export function CommunitySolutionCard({
  solution,
  currentUserId,
  onVote,
  onEdit,
  onDelete,
}: CommunitySolutionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const isOwner = currentUserId === solution.user_id;
  const authorName = solution.profiles?.username ?? 'Anonymous';
  const authorInitial = authorName.charAt(0).toUpperCase();

  // Determine which languages have code
  const availableLangs = Object.keys(solution.code ?? {}).filter(
    (l) => !!solution.code[l]?.trim()
  );
  const [displayLang, setDisplayLang] = useState(
    availableLangs.includes(solution.language)
      ? solution.language
      : (availableLangs[0] ?? solution.language)
  );
  const displayCode = solution.code?.[displayLang] ?? '';

  const formattedDate = new Date(solution.created_at).toLocaleDateString(
    undefined,
    { month: 'short', day: 'numeric', year: 'numeric' }
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayCode);
      setCopied(true);
      toast.success('Code copied!');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Failed to copy.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this solution? This action cannot be undone.')) return;
    await onDelete(solution.id);
  };

  return (
    <div className="border border-border/50 rounded-xl bg-card overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-start gap-3 p-4">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            {authorInitial}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold truncate">{authorName}</span>
            <span className="text-[10px] text-muted-foreground">{formattedDate}</span>
            {/* Language badges */}
            {availableLangs.map((lang) => (
              <Badge
                key={lang}
                variant="outline"
                className={`text-[10px] h-5 px-2 cursor-pointer transition-colors ${
                  lang === displayLang
                    ? 'bg-primary/10 text-primary border-primary/30'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => {
                  setDisplayLang(lang);
                  if (!expanded) setExpanded(true);
                }}
              >
                {LANGUAGE_LABELS[lang] ?? lang}
              </Badge>
            ))}
          </div>
          <h3 className="text-sm font-medium mt-1 text-foreground leading-snug">
            {solution.title}
          </h3>
        </div>

        {/* Owner menu */}
        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem
                onClick={() => onEdit(solution)}
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

      {/* Expandable body */}
      {expanded && (
        <>
          <Separator />
          {/* Explanation */}
          {solution.explanation && (
            <div className="px-4 pt-3 pb-2">
              <h4 className="text-xs font-semibold text-foreground mb-1.5">Explanation</h4>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {solution.explanation}
              </div>
            </div>
          )}

          {/* Read-only code editor */}
          {displayCode && (
            <div className="px-4 pb-4">
              <div className="relative rounded-lg overflow-hidden border border-border/50">
                {/* Toolbar */}
                <div className="flex items-center justify-between px-3 py-1.5 bg-muted/40 border-b border-border/40">
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {LANGUAGE_LABELS[displayLang] ?? displayLang}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={handleCopy}
                    title="Copy code"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
                {/* Monaco read-only viewer */}
                <div className="h-56">
                  <LazyCodeEditor
                    language={displayLang}
                    code={displayCode}
                    onChange={() => {}}
                    path={`community-solution-view-${solution.id}-${displayLang}`}
                    options={{
                      readOnly: true,
                      minimap: false,
                      lineNumbers: 'on',
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Footer: upvote + expand toggle */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/30 bg-muted/10">
        {/* Upvote */}
        <button
          onClick={() => onVote(solution.id)}
          disabled={!currentUserId}
          title={
            currentUserId
              ? solution.hasVoted
                ? 'Remove upvote'
                : 'Upvote'
              : 'Sign in to vote'
          }
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
            solution.hasVoted
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          {solution.upvotes}
        </button>

        {/* Expand / Collapse */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              Collapse
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              View Solution
            </>
          )}
        </button>
      </div>
    </div>
  );
}
