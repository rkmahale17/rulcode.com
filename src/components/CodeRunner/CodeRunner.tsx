import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs } from "@/components/ui/tabs";
import { useFeatureFlag } from "@/contexts/FeatureFlagContext";
import { usePostHog } from "@posthog/react";

import { OutputPanel } from './OutputPanel';
import { RunnerFooter } from './RunnerFooter';
import type { CodeEditorRef } from './CodeEditor';
import { EditorToolbar } from './EditorToolbar';
import { EditorPane } from './EditorPane';
import { DEFAULT_CODE } from './constants';
import { ImperativePanelGroupHandle } from "react-resizable-panels";
import { Language } from './LanguageSelector';
import { Submission } from '@/types/userAlgorithmData';
import { toast } from "sonner";
import { generateStub } from '@/utils/stubGenerator';

// Hooks
import { useEditorSettings } from '@/hooks/useEditorSettings';
import { useTestCases } from '@/hooks/useTestCases';
import { useSubmissionViewer } from '@/hooks/useSubmissionViewer';
import { useCodeExecution } from '@/hooks/useCodeExecution';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useApp } from '@/contexts/AppContext';
import { AuthNudge } from '../AuthNudge';

interface CodeRunnerProps {
  algorithmId?: string; // problemId in generic version
  algorithmData?: any;  // problem in generic version
  onToggleFullscreen?: () => void;
  isMaximized?: boolean;
  className?: string;
  initialCode?: string;
  onCodeChange?: (code: string) => void;
  language?: Language;
  onLanguageChange?: (language: Language) => void;
  onSuccess?: () => void;
  controls?: any;
  submissions?: Submission[];
  isInterviewMode?: boolean;
  onStateChange?: (state: any) => void;
  isMobile?: boolean;
  isLoading?: boolean;
  onToggleRightPanel?: () => void;
  brainstormProps?: any;
  hasPremiumAccess?: boolean;
  handleRandomProblem?: () => void;
  handleNextProblem?: () => void;
  handlePreviousProblem?: () => void;
  onSubmissionComplete?: () => void;
  onSubmissionStart?: () => void;
  setSubmissions?: React.Dispatch<React.SetStateAction<Submission[]>>;
  isPlatformPreview?: boolean;
  hideToolbar?: boolean;
  onOpenRulo?: () => void;
}

export interface CodeRunnerRef {
  run: () => void;
  submit: () => void;
  openThinkpad: () => void;
  selectSubmission: (submission: Submission) => void;
}

