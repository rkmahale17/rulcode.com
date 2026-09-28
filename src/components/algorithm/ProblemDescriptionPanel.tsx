import { getProblemUrl } from '@/utils/url';
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertTriangle,
  ArrowRight,
  Book,
  BookOpen,
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Code2,
  Database,
  ExternalLink,
  Eye,
  FileText,
  Flashlight,
  History,
  Lightbulb,
  ListChecks,
  Lock,
  Maximize,
  MessageSquareHeart,
  Minimize2,
  PanelLeftClose,
  Pencil,
  Star,
  Sparkles,
  Tag,
  ThumbsDown,
  ThumbsUp,
  User as UserIcon,
  XCircle,
  Youtube,
  Zap,
  Plus,
  X,
  Bot,
  Users,
  MessageSquare,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  hasVisualization,
  renderVisualization as renderVizFromMapping,
} from "@/utils/visualizationMapping";

import { AlgoLink } from "../AlgoLink";
import { AuthGuard } from "@/components/AuthGuard";
import { AuthNudge } from "@/components/AuthNudge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CompanyIcon } from "@/components/CompanyIcon";
import { DIFFICULTY_MAP } from "@/types/algorithm";
import { FeatureGuard } from "@/components/FeatureGuard";
import Link from "next/link";
import { ProOverlay } from "@/components/ProOverlay";
import { Separator } from "@/components/ui/separator";
import { Submission } from "@/types/userAlgorithmData";
import { TOP_COMPANIES, slugifyCompany } from "@/constants/companies";
import { slugifyCategory } from "@/constants/categories";
import { TabWarning } from "@/components/TabWarning";
import { User } from "@supabase/supabase-js";
import { VideoTutorialCard } from "./VideoTutorialCard";
import { ProgressiveHints } from "./ProgressiveHints";
import { VisualizationFeedbackModal } from "../feedback/VisualizationFeedbackModal";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { formatMemory } from "../CodeRunner/outputHelpers";
import { SubmissionDetailView } from "../submission/SubmissionDetailView";
import { isTreeType } from "@/utils/treeUtils";
import { renderBlind75Visualization } from "@/utils/blind75Visualizations";
import { useFeatureFlag } from "@/contexts/FeatureFlagContext";
import { RuloPanel } from "../ai/RuloPanel";

// Lazy components via next/dynamic to avoid SSR issues
const TreeDiagram = dynamic(
  () => import("../visualizations/TreeDiagram").then((mod) => mod.TreeDiagram),
  { ssr: false },
);
const GraphDiagram = dynamic(
  () =>
    import("../visualizations/GraphDiagram").then((mod) => mod.GraphDiagram),
  { ssr: false },
);
const SolutionViewer = dynamic(
  () => import("@/components/SolutionViewer").then((mod) => mod.SolutionViewer),
  { ssr: false },
);
const RichText = dynamic(
  () => import("@/components/RichText").then((mod) => mod.RichText),
  { ssr: false },
);
const ContentRights = dynamic(() => import("@/pages/ContentRights"), {
  ssr: false,
});
const BrainstormSection = dynamic(
  () =>
    import("../brainstorm/BrainstormSection").then(
      (mod) => mod.BrainstormSection,
    ),
  { ssr: false },
);
const CommunitySolutionsTab = dynamic(
  () =>
    import("../community/solutions/CommunitySolutionsTab").then(
      (mod) => mod.CommunitySolutionsTab,
    ),
  { ssr: false },
);
const DiscussionTab = dynamic(
  () =>
    import("../community/discussions/DiscussionTab").then(
      (mod) => mod.DiscussionTab,
    ),
  { ssr: false },
);

const BASE_LEFT_TABS = ["description"];
const BASE_RIGHT_TABS = ["editor"];

interface ProblemDescriptionPanelProps {
  algorithm: any;
  nextProblem?: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobile: boolean;
  toggleLeftPanel: () => void;
  isCompleted: boolean;

  // Interaction props
  likes: number;
  dislikes: number;
  userVote: "like" | "dislike" | null;
  isFavorite: boolean;
  handleVote: (vote: "like" | "dislike") => void;
  toggleFavorite: () => void;

  // Visualization props
  isVisualizationMaximized: boolean;
  setIsVisualizationMaximized: (val: boolean) => void;
  handleRichTextClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  isPlatformPreview?: boolean;
  hasPremiumAccess?: boolean;
  user?: User | null;
  submissions?: Submission[];
  isSubmissionsLoading?: boolean;
  onSelectSubmission?: (submission: Submission) => void;

  // Customizable workspace panel props
  panelId?: "left" | "right";
  tabs?: string[];
  onAddTab?: (tabId: string) => void;
  onRemoveTab?: (tabId: string) => void;
  onActivateTab?: (tabId: string) => void;
  isPatternGuessContext?: boolean;
  editorContent?: React.ReactNode;
  rightHeaderContent?: React.ReactNode;

  // New completion props
  visualizationCompleted?: boolean;
  drawingCompleted?: boolean;
  solutionCompleted?: boolean;
  onToggleVisualizationCompleted?: () => void;
  onToggleDrawingCompleted?: () => void;
  onToggleSolutionCompleted?: () => void;
  
  // AI Assistant Props
  currentCode?: string;
  language?: string;
  onCopyToEditor?: (code: string) => void;
}

