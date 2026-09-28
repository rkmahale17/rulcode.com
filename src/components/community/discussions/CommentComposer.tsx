'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface CommentComposerProps {
  /** Placeholder text shown in the textarea */
  placeholder?: string;
  /** Label shown on the submit button */
  submitLabel?: string;
  /** If true, renders in a compact inline style (for replies) */
  compact?: boolean;
  /** Called when the user submits; receives the trimmed content string */
  onSubmit: (content: string) => Promise<void>;
  /** If provided, renders a Cancel button that calls this */
  onCancel?: () => void;
  /** Initial value (for edit mode) */
  initialValue?: string;
  /** If true, disable the whole composer (e.g. not logged in) */
  disabled?: boolean;
}

export function CommentComposer({
  placeholder = 'Write a comment…',
  submitLabel = 'Post',
  compact = false,
  onSubmit,
  onCancel,
  initialValue = '',
  disabled = false,
}: CommentComposerProps) {
  const [value, setValue] = useState(initialValue);
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async () => {
    const trimmed = value.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(trimmed);
      setValue('');
      textareaRef.current?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter / Cmd+Enter submits
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${compact ? '' : 'p-4 border rounded-lg bg-card/30'}`}>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={disabled ? 'Sign in to participate in the discussion.' : placeholder}
        disabled={disabled || submitting}
        rows={compact ? 2 : 3}
        className={`resize-none text-sm ${compact ? 'min-h-[56px]' : 'min-h-[80px]'}`}
      />
      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={submitting}
            className="h-7 text-xs"
          >
            Cancel
          </Button>
        )}
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={disabled || !value.trim() || submitting}
          className="h-7 text-xs gap-1.5"
        >
          <Send className="w-3 h-3" />
          {submitting ? 'Posting…' : submitLabel}
        </Button>
      </div>
      {!compact && !disabled && (
        <p className="text-[10px] text-muted-foreground text-right">
          Ctrl+Enter to submit
        </p>
      )}
    </div>
  );
}
