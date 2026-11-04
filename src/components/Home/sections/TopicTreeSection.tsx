"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { usePostHog } from "@posthog/react";
import { useAppSelector } from "@/store/hooks";
import { getGroupedByCategory, slugifyCategory } from "@/constants/categories";
import { trackEvent } from "@/lib/analytics";
import { Skeleton } from "@/components/ui/skeleton";
import type { TopicStat } from "./TopicTreeFlow";

const TopicTreeFlow = dynamic(() => import("./TopicTreeFlow"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[660px] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/20 p-6 flex flex-col items-center justify-between">
      <Skeleton className="h-16 w-48 rounded-xl" />
      <div className="flex gap-6 justify-center w-full">
        <Skeleton className="h-16 w-48 rounded-xl" />
        <Skeleton className="h-16 w-48 rounded-xl hidden sm:block" />
      </div>
      <div className="flex gap-6 justify-center w-full">
        <Skeleton className="h-16 w-48 rounded-xl" />
        <Skeleton className="h-16 w-48 rounded-xl hidden sm:block" />
        <Skeleton className="h-16 w-48 rounded-xl hidden md:block" />
      </div>
      <Skeleton className="h-16 w-48 rounded-xl" />
      <div className="flex gap-6 justify-center w-full">
        <Skeleton className="h-16 w-48 rounded-xl" />
        <Skeleton className="h-16 w-48 rounded-xl hidden sm:block" />
        <Skeleton className="h-16 w-48 rounded-xl hidden md:block" />
      </div>
    </div>
  ),
});

export function TopicTreeSection() {
  const router = useRouter();
  const posthog = usePostHog();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [shouldRenderFlow, setShouldRenderFlow] = useState(false);

  const { items: algorithms } = useAppSelector((state) => state.algorithms);
  const { progressMap } = useAppSelector((state) => state.userProgress);

  // Defer mounting of React Flow until the section is near the viewport
  // so initial FCP & LCP are completely unaffected.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setShouldRenderFlow(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldRenderFlow(true);
          observer.disconnect();
        }
      },
      { rootMargin: "250px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const statsMap = useMemo(() => {
    const map: Record<string, TopicStat> = {};
    if (!algorithms || algorithms.length === 0) return map;

    const dsaAlgorithms = algorithms.filter(
      (algo) => algo.problemType === "dsa" && algo.published !== false
    );

    const grouped = getGroupedByCategory(dsaAlgorithms);
    for (const [category, problems] of grouped) {
      const total = problems.length;
      let solved = 0;
      for (let i = 0; i < total; i++) {
        if (progressMap?.[problems[i].id] === "solved") {
          solved++;
        }
      }
      const percentage = total > 0 ? Math.round((solved / total) * 100) : 0;
      map[category] = {
        topic: category,
        solved,
        total,
        percentage,
      };
    }

    return map;
  }, [algorithms, progressMap]);

  const handleSelectTopic = useCallback(
    (topic: string) => {
      const slug = slugifyCategory(topic);
      trackEvent(posthog, "home_cta_clicked", {
        cta_label: `Topic Tree: ${topic}`,
        destination: `/dsa/query?topic=${slug}`,
        section: "home_topic_tree",
      });
      router.push(`/dsa/query?topic=${slug}`);
    },
    [posthog, router]
  );

  return (
    <section
      ref={containerRef}
      className="pt-4 pb-20 lg:pb-28 bg-white dark:bg-black text-zinc-900 dark:text-white relative overflow-hidden"
    >
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header matching Features style */}
        <div className="flex flex-col items-center mb-10 sm:mb-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-zinc-900 dark:text-white mb-2.5">
            Topic Roadmap
          </h2>
          <div className="w-12 h-1 bg-primary rounded-full mb-3.5" />
          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-xl">
            Follow the structured prerequisite flow of DSA topics and track your completion status across every pattern.
          </p>
        </div>

        {shouldRenderFlow ? (
          <TopicTreeFlow
            statsMap={statsMap}
            onSelectTopic={handleSelectTopic}
          />
        ) : (
          <div className="w-full h-[660px] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/20 p-6 flex flex-col items-center justify-between">
            <Skeleton className="h-16 w-48 rounded-xl" />
            <div className="flex gap-6 justify-center w-full">
              <Skeleton className="h-16 w-48 rounded-xl" />
              <Skeleton className="h-16 w-48 rounded-xl hidden sm:block" />
            </div>
            <div className="flex gap-6 justify-center w-full">
              <Skeleton className="h-16 w-48 rounded-xl" />
              <Skeleton className="h-16 w-48 rounded-xl hidden sm:block" />
              <Skeleton className="h-16 w-48 rounded-xl hidden md:block" />
            </div>
            <Skeleton className="h-16 w-48 rounded-xl" />
            <div className="flex gap-6 justify-center w-full">
              <Skeleton className="h-16 w-48 rounded-xl" />
              <Skeleton className="h-16 w-48 rounded-xl hidden sm:block" />
              <Skeleton className="h-16 w-48 rounded-xl hidden md:block" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
