"use client";

import { ArrowRight } from "lucide-react";
import React, { useMemo } from "react";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { useApp } from "@/contexts/AppContext";
import { useAppSelector } from "@/store/hooks";
import { usePostHog } from "@posthog/react";

const PLATFORM_FEATURES = [
  {
    title: "Visualizer",
    description: "Interactive Tree, Graph, and Table data explorers",
    href: "/dsa/visual-library",
  },
  {
    title: "Roadmap",
    description: "Structured learning milestones guiding your journey from basics to advanced interview topics.",
    href: "/dsa/roadmap",
  },
  {
    title: "System Design",
    description: "Architectural fundamentals covering scaling, caching, databases, and distributed systems.",
    href: "/guides/system-design/introduction-to-system-design",
  },
  {
    title: "Frontend",
    description: "JavaScript, TypeScript polyfills, DOM challenges, and frontend interview essentials.",
    href: "/frontend/blind75",
  },
  {
    title: "Database (SQL)",
    description: "Interactive SQL queries, schema design, and real-world database problem sets.",
    href: "/database/sql-basics",
  },
  {
    title: "DSA Fundamentals",
    description: "In-depth visual guides and cheat sheets covering Big-O complexity and data structures.",
    href: "/guides/time-complexity",
  },
];

export function HeroSection() {
  const posthog = usePostHog();
  const { user, hasPremiumAccess } = useApp();
  const { items: algorithms } = useAppSelector((state) => state.algorithms);
  const { data: userProgressData } = useAppSelector(
    (state) => state.userProgress,
  );

  const continueLearningAlgo = useMemo(() => {
    if (!userProgressData || userProgressData.length === 0) return null;
    const sorted = [...userProgressData].sort((a, b) => {
      const timeA = new Date(a.last_viewed_at || a.updated_at).getTime();
      const timeB = new Date(b.last_viewed_at || b.updated_at).getTime();
      return timeB - timeA;
    });
    const incomplete = sorted.find((p) => !p.completed);
    const target = incomplete || sorted[0];
    if (!target) return null;
    return algorithms.find((a) => a.id === target.algorithm_id) || null;
  }, [userProgressData, algorithms]);

  const continueBlock =
    user && continueLearningAlgo ? (
      <Link
        href={
          continueLearningAlgo.slug
            ? `/problem/${continueLearningAlgo.slug}`
            : `/problem/${continueLearningAlgo.id}`
        }
        onClick={() =>
          trackEvent(posthog, "home_cta_clicked", {
            cta_label: "Continue Learning Box",
            destination: continueLearningAlgo.slug || continueLearningAlgo.id,
            section: "hero",
          })
        }
        className="flex items-center gap-4 px-5 py-3 rounded-xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 hover:border-primary/40 transition-all hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)] group max-w-[280px]"
      >
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-primary tracking-wider mb-0.5">
            Continue
          </p>
          <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
            {continueLearningAlgo.title || continueLearningAlgo.name}
          </p>
        </div>
        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all shrink-0">
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </Link>
    ) : null;

  return (
    <div className="relative pt-14 pb-20 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-32 overflow-hidden max-w-[1400px] mx-auto">
      <div className="w-full mx-auto px-4 relative z-10 flex flex-col items-center text-center">
        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight mb-6 leading-[1.2] text-zinc-900 dark:text-white max-w-4xl mx-auto">
          Visualize, Understand, Code & Master
          <span className="block mt-1.5 sm:mt-2">your technical interviews.</span>
        </h1>

        {/* Clear Subheadline covering all content tracks */}
        <p className="text-base sm:text-lg md:text-xl text-zinc-600 dark:text-zinc-400 mb-10 sm:mb-12 max-w-3xl mx-auto leading-relaxed font-normal">
          The all-in-one interactive platform for modern technical interviews. From Data Structures &amp; Algorithms and Frontend to System Design and SQL — master every domain with step-by-step visual animations, an intuitive scratchpad, and hands-on code execution.
        </p>

        {/* Company trust block */}
        <div className="mb-10 sm:mb-12 max-w-xl mx-auto">
          <Link href="#testimonials" className="group block">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-4 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors">
              Join engineers from{" "}
              <strong className="text-zinc-700 dark:text-zinc-300">
                Google
              </strong>
              ,{" "}
              <strong className="text-zinc-700 dark:text-zinc-300">
                Meta
              </strong>
              ,{" "}
              <strong className="text-zinc-700 dark:text-zinc-300">
                OpenAI
              </strong>
              , and top tech companies cracking their coding interviews.
            </p>
            <div className="flex items-center justify-center gap-3.5 sm:gap-4">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 shadow-sm flex items-center justify-center transition-all duration-300 group-hover:shadow-md group-hover:border-zinc-300 dark:group-hover:border-white/20 group-hover:-translate-y-0.5">
                <img
                  src="/icons/companies/google.svg"
                  alt="Google"
                  width="16"
                  height="16"
                  loading="eager"
                  decoding="async"
                  className="w-4 h-4 object-contain dark:invert opacity-90 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 shadow-sm flex items-center justify-center transition-all duration-300 group-hover:shadow-md group-hover:border-zinc-300 dark:group-hover:border-white/20 group-hover:-translate-y-0.5 delay-[50ms]">
                <img
                  src="/icons/companies/meta.svg"
                  alt="Meta"
                  width="16"
                  height="16"
                  loading="eager"
                  decoding="async"
                  className="w-4 h-4 object-contain dark:invert opacity-90 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 shadow-sm flex items-center justify-center transition-all duration-300 group-hover:shadow-md group-hover:border-zinc-300 dark:group-hover:border-white/20 group-hover:-translate-y-0.5 delay-[100ms]">
                <img
                  src="/icons/companies/amazon.svg"
                  alt="Amazon"
                  width="16"
                  height="16"
                  loading="eager"
                  decoding="async"
                  className="w-4 h-4 object-contain dark:invert opacity-90 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 shadow-sm flex items-center justify-center transition-all duration-300 group-hover:shadow-md group-hover:border-zinc-300 dark:group-hover:border-white/20 group-hover:-translate-y-0.5 delay-[150ms]">
                <img
                  src="/icons/companies/netflix.svg"
                  alt="Netflix"
                  width="16"
                  height="16"
                  loading="eager"
                  decoding="async"
                  className="w-4 h-4 object-contain dark:invert opacity-90 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 shadow-sm flex items-center justify-center transition-all duration-300 group-hover:shadow-md group-hover:border-zinc-300 dark:group-hover:border-white/20 group-hover:-translate-y-0.5 delay-[200ms]">
                <img
                  src="/icons/companies/microsoft.svg"
                  alt="Microsoft"
                  width="16"
                  height="16"
                  loading="eager"
                  decoding="async"
                  className="w-4 h-4 object-contain dark:invert opacity-90 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
          </Link>
        </div>

        {/* Action Button Row */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {/* Direct Entry Point: Solve a problem now */}
          <Button
            size="lg"
            className="rounded-full px-8 py-6 text-base font-semibold bg-primary hover:bg-primary/90 text-black shadow-[0_0_30px_hsl(var(--primary)/0.35)] transition-all hover:scale-105 active:scale-95"
            asChild
          >
            <Link
              href="/problems"
              onClick={() =>
                trackEvent(posthog, "home_cta_clicked", {
                  cta_label: "Solve a problem now",
                  destination: "/problems",
                  section: "hero",
                })
              }
            >
              Solve a problem now <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>

          {/* Go Pro Button (Preserved logic) */}
          {!hasPremiumAccess && (
            <Button
              size="lg"
              className="rounded-full px-7 py-6 text-base font-semibold bg-transparent border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-all hover:scale-105 active:scale-95 shadow-none"
              asChild
            >
              <Link
                href="/pricing"
                onClick={() =>
                  trackEvent(posthog, "home_cta_clicked", {
                    cta_label: "Go Pro",
                    destination: "/pricing",
                    section: "hero",
                  })
                }
              >
                Go Pro
              </Link>
            </Button>
          )}
        </div>

        {/* Continue Learning Block (Preserved logic) */}
        {continueBlock && (
          <div className="mt-6 flex justify-center animate-in fade-in duration-300">
            {continueBlock}
          </div>
        )}

        {/* Features section — routes to respective feature pages */}
        <div className="mt-20 sm:mt-24 lg:mt-28 w-full max-w-5xl">
          <div className="flex flex-col items-center mb-12 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-zinc-900 dark:text-white mb-2.5">
              Features
            </h2>
            <div className="w-12 h-1 bg-primary rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {PLATFORM_FEATURES.map((feature) => (
              <Link
                key={feature.title}
                href={feature.href}
                onClick={() =>
                  trackEvent(posthog, "home_cta_clicked", {
                    cta_label: feature.title,
                    destination: feature.href,
                    section: "hero_features",
                  })
                }
                className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 flex items-end justify-between gap-4 group"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
                    {feature.description}
                  </p>
                </div>
                <div className="shrink-0 pb-0.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
