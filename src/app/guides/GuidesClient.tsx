"use client";

import * as React from "react";

import { Check, ChevronRight, Copy, Eye, List, X } from "lucide-react";
import {
  GuideFooter,
  GuideHeader,
  GuideHeading,
  GuideParagraph,
  GuideSubHeading,
  GuideTable,
  GuideVisualizationsSection,
  InlineVizTrigger,
} from "./GuideComponents";
import { GuideItem, guidesData } from "@/data/guidesData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { cn } from "@/lib/utils";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import { renderVisualization } from "@/utils/visualizationMapping";
import { toast } from "sonner";
import { useApp } from "@/contexts/AppContext";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const SolutionViewer = dynamic(
  () => import("@/components/SolutionViewer").then((mod) => mod.SolutionViewer),
  { ssr: false }
);

const TreeDiagram = dynamic(
  () => import("@/components/visualizations/TreeDiagram").then((mod) => mod.TreeDiagram),
  { ssr: false }
);

const GraphDiagram = dynamic(
  () => import("@/components/visualizations/GraphDiagram").then((mod) => mod.GraphDiagram),
  { ssr: false }
);

const ArrayDiagram = dynamic(
  () => import("@/components/visualizations/ArrayDiagram").then((mod) => mod.ArrayDiagram),
  { ssr: false }
);

const LinkedListDiagram = dynamic(
  () => import("@/components/visualizations/LinkedListDiagram").then((mod) => mod.LinkedListDiagram),
  { ssr: false }
);

const StackDiagram = dynamic(
  () => import("@/components/visualizations/StackDiagram").then((mod) => mod.StackDiagram),
  { ssr: false }
);

const QueueDiagram = dynamic(
  () => import("@/components/visualizations/QueueDiagram").then((mod) => mod.QueueDiagram),
  { ssr: false }
);

import { AlgoLink } from "@/components/AlgoLink";

interface SolutionViewerBlock {
  type: "solution-viewer";
  implementations: {
    lang: string;
    code: { codeType: string; code: string }[];
  }[];
}

interface MarkdownBlock {
  type: "markdown";
  content: string;
}

type ParsedBlock = MarkdownBlock | SolutionViewerBlock;

