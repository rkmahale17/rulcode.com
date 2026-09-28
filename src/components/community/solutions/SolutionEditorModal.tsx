'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LanguageSelector } from '@/components/CodeRunner/LanguageSelector';
import { LazyCodeEditor } from '@/components/CodeRunner/LazyCodeEditor';
import type { CommunitySolution, NewCommunitySolution } from '@/types/community';

const SUPPORTED_LANGUAGES = ['python', 'javascript', 'typescript', 'cpp', 'java', 'sql'] as const;
type SupportedLang = (typeof SUPPORTED_LANGUAGES)[number];

const LANGUAGE_STARTERS: Record<SupportedLang, string> = {
  python: '# Write your solution here\ndef solution():\n    pass\n',
  javascript: '// Write your solution here\nfunction solution() {\n    \n}\n',
  typescript: '// Write your solution here\nfunction solution(): void {\n    \n}\n',
  cpp: '// Write your solution here\n#include <bits/stdc++.h>\nusing namespace std;\n\nvoid solution() {\n    \n}\n',
  java: '// Write your solution here\nclass Solution {\n    public void solution() {\n        \n    }\n}\n',
  sql: '-- Write your SQL solution here\nSELECT *\nFROM table_name;\n',
};

interface SolutionEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Provide an existing solution to switch into edit mode */
  editingSolution?: CommunitySolution | null;
  algorithmId: string;
  onSubmit: (payload: NewCommunitySolution) => Promise<void>;
}

export function SolutionEditorModal({
  open,
  onOpenChange,
  editingSolution,
  algorithmId,
  onSubmit,
}: SolutionEditorModalProps) {
  const isEdit = !!editingSolution;

  const [title, setTitle] = useState(editingSolution?.title ?? '');
  const [explanation, setExplanation] = useState(editingSolution?.explanation ?? '');
  const [language, setLanguage] = useState<SupportedLang>(
    (editingSolution?.language as SupportedLang) ?? 'python'
  );
  const [codeMap, setCodeMap] = useState<Record<string, string>>(
    editingSolution?.code ?? {}
  );
  const [submitting, setSubmitting] = useState(false);

  // Keep title/explanation in sync when the editing target changes
  React.useEffect(() => {
    if (editingSolution) {
      setTitle(editingSolution.title);
      setExplanation(editingSolution.explanation);
      setLanguage((editingSolution.language as SupportedLang) ?? 'python');
      setCodeMap(editingSolution.code ?? {});
    } else {
      setTitle('');
      setExplanation('');
      setLanguage('python');
      setCodeMap({});
    }
  }, [editingSolution, open]);

  const currentCode = codeMap[language] ?? LANGUAGE_STARTERS[language] ?? '';

  const handleCodeChange = (val: string | undefined) => {
    setCodeMap((prev) => ({ ...prev, [language]: val ?? '' }));
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        algorithm_id: algorithmId,
        title: title.trim(),
        explanation: explanation.trim(),
        code: { ...codeMap, [language]: currentCode },
        language,
      });
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full flex flex-col gap-0 p-0 overflow-hidden max-h-[90vh]">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border/50 shrink-0">
          <DialogTitle className="text-base">
            {isEdit ? 'Edit Solution' : 'Share Your Solution'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-5 min-h-0">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="sol-title" className="text-sm">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="sol-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Two-pointer approach in O(n)"
              className="text-sm"
              maxLength={120}
            />
          </div>

          {/* Explanation */}
          <div className="space-y-1.5">
            <Label htmlFor="sol-explanation" className="text-sm">
              Explanation
            </Label>
            <Textarea
              id="sol-explanation"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Describe your approach, intuition, and complexity…"
              rows={5}
              className="resize-none text-sm"
            />
          </div>

          {/* Language + Code */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Code</Label>
              <LanguageSelector
                language={language}
                onLanguageChange={(l) => setLanguage(l as SupportedLang)}
                availableLanguages={SUPPORTED_LANGUAGES as unknown as string[]}
              />
            </div>
            <div className="h-64 rounded-md overflow-hidden border border-border/50">
              <LazyCodeEditor
                language={language}
                code={currentCode}
                onChange={handleCodeChange}
                path={`community-solution-editor-${language}`}
                options={{ readOnly: false, minimap: false }}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border/50 shrink-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || submitting}
          >
            {submitting
              ? isEdit
                ? 'Saving…'
                : 'Posting…'
              : isEdit
              ? 'Save Changes'
              : 'Post Solution'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
