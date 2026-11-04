"use client";

import { useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAlgorithms } from "@/hooks/useAlgorithms";
import { ListType } from "@/types/algorithm";
import { ProblemsList } from "@/components/listing/ProblemsList";
import { Button } from "@/components/ui/button";
import { Target, Brain, Layers, X } from "lucide-react";
import { normalizeCategory } from "@/constants/categories";
import { normalizeCompany, slugifyCompany } from "@/constants/companies";
import { CompanyIcon } from "@/components/CompanyIcon";
import { TOPIC_ICONS } from "@/components/ProblemFilterPopup";

import { useApp } from "@/contexts/AppContext";
import { useProblemOfTheDay } from "@/hooks/useProblemOfTheDay";
import { ProblemOfTheDay } from "@/components/listing/ProblemOfTheDay";

interface ProblemsClientProps {
  listType?: string;
  title?: string;
  description?: string;
  progressTitle?: string;
  icon?: any;
  problemType?: string;
}

const ProblemsClient = ({
  listType: manualListType,
  title: manualTitle,
  description: manualDescription,
  progressTitle: manualProgressTitle,
  icon: manualIcon,
  problemType = "dsa",
}: ProblemsClientProps = {}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { data, isLoading } = useAlgorithms();
  const { activeListType, setActiveListType, progressMap, profile } = useApp();

  const searchParams = useSearchParams();

  const searchMode = searchParams.get("mode") || "all";
  const listMode = manualListType || searchMode;
  const topicFilter = searchParams.get("topic");
  const rawCompanyFilter = searchParams.get("company");

  const normalizedTopic = useMemo(
    () => (topicFilter ? normalizeCategory(topicFilter) : null),
    [topicFilter],
  );

  const isUserAdmin = profile?.role === "admin";

  const allAlgorithms = useMemo(
    () =>
      (data?.algorithms ?? [])
        .filter((algo) => algo.problemType === problemType)
        .filter((algo) => algo.published !== false || isUserAdmin),
    [data, isUserAdmin, problemType],
  );

  const potd = useProblemOfTheDay(allAlgorithms);

  const companyFilter = useMemo(() => {
    if (!rawCompanyFilter) return null;
    return normalizeCompany(rawCompanyFilter);
  }, [rawCompanyFilter]);

  const coreAlgorithms = useMemo(
    () =>
      allAlgorithms.filter((algo) => {
        const types =
          algo.listTypes || (algo.list_type ? [algo.list_type] : ["core"]);
        return types.includes(ListType.Core);
      }),
    [allAlgorithms],
  );

  const blindAlgorithms = useMemo(
    () =>
      allAlgorithms.filter((algo) => {
        const types =
          algo.listTypes || (algo.list_type ? [algo.list_type] : ["core"]);
        return types.includes(ListType.Blind75);
      }),
    [allAlgorithms],
  );

  const blind150Algorithms = useMemo(
    () =>
      allAlgorithms.filter((algo) => {
        const types =
          algo.listTypes || (algo.list_type ? [algo.list_type] : ["core"]);
        return types.includes(ListType.Blind150) || types.includes(ListType.Blind75);
      }),
    [allAlgorithms],
  );

  const filteredAlgorithms = useMemo(() => {
    let result = allAlgorithms;
    if (listMode === "core") result = coreAlgorithms;
    else if (listMode === "blind" || listMode === ListType.Blind75) result = blindAlgorithms;
    else if (listMode === "blind150" || listMode === "rulcode150") result = blind150Algorithms;

    if (companyFilter) {
      result = result.filter((algo) => {
        const companies = algo.metadata?.companies || [];
        return companies.some(
          (c: string) => c.toLowerCase() === companyFilter.toLowerCase(),
        );
      });
    }

    return result;
  }, [
    listMode,
    coreAlgorithms,
    blindAlgorithms,
    blind150Algorithms,
    allAlgorithms,
    companyFilter,
  ]);

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) params.delete(key);
      else params.set(key, value);
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const getTitle = () => {
    if (manualTitle) return manualTitle;
    if (normalizedTopic) return `${normalizedTopic} Problems`;
    if (companyFilter) return `${companyFilter} Interview Questions`;
    if (listMode === "core") return "Core Patterns";
    if (listMode === "blind" || listMode === ListType.Blind75) return "Blind 75";
    if (listMode === "blind150" || listMode === "rulcode150") return "Rulcode 150";
    return "All Practice Questions";
  };

  const getDescription = () => {
    if (manualDescription) return manualDescription;
    if (normalizedTopic)
      return `Master ${normalizedTopic} through our curated list of high-impact problems. Each challenge is selected to build your intuition and problem-solving skills in this core category.`;
    if (companyFilter)
      return `Prepare for your ${companyFilter} interview with these frequency-based problems. Practice the patterns and algorithms commonly asked in their technical assessments.`;
    if (listMode === "core")
      return "Master the 20% of patterns that solve 80% of interview questions. Focus on high-impact techniques like Sliding Window, Two Pointers, and Backtracking to develop a deep, pattern-based intuition for problem-solving.";
    if (listMode === "blind" || listMode === ListType.Blind75)
      return "The definitive list of 75 essential problems designed to maximize your preparation in minimal time. Focus on the most frequent FAANG interview questions to ensure you're ready for the highest-level technical assessments.";
    if (listMode === "blind150" || listMode === "rulcode150")
      return "A comprehensive collection of 150 critical problems combining Blind 75 and additional core patterns, providing thorough coverage across all standard algorithm topics.";
    return "Explore our comprehensive collection of 200+ problems covering all major data structures and algorithms. Master everything from basic arrays to advanced dynamic programming through hands-on practice and step-by-step visualizations.";
  };

  const getProgressTitle = () => {
    if (manualProgressTitle) return manualProgressTitle;
    if (normalizedTopic) return `${normalizedTopic} Progress`;
    if (companyFilter) return `${companyFilter} Prep Progress`;
    if (listMode === "core") return "Pattern Progress";
    if (listMode === "blind" || listMode === ListType.Blind75) return "Blind 75 Progress";
    if (listMode === "blind150" || listMode === "rulcode150") return "Rulcode 150 Progress";
    return "Overall Progress";
  };

  const initialTopics = useMemo(
    () => (topicFilter ? [topicFilter] : []),
    [topicFilter],
  );
  const initialCompanies = useMemo(
    () => (companyFilter ? [companyFilter] : []),
    [companyFilter],
  );

  const resolvedIcon = useMemo(() => {
    if (manualIcon) return manualIcon;
    if (companyFilter) {
      return ({ className }: { className?: string }) => (
        <CompanyIcon
          company={slugifyCompany(companyFilter)}
          className={className}
          forceLoad={true}
        />
      );
    }
    if (normalizedTopic && TOPIC_ICONS[normalizedTopic]) {
      return TOPIC_ICONS[normalizedTopic];
    }
    return Layers;
  }, [manualIcon, companyFilter, normalizedTopic]);

  const normalizedListMode = listMode === "blind" ? ListType.Blind75 : listMode === "rulcode150" ? ListType.Blind150 : listMode;

  return (
    <ProblemsList
      algorithms={filteredAlgorithms}
      title={getTitle()}
      description={getDescription()}
      listType={normalizedListMode}
      progressTitle={getProgressTitle()}
      isLoading={isLoading}
      showRecommendation={normalizedListMode === "all" && !topicFilter && !companyFilter}
      icon={resolvedIcon}
      initialSelectedTopics={initialTopics}
      initialSelectedCompanies={initialCompanies}
      initialExpandAll={pathname === "/dsa/query"}
      potd={potd}
      headerSlot={
        !manualListType ? (
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <Button
              variant={normalizedListMode === "all" ? "default" : "outline"}
              onClick={() => updateParams({ mode: "all" })}
              className="rounded-xl h-10 font-medium transition-all"
            >
              All Questions
            </Button>
            <Button
              variant={normalizedListMode === "core" ? "default" : "outline"}
              onClick={() => updateParams({ mode: "core" })}
              className="rounded-xl h-10 font-medium transition-all w-fit px-5"
            >
              <Target className="w-4 h-4" />
              Core
            </Button>
            <Button
              variant={normalizedListMode === ListType.Blind75 ? "default" : "outline"}
              onClick={() => updateParams({ mode: ListType.Blind75 })}
              className="rounded-xl h-10 font-medium transition-all w-fit px-5"
            >
              <Brain className="w-4 h-4" />
              Blind 75
            </Button>

            {normalizedTopic && (
              <div className="flex items-center gap-2 bg-[#dfff5e]/10 border border-[#dfff5e]/30 text-zinc-900 dark:text-white rounded-xl px-4 py-1 text-sm font-semibold h-10 animate-in fade-in zoom-in-95 duration-200">
                <span className="opacity-70 uppercase text-[10px] tracking-wider font-bold">
                  Query:
                </span>
                <span className="font-bold">{normalizedTopic}</span>
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete("topic");
                    router.push(`${pathname}?${params.toString()}`);
                  }}
                  className="ml-2 p-1 rounded-full bg-zinc-200/50 dark:bg-zinc-800/50 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-all text-zinc-700 dark:text-zinc-300 hover:text-red-500 dark:hover:text-red-450 active:scale-90 flex items-center justify-center"
                  aria-label="Remove query"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        ) : undefined
      }
    />
  );
};

export default ProblemsClient;
