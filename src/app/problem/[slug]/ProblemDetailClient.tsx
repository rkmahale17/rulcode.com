"use client";

import { AlignLeft, Maximize, Minimize2, RotateCcw } from "lucide-react";
import { ArrowDown, ArrowLeft, Code2, Check, PanelRightClose, Bot } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
// Components
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Button } from "@/components/ui/button";
import { CodeRunnerRef } from "@/components/CodeRunner/CodeRunner";
import { CodeWorkspacePanel } from "@/components/algorithm/CodeWorkspacePanel";
import { LIST_TYPE_LABELS } from "@/types/algorithm";
import { LanguageSelector } from "@/components/CodeRunner/LanguageSelector";
import Link from "next/link";
// Refactored Components
import Navbar from "@/components/Navbar";
import { Paywall } from "@/components/Paywall";
import { ProblemDescriptionPanel } from "@/components/algorithm/ProblemDescriptionPanel";
import { ProblemSidebar } from "@/components/ProblemSidebar";
import { SettingsPopover } from "@/components/CodeRunner/SettingsPopover";
import dynamic from "next/dynamic";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAlgorithm } from "@/hooks/useAlgorithm";
import { useAlgorithmInteractions } from "@/hooks/useAlgorithmInteractions";
// Hooks
import { useAlgorithmLayout } from "@/hooks/useAlgorithmLayout";
import { useAlgorithms } from "@/hooks/useAlgorithms";
import { useApp } from "@/contexts/AppContext";
import { useEditorSettings } from "@/hooks/useEditorSettings";
import { useFeatureFlag } from "@/contexts/FeatureFlagContext";
import { useInterviewSession } from "@/hooks/useInterviewSession";
import { usePostHog } from "@posthog/react";
import { useRouter } from "next/navigation";
import { useUserAlgorithmData } from "@/hooks/useUserAlgorithmData";

// Helper for scrolling to code section on mobile
const scrollToCode = () => {
  const codeSection = document.getElementById("mobile-code-section");
  if (codeSection) {
    codeSection.scrollIntoView({ behavior: "smooth" });
  }
};

interface ProblemDetailClientProps {
  initialAlgorithm: any;
  slug: string;
  isCrawler?: boolean;
}