export const CodeRunner = React.forwardRef<CodeRunnerRef, CodeRunnerProps>(({
  algorithmId,
  algorithmData,
  onToggleFullscreen,
  isMaximized = false,
  className,
  initialCode,
  onCodeChange,
  language: controlledLanguage,
  onLanguageChange,
  onSuccess,
  controls,
  submissions: initialSubmissions = [],
  isInterviewMode,
  onStateChange,
  isMobile,
  isLoading: isLoadingProp,
  onToggleRightPanel,
  brainstormProps,
  hasPremiumAccess = false,
  handleRandomProblem,
  handleNextProblem,
  handlePreviousProblem,
  onSubmissionComplete,
  onSubmissionStart,
  setSubmissions: setSubmissionsProp,
  isPlatformPreview = false,
  hideToolbar = false,
  onOpenRulo
}, ref) => {
  const posthog = usePostHog();
  const isLimitExceeded = useFeatureFlag("todays_limit_exceed");
  const { user } = useApp();

  const [internalLanguage, setInternalLanguage] = useState<Language>('typescript');
  const language = controlledLanguage || internalLanguage;
  const availableLanguages = controls?.languages ? (Object.keys(controls.languages) as Language[]).filter((lang: string) => controls.languages[lang]) : undefined;

  const [code, setCode] = useState<string>(initialCode || DEFAULT_CODE['typescript']);
  const [internalIsFullscreen, setInternalIsFullscreen] = useState(false);
  const [internalSubmissions, setInternalSubmissions] = useState<Submission[]>(initialSubmissions);

  // Sync state or use prop
  const submissions = initialSubmissions; // Use prop directly as it's now managed by parent
  const setSubmissions = setSubmissionsProp || setInternalSubmissions;

  useEffect(() => {
    if (initialSubmissions.length > 0 && !setSubmissionsProp) {
      setInternalSubmissions(initialSubmissions);
    }
  }, [initialSubmissions, setSubmissionsProp]);

  const editorRef = useRef<CodeEditorRef>(null);
  const panelGroupRef = useRef<ImperativePanelGroupHandle>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [minPanelSize, setMinPanelSize] = useState(8);
  const [isOutputExpanded, setIsOutputExpanded] = useState(false);
  const [isOutputModalOpen, setIsOutputModalOpen] = useState(false);

  // Hook 1: Editor Settings
  const { settings, updateSetting } = useEditorSettings();

  // Hook 2: Test Cases
  const testCasesHook = useTestCases();
  const { testCases, setTestCases, executedTestCases, setExecutedTestCases, activeTab, setActiveTab, activeTestCaseTab, setActiveTestCaseTab, editingTestCaseId, setEditingTestCaseId, inputValues, setInputValues, handleAddTestCase, handleUpdateTestCase, handleDeleteTestCase, handleCancelEdit, pendingTestCaseId, setPendingTestCaseId } = testCasesHook;

  // Hook 3: Submission Viewer
  const submissionViewer = useSubmissionViewer({
    algorithmId,
    setIsOutputExpanded,
    setIsOutputModalOpen
  });

  const { viewingSubmission, activeEditorTab, setActiveEditorTab, isScratchpadOpen, setIsScratchpadOpen } = submissionViewer;

  useEffect(() => {
    if (!containerRef.current) return;
    let initialSet = false;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry && entry.contentRect.height > 0) {
        const minPercent = (82 / entry.contentRect.height) * 100;
        setMinPanelSize(minPercent);

        // If the panel was initialSet but now the layout is collapsed or invalid due to resize,
        // we could potentially force a re-layout here, but for now we just update the minSize.
      }
    });

    // We still use a small delay to set the initial layout correctly once the container has height
    const timer = setInterval(() => {
      if (panelGroupRef.current && !isMobile && containerRef.current?.clientHeight) {
        const minPercent = (82 / containerRef.current.clientHeight) * 100;
        // Only set layout if it hasn't been set or if we're forced to (e.g. initial mount)
        if (!initialSet) {
          panelGroupRef.current.setLayout([100 - minPercent, minPercent]);
          initialSet = true;
          clearInterval(timer);
        }
      }
    }, 100);

    setTimeout(() => clearInterval(timer), 3000);

    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      clearInterval(timer);
    };
  }, [isMobile]);

  // Initialize Data
  useEffect(() => {
    if (initialSubmissions.length > 0) {
      setSubmissions(initialSubmissions);
    }
  }, [initialSubmissions]);

  useEffect(() => {
    if (algorithmData) {
      if (algorithmData.test_cases) {
        const initialTestCases = algorithmData.test_cases.map((tc: any, idx: number) => ({
          id: idx,
          input: tc.input,
          expectedOutput: tc.expectedOutput || tc.output,
          isCustom: false,
          description: tc.description,
          isSubmission: tc.isSubmission,
          name: tc.name,
          testCode: tc.testCode || tc.test_code
        }));
        setTestCases(initialTestCases);
      }

      const initialValues: Record<string, string> = {};
      if (algorithmData.input_schema) {
        algorithmData.input_schema.forEach((field: any, index: number) => {
          const firstTestCase = algorithmData.test_cases?.[0];
          const defaultVal = firstTestCase?.input && Array.isArray(firstTestCase.input) ? firstTestCase.input[index] : undefined;
          initialValues[field.name] = defaultVal !== undefined ? JSON.stringify(defaultVal) : "";
        });
        setInputValues(initialValues);
      }

      if (typeof initialCode === 'string' && initialCode.trim().length > 0) {
        setCode(initialCode);
        return;
      }

      const impl = algorithmData.implementations?.find((i: any) => i.lang.toLowerCase() === language.toLowerCase());
      const isSqlProblem = algorithmData.problemType === 'sql' || algorithmData.problem_type === 'sql' || algorithmData.problem_type === 'SQL' || algorithmData.problemType === 'SQL';
      
      // For SQL, don't fall back to 'optimize' (the full solution query), just start blank if no 'starter'
      let algoCode = impl?.code?.find((c: any) => c.codeType === 'starter')?.code || (!isSqlProblem ? impl?.code?.find((c: any) => c.codeType === 'optimize')?.code : undefined);

      if (!algoCode && algorithmData.input_schema && !isSqlProblem) {
        const functionName = algorithmId?.replace(/-/g, '_') || 'solution';
        const parsedInputs: Record<string, any> = {};
        algorithmData.input_schema.forEach((field: any) => {
          const value = initialValues[field.name]; // Use initialValues since state might not be updated yet
          if (value) {
            try { parsedInputs[field.name] = JSON.parse(value); } catch { parsedInputs[field.name] = value; }
          }
        });

        algoCode = generateStub(
          language,
          functionName,
          algorithmData.input_schema as any,
          Object.keys(parsedInputs).length > 0 ? parsedInputs : undefined
        );
      }

      setCode(algoCode || DEFAULT_CODE[language]);
    } else {
      if (typeof initialCode === 'string' && initialCode.trim().length > 0) {
        setCode(initialCode);
      } else {
        setCode(DEFAULT_CODE[language]);
      }
    }
  }, [algorithmData, language, algorithmId, initialCode]);

  const handleLanguageChange = (newLang: Language) => {
    if (onLanguageChange) onLanguageChange(newLang);
    else setInternalLanguage(newLang);
  };

  const handleReset = () => {
    let resetCode: string;
    if (algorithmData) {
      const impl = algorithmData.implementations?.find((i: any) => i.lang.toLowerCase() === language.toLowerCase());
      const isSqlProblem = algorithmData.problemType === 'sql' || algorithmData.problem_type === 'sql' || algorithmData.problem_type === 'SQL' || algorithmData.problemType === 'SQL';
      const algoCode = impl?.code?.find((c: any) => c.codeType === 'starter')?.code || (!isSqlProblem ? impl?.code?.find((c: any) => c.codeType === 'optimize')?.code : undefined);
      resetCode = algoCode || DEFAULT_CODE[language];
    } else {
      resetCode = DEFAULT_CODE[language];
    }
    setCode(resetCode);
    // Sync parent's savedCode immediately so the initialCode effect doesn't
    // overwrite the reset with the user's old code on the next render cycle.
    onCodeChange?.(resetCode);
    toast.success("Code reset to default");
  };

  const handleFormatCode = () => {
    editorRef.current?.formatCode();
    toast.success("Code formatted");
  };

  const isFullscreen = isMaximized || internalIsFullscreen;
  const toggleFullscreen = useCallback(() => {
    if (onToggleFullscreen) onToggleFullscreen();
    else setInternalIsFullscreen(prev => !prev);
  }, [onToggleFullscreen]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        if (!onToggleFullscreen) setInternalIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullscreen, onToggleFullscreen]);

  useEffect(() => {
    const timer = setTimeout(() => { editorRef.current?.layout(); }, 100);
    return () => clearTimeout(timer);
  }, [isFullscreen]);

  // Hook 4: Code Execution
  const executionHook = useCodeExecution({
    algorithmId,
    activeAlgorithm: algorithmData,
    code,
    language,
    testCases,
    setExecutedTestCases,
    editorRef,
    setActiveTab,
    setSubmissions,
    posthog,
    isLimitExceeded,
    onRunStart: () => {
      if (isMobile) {
        setIsOutputExpanded(true);
      } else {
        panelGroupRef.current?.setLayout([60, 40]);
        setIsOutputExpanded(true);
      }
    },
    onSuccess,
    onSubmissionComplete,
    onSubmissionStart
  });

  const { isLoading, isSubmitting, output, setOutput, executionTime, memoryUsage, lastRunSuccess, handleRun, handleSubmit } = executionHook;

  // Reset output panel whenever the user navigates to a different problem.
  // This clears the "Accepted" / "Wrong Answer" result tab so it never bleeds
  // across to a new problem. Also re-disables the "Test Result" tab button.
  useEffect(() => {
    if (!algorithmId) return;
    setActiveTab("testcase");
    setOutput(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algorithmId]);

  // Expose Imperative Handle
  React.useImperativeHandle(ref, () => ({
    run: handleRun,
    submit: handleSubmit,
    openThinkpad: () => {
      setIsScratchpadOpen(true);
      setActiveEditorTab("scratchpad");
    },
    selectSubmission: (submission: Submission) => {
      submissionViewer.handleSelectSubmission(submission);
    },
    reset: handleReset,
    formatCode: handleFormatCode,
    toggleFullscreen: toggleFullscreen
  }));

  // Report state changes
  useEffect(() => {
    onStateChange?.({ isLoading, isSubmitting, lastRunSuccess, viewingSubmission });
  }, [isLoading, isSubmitting, lastRunSuccess, viewingSubmission, onStateChange]);

  // Hook 5: Keyboard Shortcuts
  useKeyboardShortcuts({
    isLoading,
    isSubmitting,
    lastRunSuccess,
    controls,
    handleRun,
    handleSubmit
  });

  const handleShortcut = (key: string) => {
    if (key === "'") {
      if (!isLoading && !isSubmitting && controls?.run_code !== false) {
        handleRun();
      }
    } else if (key === "Enter") {
      const canSubmit = controls?.allow_submission !== false;
      if (!isLoading && !isSubmitting && canSubmit) {
        if (!lastRunSuccess) {
          toast.warning("Please run your code successfully before submitting (Ctrl/Cmd + Enter)", {
            description: "You need to pass all test cases first."
          });
          return;
        }
        handleSubmit();
      }
    }
  };

  const handleToggleOutputExpand = () => {
    const newExpanded = !isOutputExpanded;
    setIsOutputExpanded(newExpanded);
    if (!isMobile && panelGroupRef.current) {
      if (newExpanded) {
        panelGroupRef.current.setLayout([60, 40]);
      } else {
        panelGroupRef.current.setLayout([100 - minPanelSize, minPanelSize]);
      }
    }
  };

  const outputPanelContent = (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 overflow-hidden relative">
        <OutputPanel
          onToggleExpand={handleToggleOutputExpand}
          isExpanded={isOutputExpanded}
          onMaximize={() => setIsOutputModalOpen(!isOutputModalOpen)}
          isMaximized={isOutputModalOpen}
          output={output}
          loading={isLoading}
          submitting={isSubmitting}
          stdin=""
          onStdinChange={() => { }}
          testCases={testCases.map((tc: any) => ({
            input: tc.input,
            output: tc.expectedOutput
          }))}
          executionTime={executionTime}
          memoryUsage={memoryUsage}
          algorithmMeta={algorithmData}
          activeTab={activeTab}
          onTabChange={setActiveTab as any}
          allTestCases={testCases}
          executedTestCases={executedTestCases}
          onAddTestCase={() => handleAddTestCase(algorithmData)}
          onUpdateTestCase={handleUpdateTestCase}
          onDeleteTestCase={handleDeleteTestCase}
          submissions={submissions}
          onSelectSubmission={submissionViewer.handleSelectSubmission}
          editingTestCaseId={editingTestCaseId}
          onEditTestCase={setEditingTestCaseId}
          onCancelEdit={handleCancelEdit}
          inputSchema={algorithmData?.input_schema}
          controls={controls}
          activeTestCaseTab={activeTestCaseTab}
          onTestCaseTabChange={setActiveTestCaseTab}
          onOpenRulo={onOpenRulo}
        />
      </div>


      <RunnerFooter
        isExpanded={isOutputExpanded}
        onToggleExpand={handleToggleOutputExpand}
        onRun={handleRun}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        isSubmitting={isSubmitting}
        lastRunSuccess={lastRunSuccess}
        algorithm={algorithmData}
        user={user}
        hasPremiumAccess={hasPremiumAccess}
        handleRandomProblem={handleRandomProblem}
        handleNextProblem={handleNextProblem}
        handlePreviousProblem={handlePreviousProblem}
      />
    </div>
  );

  const handleCopyToLeetcode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Copied to clipboard! Opening LeetCode...");
      const leetcodeUrl = algorithmData?.metadata?.leetcode_url || algorithmData?.metadata?.leetcodeUrl;
      if (leetcodeUrl) {
        window.open(leetcodeUrl, "_blank", "noopener,noreferrer");
      } else {
        toast.error("No LeetCode URL found for this problem.");
      }
    } catch (err) {
      toast.error("Failed to copy code.");
    }
  };

  const editorTabs = (
    <Tabs
      value={activeEditorTab}
      onValueChange={(v) => setActiveEditorTab(v as any)}
      className="h-full flex flex-col"
    >
      {(!hideToolbar || viewingSubmission) && (
        <EditorToolbar
          activeEditorTab={activeEditorTab}
          setActiveEditorTab={setActiveEditorTab}
          language={language}
          onLanguageChange={handleLanguageChange}
          availableLanguages={availableLanguages}
          isMobile={isMobile || false}
          onToggleRightPanel={onToggleRightPanel}
          onReset={handleReset}
          onFormatCode={handleFormatCode}
          isLoading={isLoading}
          isSubmitting={isSubmitting}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          viewingSubmission={viewingSubmission}
          onCloseSubmission={submissionViewer.handleCloseSubmission}
          isScratchpadOpen={isScratchpadOpen}
          setIsScratchpadOpen={setIsScratchpadOpen}
          settings={settings}
          updateSetting={updateSetting}
          brainstormProps={brainstormProps}
          onToggleQween={onOpenRulo}
          isQweenOpen={false}
          onCopyToLeetcode={(algorithmData?.metadata?.leetcode_url || algorithmData?.metadata?.leetcodeUrl) ? handleCopyToLeetcode : undefined}
        />
      )}

      <div className="relative flex-1 flex flex-col min-h-0">
        <EditorPane
          activeEditorTab={activeEditorTab}
          code={code}
          onCodeChange={(newCode) => {
            setCode(newCode);
            onCodeChange?.(newCode);
          }}
          language={language}
          problemId={algorithmId}
          isMobile={isMobile || false}
          isLoading={isLoadingProp || false}
          settings={settings}
          viewingSubmission={viewingSubmission}
          editorRef={editorRef}
          brainstormProps={brainstormProps}
          onShortcut={handleShortcut}
        />
      </div>
    </Tabs>
  );

  const content = (
    <div ref={containerRef} className={`w-full bg-background shadow-sm flex flex-col ${isFullscreen
      ? 'fixed inset-0 z-50 h-screen w-screen rounded-none border-0'
      : `border rounded-lg overflow-hidden ${className || 'h-[calc(100vh-100px)]'}`
      }`}>
      {isMobile ? (
        <div className="h-full flex flex-col">
          <div className="flex-1 min-h-0 overflow-hidden">
            {editorTabs}
          </div>
          <div className={`flex flex-col border-t bg-background transition-all duration-300 ease-in-out ${isOutputExpanded ? 'h-[50vh]' : 'h-[64px]'}`}>
            {!isOutputModalOpen && outputPanelContent}
          </div>
        </div>
      ) : (
        <ResizablePanelGroup ref={panelGroupRef} direction="vertical" className="h-full">
          <ResizablePanel defaultSize={100 - minPanelSize} minSize={20} collapsible={true} collapsedSize={0}>
            {editorTabs}
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-muted/50 hover:bg-primary/20 data-[resize-handle-active]:bg-primary/40 transition-colors" />
          <ResizablePanel
            defaultSize={minPanelSize}
            minSize={minPanelSize}
            onResize={(size) => {
              if (size > minPanelSize + 5 && !isOutputExpanded) setIsOutputExpanded(true);
              if (size <= minPanelSize + 5 && isOutputExpanded) setIsOutputExpanded(false);
            }}
          >
            {!isOutputModalOpen && outputPanelContent}
          </ResizablePanel>
        </ResizablePanelGroup>
      )}

      <Dialog open={isOutputModalOpen} onOpenChange={setIsOutputModalOpen}>
        <DialogContent className="max-w-none w-screen h-screen m-0 flex flex-col p-0 overflow-hidden border-0 bg-background shadow-none rounded-none [&>button]:hidden">
          {outputPanelContent}
        </DialogContent>
      </Dialog>
    </div>
  );

  if (isFullscreen) {
    return createPortal(content, document.body);
  }

  return content;
});

CodeRunner.displayName = 'CodeRunner';

export default CodeRunner;
