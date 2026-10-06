"use client";

import {
  ArrowUpRight,
  Brain,
  Bug,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Clock,
  Code2,
  Database,
  HardDrive,
  Layers,
  FileText,
  List as ListIcon,
  Menu as MenuIcon,
  Monitor,
  PanelLeftClose,
  PanelLeftOpen,
  Pause,
  PenTool,
  Play,
  Rocket,
  RotateCcw,
  Send,
  Share2,
  Shuffle,
  Target,
  Timer,
  User,
  Sparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LIST_TYPE_LABELS, ListType } from "@/types/algorithm";
import { TOP_COMPANIES, slugifyCompany } from "@/constants/companies";
import { slugifyCategory } from "@/constants/categories";
import { CompanyIcon } from "@/components/CompanyIcon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "./ui/badge";
import { Button } from "@/components/ui/button";
import { FeatureGuard } from "@/components/FeatureGuard";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import UserMenu from "./UserMenu";
import Image from "next/image";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.svg";
import { trackEvent } from "@/lib/analytics";
import { useApp } from "@/contexts/AppContext";
import { useAppSelector } from "@/store/hooks";
import { usePathname } from "next/navigation";
import { usePostHog } from "@posthog/react";
import { useSidebar } from "@/components/ui/sidebar";
import { isSidebarRoute, GUIDE_GROUPS } from "@/config/sidebarNav";

interface NavbarProps {
  isProblemMode?: boolean;
  algorithm?: any;
  isInterviewMode?: boolean;
  toggleInterviewMode?: () => void;
  timerSeconds?: number;
  isTimerRunning?: boolean;
  setIsTimerRunning?: (running: boolean) => void;
  setTimerSeconds?: (seconds: number) => void;
  formatTime?: (seconds: number) => string;
  handleRandomProblem?: () => void;
  handleNextProblem?: () => void;
  handlePreviousProblem?: () => void;
  handleShare?: () => void;
  onToggleSidebar?: () => void;
  activeListType?: string;
  hideFeedback?: boolean;
  hideShare?: boolean;
  className?: string;
  onOpenRulo?: () => void;
}

