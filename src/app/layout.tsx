import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import React, { Suspense } from "react";
import Navbar from "@/components/Navbar";
import { Providers } from "./providers";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { FeedbackButton } from "@/components/FeedbackButton";
import Script from "next/script";
import PostHogPageView from "./PostHogPageView";
import AdminViewToggle from "@/admin/components/AdminViewToggle";
import { AnnouncementStack } from "@/components/AnnouncementStack";
import { GlobalPromoBanner } from "@/components/GlobalPromoBanner";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://rulcode.com'),
  title: "Rulcode: Master Algorithms Visually & Open Source",
  description: "Master 200+ algorithms visually with interactive animations, pro tips, and code snippets in Python, C++, Java, and TypeScript.",
  keywords: ["algorithms", "open source", "data structures", "competitive programming", "coding interviews", "algorithm visualization", "code snippets", "python", "java", "c++", "typescript", "Rulcode.com"],
  authors: [{ name: "Rulcode.com Team" }],
  robots: "index, follow",
  openGraph: {
    title: "Rulcode: Master Algorithms Visually & Open Source",
    description: "Master 200+ algorithms visually with interactive animations, pro tips, and code snippets in Python, C++, Java, and TypeScript.",
    type: "website",
    url: "https://rulcode.com/",
    images: ["https://rulcode.com/og-image.png"],
    siteName: "rulcode.com",
  },
  twitter: {
    card: "summary_large_image",
    site: "@rulcode_com",
    title: "Rulcode: Master Algorithms Visually & Open Source",
    description: "Master 200+ algorithms visually with interactive animations, pro tips, and code snippets in Python, C++, Java, and TypeScript.",
    images: ["https://rulcode.com/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${inter.className}`}>
        <Providers>
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>

          {/* Google Analytics 4 (Deferred) */}
          {process.env.NEXT_PUBLIC_GA_ID && (
            <Script
              strategy="lazyOnload"
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
          )}
          {process.env.NEXT_PUBLIC_GA_ID && (
            <Script id="google-analytics" strategy="lazyOnload">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          )}

          {/* Google tag (gtag.js) event - delayed navigation helper */}
          <Script id="google-ads-helper" strategy="lazyOnload">
            {`
              function gtagSendEvent(url) {
                var callback = function () {
                  if (typeof url === 'string') {
                    window.location = url;
                  }
                };
                gtag('event', 'conversion_event_page_view', {
                  'event_callback': callback,
                  'event_timeout': 2000,
                });
                return false;
              }
            `}
          </Script>

          <Suspense fallback={null}>
            <AppSidebar />
          </Suspense>
          <SidebarInset>
            <GlobalPromoBanner />
            <Navbar className="global-nav" />
            {children}
          </SidebarInset>
          <AdminViewToggle />
          <FeedbackButton />
          <AnnouncementStack />
        </Providers>
      </body>
    </html>
  );
}