function parseMarkdownWithSolutionViewers(content: string): ParsedBlock[] {
  const lines = content.split('\n');
  const blocks: ParsedBlock[] = [];
  
  let currentMarkdownLines: string[] = [];
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    
    const langHeaderMatch = line.trim().match(/^#{3,6}\s+(Python|Java|C\+\+|TypeScript|Javascript|Go|Rust|C#)$/i);
    
    if (langHeaderMatch) {
      let j = i + 1;
      while (j < lines.length && lines[j].trim() === '') {
        j++;
      }
      
      if (j < lines.length && lines[j].trim().startsWith('```')) {
        const implementations: { lang: string; code: { codeType: string; code: string }[] }[] = [];
        let tempI = i;
        let validGroup = true;
        
        while (tempI < lines.length) {
          const checkLine = lines[tempI];
          const checkLangMatch = checkLine.trim().match(/^#{3,6}\s+(Python|Java|C\+\+|TypeScript|Javascript|Go|Rust|C#)$/i);
          if (!checkLangMatch) break;
          
          let scanJ = tempI + 1;
          while (scanJ < lines.length && lines[scanJ].trim() === '') {
            scanJ++;
          }
          
          if (scanJ < lines.length && lines[scanJ].trim().startsWith('```')) {
            const matchedLang = checkLangMatch[1].toLowerCase();
            let codeEndJ = scanJ + 1;
            const codeLines: string[] = [];
            while (codeEndJ < lines.length && !lines[codeEndJ].trim().startsWith('```')) {
              codeLines.push(lines[codeEndJ]);
              codeEndJ++;
            }
            
            if (codeEndJ < lines.length && lines[codeEndJ].trim().startsWith('```')) {
              let mappedLang = matchedLang;
              if (matchedLang === 'c++') mappedLang = 'cpp';
              if (matchedLang === 'c#') mappedLang = 'csharp';
              if (matchedLang === 'javascript') mappedLang = 'javascript';
              
              implementations.push({
                lang: mappedLang,
                code: [{ codeType: 'solution', code: codeLines.join('\n') }]
              });
              
              tempI = codeEndJ + 1;
              while (tempI < lines.length && lines[tempI].trim() === '') {
                tempI++;
              }
            } else {
              validGroup = false;
              break;
            }
          } else {
            break;
          }
        }
        
        if (validGroup && implementations.length > 0) {
          if (currentMarkdownLines.length > 0) {
            blocks.push({
              type: 'markdown',
              content: currentMarkdownLines.join('\n')
            });
            currentMarkdownLines = [];
          }
          
          blocks.push({
            type: 'solution-viewer',
            implementations
          });
          
          i = tempI;
          continue;
        }
      }
    }
    
    currentMarkdownLines.push(line);
    i++;
  }
  
  if (currentMarkdownLines.length > 0) {
    blocks.push({
      type: 'markdown',
      content: currentMarkdownLines.join('\n')
    });
  }
  
  return blocks;
}

// Helper to extract a text string from React node to form a heading ID
const extractHeadingText = (children: React.ReactNode): string => {
  return React.Children.toArray(children)
    .map((c) => {
      if (typeof c === "string") return c;
      if (typeof c === "number") return String(c);
      if (typeof c === "object" && c && "props" in c && c.props.children) {
        return React.Children.toArray(c.props.children).join("");
      }
      return "";
    })
    .join("");
};

const GuideMarkdownHeading2 = ({ children }: { children: React.ReactNode }) => {
  const id = extractHeadingText(children)
    .replace(/\[!.*?\]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
  return <GuideHeading id={id}>{children}</GuideHeading>;
};

const GuideMarkdownHeading3 = ({ children }: { children: React.ReactNode }) => {
  const id = extractHeadingText(children)
    .replace(/\[!.*?\]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
  return <GuideSubHeading id={id}>{children}</GuideSubHeading>;
};

interface GuidesClientProps {
  guide: GuideItem;
}

export default function GuidesClient({ guide }: GuidesClientProps) {
  const router = useRouter();
  const { hasPremiumAccess } = useApp();

  const [showVisualizer, setShowVisualizer] = useState(false);
  const [activeViz, setActiveViz] = useState<string>("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [activeId, setActiveId] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(true);

  const isScrollingToRef = React.useRef<boolean>(false);
  const scrollTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const readerRef = React.useRef<HTMLDivElement>(null);

  // Sync completion state
  useEffect(() => {
    setIsCompleted(
      localStorage.getItem(`rulcode_guide_completed_${guide.slug}`) === "true",
    );
  }, [guide.slug]);

  // Setup active visualization
  useEffect(() => {
    if (guide.visualizations && guide.visualizations.length > 0) {
      setActiveViz(guide.visualizations[0]);
    } else {
      setActiveViz("");
    }
    setShowVisualizer(false); // Reset simulator pane on guide change
  }, [guide]);

  // Pattern category IDs
  const patternCategoryIds = [
    "arrays-hashing",
    "two-pointers",
    "frequency-counter",
    "prefix-sum",
    "sliding-window",
    "stack",
    "binary-search",
    "recursion",
    "backtracking",
    "merge-intervals",
  ];

  // Helper to compute the correct guide URL based on category
  const getGuideUrl = (g: GuideItem): string => {
    if (g.category === "time-complexity") return `/guides/time-complexity`;
    if (g.category === "space-complexity") return `/guides/space-complexity`;
    if (g.category === "fundamentals") return `/guides/fundamentals/${g.slug}`;
    if (g.category === "database") return `/guides/database/${g.slug}`;
    if (patternCategoryIds.includes(g.category))
      return `/guides/patterns/${g.slug}`;
    return `/guides/${g.slug}`;
  };

  // Category label for breadcrumb
  const categoryLabel = useMemo(() => {
    if (guide.category === "time-complexity") return "Time Complexity";
    if (guide.category === "space-complexity") return "Space Complexity";
    if (guide.category === "fundamentals") return "Fundamentals";
    if (guide.category === "database") return "Database";
    if (patternCategoryIds.includes(guide.category)) return "Patterns";
    return "Guides";
  }, [guide.category]);

  const categoryHref = useMemo(() => {
    if (guide.category === "time-complexity") return `/guides/time-complexity`;
    if (guide.category === "space-complexity") return `/guides/space-complexity`;
    if (guide.category === "fundamentals") return `/guides`;
    if (guide.category === "database") return `/guides`;
    if (patternCategoryIds.includes(guide.category)) return `/guides`;
    return `/guides`;
  }, [guide.category]);

  const parsedBlocks = useMemo(() => {
    if (!guide.content) return [];
    return parseMarkdownWithSolutionViewers(guide.content);
  }, [guide.content]);

  // Flat guides list for previous/next navigation
  const allGuides = useMemo(() => {
    return guidesData.flatMap((c) => c.guides);
  }, []);

  const currentIndex = useMemo(() => {
    return allGuides.findIndex((g) => g.slug === guide.slug);
  }, [guide.slug, allGuides]);

  const prevGuide = currentIndex > 0 ? allGuides[currentIndex - 1] : null;
  const nextGuide =
    currentIndex < allGuides.length - 1 ? allGuides[currentIndex + 1] : null;

  // Toggle completion
  const toggleComplete = () => {
    const newState = !isCompleted;
    setIsCompleted(newState);
    localStorage.setItem(
      `rulcode_guide_completed_${guide.slug}`,
      newState ? "true" : "false",
    );

    if (newState) {
      toast.success("Guide marked as complete!");
      import("canvas-confetti").then((confetti) => {
        confetti.default({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 },
        });
      });
    } else {
      toast.success("Completion progress cleared.");
    }
  };

  // Extract headings from markdown content for TOC scrollspy
  const headings = useMemo(() => {
    const list: { level: number; text: string; id: string }[] = [];
    
    parsedBlocks.forEach((block) => {
      if (block.type !== "markdown") return;
      
      const headingRegex = /^(##|###) (.*)$/gm;
      let match;
      while ((match = headingRegex.exec(block.content)) !== null) {
        const level = match[1] === "##" ? 2 : 3;
        const text = match[2].replace(/\[!.*?\]/g, "").trim();
        const baseId = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-");

        list.push({ level, text, id: baseId });
      }
    });
    
    if (guide.visualizations && guide.visualizations.length > 0) {
      list.push({
        level: 2,
        text: "Interactive Visualizations",
        id: "interactive-visualizations",
      });
    }
    
    return list;
  }, [parsedBlocks, guide.visualizations]);

  // Keep activeId in a ref to avoid recreating the scroll listener on every scroll step
  const activeIdRef = React.useRef(activeId);
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  // TOC scrollspy — uses passive scroll listener for better reliability
  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingToRef.current) return;
      
      const headingElements = headings
        .map((h) => document.getElementById(h.id))
        .filter((el): el is HTMLElement => el !== null);
        
      if (headingElements.length === 0) return;
      
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const scrollY = window.scrollY;
      
      // Page bottom check (standard, robust formula)
      if (scrollY + clientHeight >= scrollHeight - 20) {
        const lastHeadingId = headingElements[headingElements.length - 1].id;
        if (lastHeadingId !== activeIdRef.current) {
          setActiveId(lastHeadingId);
        }
        return;
      }
      
      let currentActiveId = "";
      const OFFSET = 120; // navbar height + breathing room
      
      for (const el of headingElements) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= OFFSET) {
          currentActiveId = el.id;
        } else {
          break;
        }
      }
      
      if (!currentActiveId && headingElements.length > 0) {
        currentActiveId = headingElements[0].id;
      }
      
      if (currentActiveId && currentActiveId !== activeIdRef.current) {
        setActiveId(currentActiveId);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Run once on mount / content change
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [guide.content, showVisualizer, headings]);

  // TOC smooth scroll click handler — scrolls window with navbar offset
  const handleTocClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      isScrollingToRef.current = true;
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

      const top = element.getBoundingClientRect().top + window.scrollY - 68;
      window.scrollTo({ top, behavior: "smooth" });
      setActiveId(id);

      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingToRef.current = false;
      }, 1000);
    }
  };

  const markdownComponents = useMemo(
    () => ({
      h1({ children }: any) {
        return null;
      },
      h2({ children }: any) {
        return <GuideMarkdownHeading2>{children}</GuideMarkdownHeading2>;
      },
      h3({ children }: any) {
        return <GuideMarkdownHeading3>{children}</GuideMarkdownHeading3>;
      },
      a({ href, children }: any) {
        if (href && href.startsWith("viz:")) {
          const vizId = href.substring(4);
          return (
            <InlineVizTrigger
              vizId={vizId}
              label={String(children)}
              showVisualizer={showVisualizer}
              setShowVisualizer={setShowVisualizer}
              activeViz={activeViz}
              setActiveViz={setActiveViz}
            />
          );
        }
        if (href && href.startsWith("/problem")) {
          return (
            <AlgoLink
              url={href}
              label={children}
              className="font-medium"
            />
          );
        }
        const isExternalOrProblem = href && (href.startsWith("http") || href.startsWith("/problem"));
        return (
          <a
            href={href}
            target={isExternalOrProblem ? "_blank" : undefined}
            rel={isExternalOrProblem ? "noopener noreferrer" : undefined}
            className="text-primary hover:underline font-medium"
          >
            {children}
          </a>
        );
      },
      p({ children }: any) {
        return <GuideParagraph>{children}</GuideParagraph>;
      },
      blockquote({ children }: any) {
        const text = React.Children.toArray(children)
          .map((c) => {
            if (typeof c === "string") return c;
            if (
              typeof c === "object" &&
              c &&
              "props" in c &&
              c.props.children
            ) {
              return React.Children.toArray(c.props.children).join("");
            }
            return "";
          })
          .join(" ");

        const isTip = /\[!TIP\]/i.test(text);
        const isNote = /\[!NOTE\]/i.test(text);
        const isImportant = /\[!IMPORTANT\]/i.test(text);
        const isWarning = /\[!WARNING\]/i.test(text);
        const isCaution = /\[!CAUTION\]/i.test(text);

        if (isTip || isNote || isImportant || isWarning || isCaution) {
          let bgClass = "bg-blue-500/10 border-blue-500/30 text-blue-200";
          let title = "Note";
          let icon = "ℹ️";

          if (isTip) {
            bgClass =
              "bg-emerald-500/10 border-emerald-500/30 text-emerald-200";
            title = "Tip";
            icon = "💡";
          } else if (isImportant) {
            bgClass = "bg-indigo-500/10 border-indigo-500/30 text-indigo-200";
            title = "Important";
            icon = "⚠️";
          } else if (isWarning) {
            bgClass = "bg-amber-500/10 border-amber-500/30 text-amber-200";
            title = "Warning";
            icon = "⚠️";
          } else if (isCaution) {
            bgClass = "bg-rose-500/10 border-rose-500/30 text-rose-200";
            title = "Caution";
            icon = "🚨";
          }

          const cleanChildren = React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              const element = child as React.ReactElement<any>;
              if (element.props && element.props.children) {
                const subChildren = React.Children.toArray(element.props.children);
                const cleanSubChildren = subChildren.map((sub) => {
                  if (typeof sub === "string") {
                    return sub.replace(
                      /\[!(TIP|NOTE|IMPORTANT|WARNING|CAUTION)\]\s*/gi,
                      "",
                    );
                  }
                  return sub;
                });
                return React.cloneElement(element, {
                  ...element.props,
                  children: cleanSubChildren,
                });
              }
            }
            return child;
          });

          return (
            <div
              className={`p-4 my-6 border-l-4 rounded-r-lg ${bgClass} flex gap-3 items-start text-sm`}
            >
              <span className="text-lg shrink-0 mt-0.5">{icon}</span>
              <div className="flex-1 min-w-0">
                <span className="font-semibold block mb-1 text-foreground/90">
                  {title}
                </span>
                <div className="text-muted-foreground leading-relaxed">
                  {cleanChildren}
                </div>
              </div>
            </div>
          );
        }

        return (
          <blockquote className="border-l-4 border-muted pl-4 italic my-4 text-muted-foreground">
            {children}
          </blockquote>
        );
      },
      pre({ children }: any) {
        return <>{children}</>;
      },
      code({ node, inline, className, children, ...props }: any) {
        const match = /language-(\w+)/.exec(className || "");
        const codeString = String(children).replace(/\n$/, "");
        const [copied, setCopied] = useState(false);

        const handleCopy = async () => {
          await navigator.clipboard.writeText(codeString);
          setCopied(true);
          toast.success("Code copied to clipboard!");
          setTimeout(() => setCopied(false), 2000);
        };

        if (!inline && match) {
          const lang = match[1];

          if (lang === "tree") {
            return <TreeDiagram data={codeString} height={200} className="my-6" />;
          }

          if (lang === "graph" || lang === "trie") {
            return <GraphDiagram data={codeString} height={250} className="my-6" />;
          }

          if (lang === "array") {
            return <ArrayDiagram data={codeString} className="my-6" />;
          }

          if (lang === "linkedlist" || lang === "singly-linkedlist") {
            return <LinkedListDiagram data={codeString} className="my-6" />;
          }

          if (lang === "doubly-linkedlist") {
            return <LinkedListDiagram data={codeString} doubly={true} className="my-6" />;
          }

          if (lang === "stack") {
            return <StackDiagram data={codeString} className="my-6" />;
          }

          if (lang === "queue") {
            return <QueueDiagram data={codeString} className="my-6" />;
          }

          return (
            <div className="my-6 rounded-lg border border-border/40 overflow-hidden bg-zinc-950">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 bg-zinc-900/60 text-xs text-muted-foreground select-none">
                <span className="font-mono uppercase">{lang}</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <SyntaxHighlighter
                style={oneDark}
                language={lang}
                PreTag="div"
                customStyle={{
                  margin: 0,
                  padding: "1rem",
                  background: "transparent",
                  fontSize: "0.85rem",
                }}
                {...props}
              >
                {codeString}
              </SyntaxHighlighter>
            </div>
          );
        }

        return (
          <code
            className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary font-medium"
            {...props}
          >
            {children}
          </code>
        );
      },
      img({ src, alt }: any) {
        return (
          <Dialog>
            <DialogTrigger asChild>
              <img
                src={src}
                alt={alt}
                className="w-full max-w-[600px] h-auto my-6 rounded-xl border border-border/50 shadow-md object-cover hover:scale-[1.02] hover:shadow-lg transition-all duration-300 mx-auto block cursor-zoom-in"
              />
            </DialogTrigger>
            <DialogContent className="w-fit max-w-[95vw] max-h-[95vh] p-0 overflow-hidden bg-transparent border-none shadow-none flex justify-center items-center [&>button]:right-2 [&>button]:top-2 [&>button]:bg-background/80 [&>button]:p-1.5 [&>button]:rounded-full [&>button]:opacity-100 hover:[&>button]:bg-background">
              <img
                src={src}
                alt={alt}
                className="w-auto h-auto max-w-[95vw] max-h-[95vh] object-contain rounded-xl"
              />
            </DialogContent>
          </Dialog>
        );
      },
      table({ children }: any) {
        return <GuideTable>{children}</GuideTable>;
      },
      thead({ children }: any) {
        return <thead className="bg-muted/40">{children}</thead>;
      },
      tbody({ children }: any) {
        return (
          <tbody className="divide-y divide-border/20 bg-background/20">
            {children}
          </tbody>
        );
      },
      tr({ children }: any) {
        return (
          <tr className="transition-colors odd:bg-transparent odd:hover:bg-muted/15 dark:odd:hover:bg-muted/5 even:bg-muted/30 dark:even:bg-muted/10 even:hover:bg-muted/40 dark:even:hover:bg-muted/15">
            {children}
          </tr>
        );
      },
      th({ children }: any) {
        return (
          <th className="px-4 py-2 text-left font-medium text-muted-foreground/80 text-[9.5px] uppercase tracking-widest leading-4">
            {children}
          </th>
        );
      },
      td({ children }: any) {
        const renderComplexityBadge = (complexity: string) => {
          let badgeStyles = "bg-muted/80 dark:bg-muted/25 text-muted-foreground border-muted/30";
          if (complexity.startsWith("O(1)")) {
            badgeStyles = "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/20";
          } else if (complexity.startsWith("O(log n)")) {
            badgeStyles = "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/20";
          } else if (complexity.startsWith("O(n log n)")) {
            badgeStyles = "bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 border-orange-500/20";
          } else if (complexity.startsWith("O(n)")) {
            badgeStyles = "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/20";
          } else if (complexity.startsWith("O(n^2)") || complexity.startsWith("O(n²)")) {
            badgeStyles = "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 border-red-500/20";
          } else if (complexity.startsWith("O(V + E)") || complexity.startsWith("O(R × C)") || complexity.startsWith("O(R * C)")) {
            badgeStyles = "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 border-indigo-500/20";
          }
          return (
            <span className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium border transition-colors",
              badgeStyles
            )}>
              {complexity}
            </span>
          );
        };

        const renderComplexityInCell = (node: React.ReactNode): React.ReactNode => {
          if (typeof node === 'string') {
            const regex = /(O\(1\)|O\(log\s*n\)|O\(n\s*log\s*n\)|O\(n\^2\)|O\(n²\)|O\(n\)|O\(V\s*\+\s*E\)|O\(R\s*[×*]\s*C\))/g;
            const parts = node.split(regex);
            if (parts.length > 1) {
              return parts.map((part, index) => {
                if (index % 2 === 1) {
                  return (
                    <React.Fragment key={index}>
                      {renderComplexityBadge(part)}
                    </React.Fragment>
                  );
                }
                return part;
              });
            } else {
              // Try exact match in case regex didn't split (e.g. O(1) without spaces etc.)
              const trimmed = node.trim();
              if (
                trimmed === "O(1)" ||
                trimmed === "O(log n)" ||
                trimmed === "O(n)" ||
                trimmed === "O(n log n)" ||
                trimmed === "O(n^2)" ||
                trimmed === "O(n²)" ||
                trimmed.startsWith("O(V + E)") ||
                trimmed.startsWith("O(R × C)") ||
                trimmed.startsWith("O(R * C)")
              ) {
                return renderComplexityBadge(trimmed);
              }
            }
          }
          return node;
        };

        return (
          <td className="px-4 py-2.5 text-muted-foreground first:text-foreground first:font-medium text-[14px] leading-5">
            {React.Children.map(children, renderComplexityInCell)}
          </td>
        );
      },
    }),
    [showVisualizer, setShowVisualizer, activeViz, setActiveViz],
  );

  return (
    <div className="flex flex-col bg-background">
      {/* Main content row: article + sticky right panel */}
      <div className="flex relative">
        {/* Left Side: Article Reader — scrolls with the page */}
        <div
          ref={readerRef}
          className={cn(
            "flex-1 min-w-0 px-4 sm:px-6 md:px-8 py-8 transition-all duration-300 relative",
            showVisualizer
              ? "lg:max-w-[50%] w-full"
              : "max-w-[850px] mx-auto w-full",
          )}
        >
          <div className="flex flex-col gap-6 mx-auto w-full max-w-[620px] pb-24">
            <GuideHeader
              guide={guide}
              categoryLabel={categoryLabel}
              categoryHref={categoryHref}
            />

            <hr className="border-neutral-200 dark:border-neutral-800"></hr>

            {guide.heroImage && (
              <div className="w-full mt-4 mb-2 flex justify-center">
                <img
                  src={`https://dkebbjneobjtmuzzrsdo.supabase.co/storage/v1/object/public/guides/${guide.heroImage}.webp`}
                  alt={`${guide.title} hero`}
                  className="w-full max-w-[600px] h-auto rounded-xl border border-border/50 shadow-sm object-cover"
                />
              </div>
            )}

            <div>
              <article className="flex flex-col">
                {/* Video Embedded Player */}
                {guide.videoUrl && (
                  <div className="my-8 rounded-xl border border-border/50 bg-card overflow-hidden shadow-lg aspect-video max-w-full">
                    <iframe
                      src={guide.videoUrl}
                      title={`${guide.title} Walkthrough Video`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  </div>
                )}

                <div className="prose dark:prose-invert text-[15px] max-w-none prose-pre:p-0 prose-pre:bg-transparent space-y-6">
                  {parsedBlocks.map((block, index) => {
                    const blockKey = `${guide.slug}-${index}`;
                    if (block.type === "markdown") {
                      return (
                        <div key={blockKey} className="mb-8">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={markdownComponents}
                            urlTransform={(value: string) => value}
                          >
                            {block.content}
                          </ReactMarkdown>
                        </div>
                      );
                    } else if (block.type === "solution-viewer") {
                      return (
                        <div key={blockKey} className="not-prose my-6 block">
                          <React.Suspense
                            fallback={
                              <div className="h-64 w-full animate-pulse bg-muted rounded-md" />
                            }
                          >
                            <SolutionViewer
                              implementations={block.implementations}
                              approachName="Solution Code"
                              controls={{ approaches: false }}
                            />
                          </React.Suspense>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>

                {guide.visualizations && guide.visualizations.length > 0 && (
                  <GuideVisualizationsSection
                    visualizations={guide.visualizations}
                    activeViz={activeViz}
                    setActiveViz={setActiveViz}
                    showVisualizer={showVisualizer}
                    setShowVisualizer={setShowVisualizer}
                  />
                )}

                <GuideFooter
                  currentIndex={currentIndex}
                  allGuidesCount={allGuides.length}
                  prevGuide={prevGuide}
                  nextGuide={nextGuide}
                  isCompleted={isCompleted}
                  toggleComplete={toggleComplete}
                  getGuideUrl={getGuideUrl}
                  allGuides={allGuides}
                />
              </article>
            </div>
          </div>
        </div>

        {/* Right Side: Visualizer — sticky panel alongside scrolling article */}
        {showVisualizer && (
          <div className="hidden lg:flex w-[50%] shrink-0 border-l border-border/50 bg-background flex-col animate-slideIn sticky top-[48px] h-[calc(100vh-48px)]">
            <div className="h-12 border-b border-border/40 bg-muted/30 flex items-center justify-between px-4 shrink-0 select-none">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-primary" />
                Interactive Simulator
              </span>
              <div className="flex items-center gap-2">
                {guide.visualizations && guide.visualizations.length > 1 && (
                  <Select value={activeViz} onValueChange={setActiveViz}>
                    <SelectTrigger className="h-7 text-xs border border-border/40 bg-background text-foreground w-[160px] focus:ring-0">
                      <SelectValue placeholder="Select visualization" />
                    </SelectTrigger>
                    <SelectContent>
                      {guide.visualizations.map((vizId) => (
                        <SelectItem
                          key={vizId}
                          value={vizId}
                          className="text-xs"
                        >
                          {vizId
                            .split("-")
                            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                            .join(" ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-full"
                  onClick={() => setShowVisualizer(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto no-scrollbar p-6 relative flex flex-col bg-background">
              <div className="flex-1 flex flex-col min-h-0 relative">
                {renderVisualization(activeViz)}
              </div>
            </div>
          </div>
        )}

        {/* Right Sidebar: TOC — sticky alongside scrolling article */}
        {!showVisualizer && headings.length > 0 && (
          <aside
            className={cn(
              "hidden xl:flex shrink-0 sticky top-[48px] h-[calc(100vh-48px)] overflow-y-auto no-scrollbar select-none flex-col transition-all duration-300 ease-in-out",
              isExpanded ? "w-64" : "w-12"
            )}
          >
            <div className={cn("py-10 transition-all duration-300", isExpanded ? "px-6" : "px-2 flex flex-col items-center")}>
              <div className={cn("flex items-center justify-between mb-4 w-full", !isExpanded && "justify-center")}>
                {isExpanded && (
                  <div className="flex items-center gap-2 text-muted-foreground/80 dark:text-muted-foreground/60 animate-fadeIn">
                    <List className="w-4 h-4" />
                    <span className="text-[10px] font-medium uppercase tracking-widest">
                      On this page
                    </span>
                  </div>
                )}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1 hover:bg-muted/60 dark:hover:bg-neutral-800/60 rounded text-muted-foreground/80 hover:text-foreground transition-all cursor-pointer"
                  aria-label={isExpanded ? "Collapse table of contents" : "Expand table of contents"}
                >
                  <ChevronRight
                    className={cn(
                      "w-4 h-4 transition-transform duration-200",
                      isExpanded ? "rotate-90" : "rotate-180"
                    )}
                  />
                </button>
              </div>

              <div
                className={cn(
                  "transition-all duration-300 ease-in-out overflow-hidden origin-top",
                  isExpanded
                    ? "max-h-[1000px] opacity-100 mt-2"
                    : "max-h-0 opacity-0 pointer-events-none"
                )}
              >
                <ul className="flex flex-col gap-2.5 text-[12.5px] border-l-2 border-neutral-200 dark:border-neutral-800/60 pl-0 relative">
                  {headings.map((h) => (
                    <li key={h.id} className="relative">
                      {activeId === h.id && (
                        <motion.div
                          layoutId="guidesActiveIndicator"
                          className="absolute -left-[2px] top-0 bottom-0 w-[2px] bg-neutral-900 dark:bg-neutral-100 rounded-full"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <a
                        href={`#${h.id}`}
                        onClick={(e) => handleTocClick(e, h.id)}
                        style={{ paddingLeft: `${12 + (h.level - 2) * 12}px` }}
                        className={cn(
                          "block py-0.5 pr-3 transition-colors",
                          activeId === h.id
                            ? "text-neutral-900 dark:text-neutral-100 font-medium"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Mobile Visualizer Overlay */}
      {showVisualizer && (
        <div className="flex lg:hidden fixed inset-0 z-50 bg-background flex-col select-none">
          <div className="h-12 border-b border-border flex items-center justify-between px-4 shrink-0 bg-muted/40">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-primary" />
              Interactive Simulator
            </span>
            <div className="flex items-center gap-2">
              {guide.visualizations && guide.visualizations.length > 1 && (
                <Select value={activeViz} onValueChange={setActiveViz}>
                  <SelectTrigger className="h-7 text-xs border border-border/40 bg-background text-foreground w-[150px] focus:ring-0">
                    <SelectValue placeholder="Select visualization" />
                  </SelectTrigger>
                  <SelectContent>
                    {guide.visualizations.map((vizId) => (
                      <SelectItem key={vizId} value={vizId} className="text-xs">
                        {vizId
                          .split("-")
                          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                          .join(" ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setShowVisualizer(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-auto no-scrollbar p-6 relative flex flex-col bg-background">
            <div className="flex-1 flex flex-col min-h-0 relative">
              {renderVisualization(activeViz)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