const Navbar = ({
  isProblemMode = false,
  algorithm,
  isInterviewMode = false,
  toggleInterviewMode,
  timerSeconds = 0,
  isTimerRunning = false,
  setIsTimerRunning,
  setTimerSeconds,
  formatTime,
  handleRandomProblem,
  handleNextProblem,
  handlePreviousProblem,
  handleShare,
  onToggleSidebar,
  activeListType,
  hideFeedback = false,
  hideShare = false,
  className,
  onOpenRulo,
}: NavbarProps) => {
  const [mounted, setMounted] = useState(false);
  const { profile, user, hasPremiumAccess, setActiveListType } = useApp();
  const { setOpenMobile, toggleSidebar, state } = useSidebar();
  const pathname = usePathname();
  const posthog = usePostHog();
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );

  useEffect(() => {
    setMounted(true);
    let raf: number;
    const handleResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setWindowWidth(window.innerWidth));
    };
    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  const [isLearnOpen, setIsLearnOpen] = useState(false);
  const [activeLearnTab, setActiveLearnTab] = useState<
    "visual" | "pattern" | "fundamentals" | "database"
  >("fundamentals");
  const learnTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPracticeOpen, setIsPracticeOpen] = useState(false);
  const [activePracticeTab, setActivePracticeTab] = useState<
    "problems" | "company" | "topics" | "patterns" | "blind75"
  >("problems");
  const practiceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentPath =
    pathname || (typeof window !== "undefined" ? window.location.pathname : "");
  const isAuthPage = currentPath === "/login";
  const algorithms = useAppSelector((state) => state.algorithms.items);

  const hasSidebar = isSidebarRoute(currentPath);

  // Hide Navbar only if explicitly in problem mode
  if (isProblemMode) {
    // Problem mode has its own navbar handling within this component
  }

  // Prevent global Navbar instance from rendering on problem or admin pages
  const isProblemPath = currentPath.startsWith("/problem/");
  const isAdminPath = currentPath.startsWith("/admin/");
  if (!isProblemMode && (isProblemPath || isAdminPath)) {
    return null;
  }

  const showCondensedMenu = windowWidth < 778;
  const listLabel =
    activeListType && activeListType !== "all"
      ? LIST_TYPE_LABELS[activeListType as ListType] || activeListType
      : "All Problems";

  const handleLearnMouseEnter = () => {
    if (learnTimeoutRef.current) clearTimeout(learnTimeoutRef.current);
    setIsLearnOpen(true);
  };

  const handleLearnMouseLeave = () => {
    learnTimeoutRef.current = setTimeout(() => {
      setIsLearnOpen(false);
    }, 150);
  };

  const handlePracticeMouseEnter = () => {
    if (practiceTimeoutRef.current) clearTimeout(practiceTimeoutRef.current);
    setIsPracticeOpen(true);
  };

  const handlePracticeMouseLeave = () => {
    practiceTimeoutRef.current = setTimeout(() => {
      setIsPracticeOpen(false);
    }, 150);
  };

  const closeMenus = () => {
    if (learnTimeoutRef.current) clearTimeout(learnTimeoutRef.current);
    if (practiceTimeoutRef.current) clearTimeout(practiceTimeoutRef.current);
    setIsLearnOpen(false);
    setIsPracticeOpen(false);
  };

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md",
        !isProblemMode && "border-b border-border/50",
        className,
      )}
    >
      <div className="w-full px-6">
        <div className="flex h-12 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            {isProblemMode ? (
              <Link
                href="/"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity shutter-click"
                onClick={closeMenus}
              >
                <Image
                  src={typeof logo === "string" ? logo : (logo as any).src}
                  alt="RulCode Logo"
                  width={24}
                  height={24}
                  className="w-6 h-6"
                  unoptimized
                />
                <span className="hidden md:inline-block  font-medium ">
                  rulcode
                </span>
              </Link>
            ) : (
              <>
                {/* Desktop Sidebar Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden data-[show=true]:md:flex h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all rounded-full"
                  data-show={hasSidebar}
                  onClick={toggleSidebar}
                >
                  {!mounted || state === "collapsed" ? (
                    <PanelLeftOpen className="w-4 h-4" />
                  ) : (
                    <PanelLeftClose className="w-4 h-4" />
                  )}
                </Button>
                <Link
                  href="/"
                  className={cn(
                    "flex items-center gap-2 hover:opacity-80 transition-opacity shutter-click",
                    hasSidebar && "md:hidden",
                  )}
                  onClick={closeMenus}
                >
                  <Image
                    src={typeof logo === "string" ? logo : (logo as any).src}
                    alt="RulCode Logo"
                    width={24}
                    height={24}
                    className="w-6 h-6"
                    unoptimized
                  />
                  <span className="font-medium">rulcode</span>
                </Link>
              </>
            )}
          </div>

          {/* Standard Navigation Links (Desktop only) */}
          {!isProblemMode && (
            <div
              className={cn(
                "hidden md:flex items-center ml-6 flex-1 text-sm font-medium",
                currentPath === "/" ? "gap-2" : "gap-6 lg:gap-8",
              )}
            >
              {!hasSidebar && (
                <div className="h-4 w-[1px] bg-border/60 mx-1"></div>
              )}

              {currentPath !== "/" &&
                !currentPath.startsWith("/dashboard") &&
                !currentPath.startsWith("/profile") && (
                  <Link
                    href="/dashboard"
                    className="font-normal hover:text-primary transition-colors shutter-click"
                    onClick={closeMenus}
                  >
                    Dashboard
                  </Link>
                )}

              {/* ───────────────────────────────────────────────────────────────── */}
              {/* LEARN MENU                                                        */}
              {/* ───────────────────────────────────────────────────────────────── */}
              {currentPath === "/" ? (
                <Link
                  href="/guides/time-complexity"
                  className="flex items-center gap-1.5 px-3.5 py-2 text-base font-medium rounded-xl hover:bg-muted/80 hover:text-primary active:scale-[0.97] transition-all shutter-click"
                  onClick={(e) => {
                    closeMenus();
                    if (typeof window !== 'undefined' && (window as any).gtagSendEvent) {
                      e.preventDefault();
                      (window as any).gtagSendEvent('/guides/time-complexity');
                    }
                  }}
                >
                  Learn
                </Link>
              ) : (
                <div
                  onMouseEnter={handleLearnMouseEnter}
                  onMouseLeave={handleLearnMouseLeave}
                >
                  <DropdownMenu
                    open={isLearnOpen}
                    onOpenChange={setIsLearnOpen}
                    modal={false}
                  >
                    <DropdownMenuTrigger className="flex items-center gap-1 hover:text-primary transition-colors outline-none font-normal shutter-click">
                      <span>Learn</span>
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-1" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-[700px] p-0 flex flex-row overflow-hidden border-border mt-2 rounded-xl shadow-2xl bg-background"
                      onMouseEnter={handleLearnMouseEnter}
                      onMouseLeave={handleLearnMouseLeave}
                      sideOffset={4}
                    >
                      <div className="w-[240px] bg-muted/30 p-4 border-r border-border flex flex-col gap-1.5">
                        <div
                          onClick={() => setActiveLearnTab("fundamentals")}
                          className={`px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 shutter-click ${activeLearnTab === "fundamentals" ? "bg-background shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)] text-foreground" : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"}`}
                        >
                          Fundamentals
                        </div>
                        <div
                          onClick={() => setActiveLearnTab("visual")}
                          className={`px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 shutter-click ${activeLearnTab === "visual" ? "bg-background shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)] text-foreground" : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"}`}
                        >
                          Visual Algorithms
                        </div>
                        <div
                          onClick={() => setActiveLearnTab("pattern")}
                          className={`px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 shutter-click ${activeLearnTab === "pattern" ? "bg-background shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)] text-foreground" : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"}`}
                        >
                          Core patterns
                        </div>
                        <div
                          onClick={() => setActiveLearnTab("database")}
                          className={`px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 shutter-click ${activeLearnTab === "database" ? "bg-background shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)] text-foreground" : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"}`}
                        >
                          Database
                        </div>
                      </div>

                      <div className="flex-1 p-8 flex flex-col gap-8 bg-background overflow-y-auto max-h-[500px]">
                        {activeLearnTab === "visual" && (
                          <div className="flex flex-col gap-8">
                            <Link
                              href="/dsa/visual-library"
                              className="group flex items-start gap-5 relative shutter-click"
                              onClick={() => {
                                closeMenus();
                                trackEvent(posthog, "home_cta_clicked", {
                                  cta_label: "Visual Algorithms",
                                  destination: "/dsa/visual-library",
                                  section: "navbar_learn",
                                });
                              }}
                            >
                              <div className="p-3 bg-muted/50 rounded-xl group-hover:bg-primary/10 transition-colors border border-border/50 shrink-0">
                                <Monitor className="w-5 h-5 text-foreground group-hover:text-primary" />
                              </div>
                              <div className="flex-1 pr-8">
                                <h4 className="text-[15px] font-semibold mb-1.5 text-foreground group-hover:text-primary transition-colors tracking-tight">
                                  Visual Algorithms
                                </h4>
                                <p className="text-[13px] text-muted-foreground mb-3 leading-relaxed max-w-[320px]">
                                  Explore our recommended 30 patterns and
                                  interact with visualizations and problem
                                  descriptions.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  <Badge
                                    variant="secondary"
                                    className="bg-muted text-[11px] font-normal hover:bg-muted/80 border-transparent px-2.5 py-0.5"
                                  >
                                    Interactive
                                  </Badge>
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-muted-foreground/30 absolute right-0 top-1/2 -translate-y-1/2 group-hover:translate-x-1 group-hover:text-primary transition-all" />
                            </Link>
                          </div>
                        )}

                        {activeLearnTab === "pattern" && (
                          <div className="flex flex-col gap-6">
                            <div className="text-xs font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">
                              Core Patterns
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              {GUIDE_GROUPS.find((g) => g.id === "patterns")
                                ?.guides.slice(0, 5)
                                .map((guide) => (
                                  <Link
                                    key={guide.slug}
                                    href={`/guides/patterns/${guide.slug}`}
                                    className="px-3 py-2 rounded-lg hover:bg-primary/5 transition-all flex items-center justify-between group shutter-click"
                                    onClick={closeMenus}
                                  >
                                    <span className="text-[13px] font-medium text-foreground group-hover:text-primary transition-colors">
                                      {guide.title}
                                    </span>
                                    <ArrowUpRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                                  </Link>
                                ))}
                            </div>

                            <div className="border-t border-border/60 pt-3 flex justify-end">
                              <Link
                                href="/dsa/core"
                                className="text-[13px] font-semibold text-primary hover:underline flex items-center gap-1 group shutter-click"
                                onClick={(e) => {
                                  if (typeof window !== 'undefined' && (window as any).gtagSendEvent) {
                                    e.preventDefault();
                                    (window as any).gtagSendEvent('/dsa/core');
                                  }
                                  closeMenus();
                                  trackEvent(posthog, "home_cta_clicked", {
                                    cta_label: "View all patterns",
                                    destination: "/dsa/core",
                                    section: "navbar_learn_core_patterns",
                                  });
                                }}
                              >
                                View all{" "}
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                              </Link>
                            </div>
                          </div>
                        )}

                        {activeLearnTab === "fundamentals" && (
                          <div className="flex flex-col gap-6">
                            <div className="text-xs font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">
                              Fundamentals
                            </div>

                            <div className="grid grid-cols-1 gap-5">
                              {/* Time Complexity */}
                              <Link
                                href="/guides/time-complexity"
                                className="group flex items-start gap-5 relative shutter-click"
                                onClick={closeMenus}
                              >
                                <div className="p-3 bg-muted/50 rounded-xl group-hover:bg-primary/10 transition-colors border border-border/50 shrink-0">
                                  <Clock className="w-5 h-5 text-foreground group-hover:text-primary" />
                                </div>
                                <div className="flex-1 pr-8">
                                  <h4 className="text-[15px] font-semibold mb-1.5 text-foreground group-hover:text-primary transition-colors tracking-tight">
                                    Time Complexity
                                  </h4>
                                  <p className="text-[13px] text-muted-foreground leading-relaxed">
                                    Big O runtime analysis and operation budgets
                                    cheat sheet.
                                  </p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-muted-foreground/30 absolute right-0 top-1/2 -translate-y-1/2 group-hover:translate-x-1 group-hover:text-primary transition-all" />
                              </Link>

                              {/* Space Complexity */}
                              <Link
                                href="/guides/space-complexity"
                                className="group flex items-start gap-5 relative shutter-click"
                                onClick={closeMenus}
                              >
                                <div className="p-3 bg-muted/50 rounded-xl group-hover:bg-primary/10 transition-colors border border-border/50 shrink-0">
                                  <HardDrive className="w-5 h-5 text-foreground group-hover:text-primary" />
                                </div>
                                <div className="flex-1 pr-8">
                                  <h4 className="text-[15px] font-semibold mb-1.5 text-foreground group-hover:text-primary transition-colors tracking-tight">
                                    Space Complexity
                                  </h4>
                                  <p className="text-[13px] text-muted-foreground leading-relaxed">
                                    Recursion stack, memory bounds, and
                                    allocations cheat sheet.
                                  </p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-muted-foreground/30 absolute right-0 top-1/2 -translate-y-1/2 group-hover:translate-x-1 group-hover:text-primary transition-all" />
                              </Link>

                              {/* Core Data Structures */}
                              <Link
                                href="/guides/fundamentals/core-data-structures"
                                className="group flex items-start gap-5 relative shutter-click"
                                onClick={closeMenus}
                              >
                                <div className="p-3 bg-muted/50 rounded-xl group-hover:bg-primary/10 transition-colors border border-border/50 shrink-0">
                                  <Layers className="w-5 h-5 text-foreground group-hover:text-primary" />
                                </div>
                                <div className="flex-1 pr-8">
                                  <h4 className="text-[15px] font-semibold mb-1.5 text-foreground group-hover:text-primary transition-colors tracking-tight">
                                    Core Data Structures
                                  </h4>
                                  <p className="text-[13px] text-muted-foreground leading-relaxed">
                                    Core structures like Arrays, Linked Lists,
                                    and Hash Maps.
                                  </p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-muted-foreground/30 absolute right-0 top-1/2 -translate-y-1/2 group-hover:translate-x-1 group-hover:text-primary transition-all" />
                              </Link>

                              {/* Trees & Graphs */}
                              <Link
                                href="/guides/fundamentals/trees"
                                className="group flex items-start gap-5 relative shutter-click"
                                onClick={closeMenus}
                              >
                                <div className="p-3 bg-muted/50 rounded-xl group-hover:bg-primary/10 transition-colors border border-border/50 shrink-0">
                                  <User className="w-5 h-5 text-foreground group-hover:text-primary" />
                                </div>
                                <div className="flex-1 pr-8">
                                  <h4 className="text-[15px] font-semibold mb-1.5 text-foreground group-hover:text-primary transition-colors tracking-tight">
                                    Trees & Graphs
                                  </h4>
                                  <p className="text-[13px] text-muted-foreground leading-relaxed">
                                    Advanced non-linear data structures
                                    fundamentals.
                                  </p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-muted-foreground/30 absolute right-0 top-1/2 -translate-y-1/2 group-hover:translate-x-1 group-hover:text-primary transition-all" />
                              </Link>
                            </div>
                          </div>
                        )}

                        {activeLearnTab === "database" && (
                          <div className="flex flex-col gap-6">
                            <div className="text-xs font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">
                              Database
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              {GUIDE_GROUPS.find((g) => g.id === "database")
                                ?.guides.slice(0, 5)
                                .map((guide) => (
                                  <Link
                                    key={guide.slug}
                                    href={`/guides/database/${guide.slug}`}
                                    className="px-3 py-2 rounded-lg hover:bg-primary/5 transition-all flex items-center justify-between group shutter-click"
                                    onClick={closeMenus}
                                  >
                                    <span className="text-[13px] font-medium text-foreground group-hover:text-primary transition-colors">
                                      {guide.title}
                                    </span>
                                    <ArrowUpRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                                  </Link>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}

              {/* ───────────────────────────────────────────────────────────────── */}
              {/* PRACTICE MENU                                                     */}
              {/* ───────────────────────────────────────────────────────────────── */}
              {currentPath === "/" ? (
                <Link
                  href="/problems"
                  className="flex items-center gap-1.5 px-3.5 py-2 text-base font-medium rounded-xl hover:bg-muted/80 hover:text-primary active:scale-[0.97] transition-all shutter-click"
                  onClick={closeMenus}
                >
                  Practice
                </Link>
              ) : (
                <div
                  onMouseEnter={handlePracticeMouseEnter}
                  onMouseLeave={handlePracticeMouseLeave}
                >
                  <DropdownMenu
                    open={isPracticeOpen}
                    onOpenChange={setIsPracticeOpen}
                    modal={false}
                  >
                    <DropdownMenuTrigger className="flex items-center gap-1 hover:text-primary transition-colors outline-none font-normal shutter-click">
                      <span>Practice</span>
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-1" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-[700px] p-0 flex flex-row overflow-hidden border-border mt-2 rounded-xl shadow-2xl bg-background"
                      onMouseEnter={handlePracticeMouseEnter}
                      onMouseLeave={handlePracticeMouseLeave}
                      sideOffset={4}
                    >
                      <div className="w-[240px] bg-muted/30 p-4 border-r border-border flex flex-col gap-1.5">
                        <div
                          onClick={() => setActivePracticeTab("problems")}
                          className={`px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 shutter-click ${activePracticeTab === "problems" ? "bg-background shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)] text-foreground" : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"}`}
                        >
                          All Problems
                        </div>
                        <div
                          onClick={() => setActivePracticeTab("topics")}
                          className={`px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 shutter-click ${activePracticeTab === "topics" ? "bg-background shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)] text-foreground" : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"}`}
                        >
                          By Topic
                        </div>
                        <div
                          onClick={() => setActivePracticeTab("company")}
                          className={`px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 shutter-click ${activePracticeTab === "company" ? "bg-background shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)] text-foreground" : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"}`}
                        >
                          By Company
                        </div>
                        <div
                          onClick={() => setActivePracticeTab("blind75")}
                          className={`px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 shutter-click ${activePracticeTab === "blind75" ? "bg-background shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)] text-foreground" : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"}`}
                        >
                          Blind 75
                        </div>
                        <div
                          onClick={() => setActivePracticeTab("patterns")}
                          className={`px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 shutter-click ${activePracticeTab === "patterns" ? "bg-background shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)] text-foreground" : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"}`}
                        >
                          Pattern Guides
                        </div>
                        <div
                          onClick={() => setActivePracticeTab("rulcode150")}
                          className={`px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 shutter-click ${activePracticeTab === "rulcode150" ? "bg-background shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)] text-foreground" : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"}`}
                        >
                          Rulcode 150
                        </div>
                      </div>

                      <div className="flex-1 p-8 flex flex-col gap-8 bg-background overflow-y-auto max-h-[500px]">
                        {activePracticeTab === "problems" && (
                          <div className="flex flex-col gap-8">
                            <Link
                              href="/dsa/problems"
                              className="group flex items-start gap-5 relative shutter-click"
                              onClick={() => {
                                closeMenus();
                                trackEvent(posthog, "home_cta_clicked", {
                                  cta_label: "All Questions",
                                  destination: "/dsa/problems",
                                  section: "navbar_practice",
                                });
                              }}
                            >
                              <div className="p-3 bg-muted/50 rounded-xl group-hover:bg-primary/10 transition-colors border border-border/50 shrink-0">
                                <Layers className="w-5 h-5 text-foreground group-hover:text-primary" />
                              </div>
                              <div className="flex-1 pr-8">
                                <h4 className="text-[15px] font-semibold mb-1.5 text-foreground group-hover:text-primary transition-colors tracking-tight">
                                  All Questions
                                </h4>
                                <p className="text-[13px] text-muted-foreground mb-3 leading-relaxed max-w-[320px]">
                                  The largest question bank of 200+ practice
                                  questions for DSA interviews
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  <Badge
                                    variant="secondary"
                                    className="bg-muted text-[11px] font-normal hover:bg-muted/80 border-transparent px-2.5 py-0.5"
                                  >
                                    Coding
                                  </Badge>
                                  <Badge
                                    variant="secondary"
                                    className="bg-muted text-[11px] font-normal hover:bg-muted/80 border-transparent px-2.5 py-0.5"
                                  >
                                    Data Structures
                                  </Badge>
                                  <Badge
                                    variant="secondary"
                                    className="bg-muted text-[11px] font-normal hover:bg-muted/80 border-transparent px-2.5 py-0.5"
                                  >
                                    Algorithms
                                  </Badge>
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-muted-foreground/30 absolute right-0 top-1/2 -translate-y-1/2 group-hover:translate-x-1 group-hover:text-primary transition-all" />
                            </Link>

                            <Link
                              href="/dsa/core"
                              className="group flex items-start gap-5 relative shutter-click"
                              onClick={(e) => {
                                if (typeof window !== 'undefined' && (window as any).gtagSendEvent) {
                                  e.preventDefault();
                                  (window as any).gtagSendEvent('/dsa/core');
                                }
                                closeMenus();
                                trackEvent(posthog, "home_cta_clicked", {
                                  cta_label: "Core problems",
                                  destination: "/dsa/core",
                                  section: "navbar_practice",
                                });
                              }}
                            >
                              <div className="p-3 bg-muted/50 rounded-xl group-hover:bg-primary/10 transition-colors border border-border/50 shrink-0">
                                <Target className="w-5 h-5 text-foreground group-hover:text-primary" />
                              </div>
                              <div className="flex-1 pr-8">
                                <h4 className="text-[15px] font-semibold mb-1.5 text-foreground group-hover:text-primary transition-colors tracking-tight">
                                  Core problems
                                </h4>
                                <p className="text-[13px] text-muted-foreground mb-3 leading-relaxed max-w-[320px]">
                                  Practice specific problem-solving patterns.
                                </p>
                              </div>
                              <ChevronRight className="w-5 h-5 text-muted-foreground/30 absolute right-0 top-1/2 -translate-y-1/2 group-hover:translate-x-1 group-hover:text-primary transition-all" />
                            </Link>
                          </div>
                        )}

                        {activePracticeTab === "company" && (
                          <div className="flex flex-col gap-6">
                            <div className="text-xs font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">
                              Top Companies
                            </div>
                            <div className="grid grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                              {TOP_COMPANIES.map((company) => (
                                <Link
                                  key={company.id}
                                  href={`/dsa/problems?company=${slugifyCompany(company.name)}`}
                                  className="px-4 py-2.5 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-between group shutter-click"
                                  onClick={closeMenus}
                                >
                                  <div className="flex items-center gap-2">
                                    <CompanyIcon
                                      company={company.id}
                                      className="w-4 h-4 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                                    />
                                    <span className="text-[13px] font-medium text-foreground group-hover:text-primary transition-colors">
                                      {company.name}
                                    </span>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        {activePracticeTab === "topics" && (
                          <div className="flex flex-col gap-6">
                            <div className="text-xs font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">
                              Categories
                            </div>
                            <div className="grid grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                              {[
                                "Arrays & Hashing",
                                "Two Pointers",
                                "Sliding Window",
                                "Stack",
                                "Binary Search",
                                "Linked List",
                                "Trees",
                                "Tries",
                                "Backtracking",
                                "Graphs",
                                "Dynamic Programming",
                                "Greedy",
                                "Intervals",
                                "Math & Geometry",
                                "Bit Manipulation",
                              ].map((topic) => (
                                <Link
                                  key={topic}
                                  href={`/dsa/problems?topic=${slugifyCategory(topic)}`}
                                  className="px-4 py-2.5 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-between group shutter-click"
                                  onClick={closeMenus}
                                >
                                  <span className="text-[13px] font-medium text-foreground group-hover:text-primary transition-colors">
                                    {topic}
                                  </span>
                                  <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        {activePracticeTab === "blind75" && (
                          <div className="flex flex-col gap-8">
                            <Link
                              href="/dsa/blind-75"
                              className="group flex items-start gap-5 relative shutter-click"
                              onClick={() => {
                                closeMenus();
                                trackEvent(posthog, "home_cta_clicked", {
                                  cta_label: "Blind 75",
                                  destination: "/dsa/blind-75",
                                  section: "navbar_practice",
                                });
                              }}
                            >
                              <div className="p-3 bg-muted/50 rounded-xl group-hover:bg-primary/10 transition-colors border border-border/50 shrink-0">
                                <Brain className="w-5 h-5 text-foreground group-hover:text-primary" />
                              </div>
                              <div className="flex-1 pr-8">
                                <h4 className="text-[15px] font-semibold mb-1.5 text-foreground group-hover:text-primary transition-colors tracking-tight">
                                  Blind 75
                                </h4>
                                <p className="text-[13px] text-muted-foreground mb-3 leading-relaxed max-w-[320px]">
                                  Curated collection of 75 essential questions
                                  to master DSA patterns for interviews.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  <Badge
                                    variant="secondary"
                                    className="bg-muted text-[11px] font-normal hover:bg-muted/80 border-transparent px-2.5 py-0.5"
                                  >
                                    Top Curated
                                  </Badge>
                                  <Badge
                                    variant="secondary"
                                    className="bg-muted text-[11px] font-normal hover:bg-muted/80 border-transparent px-2.5 py-0.5"
                                  >
                                    FAANG Prep
                                  </Badge>
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-muted-foreground/30 absolute right-0 top-1/2 -translate-y-1/2 group-hover:translate-x-1 group-hover:text-primary transition-all" />
                            </Link>
                          </div>
                        )}

                        {activePracticeTab === "patterns" && (
                          <div className="flex flex-col gap-6">
                            <div className="text-xs font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">
                              Pattern Guides
                            </div>

                            <div className="grid grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                              {GUIDE_GROUPS.find(
                                (g) => g.id === "patterns",
                              )?.guides.map((guide) => (
                                <Link
                                  key={guide.slug}
                                  href={`/guides/patterns/${guide.slug}`}
                                  className="px-3 py-2 rounded-lg hover:bg-primary/5 transition-all flex items-center justify-between group shutter-click"
                                  onClick={closeMenus}
                                >
                                  <span className="text-[13px] font-medium text-foreground group-hover:text-primary transition-colors">
                                    {guide.title}
                                  </span>
                                  <ArrowUpRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        {activePracticeTab === "rulcode150" && (
                          <div className="flex flex-col gap-8">
                            <Link
                              href="/dsa/rulcode-150"
                              className="group flex items-start gap-5 relative shutter-click"
                              onClick={() => {
                                closeMenus();
                                trackEvent(posthog, "home_cta_clicked", {
                                  cta_label: "Rulcode 150",
                                  destination: "/dsa/rulcode-150",
                                  section: "navbar_practice",
                                });
                              }}
                            >
                              <div className="p-3 bg-muted/50 rounded-xl group-hover:bg-primary/10 transition-colors border border-border/50 shrink-0">
                                <Code2 className="w-5 h-5 text-foreground group-hover:text-primary" />
                              </div>
                              <div className="flex-1 pr-8">
                                <h4 className="text-[15px] font-semibold mb-1.5 text-foreground group-hover:text-primary transition-colors tracking-tight">
                                  Rulcode 150
                                </h4>
                                <p className="text-[13px] text-muted-foreground mb-3 leading-relaxed max-w-[320px]">
                                  Comprehensive list of 150 top questions
                                  covering all major algorithms and data structures.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  <Badge
                                    variant="secondary"
                                    className="bg-muted text-[11px] font-normal hover:bg-muted/80 border-transparent px-2.5 py-0.5"
                                  >
                                    Comprehensive
                                  </Badge>
                                  <Badge
                                    variant="secondary"
                                    className="bg-muted text-[11px] font-normal hover:bg-muted/80 border-transparent px-2.5 py-0.5"
                                  >
                                    Interview Prep
                                  </Badge>
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-muted-foreground/30 absolute right-0 top-1/2 -translate-y-1/2 group-hover:translate-x-1 group-hover:text-primary transition-all" />
                            </Link>
                          </div>
                        )}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
              {/* Roadmap Navigation for top nav */}
              {currentPath === "/" ? (
                <Link
                  href="/dsa/roadmap"
                  className="flex items-center gap-1.5 px-3.5 py-2 text-base font-medium rounded-xl hover:bg-muted/80 hover:text-primary active:scale-[0.97] transition-all shutter-click"
                  onClick={closeMenus}
                >
                  Roadmap
                </Link>
              ) : (
                <Link
                  href="/dsa/roadmap"
                  className="font-normal hover:bg-muted hover:text-foreground rounded-lg px-3 py-1.5 transition-all shutter-click"
                  onClick={closeMenus}
                >
                  Roadmap
                </Link>
              )}
            </div>
          )}

          {/* Problem Navigation */}
          {isProblemMode && (
            <div className="flex flex-1 justify-start lg:absolute lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:justify-center items-center z-10 ml-2 sm:ml-4 lg:ml-0 min-w-0 overflow-x-auto no-scrollbar">
              <div className="flex items-center shadow-sm rounded-md overflow-hidden border border-border bg-secondary/50 shrink-0">
                <button
                  onClick={onToggleSidebar}
                  className="flex items-center h-8 gap-1.5 sm:gap-2.5 px-2 sm:px-3 hover:bg-muted transition-colors group border-r border-border"
                >
                  <ChevronsUpDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline-block text-[11px] sm:text-[13px] font-semibold text-foreground/90 group-hover:text-foreground transition-colors tracking-tight">
                    {(activeListType && LIST_TYPE_LABELS[activeListType]) || 
                     (!activeListType ? "All Problems" : listLabel.charAt(0).toUpperCase() + listLabel.slice(1).toLowerCase())}
                  </span>
                </button>

                {/* Navigation Buttons Group */}
                <button
                  onClick={handlePreviousProblem}
                  className="flex items-center justify-center h-8 w-7 sm:w-8 hover:bg-muted transition-colors border-r border-border text-foreground/80 hover:text-foreground shrink-0"
                  title="Previous problem"
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={handleRandomProblem}
                  className="flex items-center justify-center h-8 w-7 sm:w-8 hover:bg-muted transition-colors border-r border-border text-foreground/80 hover:text-foreground shrink-0"
                  title="Random problem"
                >
                  <Shuffle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
                <button
                  onClick={handleNextProblem}
                  className="flex items-center justify-center h-8 w-7 sm:w-8 hover:bg-muted transition-colors text-foreground/80 hover:text-foreground shrink-0"
                  title="Next problem"
                >
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
              {onOpenRulo && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          trackEvent(posthog, "ai_rulo_clicked", {
                            location: "navbar_problem_nav",
                            algorithm_slug: algorithm?.slug || algorithm?.id,
                          });
                          onOpenRulo();
                        }}
                        className="flex items-center justify-center h-8 w-8 ml-1.5 rounded-md hover:bg-primary/20 bg-secondary/50 border border-border shadow-sm transition-colors text-primary shrink-0"
                      >
                        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      <p>Rulo</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {isProblemMode ? (
              <>
                {showCondensedMenu && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MenuIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Menu</DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      {!hideShare && handleShare && (
                        <DropdownMenuItem onClick={handleShare}>
                          <Share2 className="mr-2 h-4 w-4" />
                          <span>Share</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <Link
                          href={
                            profile?.username
                              ? `/profile/${profile.username}`
                              : "/profile"
                          }
                        >
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {/* Interview Mode - Hidden for now */}
                      <FeatureGuard flag="interview_mode">
                        <DropdownMenuItem onClick={toggleInterviewMode}>
                          <Monitor className="mr-2 h-4 w-4" />
                          <span>
                            {isInterviewMode
                              ? "Exit Interview Mode"
                              : "Interview Mode"}
                          </span>
                        </DropdownMenuItem>
                      </FeatureGuard>

                      {/* Timer in Dropdown */}
                      {formatTime && (
                        <div className="p-2 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm">
                            <Timer className="h-4 w-4" />
                            <span className="font-mono">
                              {formatTime(timerSeconds)}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsTimerRunning?.(!isTimerRunning);
                              }}
                            >
                              {isTimerRunning ? (
                                <Pause className="h-3 w-3" />
                              ) : (
                                <Play className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                setTimerSeconds?.(0);
                                setIsTimerRunning?.(false);
                              }}
                            >
                              <RotateCcw className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Desktop Actions - Button Group for Share, Timer & Bug */}
                {!showCondensedMenu && (
                  <div className="flex items-center shadow-sm rounded-md overflow-hidden border border-border/60 bg-background/50 h-8">
                    {/* Share Button */}
                    {!hideShare && handleShare && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={handleShare}
                              className="flex items-center justify-center h-8 w-8 hover:bg-muted/80 transition-colors text-foreground/80 hover:text-foreground shrink-0 outline-none"
                            >
                              <Share2 className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">Share</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    {/* Divider between Share and Timer */}
                    {!hideShare &&
                      handleShare &&
                      (!algorithm?.controls ||
                        algorithm.controls?.header?.timer !== false) &&
                      formatTime && (
                        <div className="w-px h-4 bg-border/60 shrink-0" />
                      )}

                    {/* Timer Button */}
                    {(!algorithm?.controls ||
                      algorithm.controls?.header?.timer !== false) &&
                      formatTime && (
                        <TooltipProvider>
                          <Popover>
                            <PopoverTrigger asChild>
                              <button
                                className={cn(
                                  "flex items-center justify-center h-8 w-8 hover:bg-muted/80 transition-colors text-foreground/80 hover:text-foreground shrink-0 outline-none",
                                  isTimerRunning &&
                                    "bg-secondary/80 text-foreground font-medium",
                                )}
                                title="Timer"
                              >
                                <Timer className="h-4 w-4" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48">
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-lg">
                                    {formatTime(timerSeconds)}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setTimerSeconds?.(0)}
                                  >
                                    <RotateCcw className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    className="flex-1"
                                    onClick={() =>
                                      setIsTimerRunning?.(!isTimerRunning)
                                    }
                                  >
                                    {isTimerRunning ? (
                                      <Pause className="h-4 w-4 mr-2" />
                                    ) : (
                                      <Play className="h-4 w-4 mr-2" />
                                    )}
                                    {isTimerRunning ? "Pause" : "Start"}
                                  </Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </TooltipProvider>
                      )}

                    {/* Divider before Bug */}
                    {((!hideShare && handleShare) ||
                      ((!algorithm?.controls ||
                        algorithm.controls?.header?.timer !== false) &&
                        formatTime)) && (
                      <div className="w-px h-4 bg-border/60 shrink-0" />
                    )}

                    {/* Bug / Feedback Button */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => window.open("/feedback", "_blank")}
                            className="flex items-center justify-center h-8 w-8 hover:bg-muted/80 transition-colors text-foreground/80 hover:text-foreground shrink-0 outline-none"
                          >
                            <Bug className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">Feedback</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}

                <div className="h-4 w-px bg-border mx-1" />

                <ThemeToggle />

                {!isAuthPage && <UserMenu />}
              </>
            ) : (
              <>
                {(!user || !hasPremiumAccess) && !isAuthPage && (
                  <Link
                    href="/pricing"
                    className="text-sm font-normal hover:text-primary transition-colors hidden md:block mr-2"
                    onClick={(e) => {
                      if (typeof window !== 'undefined' && (window as any).gtagSendEvent) {
                        e.preventDefault();
                        (window as any).gtagSendEvent('/pricing');
                      }
                      trackEvent(posthog, "navbar_cta_clicked", {
                        cta_label: "Pricing",
                        destination: "/pricing",
                      });
                    }}
                  >
                    Pricing
                  </Link>
                )}

                <ThemeToggle />

                {!isAuthPage && <UserMenu />}

                {/* Mobile Sidebar Trigger */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-8 w-8 ml-1"
                  onClick={() => setOpenMobile(true)}
                >
                  <MenuIcon className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
