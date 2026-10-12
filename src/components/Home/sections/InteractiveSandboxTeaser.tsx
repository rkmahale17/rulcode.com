"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePostHog } from "@posthog/react";
import { trackEvent } from "@/lib/analytics";
import { ArrowRight, Check, Eye, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const MaximumSubarrayVisualization = dynamic(
  () =>
    import(
      "@/components/visualizations/algorithms/MaximumSubarrayVisualization"
    ).then((m) => m.MaximumSubarrayVisualization),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[360px] flex items-center justify-center text-sm text-zinc-400 animate-pulse">
        Loading visualization...
      </div>
    ),
  }
);

export function InteractiveSandboxTeaser() {
  const posthog = usePostHog();

  const handleCtaClick = (label: string, destination: string, section: string) => {
    trackEvent(posthog, "home_cta_clicked", {
      cta_label: label,
      destination,
      section
    });
  };

  return (
    <section id="visualization" className="pt-16 lg:pt-20 pb-20 lg:pb-28 bg-[#FAFAFA] dark:bg-[#050505] text-zinc-900 dark:text-white relative overflow-hidden">
      {/* Background Glow Orb */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/3 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[1200px] mx-auto px-6 relative z-10"
      >

        {/* Section Header - Spans full width above both columns with inline icon aligned left */}
        <div className="mx-auto mb-14 text-left">
          <h3 className="text-2xl sm:text-3xl font-medium tracking-tight text-zinc-900 dark:text-white leading-[1.1] mb-4 flex items-center gap-3">
            <BarChart3 className="w-[0.85em] h-[0.85em] text-primary shrink-0" />
            <span>Learn by Visualization</span>
          </h3>
        </div>

        <div className="mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

          {/* Detailed Selling Copy - Theme Aware */}
          <div className="lg:col-span-5 order-2 lg:order-2">
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-8 text-zinc-900 dark:text-white leading-[1.1]">
              Visualize, Understand and Solve
            </h2>

            <p className="text-zinc-600 dark:text-zinc-400 text-base md:text-lg mb-10 leading-relaxed">
              Watch Kadane&apos;s algorithm slide over contiguous ranges in lockstep motion. Observe live as the running sum decides whether to grow or reset from scratch at each array index, while updating the record-breaking maximum sum in real-time.
            </p>

            <div className="space-y-4 mb-10">
              {[
                { title: "Local vs. Global Maxima", desc: "Observe currentSum resets to zero when running sums become negative, avoiding sub-optimal ranges." },
                { title: "Contiguous Window Trace", desc: "Watch the active subarray boundaries dynamically stretch as positive integers expand the sum." },
                { title: "State Console Tracking", desc: "Inspect running variables like curSum and bestMax change line-by-line as code runs." }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 text-zinc-700 dark:text-zinc-300">
                  <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-1">
                    <Check className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-base md:text-lg tracking-tight text-zinc-900 dark:text-white mb-1">{item.title}</h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button
              size="lg"
              className="rounded-lg py-6 text-base bg-zinc-950 dark:bg-white hover:bg-zinc-900 dark:hover:bg-zinc-100 text-white dark:text-black font-medium tracking-tight transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] shadow-xl flex items-center gap-2 group/btn w-full sm:w-fit px-8"
              asChild
            >
              <Link
                href="/problem/kadanes-algorithm?tab=visualizations"
                onClick={() => handleCtaClick("Try Visualize Kadanes", "/problem/kadanes-algorithm?tab=visualizations", "interactive_visualizer_showcase")}
              >
                Try the Visual Playground
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </Link>
            </Button>
          </div>

          {/* Interactive Visualizer Component from Platform */}
          <div className="lg:col-span-7 order-1 lg:order-1 w-full">
            <div className="relative group w-full">
              {/* Vibrant neon background aura */}
              <div className="absolute -inset-[1.5px] bg-gradient-to-r from-primary/30 to-[#EAFF96]/20 rounded-xl blur-xl opacity-20 dark:opacity-30 group-hover:opacity-60 transition duration-700"></div>

              <div className="relative bg-zinc-50 dark:bg-[#080808] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden p-6 sm:p-8">
                <MaximumSubarrayVisualization />
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </section>
  );
}
