import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function InteractiveSandboxSkeleton() {
  return (
    <section className="pt-16 lg:pt-20 pb-20 lg:pb-28 bg-[#FAFAFA] dark:bg-[#050505] text-zinc-900 dark:text-white relative overflow-hidden">
      <div className="w-full max-w-[1200px] mx-auto px-6 relative z-10">
        <div className="mb-14 text-left">
          <Skeleton className="h-8 w-60 rounded-lg mb-4" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-5 order-2 lg:order-2 space-y-6">
            <Skeleton className="h-10 w-3/4 rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
            <Skeleton className="h-12 w-48 rounded-lg" />
          </div>
          <div className="lg:col-span-7 order-1 lg:order-1 w-full">
            <Skeleton className="h-[420px] w-full rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function ScratchpadSkeleton() {
  return (
    <section className="py-24 lg:py-32 bg-white dark:bg-black text-zinc-900 dark:text-white relative overflow-hidden">
      <div className="w-full max-w-[1200px] mx-auto px-6 relative z-10">
        <div className="mb-12 text-left">
          <Skeleton className="h-8 w-64 rounded-lg mb-3" />
          <Skeleton className="h-5 w-96 rounded-md" />
        </div>
        <Skeleton className="h-[480px] w-full rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60" />
      </div>
    </section>
  );
}

export function PracticeQuestionBankSkeleton() {
  return (
    <section className="py-24 lg:py-32 bg-[#FAFAFA] dark:bg-[#050505] relative overflow-hidden">
      <div className="w-full max-w-[1200px] mx-auto px-6 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <Skeleton className="h-8 w-56 rounded-lg mb-2" />
            <Skeleton className="h-4 w-72 rounded-md" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24 rounded-full" />
            <Skeleton className="h-9 w-24 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-4"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-4 w-12 rounded" />
              </div>
              <Skeleton className="h-6 w-3/4 rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PlatformPreviewSkeleton() {
  return (
    <section className="py-36 lg:py-48 bg-white dark:bg-black relative overflow-hidden">
      <div className="w-full max-w-[1400px] mx-auto px-6 relative z-10">
        <div className="mb-14 text-left">
          <Skeleton className="h-8 w-64 rounded-lg mb-4" />
          <Skeleton className="h-4 w-80 rounded-md" />
        </div>
        <Skeleton className="h-[520px] w-full rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60" />
      </div>
    </section>
  );
}

export function TestimonialsSkeleton() {
  return (
    <section className="py-24 bg-zinc-50 dark:bg-zinc-950/50 relative overflow-hidden">
      <div className="w-full max-w-[1200px] mx-auto px-4 relative z-10">
        <div className="mb-16 text-center lg:text-left max-w-3xl">
          <Skeleton className="h-10 w-96 rounded-lg mb-4" />
          <Skeleton className="h-5 w-full max-w-md rounded-md" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-4"
            >
              <Skeleton className="h-16 w-full rounded" />
              <div className="flex items-center gap-3 pt-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-3 w-32 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeedbackSkeleton() {
  return (
    <section className="py-36 lg:py-48 bg-[#FAFAFA] dark:bg-[#050505]">
      <div className="w-full max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="space-y-6">
            <Skeleton className="h-10 w-4/5 rounded-lg" />
            <Skeleton className="h-16 w-full rounded" />
            <div className="space-y-3">
              <Skeleton className="h-8 w-3/4 rounded" />
              <Skeleton className="h-8 w-2/3 rounded" />
              <Skeleton className="h-8 w-4/5 rounded" />
            </div>
          </div>
          <Skeleton className="h-[380px] w-full rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60" />
        </div>
      </div>
    </section>
  );
}

export function CommunitySkeleton() {
  return (
    <section className="py-36 lg:py-48 bg-white dark:bg-black">
      <div className="w-full max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-32">
          <div className="space-y-4">
            <Skeleton className="h-9 w-64 rounded-lg" />
            <Skeleton className="h-16 w-full rounded" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="flex items-center justify-between py-4 border-b border-zinc-100 dark:border-zinc-900">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <Skeleton className="h-5 w-36 rounded" />
                </div>
                <Skeleton className="h-5 w-5 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function FAQSkeleton() {
  return (
    <section className="py-24 max-w-4xl mx-auto px-4">
      <div className="mb-10 text-center">
        <Skeleton className="h-9 w-48 rounded-lg mx-auto mb-3" />
        <Skeleton className="h-4 w-72 rounded mx-auto" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, idx) => (
          <Skeleton key={idx} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    </section>
  );
}

export function FooterSkeleton() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 py-16 bg-white dark:bg-black">
      <div className="w-full max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="space-y-3">
              <Skeleton className="h-5 w-24 rounded" />
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-4 w-24 rounded" />
            </div>
          ))}
        </div>
        <div className="pt-8 border-t border-zinc-100 dark:border-zinc-900 flex justify-between">
          <Skeleton className="h-4 w-40 rounded" />
          <Skeleton className="h-4 w-32 rounded" />
        </div>
      </div>
    </footer>
  );
}
