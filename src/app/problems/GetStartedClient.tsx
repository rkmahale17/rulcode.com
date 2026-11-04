'use client';

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAlgorithms } from "@/hooks/useAlgorithms";
import { ListType } from "@/types/algorithm";
import { Layers, Target, Brain, ChevronDown } from "lucide-react";
import { ProblemsList } from "@/components/listing/ProblemsList";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { normalizeCategory } from "@/constants/categories";
import { normalizeCompany } from "@/constants/companies";

import { useApp } from "@/contexts/AppContext";
import { useProblemOfTheDay } from '@/hooks/useProblemOfTheDay';
import { ProblemOfTheDay } from '@/components/listing/ProblemOfTheDay';

const GetStartedClient = () => {
  const { data, isLoading } = useAlgorithms();
  const { profile, progressMap } = useApp();
  const [activeTab, setActiveTab] = useState("all");
  const isMobile = useIsMobile();
  const searchParams = useSearchParams();

  const topicFilter = searchParams.get("topic");
  const rawCompanyFilter = searchParams.get("company");

  const initialTopics = useMemo(
    () => (topicFilter ? [topicFilter] : []),
    [topicFilter]
  );
  const initialCompanies = useMemo(
    () => (rawCompanyFilter ? [normalizeCompany(rawCompanyFilter)] : []),
    [rawCompanyFilter]
  );

  const isUserAdmin = profile?.role === 'admin';

  const allAlgorithms = useMemo(() => 
    (data?.algorithms ?? [])
      .filter(algo => algo.problemType === 'dsa')
      .filter(algo => algo.published !== false || isUserAdmin),
    [data, isUserAdmin]
  );
  
  const potd = useProblemOfTheDay(allAlgorithms);

  const coreAlgorithms = useMemo(() => 
    allAlgorithms.filter(algo => {
      const types = algo.listTypes || (algo.list_type ? [algo.list_type] : ['core']);
      return types.includes(ListType.Core);
    }),
    [allAlgorithms]
  );

  const blind75Algorithms = useMemo(() => 
    allAlgorithms.filter(algo => {
      const types = algo.listTypes || (algo.list_type ? [algo.list_type] : ['core']);
      return types.includes(ListType.Blind75);
    }),
    [allAlgorithms]
  );

  const rulcode150Algorithms = useMemo(() => 
    allAlgorithms.filter(algo => {
      const types = algo.listTypes || (algo.list_type ? [algo.list_type] : ['core']);
      return types.includes(ListType.Blind150) || types.includes(ListType.Blind75);
    }),
    [allAlgorithms]
  );

  const currentAlgorithms = useMemo(() => {
    if (activeTab === "core") return coreAlgorithms;
    if (activeTab === "blind75") return blind75Algorithms;
    if (activeTab === "blind150" || activeTab === "rulcode150") return rulcode150Algorithms;
    return allAlgorithms;
  }, [activeTab, allAlgorithms, coreAlgorithms, blind75Algorithms, rulcode150Algorithms]);

  const activeIcon = useMemo(() => {
    if (activeTab === "core") return Target;
    if (activeTab === "blind75") return Brain;
    if (activeTab === "blind150" || activeTab === "rulcode150") return Layers;
    return Layers;
  }, [activeTab]);

  const tabs = [
    { value: "all", label: "All Questions", icon: Layers },
    { value: ListType.Core, label: "Core Patterns", icon: Target },
    { value: ListType.Blind75, label: "Blind 75", icon: Brain },
    { value: ListType.Blind150, label: "Rulcode 150", icon: Layers },
  ];

  const activeTabLabel = tabs.find(t => t.value === activeTab)?.label || "Select Category";

  return (
    <ProblemsList
      algorithms={currentAlgorithms}
      title="All Practice"
      description="Explore our comprehensive library of coding problems. Whether you're mastering fundamental patterns or preparing for top-tier technical interviews, we've got you covered."
      listType={activeTab as any}
      isLoading={isLoading}
      showRecommendation={activeTab === "all" && initialTopics.length === 0 && initialCompanies.length === 0}
      initialCategoryWise={activeTab !== "all"}
      initialSelectedTopics={initialTopics}
      initialSelectedCompanies={initialCompanies}
      icon={activeIcon}
      potd={activeTab === "all" ? potd : undefined}
      stickyHeaderSlot={
        <div className="w-full">
          {isMobile ? (
            <div className="flex items-center gap-2 mb-2">
              <Select value={activeTab} onValueChange={setActiveTab}>
                <SelectTrigger className="w-full h-11 rounded-xl border-border/40 bg-background shadow-sm focus:ring-0">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                      {activeTab === "all" && <Layers className="w-3.5 h-3.5" />}
                      {activeTab === "core" && <Target className="w-3.5 h-3.5" />}
                      {activeTab === "blind75" && <Brain className="w-3.5 h-3.5" />}
                      {(activeTab === "blind150" || activeTab === "rulcode150") && <Layers className="w-3.5 h-3.5" />}
                    </div>
                    <span className="font-medium text-sm">{activeTabLabel}</span>
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/40 shadow-xl">
                  {tabs.map((tab) => (
                    <SelectItem key={tab.value} value={tab.value} className="py-3 focus:bg-primary/5 focus:text-primary">
                      <div className="flex items-center gap-3">
                        <tab.icon className="w-4 h-4 opacity-70" />
                        <span className="font-medium">{tab.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
              <TabsList className="h-12 bg-transparent p-0 flex justify-start gap-6 sm:gap-8 rounded-none border-b border-border/40">
                {tabs.map((tab) => (
                  <TabsTrigger 
                    key={tab.value}
                    value={tab.value} 
                    className={cn(
                      "relative h-12 rounded-none bg-transparent px-0 pb-3 pt-2 font-medium text-muted-foreground transition-all duration-200",
                      "border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none",
                      "hover:text-foreground/80"
                    )}
                  >
                    <div className="flex items-center gap-2">
                        <tab.icon className={cn("w-4 h-4 transition-colors", activeTab === tab.value ? "text-primary" : "text-muted-foreground/60")} />
                        <span className="text-sm sm:text-[15px]">{tab.label}</span>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}
        </div>
      }
    />
  );
};

export default GetStartedClient;