const ProblemDetailClient: React.FC<ProblemDetailClientProps> = ({
  initialAlgorithm,
  slug,
  isCrawler = false,
}) => {
  const algorithmIdOrSlug = slug;
  const router = useRouter();
  const posthog = usePostHog();

  // -- Data Fetching State --
  // We seed useAlgorithm with initial data from server
  const { data: algorithm } = useAlgorithm(algorithmIdOrSlug);
  const activeAlgorithm = algorithm || initialAlgorithm;

  const {
    user,
    profile,
    hasPremiumAccess,
    activeListType,
    setActiveListType,
    progressMap,
  } = useApp();
  const { data: algorithmsData } = useAlgorithms();
  const isUserAdmin = profile?.role === "admin";

  const allAlgorithms = useMemo(
    () => {
      const isSql = activeAlgorithm?.problemType === 'sql' || activeAlgorithm?.problem_type === 'sql' || activeAlgorithm?.problem_type === 'SQL' || activeAlgorithm?.problemType === 'SQL';
      const isFrontend = activeAlgorithm?.problemType === 'frontend' || activeAlgorithm?.problem_type === 'frontend';
      return (algorithmsData?.algorithms || [])
        .filter((algo) => {
          const algoIsSql = algo.problemType === 'sql' || algo.problem_type === 'sql' || algo.problem_type === 'SQL' || algo.problemType === 'SQL';
          const algoIsFrontend = algo.problemType === 'frontend' || algo.problem_type === 'frontend';
          if (isFrontend) return algoIsFrontend;
          return isSql ? algoIsSql : (!algoIsSql && !algoIsFrontend && algo.problemType === "dsa");
        })
        .filter((algo) => algo.published !== false || isUserAdmin);
    },
    [algorithmsData, isUserAdmin, activeAlgorithm],
  );

  const nextProblem = useMemo(() => {
    if (!activeAlgorithm || !allAlgorithms) return null;
    const sorted = [...allAlgorithms].sort((a, b) => (a.serial_no || 0) - (b.serial_no || 0));
    const currentIndex = sorted.findIndex(
      (a) =>
        a.id === activeAlgorithm.id ||
        a.slug === activeAlgorithm.slug ||
        a.id === slug,
    );
    if (currentIndex >= 0 && currentIndex < sorted.length - 1) {
      return sorted[currentIndex + 1];
    }
    return null;
  }, [activeAlgorithm, allAlgorithms, slug]);

  const isPaywallEnabled = useFeatureFlag("paywall_enabled");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isPremiumAlgorithm = useMemo(() => {
    return !!(
      activeAlgorithm?.is_premium ||
      activeAlgorithm?.is_pro ||
      activeAlgorithm?.metadata?.is_pro
    );
  }, [activeAlgorithm]);

  // -- Hooks --
  const layout = useAlgorithmLayout();
  const session = useInterviewSession();
  const { settings, updateSetting } = useEditorSettings();

  // Fetch user data hook
  const {
    data: userAlgoData,
    loading: loadingUserData,
    refetch: refetchUserData,
  } = useUserAlgorithmData({
    userId: user?.id,
    algorithmId: algorithmIdOrSlug || "",
    numericAlgorithmId: activeAlgorithm?.id?.toString(),
    enabled: !!user && !!algorithmIdOrSlug,
  });

  const filteredAlgorithms = useMemo(() => {
    if (!allAlgorithms) return [];
    if (!activeListType || activeListType === "all") return allAlgorithms;

    const currentListType = activeListType.toLowerCase();
    return allAlgorithms.filter((algo) => {
      const listTypes =
        algo.listTypes || (algo.list_type ? [algo.list_type] : []);
      const normalizedListTypes = listTypes.map((t: string) =>
        t.toLowerCase() === "corealgo" ? "core" : t.toLowerCase(),
      );
      return normalizedListTypes.includes(currentListType);
    });
  }, [allAlgorithms, activeListType]);

  const totalCount = filteredAlgorithms.length;
  const completedCount = useMemo(() => {
    if (!progressMap) return 0;
    return filteredAlgorithms.filter(
      (algo) => progressMap[algo.id] === "solved",
    ).length;
  }, [filteredAlgorithms, progressMap]);
  const progressPercentage =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const interactions = useAlgorithmInteractions({
    user,
    algorithmId: algorithmIdOrSlug,
    algorithm: activeAlgorithm,
    userAlgoData,
    refetchUserData,
    filteredAlgorithms,
  });

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [prevDbSubmissions, setPrevDbSubmissions] = useState<Submission[] | undefined>(undefined);

  if (userAlgoData?.submissions !== prevDbSubmissions) {
    setPrevDbSubmissions(userAlgoData?.submissions);
    if (userAlgoData?.submissions) {
      setSubmissions((current) => {
        // Create a map of all known submissions (DB + Local)
        const allSubmissionsMap = new Map();
        
        // Add DB submissions first
        userAlgoData.submissions.forEach((sub: Submission) => {
          allSubmissionsMap.set(sub.id, sub);
        });
        
        // Add current local submissions (to preserve any optimistic updates that haven't propagated yet)
        current.forEach((sub: Submission) => {
          if (!allSubmissionsMap.has(sub.id)) {
            allSubmissionsMap.set(sub.id, sub);
          }
        });
        
        // Convert back to array and sort descending by timestamp
        return Array.from(allSubmissionsMap.values()).sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      });
    }
  }

  const handleSelectSubmission = useCallback(
    (submission: any) => {
      // 1. Find which panel contains the "editor" (Code) tab and activate it first
      if (layout.leftTabs.includes("editor")) {
        layout.setActiveLeftTab("editor");
      } else if (layout.rightTabs.includes("editor")) {
        layout.setActiveRightTab("editor");
      } else {
        layout.addTab("right", "editor");
      }

      // 2. Select the submission after a short timeout so Monaco mounts inside a visible container
      setTimeout(() => {
        runnerRef.current?.selectSubmission(submission);
      }, 50);
    },
    [
      layout.leftTabs,
      layout.rightTabs,
      layout.setActiveLeftTab,
      layout.setActiveRightTab,
      layout.addTab,
    ],
  );

  // -- Code Runner Control --
  const runnerRef = React.useRef<CodeRunnerRef>(null);
  const [runnerState, setRunnerState] = useState({
    isLoading: false,
    isSubmitting: false,
    lastRunSuccess: false,
    viewingSubmission: null as any,
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

  // -- Effects --

  // 1. Set Likes/Dislikes Initial State from Algorithm Data
  useEffect(() => {
    if (activeAlgorithm?.metadata) {
      const meta = activeAlgorithm.metadata as any;
      interactions.setLikes((meta.likes as number) || 0);
      interactions.setDislikes((meta.dislikes as number) || 0);
    }
  }, [activeAlgorithm]);

  // 2. Track Problem Opened
  useEffect(() => {
    if (activeAlgorithm) {
      posthog?.capture("problem_opened", {
        problemId: algorithmIdOrSlug,
        problemName: activeAlgorithm.name,
        difficulty: activeAlgorithm.difficulty,
        listType: activeListType,
      });
    }
  }, [activeAlgorithm, algorithmIdOrSlug, posthog, activeListType]);

  // 2b. Auto-mark problem as "Learned" in localStorage when problem page is opened
  // This auto-completes the "Learn" step in the Roadmap for this problem.
  useEffect(() => {
    if (!activeAlgorithm?.id) return;
    try {
      const saved = localStorage.getItem('roadmap_learned_problems');
      const learned: string[] = saved ? JSON.parse(saved) : [];
      if (!learned.includes(activeAlgorithm.id)) {
        learned.push(activeAlgorithm.id);
        localStorage.setItem('roadmap_learned_problems', JSON.stringify(learned));
      }
    } catch (e) {
      // Silently ignore localStorage errors
    }
  }, [activeAlgorithm?.id]);

  // 3. Track Tab Switch
  useEffect(() => {
    if (activeAlgorithm) {
      posthog?.capture("problem_tab_switched", {
        problemId: algorithmIdOrSlug,
        tabName: layout.activeTab,
        panel: "left",
      });
    }
  }, [layout.activeTab, algorithmIdOrSlug, posthog, activeAlgorithm]);

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

  const handleRichTextClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (anchor) {
        const href = anchor.getAttribute("href");
        if (href === "#visualization") {
          e.preventDefault();
          if (layout.leftTabs.includes("visualizations")) {
            layout.setActiveLeftTab("visualizations");
          } else if (layout.rightTabs.includes("visualizations")) {
            layout.setActiveRightTab("visualizations");
          } else {
            layout.addTab("left", "visualizations");
          }
        }
      }
    },
    [
      layout.leftTabs,
      layout.rightTabs,
      layout.setActiveLeftTab,
      layout.setActiveRightTab,
      layout.addTab,
    ],
  );

  const activateWorkspaceTab = useCallback(
    (tabId: string) => {
      if (layout.isMobile) {
        if (layout.leftTabs.includes(tabId)) {
          layout.setActiveLeftTab(tabId);
        } else {
          layout.addTab("left", tabId);
        }
        return;
      }

      if (layout.leftTabs.includes(tabId)) {
        layout.setActiveLeftTab(tabId);
      } else if (layout.rightTabs.includes(tabId)) {
        layout.setActiveRightTab(tabId);
      } else {
        const targetPanel = tabId === "thinkpad" ? "right" : "left";
        layout.addTab(targetPanel, tabId);
      }
    },
    [
      layout.isMobile,
      layout.leftTabs,
      layout.rightTabs,
      layout.setActiveLeftTab,
      layout.setActiveRightTab,
      layout.addTab,
    ],
  );

  const isLeftPanelEditorActive =
    layout.activeLeftTab === "editor" && layout.leftTabs.includes("editor");
  const isRightPanelEditorActive =
    layout.activeRightTab === "editor" && layout.rightTabs.includes("editor");

  const availableLanguages = useMemo(() => {
    const isSqlProblem = activeAlgorithm?.problemType === 'sql' || activeAlgorithm?.problem_type === 'sql' || activeAlgorithm?.problem_type === 'SQL' || activeAlgorithm?.problemType === 'SQL';
    if (isSqlProblem) return ['sql'];

    const isFrontendProblem = activeAlgorithm?.problemType === 'frontend' || activeAlgorithm?.problem_type === 'frontend';
    if (isFrontendProblem) return ['typescript'];

    const controls = activeAlgorithm?.controls?.code_runner;
    return controls?.languages
      ? (Object.keys(controls.languages) as any[]).filter(
          (lang) => controls.languages[lang],
        )
      : undefined;
  }, [activeAlgorithm]);

  const getEditorHeaderContent = useCallback(
    (panelId: "left" | "right") => {
      const isActive =
        panelId === "left" ? isLeftPanelEditorActive : isRightPanelEditorActive;
      if (!isActive || runnerState.viewingSubmission) return null;

      const handleReset = () => {
        runnerRef.current?.reset?.();
      };

      const handleFormat = () => {
        runnerRef.current?.formatCode?.();
      };

      const isFullscreen = layout.isCodeRunnerMaximized;
      const toggleFullscreen = () => {
        layout.setIsCodeRunnerMaximized(!layout.isCodeRunnerMaximized);
      };

      const handleCopyToLeetcode = async () => {
        try {
          await navigator.clipboard.writeText(interactions.savedCode);
          toast.success("Copied to clipboard! Opening LeetCode...");
          const leetcodeUrl = activeAlgorithm?.metadata?.leetcode_url || activeAlgorithm?.metadata?.leetcodeUrl;
          if (leetcodeUrl) {
            window.open(leetcodeUrl, "_blank", "noopener,noreferrer");
          } else {
            toast.error("No LeetCode URL found for this problem.");
          }
        } catch (err) {
          toast.error("Failed to copy code.");
        }
      };

      const LeetcodeIcon = ({ className }: { className?: string }) => (
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor">
            <path d="M16.102 17.93l-2.697 2.607c-.466.467-1.111.662-1.823.662s-1.357-.195-1.824-.662l-4.332-4.363c-.467-.467-.701-1.115-.701-1.924s.234-1.457.701-1.924l2.92-2.938c.466-.467 1.111-.662 1.824-.662s1.357.195 1.824.662l2.919 2.938c.467.467.665 1.115.665 1.924 0 .808-.198 1.457-.665 1.924l-3.23 3.197h8.847c.563 0 1.018.457 1.018 1.02s-.455 1.02-1.018 1.02H16.102zm-3.661-4.706l-2.148-2.179c-.197-.198-.588-.198-.785 0l-2.919 2.937c-.198.199-.198.59 0 .788l4.332 4.363c.197.199.588.199.785 0l2.697-2.607c.198-.198.198-.589 0-.788l-1.962-1.962v-.001h-3.957c-.563 0-1.018-.456-1.018-1.019s.455-1.02 1.018-1.02h4.957v.488zM20.916 6.136c0-.809-.234-1.457-.701-1.924L17.296 1.274C16.829.807 16.184.612 15.472.612s-1.357.195-1.824.662L8.031 6.891c-.467.467-.701 1.115-.701 1.924s.234 1.457.701 1.924l4.332 4.363c.467.467 1.111.662 1.824.662s1.357-.195 1.824-.662l5.617-5.65c.467-.467.665-1.115.665-1.924v-.001h-.001z" />
        </svg>
      );

      return (
        <TooltipProvider>
          <div className="flex items-center h-full select-none">
            <LanguageSelector
              language={interactions.selectedLanguage as any}
              onLanguageChange={(lang) =>
                interactions.setSelectedLanguage(lang)
              }
              availableLanguages={availableLanguages}
              disabled={runnerState.isLoading || runnerState.isSubmitting}
            />
            <div className="flex items-center gap-1 pl-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={handleReset}
                    disabled={runnerState.isLoading || runnerState.isSubmitting}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="z-[150]">
                  Reset to starter code
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={handleFormat}
                  >
                    <AlignLeft className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="z-[150]">
                  Format code
                </TooltipContent>
              </Tooltip>

              {(activeAlgorithm?.metadata?.leetcode_url || activeAlgorithm?.metadata?.leetcodeUrl) && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-orange-500 hover:text-orange-600 hover:bg-orange-500/10"
                      onClick={handleCopyToLeetcode}
                    >
                      <LeetcodeIcon className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="z-[150]">
                    Paste to LeetCode
                  </TooltipContent>
                </Tooltip>
              )}

              <SettingsPopover
                settings={settings}
                updateSetting={updateSetting}
              />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={toggleFullscreen}
                  >
                    {isFullscreen ? (
                      <Minimize2 className="w-4 h-4" />
                    ) : (
                      <Maximize className="w-4 h-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="z-[150]">
                  {isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </TooltipProvider>
      );
    },
    [
      isLeftPanelEditorActive,
      isRightPanelEditorActive,
      interactions.selectedLanguage,
      interactions.setSelectedLanguage,
      availableLanguages,
      runnerState.isLoading,
      runnerState.isSubmitting,
      layout.isCodeRunnerMaximized,
      layout.setIsCodeRunnerMaximized,
      settings,
      updateSetting,
    ],
  );

  const codeWorkspacePanel = useMemo(
    () => (
      <CodeWorkspacePanel
        algorithm={activeAlgorithm}
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
        hasPremiumAccess={hasPremiumAccess}
        handleRandomProblem={interactions.handleRandomProblem}
        handleNextProblem={interactions.handleNextProblem}
        handlePreviousProblem={interactions.handlePreviousProblem}
        onSubmissionComplete={() => {
          refetchUserData();
          if (layout.leftTabs.includes("submissions")) {
            layout.setActiveLeftTab("submissions");
          } else if (layout.rightTabs.includes("submissions")) {
            layout.setActiveRightTab("submissions");
          } else {
            layout.addTab("left", "submissions");
          }
        }}
        onOpenRulo={() => {
          if (!layout.leftTabs.includes("rulo")) {
            layout.addTab("left", "rulo");
          }
          layout.setActiveLeftTab("rulo");
        }}
        hideToolbar={!layout.isMobile && !layout.isCodeRunnerMaximized}
      />
    ),
    [
      activeAlgorithm,
      algorithmIdOrSlug,
      layout.isMobile,
      layout.toggleRightPanel,
      interactions.handleCodeChange,
      interactions.handleCodeSuccess,
      interactions.selectedLanguage,
      interactions.setSelectedLanguage,
      layout.isCodeRunnerMaximized,
      layout.setIsCodeRunnerMaximized,
      submissions,
      loadingUserData,
      interactions.handleRandomProblem,
      interactions.handleNextProblem,
      interactions.handlePreviousProblem,
      layout.leftTabs,
      layout.rightTabs,
      layout.setActiveLeftTab,
      layout.setActiveRightTab,
      layout.addTab,
      refetchUserData,
    ],
  );

  // -- Render Guards --

  // Paywall Logic - Bypassed for Search Engine Crawlers to allow SEO indexing of the problem descriptions
  if (
    isPaywallEnabled &&
    isPremiumAlgorithm &&
    !hasPremiumAccess &&
    !isCrawler
  ) {
    return <Paywall />;
  }

  // Determine layout mode
  const isTablet = false; // layout.windowWidth >= 768 && layout.windowWidth < 1024;
  const showHorizontalScroll = false;
  const isMobileView = layout.windowWidth < 768;

  const isUnpublished = activeAlgorithm?.published === false;

  return (
    <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
      <style
        dangerouslySetInnerHTML={{
          __html: ".global-nav { display: none !important; }",
        }}
      />
      <div
        className={`h-screen w-full overflow-hidden flex flex-col bg-background ${session.isInterviewMode ? "border-4 border-green-500/30" : ""}`}
      >
        <Navbar
          isProblemMode={true}
          algorithm={activeAlgorithm}
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
          onOpenRulo={() => {
            if (layout.leftTabs.includes("rulo")) {
              layout.setActiveLeftTab("rulo");
            } else if (layout.rightTabs.includes("rulo")) {
              layout.setActiveRightTab("rulo");
            } else {
              layout.addTab("left", "rulo");
            }
          }}
        />

        {isUnpublished && (
          <div className="bg-yellow-500/20 border-b border-yellow-500/30 px-4 py-1.5 text-center text-xs font-medium text-yellow-200 flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <span>
              Admin Preview: This problem is a draft (unpublished) and not
              visible to regular users.
            </span>
          </div>
        )}

        <div
          className={`flex-1 relative ${showHorizontalScroll ? "overflow-x-auto overflow-y-hidden" : "overflow-hidden"}`}
        >
          {(activeAlgorithm?.controls as any)?.maintenance_mode ? (
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
                  This algorithm is currently getting a makeover. Please check
                  back shortly!
                </p>
              </div>
              <Link href="/">
                <Button variant="outline" className="gap-2 hover:bg-primary/10">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Problems
                </Button>
              </Link>
            </div>
          ) : isMobileView ? (
            <div className="h-full overflow-y-auto no-scrollbar pb-20 scroll-smooth">
              <div className="min-h-screen">
                <div className="min-h-screen p-3 pt-0.5">
                  <div className="h-full rounded-xl overflow-hidden border border-border/70 shadow-md bg-card/30 backdrop-blur-sm">
                    <ProblemDescriptionPanel
                      algorithm={activeAlgorithm}
                      nextProblem={nextProblem}
                      activeTab={layout.activeLeftTab}
                      setActiveTab={layout.setActiveLeftTab}
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
                      setIsVisualizationMaximized={
                        layout.setIsVisualizationMaximized
                      }
                      handleRichTextClick={handleRichTextClick}
                      submissions={submissions}
                      user={user}
                      onSelectSubmission={handleSelectSubmission}
                      panelId="left"
                      tabs={layout.leftTabs}
                      onAddTab={(tab) => layout.addTab("left", tab)}
                      onRemoveTab={(tab) => layout.removeTab("left", tab)}
                      onActivateTab={activateWorkspaceTab}
                      editorContent={codeWorkspacePanel}
                      visualizationCompleted={interactions.isVisualizationCompleted}
                      drawingCompleted={interactions.isDrawingCompleted}
                      solutionCompleted={interactions.isSolutionCompleted}
                      onToggleVisualizationCompleted={interactions.toggleVisualizationCompletion}
                      onToggleDrawingCompleted={interactions.toggleDrawingCompletion}
                      onToggleSolutionCompleted={interactions.toggleSolutionCompletion}
                      currentCode={interactions.savedCode}
                      language={interactions.selectedLanguage}
                      onCopyToEditor={(code: string) => {
                        interactions.handleCodeChange(code);
                        if (!layout.leftTabs.includes("editor") && !layout.rightTabs.includes("editor")) {
                           layout.addTab("right", "editor");
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              <div
                id="mobile-code-section"
                className="min-h-screen border-t-4 border-muted p-3 pt-0.5"
              >
                <div className="h-full rounded-xl overflow-hidden border border-border/70 shadow-md bg-card/30 backdrop-blur-sm">
                  <CodeWorkspacePanel
                    algorithm={activeAlgorithm}
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
                    isInterviewMode={session.isInterviewMode}
                    handleRandomProblem={interactions.handleRandomProblem}
                    handleNextProblem={interactions.handleNextProblem}
                    handlePreviousProblem={interactions.handlePreviousProblem}
                    submissions={submissions}
                    setSubmissions={setSubmissions}
                    onSubmissionComplete={() => {
                      refetchUserData();
                      if (layout.leftTabs.includes("submissions")) {
                        layout.setActiveLeftTab("submissions");
                      } else if (layout.rightTabs.includes("submissions")) {
                        layout.setActiveRightTab("submissions");
                      } else {
                        layout.addTab("left", "submissions");
                      }
                    }}
                    className="h-[85vh]"
                  />
                </div>
              </div>

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
            <div
              className={`h-full ${showHorizontalScroll ? "min-w-[778px]" : "w-full"}`}
            >
              <ResizablePanelGroup direction="horizontal" className="h-full" autoSaveId="problem-panels-layout">
                <ResizablePanel
                  ref={layout.leftPanelRef}
                  defaultSize={40}
                  minSize={20}
                  maxSize={80}
                  collapsible={true}
                  className={layout.isLeftCollapsed ? "min-w-[0px]" : ""}
                >
                  <div className="h-full p-1.5 pt-0 pr-0 sm:p-2 sm:pt-0 sm:pr-0">
                    <div className="h-full rounded-xl overflow-hidden border border-border/70 shadow-md bg-card/30 backdrop-blur-sm">
                      <ProblemDescriptionPanel
                        algorithm={activeAlgorithm}
                        nextProblem={nextProblem}
                        activeTab={layout.activeLeftTab}
                        setActiveTab={layout.setActiveLeftTab}
                        isMobile={layout.isMobile}
                        toggleLeftPanel={layout.toggleLeftPanel}
                        isCompleted={interactions.isCompleted}
                        likes={interactions.likes}
                        dislikes={interactions.dislikes}
                        userVote={interactions.userVote}
                        isFavorite={interactions.isFavorite}
                        handleVote={interactions.handleVote}
                        toggleFavorite={interactions.toggleFavorite}
                        isVisualizationMaximized={
                          layout.isVisualizationMaximized
                        }
                        setIsVisualizationMaximized={
                          layout.setIsVisualizationMaximized
                        }
                        handleRichTextClick={handleRichTextClick}
                        hasPremiumAccess={hasPremiumAccess}
                        user={user}
                        submissions={submissions}
                        isSubmissionsLoading={loadingUserData}
                        onSelectSubmission={handleSelectSubmission}
                        panelId="left"
                        tabs={layout.leftTabs}
                        onAddTab={(tab) => layout.addTab("left", tab)}
                        onRemoveTab={(tab) => layout.removeTab("left", tab)}
                        onActivateTab={activateWorkspaceTab}
                        editorContent={codeWorkspacePanel}
                        rightHeaderContent={getEditorHeaderContent("left")}
                        visualizationCompleted={interactions.isVisualizationCompleted}
                        drawingCompleted={interactions.isDrawingCompleted}
                        solutionCompleted={interactions.isSolutionCompleted}
                        onToggleVisualizationCompleted={interactions.toggleVisualizationCompletion}
                        onToggleDrawingCompleted={interactions.toggleDrawingCompletion}
                        onToggleSolutionCompleted={interactions.toggleSolutionCompletion}
                        currentCode={interactions.savedCode}
                        language={interactions.selectedLanguage}
                        onCopyToEditor={(code: string) => {
                          interactions.handleCodeChange(code);
                          if (!layout.leftTabs.includes("editor") && !layout.rightTabs.includes("editor")) {
                             layout.addTab("right", "editor");
                          }
                        }}
                      />
                    </div>
                  </div>
                </ResizablePanel>

                <ResizableHandle className="bg-transparent hover:bg-primary/5 data-[resize-handle-active]:bg-primary/10 transition-colors w-1 group">
                  <div className="z-10 flex h-10 w-1 items-center justify-center rounded-full bg-muted-foreground/40 group-hover:bg-primary transition-colors shadow-sm" />
                </ResizableHandle>

                <ResizablePanel
                  ref={layout.rightPanelRef}
                  defaultSize={60}
                  minSize={20}
                  maxSize={80}
                  collapsible={true}
                  className={layout.isRightCollapsed ? "min-w-[0px]" : ""}
                >
                  <div className="h-full pt-0 pl-0 pr-0 sm:pt-0 sm:pl-0 sm:pr-0 pb-1.5 sm:pb-2 mr-2">
                    <div className="h-full rounded-lg overflow-hidden border border-border/70 shadow-md bg-card/30 backdrop-blur-sm">
                      <ProblemDescriptionPanel
                        algorithm={activeAlgorithm}
                        nextProblem={nextProblem}
                        activeTab={layout.activeRightTab}
                        setActiveTab={layout.setActiveRightTab}
                        isMobile={layout.isMobile}
                        toggleLeftPanel={layout.toggleRightPanel}
                        isCompleted={interactions.isCompleted}
                        likes={interactions.likes}
                        dislikes={interactions.dislikes}
                        userVote={interactions.userVote}
                        isFavorite={interactions.isFavorite}
                        handleVote={interactions.handleVote}
                        toggleFavorite={interactions.toggleFavorite}
                        isVisualizationMaximized={
                          layout.isVisualizationMaximized
                        }
                        setIsVisualizationMaximized={
                          layout.setIsVisualizationMaximized
                        }
                        handleRichTextClick={handleRichTextClick}
                        hasPremiumAccess={hasPremiumAccess}
                        user={user}
                        submissions={submissions}
                        onSelectSubmission={handleSelectSubmission}
                        panelId="right"
                        tabs={layout.rightTabs}
                        onAddTab={(tab) => layout.addTab("right", tab)}
                        onRemoveTab={(tab) => layout.removeTab("right", tab)}
                        onActivateTab={activateWorkspaceTab}
                        editorContent={codeWorkspacePanel}
                        rightHeaderContent={getEditorHeaderContent("right")}
                        visualizationCompleted={interactions.isVisualizationCompleted}
                        drawingCompleted={interactions.isDrawingCompleted}
                        solutionCompleted={interactions.isSolutionCompleted}
                        onToggleVisualizationCompleted={interactions.toggleVisualizationCompletion}
                        onToggleDrawingCompleted={interactions.toggleDrawingCompletion}
                        onToggleSolutionCompleted={interactions.toggleSolutionCompletion}
                        currentCode={interactions.savedCode}
                        language={interactions.selectedLanguage}
                        onCopyToEditor={(code: string) => {
                          interactions.handleCodeChange(code);
                          if (!layout.leftTabs.includes("editor") && !layout.rightTabs.includes("editor")) {
                             layout.addTab("right", "editor");
                          }
                        }}
                      />
                    </div>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          )}
        </div>

        <SheetContent
          side="right"
          className="w-full sm:max-w-[600px] p-0 border-l border-border shadow-2xl flex flex-col gap-0 [&>button]:top-[6px]"
        >
          <div className="flex items-center justify-between py-2 px-4 pr-14 border-b border-border bg-background gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <Select
                value={activeListType || "all"}
                onValueChange={(val) => setActiveListType(val as any)}
              >
                <SelectTrigger className="border border-border/80 bg-muted/50 hover:bg-muted/85 focus:ring-0 px-3 h-8 text-sm font-medium w-fit min-w-[130px] gap-2 transition-colors rounded-md shrink-0">
                  <SelectValue>
                    {LIST_TYPE_LABELS[activeListType as any] || "Problem List"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Problems</SelectItem>
                  {Object.entries(LIST_TYPE_LABELS)
                    .filter(([key]) => key !== "all")
                    .map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {/* Progress Widget - circular SVG style matching DSA listing */}
              {(() => {
                const radius = 14;
                const circumference = 2 * Math.PI * radius;
                const percentage = totalCount > 0 ? completedCount / totalCount : 0;
                const strokeDashoffset = circumference - percentage * circumference;
                return (
                  <div className="flex items-center gap-2 h-8 px-2.5 rounded-md border border-border/80 bg-muted/30 shrink-0 select-none">
                    <svg className="w-4 h-4 transform -rotate-90 shrink-0" viewBox="0 0 36 36">
                      <circle
                        className="stroke-zinc-200 dark:stroke-zinc-800"
                        strokeWidth="3.5"
                        fill="transparent"
                        r={radius}
                        cx="18"
                        cy="18"
                      />
                      <circle
                        className="stroke-green-500 transition-all duration-500"
                        strokeWidth="3.5"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                        r={radius}
                        cx="18"
                        cy="18"
                      />
                    </svg>
                    <span className="text-xs font-medium tracking-tight whitespace-nowrap">
                      <strong className="text-foreground font-semibold">{completedCount}</strong>
                      <span className="text-muted-foreground/50 mx-0.5">/</span>
                      <strong className="text-foreground font-semibold">{totalCount}</strong>
                      <span className="text-muted-foreground/80 ml-1 text-[11px] font-semibold">Solved</span>
                    </span>
                  </div>
                );
              })()}
            </div>
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

export default ProblemDetailClient;