export const ProblemDescriptionPanel = React.memo(
  ({
    algorithm,
    nextProblem,
    activeTab,
    setActiveTab,
    isMobile,
    toggleLeftPanel,
    isCompleted,
    likes,
    dislikes,
    userVote,
    isFavorite,
    handleVote,
    toggleFavorite,
    isVisualizationMaximized,
    setIsVisualizationMaximized,
    handleRichTextClick,
    isPlatformPreview = false,
    hasPremiumAccess = false,
    user = null,
    submissions = [],
    isSubmissionsLoading = false,
    onSelectSubmission,
    panelId = "left",
    tabs = BASE_LEFT_TABS,
    onAddTab,
    onRemoveTab,
    onActivateTab,
    isPatternGuessContext = false,
    editorContent,
    rightHeaderContent,
    visualizationCompleted = false,
    drawingCompleted = false,
    solutionCompleted = false,
    onToggleVisualizationCompleted,
    onToggleDrawingCompleted,
    onToggleSolutionCompleted,
    currentCode,
    language,
    onCopyToEditor,
  }: ProblemDescriptionPanelProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const topicsRef = useRef<HTMLDivElement>(null);
    const companiesRef = useRef<HTMLDivElement>(null);
    const tipsRef = useRef<HTMLDivElement>(null);
    const tabsScrollRef = useRef<HTMLDivElement>(null);
    const endOfDescriptionRef = useRef<HTMLDivElement>(null);
    const visualizerContainerRef = useRef<HTMLDivElement>(null);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

    // Client-only mount guard to prevent hydration mismatch for data that
    // is null during SSR but resolves on the client (e.g. nextProblem)
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => { setIsMounted(true); }, []);

    // State for submission detail view (push/pop within submissions tab)
    const [selectedSubmissionDetail, setSelectedSubmissionDetail] = useState<Submission | null>(null);

    // Track the ID of the newest submission we've seen to detect new ones accurately
    const initialTopSubmissionId = useRef<string | null>(null);
    const isInitialLoadRef = useRef(true);

    // Reset the submission detail tab whenever the problem changes.
    const derivedSolutionControls = useMemo(() => {
      let controls = algorithm?.controls?.solutions || {};
      const isFrontend = algorithm?.problemType === 'frontend' || algorithm?.problem_type === 'frontend';
      const isSql = algorithm?.problemType === 'sql' || algorithm?.problem_type === 'sql' || algorithm?.problemType === 'SQL' || algorithm?.problem_type === 'SQL';

      if (isFrontend) {
        controls = {
          ...controls,
          languages: {
            typescript: true,
            javascript: false,
            python: false,
            cpp: false,
            java: false,
            sql: false,
            ...(typeof controls.languages === 'object' ? controls.languages : {})
          }
        };
      } else if (isSql) {
        controls = {
          ...controls,
          languages: {
            sql: true,
            typescript: false,
            javascript: false,
            python: false,
            cpp: false,
            java: false,
            ...(typeof controls.languages === 'object' ? controls.languages : {})
          }
        };
      }
      return controls;
    }, [algorithm]);

    useEffect(() => {
      setSelectedSubmissionDetail(null);
      initialTopSubmissionId.current = null;
      isInitialLoadRef.current = true;
    }, [algorithm?.id]);

    // Auto-open detail view ONLY for submissions added during the current session
    // (i.e. the user just clicked Submit). Never auto-opens on page load / reload.
    useEffect(() => {
      if (!tabs.includes("submissions")) return;

      if (isInitialLoadRef.current) {
        // Don't do anything if we are still fetching from the database for the FIRST time
        if (isSubmissionsLoading) return;

        // DB has finished loading at least once. Record the top ID silently and mark initial load as done.
        initialTopSubmissionId.current = submissions.length > 0 ? submissions[0].id.toString() : null;
        isInitialLoadRef.current = false;
        return;
      }

      if (submissions.length === 0) return;

      const topSubmissionId = submissions[0].id.toString();

      if (topSubmissionId !== initialTopSubmissionId.current) {
        // A brand-new submission was prepended during this session → auto-open it
        initialTopSubmissionId.current = topSubmissionId;
        setSelectedSubmissionDetail(submissions[0]);
        setTimeout(() => {
          setActiveTab("submission_detail");
        }, 50);
      }
    }, [submissions, isSubmissionsLoading, setActiveTab, panelId]);

    // Auto-mark Read step complete when scrolled to bottom
    useEffect(() => {
      if (activeTab !== "description" || !algorithm?.id) return;
      const el = endOfDescriptionRef.current;
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            try {
              const stored = JSON.parse(localStorage.getItem('roadmap_learned_problems') || '[]');
              if (!stored.includes(algorithm.id)) {
                stored.push(algorithm.id);
                localStorage.setItem('roadmap_learned_problems', JSON.stringify(stored));
                window.dispatchEvent(new Event('roadmap_learned_problems_updated'));
              }
            } catch (e) {
              console.error('Failed to mark read complete', e);
            }
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );

      observer.observe(el);
      return () => observer.disconnect();
    }, [activeTab, algorithm?.id]);

    // Auto-mark Visualization step complete when reached the end
    useEffect(() => {
      if (activeTab !== "visualizations" || visualizationCompleted || !onToggleVisualizationCompleted) return;
      
      const container = visualizerContainerRef.current;
      if (!container) return;

      const checkDisabledState = (target: HTMLButtonElement) => {
        if (target.disabled && (target.title === "Step Forward" || target.querySelector('svg.lucide-skip-forward'))) {
          onToggleVisualizationCompleted();
          return true;
        }
        return false;
      };

      const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
          if (m.type === 'attributes' && m.attributeName === 'disabled') {
            const target = m.target as HTMLButtonElement;
            if (checkDisabledState(target)) {
              observer.disconnect();
              return;
            }
          }
        }
      });

      observer.observe(container, { attributes: true, subtree: true, attributeFilter: ['disabled'] });
      
      // Also check if it's already disabled on mount (might happen if sequence is empty or user is at the end)
      const skipIcon = container.querySelector('svg.lucide-skip-forward');
      const stepForwardBtn = skipIcon ? skipIcon.closest('button') as HTMLButtonElement : null;
      if (stepForwardBtn && checkDisabledState(stepForwardBtn)) {
        observer.disconnect();
      }

      return () => observer.disconnect();
    }, [activeTab, visualizationCompleted, onToggleVisualizationCompleted]);

    const isBrainstormEnabled = useFeatureFlag("brainstrom_tab");

    const [isCompact, setIsCompact] = useState(false);
    const [isUltraCompact, setIsUltraCompact] = useState(false);
    const [tabsShowLeftFade, setTabsShowLeftFade] = useState(false);
    const [tabsShowRightFade, setTabsShowRightFade] = useState(false);
    const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([]);
    const [learnAccordionOpen, setLearnAccordionOpen] = useState<string>("details");

    const ALL_AVAILABLE_TABS = [
      { id: "description", label: "Description", icon: FileText },
      { id: "visualizations", label: "Visualizations", icon: Eye },
      { id: "solutions", label: "Solutions", icon: Flashlight },
      { id: "community_solutions", label: "Community", icon: Users },
      { id: "discussion", label: "Discussion", icon: MessageSquare },
      { id: "submissions", label: "Submissions", icon: History },
      { id: "thinkpad", label: "Thinkpad", icon: Book },
      { id: "editor", label: "Code", icon: Code2 },
      { id: "rulo", label: "Rulo", icon: Sparkles },
    ];

    const isSqlProblem = algorithm?.problemType === 'sql' || algorithm?.problem_type === 'sql' || algorithm?.problem_type === 'SQL' || algorithm?.problemType === 'SQL';
    const isFrontendProblem = algorithm?.problemType === 'frontend' || algorithm?.problem_type === 'frontend';

    const rawActiveTabsList = tabs || (panelId === "left"
      ? ["description", "visualizations", "solutions", "community_solutions", "discussion", "submissions"]
      : ["editor", "thinkpad"]);
      
    const activeTabsList = isSqlProblem 
      ? rawActiveTabsList.filter(t => t !== "visualizations" && t !== "thinkpad")
      : isFrontendProblem
      ? rawActiveTabsList.filter(t => t !== "visualizations")
      : rawActiveTabsList;

    // Detect tab scroll overflow to show left/right gradient fades
    useEffect(() => {
      const el = tabsScrollRef.current;
      if (!el) return;

      const update = () => {
        setTabsShowLeftFade(el.scrollLeft > 4);
        setTabsShowRightFade(
          el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
        );
      };

      update();
      el.addEventListener("scroll", update, { passive: true });
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => {
        el.removeEventListener("scroll", update);
        ro.disconnect();
      };
    }, []);

    const handleToolCardClick = (tabId: string) => {
      if (onActivateTab) {
        onActivateTab(tabId);
      } else {
        setActiveTab(tabId);
      }
    };

    const scrollToSection = (
      ref: React.RefObject<HTMLDivElement>,
      sectionId?: string,
    ) => {
      if (sectionId) {
        setOpenAccordionItems((prev) => {
          if (prev.includes(sectionId)) return prev;
          return [...prev, sectionId];
        });
      }
      setTimeout(() => {
        ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    };

    const handleScrollTabs = (direction: "left" | "right") => {
      const el = tabsScrollRef.current;
      if (!el) return;
      const scrollAmount = 180;
      el.scrollTo({
        left:
          direction === "left"
            ? el.scrollLeft - scrollAmount
            : el.scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    };

    useEffect(() => {
      if (!containerRef.current) return;

      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setIsCompact(entry.contentRect.width < 400);
          setIsUltraCompact(entry.contentRect.width < 300);
        }
      });

      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }, []);

    const renderVisualization = () => {
      if (!algorithm) return null;

      // 1. Check DB Visualization URL
      const dbUrl =
        algorithm.metadata?.visualizationUrl || algorithm.visualizationUrl;
      if (dbUrl && dbUrl.startsWith("http")) {
        return (
          <iframe
            src={dbUrl}
            className="w-full h-full border-0 "
            title="Visualization"
          />
        );
      }

      // 2. Try centralized visualization mapping (internal components)
      const algorithmKey = algorithm.id || algorithm.slug;
      if (hasVisualization(algorithmKey)) {
        return renderVizFromMapping(algorithmKey);
      }

      // 3. Try Blind 75 Visualization Mapping (legacy fallback)
      const vizKey = algorithm.id || algorithm.slug;

      // Try to render using Blind 75 visualization helper
      const blind75Viz = renderBlind75Visualization(vizKey);
      if (blind75Viz) {
        return blind75Viz;
      }

      // 4. Fallback: "Coming Soon" message
      return (
        <div className="text-center space-y-3 py-12">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <Eye className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">
              Visualization Coming Soon
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              We're working on an interactive visualization for this algorithm
            </p>
          </div>
        </div>
      );
    };

    return (
      <div ref={containerRef} className="h-full flex flex-col">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden w-full pt-0 mt-0"
        >
          {/* Tabs header with ScrollArea scrollbar exactly like the test cases tab + overflow fades & scroll buttons */}
          <div className="px-0 shrink-0 border-b bg-background/50 relative group/tabs flex items-center justify-between">
            <div className="flex-1 min-w-0 relative h-9 flex items-center">
              {/* Left fade & Scroll Button */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background via-background/90 to-transparent pointer-events-none z-10 transition-opacity duration-200 ${tabsShowLeftFade ? "opacity-100" : "opacity-0"}`}
              />
              {tabsShowLeftFade && (
                <button
                  type="button"
                  onClick={() => handleScrollTabs("left")}
                  className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-7 h-7 rounded-full bg-background/95 hover:bg-background border border-border shadow-sm text-muted-foreground hover:text-foreground active:scale-95 transition-all duration-200"
                  aria-label="Scroll tabs left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}

              {/* Right fade & Scroll Button */}
              <div
                className={`absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background via-background/90 to-transparent pointer-events-none z-10 transition-opacity duration-200 ${tabsShowRightFade ? "opacity-100" : "opacity-0"}`}
              />
              {tabsShowRightFade && (
                <button
                  type="button"
                  onClick={() => handleScrollTabs("right")}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-7 h-7 rounded-full bg-background/95 hover:bg-background border border-border shadow-sm text-muted-foreground hover:text-foreground active:scale-95 transition-all duration-200"
                  aria-label="Scroll tabs right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              <ScrollAreaPrimitive.Root
                type="hover"
                className="w-full overflow-hidden"
              >
                <ScrollAreaPrimitive.Viewport
                  ref={tabsScrollRef}
                  className="w-full"
                >
                  <div
                    className={`flex flex-col ${isCompact ? "w-full" : "w-max"}`}
                  >
                    <TabsList
                      className={`flex p-0 bg-transparent gap-0 rounded-none h-9 ${isCompact ? "w-full" : "w-max min-w-full"}`}
                    >
                      <TooltipProvider>
                        {onAddTab && (
                          <div className="flex items-center px-2">
                            <DropdownMenu>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 rounded-full bg-transparent text-foreground/80 hover:bg-primary hover:text-primary-foreground active:scale-95 transition-all duration-200 flex items-center justify-center"
                                    >
                                      <Plus className="w-4 h-4 stroke-[2.5]" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent side="top">Add Tab</TooltipContent>
                              </Tooltip>
                              
                              <DropdownMenuContent align="start" className="w-48 bg-popover border border-border rounded-lg shadow-md p-1 z-[150]">
                                {ALL_AVAILABLE_TABS
                                  .filter(t => {
                                    if (activeTabsList.includes(t.id)) return false;
                                    if (isSqlProblem && (t.id === 'thinkpad' || t.id === 'visualizations')) return false;
                                    if (isFrontendProblem && (t.id === 'visualizations')) return false;
                                    if (isPatternGuessContext && (t.id === 'rulo' || t.id === 'visualizations' || t.id === 'thinkpad' || t.id === 'submissions')) return false;
                                    if (t.id === 'thinkpad') {
                                      return isBrainstormEnabled && algorithm?.controls?.brainstorm !== false;
                                    }
                                    return true;
                                  })
                                  .map(t => {
                                    const Icon = t.icon;
                                    return (
                                      <DropdownMenuItem
                                        key={t.id}
                                        onClick={() => onAddTab(t.id)}
                                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-muted/80 transition-colors"
                                      >
                                        <Icon className="w-4 h-4 text-muted-foreground" />
                                        <span>{t.label}</span>
                                      </DropdownMenuItem>
                                    );
                                  })
                                }
                                {ALL_AVAILABLE_TABS.filter(t => {
                                  if (activeTabsList.includes(t.id)) return false;
                                  if (isSqlProblem && (t.id === 'thinkpad' || t.id === 'visualizations')) return false;
                                  if (isFrontendProblem && (t.id === 'visualizations')) return false;
                                  if (t.id === 'thinkpad') {
                                    return isBrainstormEnabled && algorithm?.controls?.brainstorm !== false;
                                  }
                                  return true;
                                }).length === 0 && (
                                  <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                                    All tabs added
                                  </div>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}

                        {activeTabsList.map((tabId) => {
                          const tabMeta = ALL_AVAILABLE_TABS.find(t => t.id === tabId);
                          if (!tabMeta) return null;
                          
                          if (tabId === 'thinkpad' && (!isBrainstormEnabled || algorithm?.controls?.brainstorm === false)) {
                            return null;
                          }
                          
                          const IconComponent = tabMeta.icon;
                          const isRemovable = panelId === 'left' ? !BASE_LEFT_TABS.includes(tabId) : !BASE_RIGHT_TABS.includes(tabId);
                          
                          // Determine if tab is completed
                          let isTabCompleted = false;
                          if (tabId === "visualizations") isTabCompleted = !!visualizationCompleted;
                          if (tabId === "thinkpad") isTabCompleted = !!drawingCompleted;
                          if (tabId === "solutions") isTabCompleted = !!solutionCompleted;
                          if (tabId === "editor") isTabCompleted = !!isCompleted;

                          return (
                            <TabsTrigger
                              key={tabId}
                              value={tabId}
                              className="group/trigger relative flex-1 text-[12px] data-[state=active]:bg-transparent data-[state=active]:text-foreground border-b-[2px] border-transparent data-[state=active]:border-primary rounded-none h-9 px-3 sm:px-4 transition-all flex items-center justify-center"
                            >
                              {isCompact ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="flex items-center justify-center relative">
                                      <IconComponent className="w-4 h-4" />
                                      {isTabCompleted && (
                                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-500 border border-background" />
                                      )}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>{tabMeta.label}</TooltipContent>
                                </Tooltip>
                              ) : (
                                <>
                                  <IconComponent className="w-4 h-4 mr-2 shrink-0" />
                                  {tabMeta.label}
                                  {isTabCompleted && (
                                    <span className="ml-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-green-500 text-white text-[8px] font-bold shadow-sm shrink-0">
                                      ✓
                                    </span>
                                  )}
                                </>
                              )}
                            </TabsTrigger>
                          );
                        })}

                          {/* Dynamic Submission Detail Tab */}
                          {selectedSubmissionDetail && tabs.includes("submissions") && (
                            <TabsTrigger
                              value="submission_detail"
                              className={`group/trigger relative flex-1 text-[12px] data-[state=active]:bg-transparent data-[state=active]:text-foreground border-b-[2px] border-transparent rounded-none h-9 px-3 sm:px-4 transition-all flex items-center justify-center gap-2 ${
                                selectedSubmissionDetail.status === 'passed' ? 'data-[state=active]:border-primary' : 'data-[state=active]:border-red-500'
                              }`}
                            >
                              <span className="flex items-center gap-1.5">
                                {selectedSubmissionDetail.status === 'passed' ? (
                                  <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                                    <Check className="w-3 h-3 text-primary stroke-[3]" />
                                  </div>
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-500" />
                                )}
                                <span className={selectedSubmissionDetail.status === 'passed' ? 'text-primary font-medium' : 'text-red-500 font-medium'}>
                                  {selectedSubmissionDetail.status === 'passed' ? 'Accepted' : 'Wrong Answer'}
                                </span>
                              </span>
                              {/* Must be a span, not Button — TabsTrigger renders as <button>
                                  and nesting <button> inside <button> is invalid HTML. */}
                              <span
                                role="button"
                                aria-label="Close tab"
                                className="h-4 w-4 p-0 ml-1 rounded-sm opacity-50 hover:opacity-100 hover:bg-muted inline-flex items-center justify-center cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSubmissionDetail(null);
                                  if (activeTab === "submission_detail") {
                          handleToolCardClick("submissions");
                                  }
                                }}
                              >
                                <X className="w-3 h-3" />
                              </span>
                            </TabsTrigger>
                          )}
                      </TooltipProvider>
                    </TabsList>
                  </div>
                </ScrollAreaPrimitive.Viewport>
                <ScrollAreaPrimitive.Scrollbar
                  orientation="horizontal"
                  className="flex h-1.5 touch-none select-none flex-col border-t border-t-transparent p-[1px] transition-colors"
                >
                  <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
                </ScrollAreaPrimitive.Scrollbar>
              </ScrollAreaPrimitive.Root>
            </div>

            {rightHeaderContent && (
              <div className="flex items-center shrink-0 border-l border-border h-9 pr-2 select-none">
                {rightHeaderContent}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-hidden relative">
            <TabsContent
              value="description"
              className="h-full m-0 data-[state=inactive]:hidden relative flex flex-col"
            >
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-6">
                  {/* Mastery congratulations banner */}
                  {isCompleted && 
                   (isSqlProblem || (visualizationCompleted && drawingCompleted)) && 
                   solutionCompleted && (
                    <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/10 dark:bg-green-950/20 shadow-md flex items-start gap-3.5 animate-in fade-in slide-in-from-top-4 duration-500 mb-4">
                      <div className="p-2 rounded-full bg-green-500 text-white shadow-md shadow-green-500/25 shrink-0 mt-0.5 animate-bounce">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-green-700 dark:text-green-400 text-sm sm:text-base flex items-center gap-1.5">
                          Problem Mastered! 🌟
                        </h4>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                          Exceptional work! You have written the code, analyzed the step-by-step visualization, sketched your logic, and reviewed the optimal solution. You've fully mastered this algorithm!
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Title & Progress */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h1 className="text-md font-medium">
                          {
                            <span className="font-medium text-md mr-1">
                              {algorithm.serial_no
                                ? `${algorithm.serial_no}. `
                                : ""}
                            </span>
                          }
                          {algorithm.name}
                        </h1>
                        <div className="flex items-center gap-2">
                          {(algorithm?.is_premium ||
                            algorithm?.is_pro ||
                            algorithm?.metadata?.is_pro) && (
                            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] sm:text-[11px] font-bold px-3 py-0.5 uppercase tracking-wide h-6 rounded-full">
                              PRO
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Difficulty and Company Tags */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Difficulty Badge */}
                        {(!algorithm?.controls ||
                          algorithm.controls?.metadata?.difficulty !== false) &&
                          algorithm.difficulty && (
                            <Badge
                              variant="outline"
                              className={`
                              ${DIFFICULTY_MAP[algorithm.difficulty?.toLowerCase()] === "Easy" ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30" : ""}
                              ${DIFFICULTY_MAP[algorithm.difficulty?.toLowerCase()] === "Medium" ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30" : ""}
                              ${DIFFICULTY_MAP[algorithm.difficulty?.toLowerCase()] === "Hard" ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30" : ""}
                              font-semibold px-3 py-0.5 h-6 rounded-full text-[10px] sm:text-[11px]
                            `}
                            >
                              {DIFFICULTY_MAP[
                                algorithm.difficulty?.toLowerCase()
                              ] || algorithm.difficulty}
                            </Badge>
                          )}

                        {/* Metadata Badges (Topics, Companies, Hint) */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Topics Badge */}
                          {algorithm.category && (
                            <Badge
                              variant="outline"
                              className="bg-transparent text-foreground border-border text-[10px] sm:text-[11px] px-3 py-0.5 cursor-pointer hover:bg-muted/50 transition-all flex items-center h-6 rounded-full gap-1.5"
                              onClick={(e) => {
                                e.stopPropagation();
                                scrollToSection(topicsRef, "topics");
                              }}
                            >
                              <Tag className="w-3.5 h-3.5 text-primary" />
                              Topics
                            </Badge>
                          )}

                          {/* Companies Badge */}
                          {algorithm.metadata?.companies &&
                            algorithm.metadata.companies.length > 0 && (
                              <Badge
                                variant="outline"
                                className="bg-transparent text-foreground border-border text-[10px] sm:text-[11px] px-3 py-0.5 cursor-pointer hover:bg-muted/50 transition-all flex items-center h-6 rounded-full gap-1.5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  scrollToSection(companiesRef, "companies");
                                }}
                              >
                                {hasPremiumAccess || isPlatformPreview ? (
                                  <Building2 className="w-3.5 h-3.5 text-primary" />
                                ) : (
                                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                                )}
                                Companies
                              </Badge>
                            )}

                          {/* Tips Badge */}
                          {algorithm.explanation?.tips && (
                            <Badge
                              variant="outline"
                              className="bg-transparent text-foreground border-border text-[10px] sm:text-[11px] px-3 py-0.5 cursor-pointer hover:bg-muted/50 transition-all flex items-center h-6 rounded-full gap-1.5"
                              onClick={(e) => {
                                e.stopPropagation();
                                scrollToSection(tipsRef, "tips");
                              }}
                            >
                              <Lightbulb className="w-3.5 h-3.5 text-primary" />
                              Hint
                            </Badge>
                          )}

                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 flex flex-col gap-2">
                       {(!algorithm?.controls ||
                         algorithm.controls?.metadata?.attempted_badge !==
                           false) &&
                         isCompleted && (
                           <Badge
                             variant="outline"
                             className="bg-primary/10 text-primary border-primary/20 px-3 py-0.5 hover:bg-primary/20 transition-colors cursor-default flex items-center h-6 rounded-full text-[10px] sm:text-[11px] font-medium"
                           >
                             <div className="bg-primary rounded-full p-0.5 mr-1.5 flex items-center justify-center text-primary-foreground shadow-sm">
                               <Check className="w-2.5 h-2.5 stroke-[3]" />
                             </div>
                             {isPatternGuessContext ? "Identified Pattern" : "Solved"}
                           </Badge>
                         )}
                     </div>
                  </div>
                  <section className="max-w-[800px] ">
                    {algorithm.explanation.problemStatement &&
                      (!algorithm?.controls ||
                        algorithm.controls?.description?.problem_statement !==
                          false) && (
                        <React.Suspense
                          fallback={
                            <div className="h-20 w-full animate-pulse bg-muted rounded-md" />
                          }
                        >
                          <RichText
                            content={algorithm.explanation.problemStatement}
                            className="text-base leading-relaxed pr-4 dark:text-muted-foreground"
                            onClick={handleRichTextClick}
                          ></RichText>
                        </React.Suspense>
                      )}
                  </section>

                  {(algorithm.problemType === 'sql' || algorithm.problem_type === 'SQL' || algorithm.problemType === 'SQL') && algorithm.metadata?.db_setup && (
                    <section className="max-w-[800px] mt-6">
                      <h3 className="text-md font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Database className="w-4 h-4 text-primary" />
                        Database Schema
                      </h3>
                      <div className="rounded-xl overflow-hidden border border-border/50 bg-card">
                        <div className="bg-muted/40 px-4 py-2 border-b border-border/50 text-xs font-mono text-muted-foreground flex justify-between items-center">
                          <span>Setup Script</span>
                          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] uppercase font-semibold">SQL</span>
                        </div>
                        <div className="p-4 overflow-x-auto text-sm font-mono text-foreground whitespace-pre-wrap">
                          {algorithm.metadata.db_setup}
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Workspace Playgrounds renamed to Helpful Tools to Learn & Understand */}
                  {algorithm.problemType !== 'sql' && algorithm.problem_type !== 'sql' && algorithm.problem_type !== 'SQL' && algorithm.problemType !== 'SQL' && algorithm.problemType !== 'frontend' && algorithm.problem_type !== 'frontend' && (
                  <div className="max-w-[600px] my-6 rounded-xl border border-border/50 bg-card p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary shadow-sm">
                        <Lightbulb className="w-4 h-4" />
                      </div>
                      <h3 className="text-md font-medium text-foreground">
                        Understand Before Coding
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Visualize Card */}
                      <div
                        onClick={() => handleToolCardClick("visualizations")}
                        className="group relative cursor-pointer overflow-hidden rounded-xl border border-border/50 bg-card hover:border-primary/50 hover:ring-1 hover:ring-primary/50 transition-all duration-300 shadow-sm h-32"
                      >
                        {/* Background Abstract / Live Preview */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent dark:from-primary/10 overflow-hidden">
                           {(algorithm?.id && (hasVisualization(algorithm.id) || renderBlind75Visualization(algorithm.id))) ? (
                             <div className="absolute top-0 left-0 w-[800px] h-[600px] origin-top-left scale-[0.4] opacity-50 pointer-events-none select-none blur-[0.5px]">
                             {renderVizFromMapping(algorithm.id) || renderBlind75Visualization(algorithm.id)}
                             </div>
                           ) : (
                             <svg className="absolute inset-0 w-full h-full text-primary/30" fill="none" viewBox="0 0 300 120" stroke="currentColor" strokeWidth="1.5">
                               {/* Array [1, 2, 3, 4] */}
                               <g transform="translate(40, 25)">
                                 <rect x="0" y="0" width="24" height="24" rx="4" className="fill-primary/10" />
                                 <rect x="32" y="0" width="24" height="24" rx="4" className="fill-primary/10" />
                                 <rect x="64" y="0" width="24" height="24" rx="4" className="fill-primary/10" />
                                 <rect x="96" y="0" width="24" height="24" rx="4" className="fill-primary/10" />
                                 <text x="12" y="16" fontSize="12" textAnchor="middle" className="fill-primary font-bold" stroke="none">1</text>
                                 <text x="44" y="16" fontSize="12" textAnchor="middle" className="fill-primary font-bold" stroke="none">2</text>
                                 <text x="76" y="16" fontSize="12" textAnchor="middle" className="fill-primary font-bold" stroke="none">3</text>
                                 <text x="108" y="16" fontSize="12" textAnchor="middle" className="fill-primary font-bold" stroke="none">4</text>
                               </g>

                               {/* Binary Tree */}
                               <g transform="translate(220, 20)">
                                 {/* Edges */}
                                 <line x1="20" y1="10" x2="-5" y2="40" />
                                 <line x1="20" y1="10" x2="45" y2="40" />
                                 <line x1="-5" y1="40" x2="-20" y2="70" />
                                 <line x1="-5" y1="40" x2="10" y2="70" />
                                 {/* Nodes */}
                                 <circle cx="20" cy="10" r="10" className="fill-primary/10 border-primary/40" />
                                 <circle cx="-5" cy="40" r="10" className="fill-primary/10 border-primary/40" />
                                 <circle cx="45" cy="40" r="10" className="fill-primary/10 border-primary/40" />
                                 <circle cx="-20" cy="70" r="10" className="fill-primary/10 border-primary/40" />
                                 <circle cx="10" cy="70" r="10" className="fill-primary/10 border-primary/40" />
                               </g>

                               {/* Stack / 2D Matrix */}
                               <g transform="translate(40, 70)">
                                 <rect x="0" y="0" width="16" height="16" rx="2" className="fill-primary/10" />
                                 <rect x="20" y="0" width="16" height="16" rx="2" className="fill-primary/10" />
                                 <rect x="40" y="0" width="16" height="16" rx="2" className="fill-primary/10" />
                                 
                                 <rect x="0" y="20" width="16" height="16" rx="2" className="fill-primary/10" />
                                 <rect x="20" y="20" width="16" height="16" rx="2" className="fill-primary/10 opacity-50" />
                                 <rect x="40" y="20" width="16" height="16" rx="2" className="fill-primary/10" />
                               </g>

                               {/* Connecting / Pointer line */}
                               <g transform="translate(130, 60)">
                                 <path d="M 0 0 C 20 -10, 30 20, 50 10" className="stroke-primary/50" strokeDasharray="4 4" strokeWidth="2" strokeLinecap="round" />
                                 <path d="M 45 5 L 50 10 L 45 15" className="stroke-primary/50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                               </g>
                             </svg>
                           )}
                           {/* Dark Gradient Overlay for Readability */}
                           <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background/90 via-background/50 to-transparent pointer-events-none transition-opacity duration-300 group-hover:opacity-0" />
                           
                           {/* Text Label overlay */}
                           <div className="absolute bottom-3 left-4 right-4 flex justify-between items-center transition-opacity duration-300 group-hover:opacity-0 z-10">
                              <h5 className="font-semibold text-sm text-foreground flex items-center gap-2 drop-shadow-sm">
                                <Eye className="w-4 h-4 text-primary" /> Visualize This Problem
                              </h5>
                              <div className="w-6 h-6 rounded-full bg-background/50 border border-border/50 flex items-center justify-center text-muted-foreground shadow-sm">
                                <ArrowRight className="w-3 h-3" />
                              </div>
                           </div>
                        </div>
                        
                        {/* Hover Overlay with Button */}
                        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                          <Badge variant="default" className="gap-2 px-4 py-2 shadow-md hover:scale-105 transition-transform cursor-pointer">
                            Open Visualizer <ArrowRight className="w-3.5 h-3.5" />
                          </Badge>
                        </div>
                      </div>



                      {/* Thinkpad Card */}
                      {isBrainstormEnabled && algorithm?.controls?.brainstorm !== false && (
                        <div
                          onClick={() => handleToolCardClick("thinkpad")}
                          className="group relative cursor-pointer overflow-hidden rounded-xl border border-border/50 bg-card hover:border-primary/50 hover:ring-1 hover:ring-primary/50 transition-all duration-300 shadow-sm h-32"
                        >
                          {/* Background Abstract Preview */}
                          <div className="absolute inset-0 bg-[radial-gradient(#d1d5db_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#4b5563_1px,transparent_1px)] [background-size:16px_16px] opacity-70 dark:opacity-40" />
                          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent dark:from-amber-500/10">
                             {/* Abstract Drawing SVG Mimicking Homepage */}
                             <svg className="absolute inset-0 w-full h-full text-amber-500/40" fill="none" viewBox="0 0 300 120" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                               {/* Wobbly Array */}
                               <g transform="translate(30, 20)">
                                 <path d="M 0,0 C 8,-3 15,3 24,0 C 24,8 21,15 24,24 C 15,27 8,21 0,24 C -3,15 3,8 0,0" />
                                 <path d="M 32,0 C 40,-3 47,3 56,0 C 56,8 53,15 56,24 C 47,27 40,21 32,24 C 29,15 35,8 32,0" />
                                 <path d="M 64,0 C 72,-3 79,3 88,0 C 88,8 85,15 88,24 C 79,27 72,21 64,24 C 61,15 67,8 64,0" />
                                 <path d="M 96,0 C 104,-3 111,3 120,0 C 120,8 117,15 120,24 C 111,27 104,21 96,24 C 93,15 99,8 96,0" />
                               </g>

                               {/* Wobbly Tree */}
                               <g transform="translate(210, 20)">
                                 <path d="M 30,8 C 24,18 18,28 12,38" />
                                 <path d="M 30,8 C 36,18 42,28 48,38" />
                                 <path d="M 12,38 C 6,48 0,58 -6,68" />
                                 <path d="M 48,38 C 54,48 60,58 66,68" />
                                 
                                 <path d="M 25,8 C 25,3 35,3 35,8 C 35,13 25,13 25,8" />
                                 <path d="M 7,38 C 7,33 17,33 17,38 C 17,43 7,43 7,38" />
                                 <path d="M 43,38 C 43,33 53,33 53,38 C 53,43 43,43 43,38" />
                                 <path d="M -11,68 C -11,63 -1,63 -1,68 C -1,73 -11,73 -11,68" />
                                 <path d="M 61,68 C 61,63 71,63 71,68 C 71,73 61,73 61,68" />
                               </g>

                               {/* Hand-drawn Math / Loop */}
                               <g transform="translate(30, 80)">
                                 <path d="M 0,0 C 15, -8 30, 8 45, 0" />
                                 <path d="M 0,15 C 15, 7 30, 23 45, 15" />
                                 <path d="M 22,-15 C 15,7 30,30 22,38" className="text-amber-500/20" strokeWidth="5" />
                               </g>

                               {/* Highlight Lasso around something */}
                               <g transform="translate(120, 60)">
                                 <path d="M 0,15 C 15,-8 30,-8 45,15 C 60,38 30,53 15,38 C 0,23 -15,38 0,15" strokeDasharray="6 6" className="text-amber-500/60" strokeWidth="2" />
                                 <path d="M 40,38 C 48,53 60,53 68,45" />
                                 <path d="M 60,45 L 68,45 L 65,53" />
                               </g>
                             </svg>
                             {/* Dark Gradient Overlay for Readability */}
                             <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background/90 via-background/50 to-transparent pointer-events-none transition-opacity duration-300 group-hover:opacity-0" />

                             <div className="absolute bottom-3 left-4 right-4 flex justify-between items-center transition-opacity duration-300 group-hover:opacity-0 z-10">
                                <h5 className="font-semibold text-sm text-foreground flex items-center gap-2 drop-shadow-sm">
                                  <Pencil className="w-4 h-4 text-amber-500"/> Draw Your Approach
                                </h5>
                                <div className="w-6 h-6 rounded-full bg-background/50 border border-border/50 flex items-center justify-center text-muted-foreground shadow-sm">
                                  <ArrowRight className="w-3 h-3" />
                                </div>
                             </div>
                          </div>
                          
                          {/* Hover Overlay with Button */}
                          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                            <Badge variant="secondary" className="gap-2 px-3 py-1.5 shadow-md hover:scale-105 transition-transform bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 dark:text-amber-400 cursor-pointer">
                              Draw <ArrowRight className="w-3.5 h-3.5" />
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  )}

                  {/* Examples and Constraints Group */}
                  {(() => {
                    const hasExamples = algorithm.explanation.io && algorithm.explanation.io.length > 0 && (!algorithm?.controls || algorithm.controls?.description?.examples !== false);
                    const hasConstraints = algorithm.explanation.constraints && algorithm.explanation.constraints.length > 0 && (!algorithm?.controls || algorithm.controls?.description?.constraints !== false);
                    
                    if (!hasExamples && !hasConstraints) return null;
                    
                    return (
                      <Card className="glass-card max-w-[600px] overflow-hidden flex flex-col divide-y divide-border/50">
                        {hasExamples && (
                          <div className="flex flex-col">
                        {algorithm.explanation.io.map(
                          (example: any, index: number) => (
                            <React.Fragment key={index}>
                              <div className="p-4">
                                <h4 className="text-sm font-medium mb-3 transition-colors text-foreground">
                                  Example {index + 1}:
                                </h4>
                                <div className="space-y-2 font-mono text-sm">
                                  {example.inputBeforeHtml && (
                                    <React.Suspense
                                      fallback={
                                        <div className="h-6 w-full animate-pulse bg-muted rounded" />
                                      }
                                    >
                                      <RichText
                                        content={example.inputBeforeHtml}
                                        className="mb-2"
                                      />
                                    </React.Suspense>
                                  )}
                                  {example.input && (
                                    <div className="space-y-2">
                                      <div>
                                        <span className="font-medium">
                                          Input:
                                        </span>{" "}
                                        {typeof example.input === 'string' && (example.input.trim().startsWith('<') || example.input.includes('<table')) ? (
                                          <div className="mt-2 prose dark:prose-invert max-w-none text-xs sm:text-sm overflow-x-auto" dangerouslySetInnerHTML={{ __html: example.input }} />
                                        ) : (
                                          <code className="bg-muted px-2 py-0.5 rounded">
                                            {example.input}
                                          </code>
                                        )}
                                      </div>
                                      {example.inputAfterHtml && (
                                        <React.Suspense
                                          fallback={
                                            <div className="h-6 w-full animate-pulse bg-muted rounded" />
                                          }
                                        >
                                          <RichText
                                            content={example.inputAfterHtml}
                                            className="mt-2"
                                          />
                                        </React.Suspense>
                                      )}
                                      {(algorithm?.controls?.visualizations
                                        ?.tree?.enabled ??
                                        algorithm?.controls
                                          ?.show_tree_visualization) &&
                                        algorithm?.controls?.visualizations
                                          ?.tree?.examples_input !== false && (
                                          <React.Suspense
                                            fallback={
                                              <div className="h-[120px] w-full animate-pulse bg-muted rounded-md" />
                                            }
                                          >
                                            <TreeDiagram
                                              data={example.input}
                                              height={120}
                                              multiple={
                                                algorithm?.controls
                                                  ?.visualizations?.tree
                                                  ?.multiple
                                              }
                                            />
                                          </React.Suspense>
                                        )}
                                      {(algorithm?.controls?.visualizations
                                        ?.graph?.enabled ??
                                        algorithm?.controls
                                          ?.show_graph_visualization) &&
                                        algorithm?.controls?.visualizations
                                          ?.graph?.examples_input !== false && (
                                          <React.Suspense
                                            fallback={
                                              <div className="h-[120px] w-full animate-pulse bg-muted rounded-md" />
                                            }
                                          >
                                            <GraphDiagram
                                              data={example.input}
                                              height={120}
                                            />
                                          </React.Suspense>
                                        )}
                                    </div>
                                  )}
                                  {example.outputBeforeHtml && (
                                    <React.Suspense
                                      fallback={
                                        <div className="h-6 w-full animate-pulse bg-muted rounded" />
                                      }
                                    >
                                      <RichText
                                        content={example.outputBeforeHtml}
                                        className="mb-2"
                                      />
                                    </React.Suspense>
                                  )}
                                  {example.output && (
                                    <div className="space-y-2">
                                      <div>
                                        <span className="font-medium">
                                          Output:
                                        </span>{" "}
                                        {typeof example.output === 'string' && (example.output.trim().startsWith('<') || example.output.includes('<table')) ? (
                                          <div className="mt-2 prose dark:prose-invert max-w-none text-xs sm:text-sm overflow-x-auto" dangerouslySetInnerHTML={{ __html: example.output }} />
                                        ) : (
                                          <code className="bg-muted px-2 py-0.5 rounded">
                                            {example.output}
                                          </code>
                                        )}
                                      </div>
                                      {example.outputAfterHtml && (
                                        <React.Suspense
                                          fallback={
                                            <div className="h-6 w-full animate-pulse bg-muted rounded" />
                                          }
                                        >
                                          <RichText
                                            content={example.outputAfterHtml}
                                            className="mt-2"
                                          />
                                        </React.Suspense>
                                      )}
                                      {(algorithm?.controls?.visualizations
                                        ?.tree?.enabled ??
                                        algorithm?.controls
                                          ?.show_tree_visualization) &&
                                        algorithm?.controls?.visualizations
                                          ?.tree?.examples_output !== false && (
                                          <React.Suspense
                                            fallback={
                                              <div className="h-[120px] w-full animate-pulse bg-muted rounded-md" />
                                            }
                                          >
                                            <TreeDiagram
                                              data={example.output}
                                              height={120}
                                              multiple={
                                                algorithm?.controls
                                                  ?.visualizations?.tree
                                                  ?.multiple
                                              }
                                            />
                                          </React.Suspense>
                                        )}
                                      {(algorithm?.controls?.visualizations
                                        ?.graph?.enabled ??
                                        algorithm?.controls
                                          ?.show_graph_visualization) &&
                                        algorithm?.controls?.visualizations
                                          ?.graph?.examples_output !==
                                          false && (
                                          <React.Suspense
                                            fallback={
                                              <div className="h-[120px] w-full animate-pulse bg-muted rounded-md" />
                                            }
                                          >
                                            <GraphDiagram
                                              data={example.output}
                                              height={120}
                                            />
                                          </React.Suspense>
                                        )}
                                    </div>
                                  )}
                                  {example.explanation && (
                                    <div className="mt-2">
                                      <span className="font-medium">
                                        Explanation:
                                      </span>{" "}
                                      {typeof example.explanation === 'string' && (example.explanation.trim().startsWith('<') || example.explanation.includes('<p>')) ? (
                                        <div className="text-muted-foreground prose dark:prose-invert max-w-none text-xs sm:text-sm" dangerouslySetInnerHTML={{ __html: example.explanation }} />
                                      ) : (
                                        <span className="text-muted-foreground whitespace-pre-line">
                                          {example.explanation}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                                {index < algorithm.explanation.io.length - 1 && (
                                  <Separator className="bg-border/50 mx-5 w-auto" />
                                )}
                              </React.Fragment>
                            ),
                          )}
                          </div>
                        )}

                        {/* Constraints Section */}
                        {hasConstraints && (
                          <div className="p-4">
                        <h4 className="text-sm font-medium mb-3 transition-colors text-foreground">Constraints:</h4>
                        <ul className="space-y-1.5 font-mono text-sm">
                          {algorithm.explanation.constraints.map(
                            (constraint: string, index: number) => (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <span className="text-muted-foreground mt-0.5">
                                  •
                                </span>
                                <React.Suspense
                                  fallback={
                                    <div className="h-6 w-full animate-pulse bg-muted rounded" />
                                  }
                                >
                                  <RichText
                                    content={constraint}
                                    className="text-base leading-relaxed pr-4 text-sm "
                                    onClick={handleRichTextClick}
                                  ></RichText>
                                </React.Suspense>
                              </li>
                            ),
                          )}
                        </ul>
                          </div>
                        )}
                      </Card>
                    );
                  })()}

                  {/* Note Section */}
                  {algorithm.explanation.note &&
                    (!algorithm?.controls ||
                      algorithm.controls?.description?.problem_statement !==
                        false) && (
                      <div className="border-l-4 border-primary pl-4 py-2">
                        <p className="text-sm text-muted-foreground italic">
                          {algorithm.explanation.note}
                        </p>
                      </div>
                    )}

                  {/* Unified Content Card */}
                  <Card className="glass-card max-w-[600px] overflow-hidden flex flex-col my-6">
                  {/* Collapsible Section for Overview and Guides */}
                  {(() => {
                    const showOverview =
                      !algorithm?.controls ||
                      algorithm.controls?.description?.overview !== false;
                    if (!showOverview) return null;

                    // Prioritize metadata (Preview Mode) then root properties (Production Mode)
                    const overview =
                      algorithm.metadata?.overview || algorithm.overview;
                    const timeComplexity =
                      algorithm.metadata?.timeComplexity ||
                      algorithm.timeComplexity;
                    const spaceComplexity =
                      algorithm.metadata?.spaceComplexity ||
                      algorithm.spaceComplexity;

                    return (
                      <div className="border-b border-border/50">
                        <Accordion
                          type="single"
                          collapsible
                          value={learnAccordionOpen}
                          onValueChange={setLearnAccordionOpen}
                          className="w-full"
                        >
                          <AccordionItem
                            value="details"
                            className="border-none"
                          >
                            <AccordionTrigger className="px-4 sm:px-6 py-4 hover:no-underline">
                              <div className="flex items-center gap-2 text-sm font-medium transition-colors text-foreground">
                                <BookOpen className="w-4 h-4 text-primary" />
                                Learn
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-1 sm:px-1 pb-4">
                              <div className="space-y-6 pt-0">
                                <Tabs defaultValue="overview" className="w-full">
                                  <TabsList className="w-full justify-start rounded-none border-b border-border/50 bg-transparent p-0 mb-4 h-auto px-3 sm:px-5">
                                    <TabsTrigger
                                      value="overview"
                                      className="rounded-none border-b-2 border-transparent px-4 py-2 text-sm font-medium transition-all data-[state=active]:border-primary data-[state=active]:bg-muted/30 data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground hover:bg-muted/50"
                                    >
                                      Understand the pattern
                                    </TabsTrigger>
                                    {algorithm?.explanation?.steps && (!algorithm?.controls || algorithm.controls?.description?.guides !== false) && (
                                      <TabsTrigger
                                        value="steps"
                                        className="rounded-none border-b-2 border-transparent px-4 py-2 text-sm font-medium transition-all data-[state=active]:border-primary data-[state=active]:bg-muted/30 data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground hover:bg-muted/50"
                                      >
                                        Steps to Solve
                                      </TabsTrigger>
                                    )}
                                  </TabsList>

                                  <TabsContent value="overview" className="mt-0">
                                    <div className="px-3 sm:px-5 space-y-4">
                                      {showOverview && (
                                        <>
                                          <div className="text-sm text-muted-foreground">
                                            {/* Using RichText if available, otherwise fallback */}
                                            <React.Suspense
                                              fallback={
                                                <div className="h-20 w-full animate-pulse bg-muted rounded" />
                                              }
                                            >
                                              {overview ? (
                                                <RichText content={overview} />
                                              ) : (
                                                <RichText
                                                  content={
                                                    algorithm.explanation
                                                      .problemStatement
                                                  }
                                                />
                                              )}
                                            </React.Suspense>
                                          </div>

                                          {algorithm.problemType !== 'sql' && algorithm.problem_type !== 'sql' && algorithm.problem_type !== 'SQL' && algorithm.problemType !== 'SQL' && (
                                            <>
                                              <Separator />

                                              <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                  <p className="text-sm font-medium mb-1">
                                                    Time Complexity
                                                  </p>
                                                  <Badge
                                                    variant="outline"
                                                    className="font-mono"
                                                  >
                                                    {timeComplexity || "N/A"}
                                                  </Badge>
                                                </div>
                                                <div>
                                                  <p className="text-sm font-medium mb-1">
                                                    Space Complexity
                                                  </p>
                                                  <Badge
                                                    variant="outline"
                                                    className="font-mono"
                                                  >
                                                    {spaceComplexity || "N/A"}
                                                  </Badge>
                                                </div>
                                              </div>
                                            </>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  </TabsContent>

                                  {algorithm?.explanation?.steps && (!algorithm?.controls || algorithm.controls?.description?.guides !== false) && (
                                    <TabsContent value="steps" className="mt-0 px-3 sm:px-5 pb-4">
                                      {(algorithm?.is_premium || algorithm?.is_pro || algorithm?.metadata?.is_pro) && !hasPremiumAccess && !isPlatformPreview ? (
                                        <ProOverlay className="rounded-none border-0 py-12" />
                                      ) : (
                                        <div className="text-sm text-muted-foreground">
                                          <React.Suspense fallback={<div className="h-20 w-full animate-pulse bg-muted rounded" />}>
                                            <RichText content={algorithm.explanation.steps} />
                                          </React.Suspense>
                                        </div>
                                      )}
                                    </TabsContent>
                                  )}
                                </Tabs>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    );
                  })()}
                  {/* Metadata Accordions (Topics, Companies, Hints) */}
                  <div className="w-full">
                    <Accordion
                      type="multiple"
                      className="w-full"
                      value={openAccordionItems}
                      onValueChange={setOpenAccordionItems}
                    >
                      {/* Topics Item */}
                      {algorithm.category && (
                        <AccordionItem
                          value="topics"
                          className="border-b border-border/50"
                          ref={topicsRef}
                        >
                          <AccordionTrigger className="px-4 sm:px-6 py-4 hover:no-underline group">
                            <div className="flex items-center gap-2 text-sm font-medium transition-colors text-foreground">
                              <Tag className="w-4 h-4 text-primary" />
                              Topics
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 sm:px-6 pb-6 pt-0">
                            <Separator className="mb-4 bg-border/40" />
                            <div className="flex flex-wrap gap-2">
                              {(algorithm.category.includes(",")
                                ? algorithm.category
                                    .split(",")
                                    .map((c: string) => c.trim())
                                : [algorithm.category]
                              ).map((tag: string, i: number) => (
                                <Link
                                  key={i}
                                  href={`/dsa/query?topic=${slugifyCategory(tag)}`}
                                  passHref
                                >
                                  <Badge
                                    variant="secondary"
                                    className="bg-muted hover:bg-muted/80 text-foreground border-border font-semibold px-3 py-0.5 h-6 rounded-full text-[10px] sm:text-[11px] cursor-pointer flex items-center gap-1.5"
                                  >
                                    <Tag className="w-3 h-3 text-primary/70" />
                                    {tag}
                                  </Badge>
                                </Link>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )}

                      {/* Companies Item */}
                      {algorithm.metadata?.companies &&
                        algorithm.metadata.companies.length > 0 && (
                          <AccordionItem
                            value="companies"
                            className="border-b border-border/50"
                            ref={companiesRef}
                          >
                            <AccordionTrigger className="px-4 sm:px-6 py-4 hover:no-underline group">
                              <div className="flex items-center gap-2 text-sm font-medium transition-colors text-foreground">
                                {hasPremiumAccess || isPlatformPreview ? (
                                  <Building2 className="w-4 h-4 text-primary" />
                                ) : (
                                  <Lock className="w-4 h-4 text-amber-500" />
                                )}
                                Companies
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 sm:px-6 pb-6 pt-0">
                              <Separator className="mb-4 bg-border/40" />
                              {hasPremiumAccess || isPlatformPreview ? (
                                <div className="flex flex-wrap gap-2">
                                  {algorithm.metadata.companies.map(
                                    (company: string, index: number) => (
                                      <Link
                                        key={index}
                                        href={`/dsa/query?company=${slugifyCompany(company)}`}
                                        passHref
                                      >
                                        <Badge
                                          variant="secondary"
                                          className="bg-muted hover:bg-muted/80 text-foreground border-border font-semibold px-3 py-0.5 h-6 rounded-full text-[10px] sm:text-[11px] flex items-center gap-1.5 cursor-pointer"
                                        >
                                          <CompanyIcon
                                            company={company}
                                            className="w-3 h-3 opacity-80"
                                          />
                                          {company}
                                        </Badge>
                                      </Link>
                                    ),
                                  )}
                                </div>
                              ) : (
                                <div className="relative overflow-hidden rounded-lg min-h-[95px] flex items-center px-4 py-2 border border-border/30 bg-muted/5">
                                  <div className="flex flex-wrap gap-2 filter blur-[3px] select-none pointer-events-none opacity-50">
                                    {algorithm.metadata.companies
                                      .slice(0, 5)
                                      .map((company: string, index: number) => (
                                        <Badge
                                          key={index}
                                          variant="secondary"
                                          className="font-semibold px-3 py-0.5 h-6 rounded-full text-[10px] sm:text-[11px]"
                                        >
                                          {company}
                                        </Badge>
                                      ))}
                                  </div>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <ProOverlay
                                      className="rounded-none border-0 h-full p-2"
                                      variant="compact"
                                    />
                                  </div>
                                </div>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        )}

                      {/* Hint Item */}
                      {algorithm?.explanation?.tips && (!algorithm?.controls || algorithm.controls?.description?.guides !== false) && (
                        <AccordionItem
                          value="tips"
                          className="border-b border-border/50"
                          ref={tipsRef}
                        >
                          <AccordionTrigger className="px-4 sm:px-6 py-4 hover:no-underline group">
                            <div className="flex items-center gap-2 text-sm font-medium transition-colors text-foreground">
                              <Lightbulb className="w-4 h-4 text-primary" />
                              Hint
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 sm:px-6 pb-6 pt-0">
                            <Separator className="mb-4 bg-border/40" />
                            {(algorithm?.is_premium || algorithm?.is_pro || algorithm?.metadata?.is_pro) && !hasPremiumAccess && !isPlatformPreview ? (
                              <ProOverlay className="rounded-none border-0 py-12" />
                            ) : (
                              <div className="text-sm">
                                <React.Suspense fallback={<div className="h-20 w-full animate-pulse bg-muted rounded" />}>
                                  <ProgressiveHints hintsHtml={algorithm.explanation.tips} />
                                </React.Suspense>
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      )}

                      {/* Use Cases Item */}
                      {algorithm?.explanation?.useCase && (!algorithm?.controls || algorithm.controls?.description?.guides !== false) && (
                        <AccordionItem
                          value="usecase"
                          className="border-b border-border/50"
                        >
                          <AccordionTrigger className="px-4 sm:px-6 py-4 hover:no-underline group">
                            <div className="flex items-center gap-2 text-sm font-medium transition-colors text-foreground">
                              <Briefcase className="w-4 h-4 text-primary" />
                              Use Cases
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 sm:px-6 pb-6 pt-0">
                            <Separator className="mb-4 bg-border/40" />
                            <div className="text-sm text-muted-foreground">
                              <React.Suspense fallback={<div className="h-20 w-full animate-pulse bg-muted rounded" />}>
                                <RichText content={algorithm.explanation.useCase} />
                              </React.Suspense>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )}

                    </Accordion>
                  </div>
                  </Card>

                  {/* Video Tutorial Card */}
                  <FeatureGuard flag="youtube_video">
                    {algorithm.tutorials?.[0]?.url &&
                      (!algorithm?.controls ||
                        algorithm.controls?.content?.youtube_tutorial !==
                          false) && (
                        <VideoTutorialCard
                          tutorial={algorithm.tutorials[0]}
                          title="Video Tutorial"
                          className="max-w-[600px] mt-6 mx-0"
                        />
                      )}
                  </FeatureGuard>

                  {/* Next & Similar Problems Combined Card */}
                  {((isMounted && nextProblem) || (algorithm?.problems_to_solve?.internal && algorithm.problems_to_solve.internal.length > 0 && (!algorithm?.controls || algorithm.controls?.content?.practice_problems !== false))) && (
                    <Card className="p-4 sm:p-6 glass-card overflow-hidden max-w-[600px] flex flex-col gap-6">
                      {isMounted && nextProblem && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-3 transition-colors">
                            Next problem to solve
                          </h3>
                          <div className="space-y-2">
                            <Link
                              href={getProblemUrl(nextProblem)}
                              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex-1">
                                <p className="text-sm">
                                  {nextProblem.serial_no}. {nextProblem.title || nextProblem.name}
                                </p>
                                <div className="mt-1.5 flex">
                                  <Badge
                                    variant="secondary"
                                    className={`
                                    text-[10px] h-5 px-2 capitalize font-medium border
                                    ${(nextProblem.difficulty || '').toLowerCase() === "easy" ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200" : ""}
                                    ${(nextProblem.difficulty || '').toLowerCase() === "medium" ? "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200" : ""}
                                    ${(nextProblem.difficulty || '').toLowerCase() === "hard" ? "bg-red-100 text-red-700 border-red-200 hover:bg-red-200" : ""}
                                  `}
                                  >
                                    {nextProblem.difficulty}
                                  </Badge>
                                </div>
                              </div>
                              <ExternalLink className="w-4 h-4 text-muted-foreground" />
                            </Link>
                          </div>
                        </div>
                      )}

                      {isMounted && nextProblem &&
                        algorithm?.problems_to_solve?.internal &&
                        algorithm.problems_to_solve.internal.length > 0 &&
                        (!algorithm?.controls ||
                          algorithm.controls?.content?.practice_problems !== false) && (
                          <FeatureGuard flag="external_links">
                            <Separator />
                          </FeatureGuard>
                        )}

                      <FeatureGuard flag="external_links">
                        {algorithm?.problems_to_solve?.internal &&
                        algorithm.problems_to_solve.internal.length > 0 &&
                        (!algorithm?.controls ||
                          algorithm.controls?.content?.practice_problems !==
                            false) ? (
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-3 transition-colors">
                              Similar problems to solve
                            </h3>
                            <div className="space-y-2">
                              {algorithm.problems_to_solve.internal.map(
                                (problem: any, i: number) => (
                                  <Link
                                    key={`internal-${i}`}
                                    href={`/problem/${problem.url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                                  >
                                    <div className="flex-1">
                                      <p className="text-sm">
                                        {problem.serial_no || i + 1}. {problem.title}
                                      </p>
                                      <div className="mt-1.5 flex">
                                        <Badge
                                          variant="secondary"
                                          className={`
                                          text-[10px] h-5 px-2 capitalize font-medium border
                                          ${problem.type.toLowerCase() === "easy" ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200  " : ""}
                                          ${problem.type.toLowerCase() === "medium" ? "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200" : ""}
                                          ${problem.type.toLowerCase() === "hard" ? "bg-red-100 text-red-700 border-red-200 hover:bg-red-200" : ""}
                                        `}
                                        >
                                          {problem.type}
                                        </Badge>
                                      </div>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                  </Link>
                                ),
                              )}
                            </div>
                          </div>
                        ) : null}
                      </FeatureGuard>
                    </Card>
                  )}

                  {/* Bottom Action Bar moved to parent container */}
                  <div ref={endOfDescriptionRef} className="h-px w-full mb-12" />
                </div>
              </ScrollArea>

              {/* Bottom Action Bar - Ultra Slim Capsule */}
              <div className="absolute bottom-[2px] left-0 right-0 z-10 flex justify-center pointer-events-none px-4">
                <div className="pointer-events-auto max-w-full overflow-x-auto no-scrollbar flex items-center gap-1 p-0.5 bg-background/80 backdrop-blur-xl border border-border/50 shadow-lg rounded-full animate-in fade-in slide-in-from-bottom-4 duration-300">
                  {/* Like Button */}
                  {(!algorithm?.controls || algorithm.controls?.social?.voting !== false) && (
                    <>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={userVote === "like" ? "secondary" : "ghost"}
                              size="sm"
                              onClick={() => handleVote("like")}
                              className={`gap-1.5 h-7 px-2.5 rounded-full transition-all ${userVote === "like" ? "bg-primary/10 text-primary hover:bg-primary/20" : "hover:bg-muted"}`}
                            >
                              <ThumbsUp className={`h-3 w-3 ${userVote === "like" ? "fill-current" : ""}`} />
                              <span className="text-[11px] font-medium">{likes}</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">Like</TooltipContent>
                        </Tooltip>

                        {/* Dislike Button */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={userVote === "dislike" ? "secondary" : "ghost"}
                              size="sm"
                              onClick={() => handleVote("dislike")}
                              className={`gap-1.5 h-7 px-2.5 rounded-full transition-all ${userVote === "dislike" ? "bg-destructive/10 text-destructive hover:bg-destructive/20" : "hover:bg-muted"}`}
                            >
                              <ThumbsDown className={`h-3 w-3 ${userVote === "dislike" ? "fill-current" : ""}`} />
                              {dislikes > 0 && (
                                <span className="text-[11px] font-medium">{dislikes}</span>
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">Dislike</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <div className="w-px h-3 bg-border mx-0.5" />
                    </>
                  )}

                  {/* Community Solutions Button */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveTab("community_solutions")}
                          className="gap-1.5 h-7 px-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                        >
                          <Users className="h-3 w-3" />
                          <span className="text-[11px] font-medium">Community</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">Community Solutions</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Discussion Button */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveTab("discussion")}
                          className="gap-1.5 h-7 px-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                        >
                          <MessageSquare className="h-3 w-3" />
                          <span className="text-[11px] font-medium">Discussion</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">Discussion</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {(!algorithm?.controls || algorithm.controls?.social?.favorite !== false) && (
                    <>
                      <div className="w-px h-3 bg-border mx-0.5" />
                      {/* Favorite Button */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={toggleFavorite}
                              className={`h-7 w-7 rounded-full transition-all ${isFavorite ? "text-yellow-500 hover:text-yellow-600 hover:bg-yellow-500/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                            >
                              <Star className={`h-3.5 w-3.5 ${isFavorite ? "fill-current" : ""}`} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            {isFavorite ? "Unfavorite" : "Favorite"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>

            {activeTabsList.includes("editor") && (
              <TabsContent
                value="editor"
                className="h-full m-0 data-[state=inactive]:hidden"
              >
                {editorContent}
              </TabsContent>
            )}

            <TabsContent
              value="visualizations"
              className="h-full m-0 flex flex-col data-[state=inactive]:hidden"
            >
              {algorithm?.controls?.tabs?.visualization === false ? (
                <TabWarning message="Visualization is not available for this problem at the moment." />
              ) : (
                <AuthGuard
                  fallbackTitle="Sign in to view Visualizations"
                  fallbackDescription="Create an account or sign in to access interactive algorithm visualizations."
                  disabled={true}
                >
                  <div className="flex-1 flex flex-col relative h-full">
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute top-2 right-2 z-50 h-8 w-8 rounded-full bg-background/80 backdrop-blur shadow-sm hover:bg-background"
                      onClick={() => setIsVisualizationMaximized(true)}
                      title="Maximize Visualization"
                    >
                      <Maximize className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute top-2 right-12 z-50 h-8 w-8 rounded-full bg-background/80 backdrop-blur shadow-sm hover:bg-background group"
                      onClick={() => setIsFeedbackModalOpen(true)}
                      title="Rate Visualization"
                    >
                      <MessageSquareHeart className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Button>
                    <VisualizationFeedbackModal 
                      isOpen={isFeedbackModalOpen}
                      onOpenChange={setIsFeedbackModalOpen}
                      algorithmId={algorithm?.id || ""}
                      algorithmName={algorithm?.title}
                      userId={user?.id}
                    />

                    {/* Floating Visualization Completion Button */}
                    {!(algorithm?.is_premium || algorithm?.is_pro || (algorithm?.metadata?.is_pro && !hasPremiumAccess)) && (
                      <button
                        onClick={onToggleVisualizationCompleted}
                        className={`absolute bottom-4 right-4 z-40 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-md transition-all active:scale-95 flex items-center gap-1.5 border select-none ${
                          visualizationCompleted
                            ? "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400 hover:bg-green-500/20 hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/10 group"
                            : "bg-background/80 border-border text-muted-foreground hover:text-foreground hover:bg-accent/50"
                        }`}
                        title={visualizationCompleted ? "Click to mark incomplete" : "Click to mark complete"}
                      >
                        {visualizationCompleted ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[2.5] group-hover:hidden" />
                            <X className="w-3.5 h-3.5 stroke-[2.5] hidden group-hover:block" />
                            <span className="group-hover:hidden">Completed</span>
                            <span className="hidden group-hover:block">Mark Incomplete</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Mark Complete</span>
                          </>
                        )}
                      </button>
                    )}
                    <div
                      ref={visualizerContainerRef}
                      className={`flex-1 overflow-auto no-scrollbar relative flex flex-col ${(algorithm?.is_premium || algorithm?.is_pro || algorithm?.metadata?.is_pro) && !hasPremiumAccess && !isPlatformPreview ? "p-0" : "p-2 sm:p-4"}`}
                    >
                      {(algorithm?.is_premium ||
                        algorithm?.is_pro ||
                        algorithm?.metadata?.is_pro) &&
                      !hasPremiumAccess &&
                      !isPlatformPreview ? (
                        <ProOverlay className="rounded-none border-0 flex-1 h-full" />
                      ) : (
                        <div className="flex-1 flex flex-col min-h-0 relative">
                          <div className="flex-1 overflow-auto no-scrollbar">
                            {renderVisualization()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </AuthGuard>
              )}
            </TabsContent>

            <TabsContent
              value="solutions"
              className="h-full m-0 data-[state=inactive]:hidden relative"
            >
              {algorithm?.controls?.tabs?.solutions === false ? (
                <TabWarning message="Detailed solutions are not available for this problem yet." />
              ) : (algorithm?.is_premium ||
                  algorithm?.is_pro ||
                  algorithm?.metadata?.is_pro) &&
                !hasPremiumAccess &&
                !isPlatformPreview ? (
                <div className="h-full flex flex-col">
                  <ProOverlay className="rounded-none border-0 flex-1" />
                </div>
              ) : (
                <>
                  <ScrollArea className="h-full relative">
                    <div className="p-4 space-y-4 pb-20">
                      {algorithm?.implementations ? (
                        <React.Suspense
                          fallback={
                            <div className="h-64 w-full animate-pulse bg-muted rounded-md" />
                          }
                        >
                          <SolutionViewer
                            implementations={algorithm.implementations}
                            approachName="Optimal Solution"
                            controls={derivedSolutionControls}
                            tutorial={algorithm.tutorials?.[0]}
                            problemName={algorithm.name}
                          />
                        </React.Suspense>
                      ) : (
                        <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                          No solutions available.
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Floating Solution Completion Button */}
                  {!(algorithm?.is_premium || algorithm?.is_pro || (algorithm?.metadata?.is_pro && !hasPremiumAccess)) && (
                    <button
                      onClick={onToggleSolutionCompleted}
                      className={`absolute bottom-4 right-4 z-40 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-md transition-all active:scale-95 flex items-center gap-1.5 border select-none ${
                        solutionCompleted
                          ? "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400 hover:bg-green-500/20"
                          : "bg-background/80 border-border/60 text-muted-foreground hover:text-foreground hover:bg-background/95"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{solutionCompleted ? "Completed" : "Mark Complete"}</span>
                    </button>
                  )}
                </>
              )}
            </TabsContent>

            {/* Community Solutions Tab */}
            <TabsContent
              value="community_solutions"
              className="h-full m-0 data-[state=inactive]:hidden"
            >
              <React.Suspense
                fallback={
                  <div className="h-full flex flex-col gap-3 p-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="border border-border/40 rounded-xl p-4 space-y-3">
                        <div className="flex gap-3">
                          <div className="h-8 w-8 rounded-full bg-muted animate-pulse shrink-0" />
                          <div className="space-y-2 flex-1">
                            <div className="h-3 w-28 bg-muted animate-pulse rounded" />
                            <div className="h-3 w-48 bg-muted animate-pulse rounded" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                }
              >
                <CommunitySolutionsTab
                  algorithmId={algorithm?.id || algorithm?.slug || ''}
                  user={user}
                />
              </React.Suspense>
            </TabsContent>

            {/* Discussion Tab */}
            <TabsContent
              value="discussion"
              className="h-full m-0 data-[state=inactive]:hidden"
            >
              <React.Suspense
                fallback={
                  <div className="h-full flex flex-col gap-4 p-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-muted animate-pulse shrink-0" />
                        <div className="space-y-2 flex-1">
                          <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                          <div className="h-3 w-full bg-muted animate-pulse rounded" />
                          <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                }
              >
                <DiscussionTab
                  algorithmId={algorithm?.id || algorithm?.slug || ''}
                  user={user}
                />
              </React.Suspense>
            </TabsContent>

            <TabsContent
              value="submissions"
              className="h-full m-0 data-[state=inactive]:hidden"
            >
              <div className="h-full flex flex-col min-h-0 bg-background/50">
                {submissions.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                    <History className="w-12 h-12 mb-4 opacity-20" />
                    <p>No submissions yet</p>
                    <p className="text-xs mt-1">
                      Submit your code to see history here
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-3">
                      {/* Header */}
                      <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-3 mb-2">
                        <div className="col-span-3">Status</div>
                        <div className="col-span-1">Lang</div>
                        <div className="col-span-2">Time</div>
                        <div className="col-span-2">Memory</div>
                        <div className="col-span-4 text-right">Date</div>
                      </div>

                      {/* List */}
                      <div className="space-y-2">
                        {submissions.map((sub) => (
                          <div
                            key={sub.id}
                            className="grid grid-cols-12 gap-2 p-3 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer transition-colors items-center text-sm shadow-sm"
                            onClick={() => {
                              setSelectedSubmissionDetail(sub);
                              setActiveTab("submission_detail");
                            }}
                          >
                            <div className="col-span-3 flex items-center gap-2">
                              {sub.status === "passed" ? (
                                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground shrink-0 shadow-sm border border-primary/20">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </div>
                              ) : sub.status === "error" ? (
                                <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
                              ) : (
                                <XCircle className="w-6 h-6 text-red-500 shrink-0" />
                              )}
                              <div className="flex flex-col overflow-hidden">
                                <span
                                  className={`font-medium truncate ${sub.status === "passed" ? "text-primary" : "text-red-500"}`}
                                >
                                  {sub.status === "passed"
                                    ? "Accepted"
                                    : sub.status === "error"
                                      ? "Runtime Error"
                                      : "Wrong Answer"}
                                </span>
                                <span className="text-[10px] text-muted-foreground mt-0.5">
                                  {sub.test_results?.passed ?? 0}/
                                  {sub.test_results?.total ?? 0}
                                </span>
                              </div>
                            </div>
                            <div className="col-span-1 text-xs capitalize text-muted-foreground truncate">
                              {sub.language}
                            </div>
                            <div className="col-span-2 text-xs text-muted-foreground font-mono">
                              {sub.test_results?.execution_time_ms
                                ? `${sub.test_results.execution_time_ms} ms`
                                : "-"}
                            </div>
                            <div className="col-span-2 text-xs text-muted-foreground font-mono">
                              {sub.test_results?.memory_usage_kb
                                ? formatMemory(sub.test_results.memory_usage_kb)
                                : "-"}
                            </div>
                            <div className="col-span-4 text-right text-[10px] text-muted-foreground leading-tight">
                              {new Date(sub.timestamp).toLocaleString(
                                undefined,
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </ScrollArea>
                )}
              </div>
            </TabsContent>

            {/* Dynamic Submission Detail Content */}
            {selectedSubmissionDetail && tabs.includes("submissions") && (
              <TabsContent
                value="submission_detail"
                className="h-full m-0 data-[state=inactive]:hidden"
              >
                <div className="h-full flex flex-col min-h-0 bg-background/50">
                  <SubmissionDetailView
                    submission={selectedSubmissionDetail}
                    algorithmId={algorithm?.id || algorithm?.slug || ''}
                    onBack={() => {
                      setSelectedSubmissionDetail(null);
                      handleToolCardClick("submissions");
                    }}
                    optimalTimeComplexity={algorithm?.metadata?.timeComplexity}
                    optimalSpaceComplexity={algorithm?.metadata?.spaceComplexity}
                  />
                </div>
              </TabsContent>
            )}

            {isBrainstormEnabled &&
              algorithm?.controls?.brainstorm !== false && (
                <TabsContent
                  value="thinkpad"
                  className="h-full m-0 flex flex-col data-[state=inactive]:hidden bg-background"
                >
                  <AuthGuard
                    fallbackTitle="Sign in to use Thinkpad"
                    fallbackDescription="Create an account or sign in to access drawing boards and notes."
                    disabled={true}
                  >
                    <div className="flex-1 overflow-hidden relative flex flex-col p-0 h-full">
                      {(algorithm?.is_premium ||
                        algorithm?.is_pro ||
                        algorithm?.metadata?.is_pro) &&
                      !hasPremiumAccess &&
                      !isPlatformPreview ? (
                        <ProOverlay className="rounded-none border-0 flex-1 h-full" />
                      ) : (
                        <BrainstormSection
                          algorithmId={algorithm.id || algorithm.slug || ""}
                          algorithmTitle={algorithm.title || algorithm.name || ""}
                          controls={algorithm.controls?.brainstorm}
                          drawingCompleted={drawingCompleted}
                          onToggleDrawingCompleted={onToggleDrawingCompleted}
                        />
                      )}
                    </div>
                  </AuthGuard>
                </TabsContent>
              )}

            <TabsContent value="rulo" className="h-full m-0 data-[state=inactive]:hidden flex flex-col">
               <RuloPanel 
                  algorithmId={algorithm?.id || algorithm?.slug || ''}
                  algorithmData={algorithm}
                  currentCode={currentCode || ""}
                  language={language || "typescript"}
                  onClose={() => {}}
                  hasPremiumAccess={hasPremiumAccess}
                  onOpenVisualizations={() => handleToolCardClick("visualizations")}
                  onCopyToEditor={onCopyToEditor}
               />
            </TabsContent>

            {/* Bottom Action Bar - Removed from here, moved into the description tab */}
          </div>
        </Tabs>

        {/* Maximized Visualization Portal */}
        {isVisualizationMaximized &&
          createPortal(
            <div className="fixed inset-0 z-[100] bg-background flex flex-col w-screen h-screen">
              <div className="flex items-center justify-between px-4 py-2 border-b bg-background shrink-0 h-14">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />
                  Visualization
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsVisualizationMaximized(false)}
                  className="gap-2"
                >
                  <Minimize2 className="w-4 h-4" />
                  Exit Fullscreen
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 relative">
                {renderVisualization()}
              </div>
            </div>,
            document.body,
          )}
      </div>
    );
  },
);
