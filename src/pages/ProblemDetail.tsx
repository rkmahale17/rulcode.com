"use client";
import React, { useCallback, useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import NextLink from "next/link";
import { Code2, ArrowLeft, Eye, Lightbulb, Minimize2, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { usePostHog } from "@posthog/react";
import { supabase } from "@/integrations/supabase/client";

// Components
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { PremiumLoader } from "@/components/PremiumLoader";
import { AlgoMetaHead } from "@/services/meta.injector";
import { CodeRunnerRef } from "@/components/CodeRunner/CodeRunner";

// New Refactored Components
import Navbar from "@/components/Navbar";
import { ProblemDescriptionPanel } from "@/components/algorithm/ProblemDescriptionPanel";
import { CodeWorkspacePanel } from "@/components/algorithm/CodeWorkspacePanel";
import { Paywall } from "@/components/Paywall";

// New Hooks
import { useAlgorithmLayout } from "@/hooks/useAlgorithmLayout";
import { useInterviewSession } from "@/hooks/useInterviewSession";
import { useAlgorithmInteractions } from "@/hooks/useAlgorithmInteractions";
import { useUserAlgorithmData } from "@/hooks/useUserAlgorithmData";
import { useAlgorithm } from "@/hooks/useAlgorithm";
import { useApp } from "@/contexts/AppContext";
import { useFeatureFlag } from "@/contexts/FeatureFlagContext";

// Helper for scrolling to code section on mobile
const scrollToCode = () => {
  const codeSection = document.getElementById('mobile-code-section');
  if (codeSection) {
    codeSection.scrollIntoView({ behavior: 'smooth' });
  }
};

import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { ProblemSidebar } from "@/components/ProblemSidebar";
import { useAlgorithms } from "@/hooks/useAlgorithms";
import { ListType, LIST_TYPE_LABELS } from "@/types/algorithm";
import { Submission } from "@/types/userAlgorithmData";


const ProblemDetail: React.FC = () => {
  const router = useRouter();
  const routeParams = useParams();
  const id = routeParams?.id as string | undefined;
  const slug = routeParams?.slug as string | undefined;
  // Unified route: /problem/:id (supports both core patterns and Blind 75)
  const algorithmIdOrSlug = (id || slug) as string;
  const posthog = usePostHog();

  // -- Data Fetching State --
  const { data: algorithm, isLoading: isLoadingAlgorithm } = useAlgorithm(algorithmIdOrSlug);
  const { user, hasPremiumAccess, activeListType, setActiveListType, progressMap, profile } = useApp();
  const { data: algorithmsData, isLoading: isAlgorithmsLoading } = useAlgorithms();
  const isUserAdmin = profile?.role === 'admin';
  const allAlgorithms = useMemo(() => {
    const isSql = (algorithm as any)?.problemType === 'sql' || (algorithm as any)?.problem_type === 'sql' || (algorithm as any)?.problem_type === 'SQL' || (algorithm as any)?.problemType === 'SQL';
    return (algorithmsData?.algorithms || [])
      .filter(algo => {
        const algoIsSql = algo.problemType === 'sql' || algo.problem_type === 'sql' || algo.problem_type === 'SQL' || algo.problemType === 'SQL';
        return isSql ? algoIsSql : (!algoIsSql && algo.problemType === "dsa");
      })
      .filter(algo => algo.published !== false || isUserAdmin);
  }, [algorithmsData, isUserAdmin, algorithm]);
  const isPaywallEnabled = useFeatureFlag('paywall_enabled');

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isPremiumAlgorithm = useMemo(() => {
    const algo = algorithm as any;
    return !!(algo?.is_premium || algo?.is_pro || algo?.metadata?.is_pro);
  }, [algorithm]);

  // -- Hooks --
  const layout = useAlgorithmLayout();
  const session = useInterviewSession();

  // Fetch user data hook
  const { data: userAlgoData, loading: loadingUserData, refetch: refetchUserData } = useUserAlgorithmData({
    userId: user?.id,
    algorithmId: algorithmIdOrSlug || '',
    enabled: !!user && !!algorithmIdOrSlug,
  });


  const filteredAlgorithms = useMemo(() => {
    if (!allAlgorithms) return [];
    if (!activeListType || activeListType === 'all') return allAlgorithms;

    const rawListType = activeListType.toLowerCase();
    const currentListType =
      rawListType === 'blind'
        ? ListType.Blind75
        : rawListType === 'rulcode150'
          ? ListType.Blind150
          : rawListType === 'corealgo'
            ? ListType.Core
            : rawListType;

    return allAlgorithms.filter(algo => {
      const listTypes =
        algo.listTypes || (algo.list_type ? [algo.list_type] : ['core']);
      const normalizedListTypes = listTypes.map((t: string) => {
        const lower = t.toLowerCase();
        if (lower === 'corealgo') return ListType.Core;
        if (lower === 'blind') return ListType.Blind75;
        if (lower === 'rulcode150') return ListType.Blind150;
        return lower;
      });
      if (currentListType === ListType.Blind150) {
        return (
          normalizedListTypes.includes(ListType.Blind150) ||
          normalizedListTypes.includes(ListType.Blind75)
        );
      }
      return normalizedListTypes.includes(currentListType);
    });
  }, [allAlgorithms, activeListType]);

  const interactions = useAlgorithmInteractions({
    user,
    algorithmId: algorithmIdOrSlug,
    algorithm,
    userAlgoData,
    refetchUserData,
    filteredAlgorithms,
  });

  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    if (userAlgoData?.submissions) {
      setSubmissions(userAlgoData.submissions);
    }
  }, [userAlgoData?.submissions]);

  // -- Code Runner Control --
  const runnerRef = React.useRef<CodeRunnerRef>(null);
  const [runnerState, setRunnerState] = useState({
    isLoading: false,
    isSubmitting: false,
    lastRunSuccess: false
  });

  const handleRunnerStateChange = useCallback((state: any) => {
    setRunnerState(state);
  }, []);

  const handleRun = useCallback(() => {
    runnerRef.current?.run();
  }, []);

  const handleSubmit = useCallback(() => {
    runnerRef.current?.submit();
  }, []);

  const handleSelectSubmission = useCallback((submission: any) => {
    runnerRef.current?.selectSubmission(submission);
  }, []);

  // -- Effects --

  // 1. Auth Listener - Removed as it's now handled by AppContext

  // 2. Set Likes/Dislikes Initial State from Algorithm Data
  useEffect(() => {
    if (algorithm?.metadata) {
      const meta = algorithm.metadata as any;
      interactions.setLikes((meta.likes as number) || 0);
      interactions.setDislikes((meta.dislikes as number) || 0);
    }
  }, [algorithm]);

  // 3. Track Problem Opened
  useEffect(() => {
    if (algorithm) {
      posthog?.capture('problem_opened', {
        problemId: algorithmIdOrSlug,
        problemName: algorithm.name,
        difficulty: algorithm.difficulty,
        listType: activeListType
      });
    }
  }, [algorithm, algorithmIdOrSlug, posthog, activeListType]);

  // 4. Track Tab Switch
  useEffect(() => {
    if (algorithm) {
      posthog?.capture('problem_tab_switched', {
        problemId: algorithmIdOrSlug,
        tabName: layout.activeTab,
        panel: 'left'
      });
    }
  }, [layout.activeTab, algorithmIdOrSlug, posthog, algorithm]);

  // -- Handlers --
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out");
    } else {
      toast.success("Signed out successfully");
      router.push("/");
    }
  };

  const handleRichTextClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    if (anchor) {
      const href = anchor.getAttribute('href');
      if (href === '#visualization') {
        e.preventDefault();
        layout.setActiveTab('visualizations');
      }
    }
  }, [layout.setActiveTab]);

  const codeWorkspacePanel = useMemo(() => (
    <CodeWorkspacePanel
      algorithm={algorithm}
      algorithmId={algorithmIdOrSlug || ""}
      isMobile={layout.isMobile}
      toggleRightPanel={layout.toggleRightPanel}
      savedCode={interactions.savedCode}
      handleCodeChange={interactions.handleCodeChange}
      handleCodeSuccess={interactions.handleCodeSuccess}
      selectedLanguage={interactions.selectedLanguage}
      setSelectedLanguage={interactions.setSelectedLanguage}
      isCodeRunnerMaximized={layout.isCodeRunnerMaximized}
      setIsCodeRunnerMaximized={layout.setIsCodeRunnerMaximized}
      submissions={submissions}
      setSubmissions={setSubmissions}
      codeRunnerRef={runnerRef}
      onRunnerStateChange={handleRunnerStateChange}
      isLoading={loadingUserData}
      onSubmissionComplete={refetchUserData}
    />
  ), [
    algorithm,
    algorithmIdOrSlug,
    layout.isMobile,
    layout.toggleRightPanel,
    interactions.savedCode,
    interactions.handleCodeChange,
    interactions.handleCodeSuccess,
    interactions.selectedLanguage,
    interactions.setSelectedLanguage,
    layout.isCodeRunnerMaximized,
    layout.setIsCodeRunnerMaximized,
    submissions,
    loadingUserData
  ]);

  // -- Render Guards --

  if (isLoadingAlgorithm) {
    return <PremiumLoader text="Fetching Algorithm Details" />;
  }

  // Paywall Logic
  if (isPaywallEnabled && isPremiumAlgorithm && !hasPremiumAccess) {
    return <Paywall />;
  }



  // Not Found
  if (!algorithm) {
    return (
      <>
        <AlgoMetaHead />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-">Algorithm not found</h2>
            <NextLink href="/">
              <Button>Go Home</Button>
            </NextLink>
          </div>
        </div>
      </>
    );
  }



  // Determine layout mode
  const isTablet = layout.windowWidth >= 480 && layout.windowWidth < 778;
  const showHorizontalScroll = isTablet;
  const isMobileView = layout.windowWidth < 480;



  return (
    <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
      <div className={`h-screen w-full overflow-hidden flex flex-col bg-background ${session.isInterviewMode ? 'border-4 border-green-500/30' : ''}`}>
        <style dangerouslySetInnerHTML={{ __html: '.global-nav { display: none !important; }' }} />
        <AlgoMetaHead algorithm={algorithm} />

        <Navbar
          isProblemMode={true}
          algorithm={algorithm}
          isInterviewMode={session.isInterviewMode}
          toggleInterviewMode={session.toggleInterviewMode}
          timerSeconds={session.timerSeconds}
          isTimerRunning={session.isTimerRunning}
          setIsTimerRunning={session.setIsTimerRunning}
          setTimerSeconds={session.setTimerSeconds}
          formatTime={session.formatTime}
          handleRandomProblem={interactions.handleRandomProblem}
          handleNextProblem={interactions.handleNextProblem}
          handlePreviousProblem={interactions.handlePreviousProblem}
          handleShare={interactions.handleShare}
          onToggleSidebar={() => setIsSidebarOpen(true)}
          activeListType={activeListType}
        />

        <div className={`flex-1 relative ${showHorizontalScroll ? 'overflow-x-auto overflow-y-hidden' : 'overflow-hidden'}`}>
          {(algorithm?.controls as any)?.maintenance_mode ? (
            <div className="h-full w-full flex flex-col items-center justify-center bg-card/30 backdrop-blur-sm p-4 text-center space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-20" />
                <div className="bg-primary/10 p-6 rounded-full">
                  <Code2 className="w-12 h-12 text-primary animate-bounce duration-1000" />
                </div>
              </div>
              <div className="space-y-2 max-w-md">
                <h1 className="text-3xl font- tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                  Under Maintenance
                </h1>
                <p className="text-muted-foreground">
                  This algorithm is currently getting a makeover. Please check back shortly!
                </p>
              </div>
              <NextLink href="/">
                <Button variant="outline" className="gap-2 hover:bg-primary/10">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Problems
                </Button>
              </NextLink>
            </div>
          ) : (
            /* Normal Content */
            isMobileView ? (
              <div className="h-full overflow-y-auto no-scrollbar pb-20 scroll-smooth">
                {/* Top: Description */}
                <div className="min-h-screen">
                  <ProblemDescriptionPanel
                    algorithm={algorithm}
                    activeTab={layout.activeTab}
                    setActiveTab={layout.setActiveTab}
                    isMobile={true}
                    toggleLeftPanel={layout.toggleLeftPanel}
                    isCompleted={interactions.isCompleted}
                    likes={interactions.likes}
                    dislikes={interactions.dislikes}
                    userVote={interactions.userVote}
                    isFavorite={interactions.isFavorite}
                    handleVote={interactions.handleVote}
                    toggleFavorite={interactions.toggleFavorite}
                    isVisualizationMaximized={layout.isVisualizationMaximized}
                    setIsVisualizationMaximized={layout.setIsVisualizationMaximized}
                    handleRichTextClick={handleRichTextClick}
                    submissions={submissions}
                    onSelectSubmission={handleSelectSubmission}
                  />
                </div>

                {/* Bottom: Code Workspace */}
                <div id="mobile-code-section" className="min-h-screen border-t-4 border-muted">
                  <CodeWorkspacePanel
                    algorithm={algorithm}
                    algorithmId={algorithmIdOrSlug || ""}
                    isMobile={true}
                    toggleRightPanel={layout.toggleRightPanel}
                    savedCode={interactions.savedCode}
                    handleCodeChange={interactions.handleCodeChange}
                    handleCodeSuccess={interactions.handleCodeSuccess}
                    selectedLanguage={interactions.selectedLanguage}
                    setSelectedLanguage={interactions.setSelectedLanguage}
                    isCodeRunnerMaximized={layout.isCodeRunnerMaximized}
                    setIsCodeRunnerMaximized={layout.setIsCodeRunnerMaximized}
                    submissions={submissions}
                    setSubmissions={setSubmissions}
                    className="h-[85vh]"
                    isInterviewMode={session.isInterviewMode}
                    onSubmissionComplete={refetchUserData}
                  />
                </div>

                {/* Floating Action Button for Mobile Scroll */}
                <div className="fixed bottom-6 right-6 z-50">
                  <Button
                    size="icon"
                    className="rounded-full h-12 w-12 shadow-lg hover:shadow-xl transition-shadow bg-primary text-primary-foreground"
                    onClick={scrollToCode}
                  >
                    <ArrowDown className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            ) : (
              /* Tablet/Desktop View (>= 480px): Resizable Panels */
              <div className={`h-full ${showHorizontalScroll ? 'min-w-[778px]' : 'w-full'}`}>
                <ResizablePanelGroup direction="horizontal" className="h-full" autoSaveId="problem-panels-layout">
                  {/* Left Panel */}
                  <ResizablePanel
                    ref={layout.leftPanelRef}
                    defaultSize={40}
                    minSize={20}
                    maxSize={80}
                    collapsible={true}
                    onCollapse={() => {
                      // If utilizing local storage sync, update it here
                    }}
                    className={layout.isLeftCollapsed ? 'min-w-[0px]' : ''}
                  >
                    <ProblemDescriptionPanel
                      algorithm={algorithm}
                      activeTab={layout.activeTab}
                      setActiveTab={layout.setActiveTab}
                      isMobile={layout.isMobile}
                      toggleLeftPanel={layout.toggleLeftPanel}
                      isCompleted={interactions.isCompleted}
                      likes={interactions.likes}
                      dislikes={interactions.dislikes}
                      userVote={interactions.userVote}
                      isFavorite={interactions.isFavorite}
                      handleVote={interactions.handleVote}
                      toggleFavorite={interactions.toggleFavorite}
                      isVisualizationMaximized={layout.isVisualizationMaximized}
                      setIsVisualizationMaximized={layout.setIsVisualizationMaximized}
                      handleRichTextClick={handleRichTextClick}
                      submissions={submissions}
                      onSelectSubmission={handleSelectSubmission}
                    />
                  </ResizablePanel>

                  <ResizableHandle withHandle className="bg-border hover:bg-primary/20 data-[resize-handle-active]:bg-primary/40 transition-colors" />

                  {/* Right Panel */}
                  <ResizablePanel
                    ref={layout.rightPanelRef}
                    defaultSize={60}
                    minSize={20}
                    maxSize={80}
                    collapsible={true}
                    onCollapse={() => { }}
                    className={layout.isRightCollapsed ? 'min-w-[0px]' : ''}
                  >
                    {codeWorkspacePanel}
                  </ResizablePanel>
                </ResizablePanelGroup>
              </div>
            )
          )}
        </div>

        <SheetContent side="left" className="w-full sm:max-w-[600px] p-0 border-r border-border shadow-2xl flex flex-col">
          <div className="flex items-center justify-between p-3 border-b border-border bg-background">
            <Select
              value={activeListType || "all"}
              onValueChange={(val) => setActiveListType(val as any)}
            >
              <SelectTrigger className="w-[140px] h-8 bg-background border-input text-xs focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none">
                <SelectValue>
                  {LIST_TYPE_LABELS[activeListType as any] || 'Problem List'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Problems</SelectItem>
                {Object.entries(LIST_TYPE_LABELS)
                  .filter(([key]) => key !== 'all')
                  .map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 overflow-hidden">
            <ProblemSidebar
              algorithms={filteredAlgorithms as any}
              progressMap={progressMap || {}}
              isPaywallEnabled={isPaywallEnabled}
              hasPremiumAccess={hasPremiumAccess}
              className="h-full"
              onItemClick={() => setIsSidebarOpen(false)}
            />
          </div>
        </SheetContent>
      </div>
    </Sheet>
  );
};

export default ProblemDetail;
