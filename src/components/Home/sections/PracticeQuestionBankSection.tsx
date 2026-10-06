"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { usePostHog } from "@posthog/react";
import { trackEvent } from "@/lib/analytics";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { useAlgorithms } from "@/hooks/useAlgorithms";
import { useApp } from "@/contexts/AppContext";
import { slugifyCategory } from "@/constants/categories";
import { slugifyCompany } from "@/constants/companies";
import { CompanyIcon } from "@/components/CompanyIcon";
import { PremiumProblemCard } from "@/components/listing/PremiumProblemCard";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const TOPIC_NODES = [
  "Arrays & Hashing",
  "Two Pointers",
  "Sliding Window",
  "Stack",
  "Binary Search",
  "Linked List",
  "Trees",
  "Tries",
  "Backtracking",
  "Heap / Priority Queue",
  "Graphs",
  "Dynamic Programming",
  "Greedy",
  "Intervals",
  "Math & Geometry",
  "Bit Manipulation",
  "Advanced Algorithms",
  "Design Pattern"
];

const TOP_TRACK_COMPANIES = [
  "Google",
  "Meta",
  "Amazon",
  "Microsoft",
  "Netflix",
  "Apple",
  "Uber",
  "Spotify"
];

export function PracticeQuestionBankSection() {
  const posthog = usePostHog();
  const router = useRouter();
  const { data } = useAlgorithms();
  const { progressMap } = useApp();

  const [activeTab, setActiveTab] = useState<"topics" | "companies">("topics");
  const [activeItem, setActiveItem] = useState<string>(TOPIC_NODES[0]);

  const handleTabChange = (tab: "topics" | "companies") => {
    setActiveTab(tab);
    setActiveItem(tab === "topics" ? TOPIC_NODES[0] : TOP_TRACK_COMPANIES[0]);
  };

  const filteredAlgorithms = useMemo(() => {
    if (!data?.algorithms) return [];
    
    let result = data.algorithms;

    if (activeTab === "topics") {
      result = result.filter(algo => {
        if (!algo.category) return false;
        const rawCats = algo.category.split(',').map((c: string) => c.trim().toLowerCase());
        return rawCats.some((c: string) => c === activeItem.toLowerCase() || activeItem.toLowerCase().includes(c));
      });
    } else if (activeTab === "companies") {
      result = result.filter(algo => {
        const companies = algo.metadata?.companies;
        if (!Array.isArray(companies)) return false;
        return companies.some((c: string) => c.toLowerCase() === activeItem.toLowerCase());
      });
    }

    if (activeTab === "companies") {
      return result.slice(0, 1);
    }
    return result.slice(0, 4); // show max 4 for topics
  }, [data, activeTab, activeItem]);

  const [isMounted, setIsMounted] = useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalQuestions = isMounted ? (data?.algorithms?.length || 200) : 200;

  return (
    <section className="py-20 lg:py-28 bg-white dark:bg-[#111111] text-zinc-900 dark:text-white relative overflow-hidden">
      <div className="w-full max-w-[1200px] mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="max-w-4xl text-left mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight mb-4 leading-tight text-zinc-900 dark:text-white">
            A practice question bank with everything you'd ever need
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-base md:text-lg max-w-3xl leading-relaxed">
            Master data structures and algorithms across critical topics and top tech companies. Every question is paired with step-by-step interactive visualizations, hints, and optimized solutions to help you ace your interviews.
          </p>
        </div>

        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleTabChange("topics")}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 border",
                activeTab === "topics" 
                  ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-black dark:border-white" 
                  : "bg-transparent text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-500"
              )}
            >
              Topics
            </button>
            <button
              onClick={() => handleTabChange("companies")}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 border",
                activeTab === "companies" 
                  ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-black dark:border-white" 
                  : "bg-transparent text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-500"
              )}
            >
              Companies
            </button>
          </div>

          <div className="flex items-center gap-6 text-zinc-600 dark:text-zinc-400 text-sm">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>{totalQuestions}+ questions</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Lifetime access</span>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Sidebar (Topics/Companies) */}
          <div className="lg:w-[280px] shrink-0 border-l border-zinc-200 dark:border-zinc-800 flex flex-col gap-1 relative overflow-y-auto max-h-[500px] scrollbar-thin">
            {(activeTab === "topics" ? TOPIC_NODES : TOP_TRACK_COMPANIES).map((item, idx) => {
              const isActive = activeItem === item;
              return (
                <button
                  key={item}
                  onClick={() => setActiveItem(item)}
                  className={cn(
                    "relative text-left px-5 py-2.5 text-sm transition-all duration-200 flex items-center gap-2.5",
                    isActive ? "text-zinc-900 dark:text-white font-semibold" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-[-1px] top-0 bottom-0 w-[2px] bg-zinc-900 dark:bg-white"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  {activeTab === "companies" && (
                    <CompanyIcon company={slugifyCompany(item)} className="w-4 h-4 opacity-70 grayscale" forceLoad />
                  )}
                  {item}
                </button>
              );
            })}
          </div>

          {/* Right Content Area (Problems List) */}
          <div className="flex-1 min-w-0 bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-1 relative overflow-hidden">
            <div className="flex flex-col">
              <AnimatePresence mode="popLayout">
                {filteredAlgorithms.map((algo, index) => (
                  <motion.div
                    key={algo.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="relative"
                  >
                    <PremiumProblemCard
                      algorithm={algo}
                      status={progressMap?.[algo.id]}
                      isPremium={algo.is_premium}
                      index={index}
                      isFirst={index === 0}
                      isLast={index === filteredAlgorithms.length - 1 && activeTab === "topics"}
                      onClick={() => {
                        trackEvent(posthog, "question_bank_click", {
                          algorithm: algo.slug || algo.id,
                          section: activeTab,
                        });
                        router.push(`/problem/${algo.slug || algo.id}`);
                      }}
                      noBorder={true}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Dummy Blurred Items for Companies Tab */}
              {activeTab === "companies" && filteredAlgorithms.length > 0 && (
                <>
                  {[1, 2].map((i) => (
                    <div key={`dummy-${i}`} className="relative blur-[4px] opacity-40 pointer-events-none select-none border-t border-zinc-200 dark:border-zinc-800/50 p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800/50"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-1/3 bg-zinc-300 dark:bg-zinc-800 rounded"></div>
                          <div className="h-3 w-1/4 bg-zinc-200 dark:bg-zinc-800/50 rounded"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {filteredAlgorithms.length === 0 && (
                <div className="py-12 text-center text-zinc-500">
                  More questions coming soon for this {activeTab === "topics" ? "topic" : "company"}.
                </div>
              )}
            </div>

            {/* Bottom Blurred Overlay */}
            {filteredAlgorithms.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-zinc-50 dark:from-[#161616] via-zinc-50/90 dark:via-[#161616]/90 to-transparent pointer-events-none flex items-end justify-center pb-6 z-[20]">
                <Link
                  href={`/dsa/query?${activeTab === "topics" ? 'topic' : 'company'}=${activeTab === "topics" ? slugifyCategory(activeItem) : slugifyCompany(activeItem)}`}
                  className="pointer-events-auto flex items-center gap-2 px-6 py-2.5 rounded-full bg-white dark:bg-[#222222] hover:bg-zinc-50 dark:hover:bg-[#333333] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm font-medium transition-all duration-200 shadow-md dark:shadow-xl"
                >
                  See all questions <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
