// ── Above-the-fold sections (static imports for fast LCP) ───────────────────
import { HeroSection } from "@/components/Home/sections/HeroSection";
import { Metadata } from "next";
import Script from "next/script";
import dynamic from "next/dynamic";

import {
  InteractiveSandboxSkeleton,
  ScratchpadSkeleton,
  PracticeQuestionBankSkeleton,
  PlatformPreviewSkeleton,
  TestimonialsSkeleton,
  FeedbackSkeleton,
} from "@/components/Home/sections/HomeSectionSkeletons";

// ── Below-the-fold secondary sections (lazy loaded with individual skeletons to prioritize critical content FCP) ───
const DashboardWidgets = dynamic(() =>
  import("@/components/listing/DashboardWidgets").then((m) => ({
    default: m.DashboardWidgets,
  }))
);

const InteractiveSandboxTeaser = dynamic(
  () =>
    import("@/components/Home/sections/InteractiveSandboxTeaser").then((m) => ({
      default: m.InteractiveSandboxTeaser,
    })),
  {
    loading: () => <InteractiveSandboxSkeleton />,
  }
);

const ScratchpadSection = dynamic(
  () =>
    import("@/components/Home/sections/ScratchpadSection").then((m) => ({
      default: m.ScratchpadSection,
    })),
  {
    loading: () => <ScratchpadSkeleton />,
  }
);

const PracticeQuestionBankSection = dynamic(
  () =>
    import("@/components/Home/sections/PracticeQuestionBankSection").then((m) => ({
      default: m.PracticeQuestionBankSection,
    })),
  {
    loading: () => <PracticeQuestionBankSkeleton />,
  }
);

const HomeClient = dynamic(() => import("./HomeClient"), {
  loading: () => <PlatformPreviewSkeleton />,
});

const TestimonialsSection = dynamic(
  () =>
    import("@/components/Home/sections/TestimonialsSection").then((m) => ({
      default: m.TestimonialsSection,
    })),
  {
    loading: () => <TestimonialsSkeleton />,
  }
);

const FeedbackSection = dynamic(
  () =>
    import("@/components/Home/sections/FeedbackSection").then((m) => ({
      default: m.FeedbackSection,
    })),
  {
    loading: () => <FeedbackSkeleton />,
  }
);

import { BottomCTA } from "@/components/Home/sections/BottomCTA";
import { CommunitySection } from "@/components/Home/sections/CommunitySection";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Rulcode – Learn Data Structures & Algorithms with Interactive Visualizations",
  description:
    "Learn Data Structures & Algorithms with interactive visualizations, step-by-step explanations, hints, multiple programming languages, Blind 75, NeetCode 150, and coding interview preparation.",
  keywords: [
    "algorithms",
    "open source",
    "data structures",
    "competitive programming",
    "coding interviews",
    "algorithm visualization",
    "code snippets",
    "python",
    "java",
    "c++",
    "typescript",
    "Rulcode.com",
  ],
  openGraph: {
    title: "Rulcode – Learn Data Structures & Algorithms with Interactive Visualizations",
    description:
      "Learn Data Structures & Algorithms with interactive visualizations, step-by-step explanations, hints, multiple programming languages, Blind 75, NeetCode 150, and coding interview preparation.",
    type: "website",
    url: "https://rulcode.com/",
    images: ["https://rulcode.com/og-image.png"],
    siteName: "rulcode.com",
  },
  twitter: {
    card: "summary_large_image",
    site: "@rulcode_com",
    title: "Rulcode – Learn Data Structures & Algorithms with Interactive Visualizations",
    description:
      "Learn Data Structures & Algorithms with interactive visualizations, step-by-step explanations, hints, multiple programming languages, Blind 75, NeetCode 150, and coding interview preparation.",
    images: ["https://rulcode.com/og-image.png"],
  },
};

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://rulcode.com/#website",
        url: "https://rulcode.com",
        name: "Rulcode",
        description:
          "Interactive open-source algorithm library and visualization platform",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate:
              "https://rulcode.com/dsa/problems?q={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": "https://rulcode.com/#organization",
        name: "Rulcode",
        url: "https://rulcode.com",
        logo: {
          "@type": "ImageObject",
          url: "https://rulcode.com/android-chrome-512x512.png",
        },
        sameAs: ["https://github.com/rkmahale17/rulcode.com"],
      },
      {
        "@type": "SiteNavigationElement",
        "@id": "https://rulcode.com/#navigation",
        name: "Main Navigation",
        hasPart: [
          { "@type": "WebPage", name: "Core Patterns", url: "https://rulcode.com/dsa/core" },
          { "@type": "WebPage", name: "Blind 75", url: "https://rulcode.com/dsa/blind-75" },
          { "@type": "WebPage", name: "Rulcode 150", url: "https://rulcode.com/dsa/rulcode-150" },
          { "@type": "WebPage", name: "Visual Library", url: "https://rulcode.com/dsa/visual-library" },
          { "@type": "WebPage", name: "Guess the Pattern", url: "https://rulcode.com/dsa/pattern-guess" },
          { "@type": "WebPage", name: "SQL Questions", url: "https://rulcode.com/database/sql-basics" },
          { "@type": "WebPage", name: "Algorithm Guides", url: "https://rulcode.com/guides/fundamentals/core-data-structures" },
          { "@type": "WebPage", name: "Pattern Database", url: "https://rulcode.com/dsa/patterns" },
        ],
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://rulcode.com/#breadcrumb",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://rulcode.com/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Core Patterns",
            item: "https://rulcode.com/dsa/core",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Blind 75",
            item: "https://rulcode.com/dsa/blind-75",
          },
          {
            "@type": "ListItem",
            position: 4,
            name: "Rulcode 150",
            item: "https://rulcode.com/dsa/rulcode-150",
          },
          {
            "@type": "ListItem",
            position: 5,
            name: "Visual Library",
            item: "https://rulcode.com/dsa/visual-library",
          },
          {
            "@type": "ListItem",
            position: 6,
            name: "Algorithm Guides",
            item: "https://rulcode.com/guides/fundamentals/core-data-structures",
          },
          {
            "@type": "ListItem",
            position: 7,
            name: "SQL Questions",
            item: "https://rulcode.com/database/sql-basics",
          },
          {
            "@type": "ListItem",
            position: 8,
            name: "Pattern Database",
            item: "https://rulcode.com/dsa/patterns",
          },
        ],
      },
    ],
  };

  return (
    <>
      <Script
        id="json-ld-home"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-white dark:bg-black text-[#1A1A1A] dark:text-white overflow-x-hidden relative w-full">
        <HeroSection />
        <TestimonialsSection />
        <DashboardWidgets />

        <div id="visualize">
          <InteractiveSandboxTeaser />
        </div>
        <div id="thinkpad">
          <ScratchpadSection />
        </div>
        <PracticeQuestionBankSection />
        <div id="playground">
          <HomeClient type="platform-preview" />
        </div>
        <FeedbackSection />
        <CommunitySection />
        <BottomCTA />
        <FAQ />
        <Footer />
      </div>
    </>
  );
}
