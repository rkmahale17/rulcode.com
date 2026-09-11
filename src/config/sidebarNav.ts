import {
  BookOpen,
  Brain,
  Clock,
  Compass,
  Database,
  FileText,
  HardDrive,
  Layers,
  LayoutDashboard,
  ListTodo,
  Rocket,
  Target,
  Terminal,
  LayoutTemplate,
} from "lucide-react";
import { guidesData } from "@/data/guidesData";

// ─── Guide URL helper ────────────────────────────────────────────────────────
export const PATTERN_IDS = [
  "arrays-hashing",
  "two-pointers",
  "frequency-counter",
  "prefix-sum",
  "sliding-window",
  "stack",
  "binary-search",
  "cyclic-sort",
  "merge-sort",
  "recursion",
  "backtracking",
  "merge-intervals",
  "dynamic-programming",
  "fast-and-slow-pointers",
  "greedy",
  "bfs-dfs",
] as const;

export function getGuideUrl(categoryId: string, slug: string): string {
  if (categoryId === "time-complexity") return "/guides/time-complexity";
  if (categoryId === "space-complexity") return "/guides/space-complexity";
  if (categoryId === "fundamentals") return `/guides/fundamentals/${slug}`;
  if (categoryId === "database") return `/guides/database/${slug}`;
  if (categoryId === "system-design") return `/guides/system-design/${slug}`;
  return `/guides/patterns/${slug}`;
}

// ─── DSA nav items ────────────────────────────────────────────────────────────
export const DSA_ITEMS = [
  { id: "problems", title: "Problems", icon: Rocket, url: "/problems" },
  { id: "core-patterns", title: "Core patterns", icon: Target, url: "/dsa/core" },
  { id: "blind-75", title: "Blind 75", icon: Brain, url: "/dsa/blind-75" },
  { id: "rulcode-150", title: "Rulcode 150", icon: Layers, url: "/dsa/rulcode-150" },
  { id: "pattern-guess", title: "Guess the Pattern", icon: Brain, url: "/dsa/pattern-guess" },
] as const;

// ─── Database nav items ───────────────────────────────────────────────────────
export const DATABASE_ITEMS = [
  { id: "sql-basics", title: "SQL Basics", icon: HardDrive, url: "/database/sql-basics" },
] as const;

// ─── Frontend nav items ───────────────────────────────────────────────────────
export const FRONTEND_ITEMS = [
  { id: "frontend-questions", title: "Blind 75", icon: LayoutTemplate, url: "/frontend/blind75" },
] as const;

// ─── Guide nav groups (derived from guidesData) ───────────────────────────────
function buildGuideGroups() {
  const timeCompCat = guidesData.find((c) => c.id === "time-complexity");
  const spaceCompCat = guidesData.find((c) => c.id === "space-complexity");
  const fundamentalsCat = guidesData.find((c) => c.id === "fundamentals");
  const databaseCat = guidesData.find((c) => c.id === "database");
  const systemDesignCat = guidesData.find((c) => c.id === "system-design");
  const patternGuides = guidesData
    .filter((c) => (PATTERN_IDS as readonly string[]).includes(c.id))
    .flatMap((c) => c.guides);

  return [
    {
      id: "time-complexity",
      title: "Time Complexity",
      icon: Clock,
      /** time-complexity is a single flat page — no sub-list */
      isSingleLink: true,
      guides: timeCompCat?.guides ?? [],
    },
    {
      id: "space-complexity",
      title: "Space Complexity",
      icon: HardDrive,
      /** space-complexity is also a single flat page */
      isSingleLink: true,
      guides: spaceCompCat?.guides ?? [],
    },
    {
      id: "fundamentals",
      title: "Fundamentals",
      icon: Layers,
      isSingleLink: false,
      guides: fundamentalsCat?.guides ?? [],
    },
    {
      id: "patterns",
      title: "Patterns",
      icon: Target,
      isSingleLink: false,
      guides: patternGuides,
    },
    {
      id: "database",
      title: "Database",
      icon: Database,
      isSingleLink: false,
      guides: databaseCat?.guides ?? [],
    },
    {
      id: "system-design",
      title: "System Design",
      icon: Layers,
      isSingleLink: false,
      guides: systemDesignCat?.guides ?? [],
    }
  ];
}

export const GUIDE_GROUPS = buildGuideGroups();

// ─── Top-level nav sections ───────────────────────────────────────────────────
/**
 * Each section is shown on DSA routes.
 * Guides route only shows the GUIDE_GROUPS inline (not the DSA section).
 */
export const DSA_NAV_SECTIONS = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/dashboard",
    isCollapsible: false,
  },
  {
    id: "dsa",
    title: "DSA",
    icon: ListTodo,
    isCollapsible: true,
    items: DSA_ITEMS,
  },
  {
    id: "guidebook",
    title: "Guidebook",
    icon: BookOpen,
    isCollapsible: true,
    /** Items are guide groups — rendered as flat category links on DSA routes */
    items: GUIDE_GROUPS.map((g) => ({
      id: g.id,
      title: g.title,
      icon: g.icon,
      url: g.id === "time-complexity"
        ? "/guides/time-complexity"
        : g.id === "space-complexity"
        ? "/guides/space-complexity"
        : g.id === "fundamentals"
        ? "/guides/fundamentals/core-data-structures"
        : g.id === "database"
        ? "/guides/database/what-is-database"
        : g.id === "system-design"
        ? "/guides/system-design/introduction-to-system-design"
        : "/guides/patterns/arrays-hashing",
    })),
  },
] as const;

// ─── Sidebar route list (shared between Navbar + AppSidebar) ─────────────────
export const SIDEBAR_ROUTES = [
  "/dsa/problems",
  "/problems",
  "/dsa/blind-75",
  "/dsa/rulcode-150",
  "/dsa/core",
  "/dsa/query",
  "/dsa/visual-library",
  "/dsa/roadmap",
  "/dsa/pattern-guess",
  "/dashboard",
  "/database",
  "/frontend/blind75",
];

/** Returns true if the given pathname should show the sidebar */
export function isSidebarRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname.startsWith("/frontend/blind75/") && pathname !== "/frontend/blind75/") return false;
  if (
    pathname.startsWith("/guides") &&
    pathname !== "/guides" &&
    pathname !== "/guides/"
  ) {
    return true;
  }
  return SIDEBAR_ROUTES.some((r) => pathname.startsWith(r));
}

/** Returns true if we are inside a guide detail page (not the listing) */
export function isGuideRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname.startsWith("/guides") &&
    pathname !== "/guides" &&
    pathname !== "/guides/"
  );
}
