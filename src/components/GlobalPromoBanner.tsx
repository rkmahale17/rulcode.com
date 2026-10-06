"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { X, ArrowRight, Copy, Check } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";

export type BannerAnnouncement = {
  id: string;
  title: string;
  body: string;
  is_active: boolean;
  type?: string;
};

const CopyButton = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 font-bold bg-black text-[#eaf761] px-1.5 py-0.5 rounded mx-1 tracking-wider hover:bg-black/80 transition-colors"
    >
      {code}
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
    </button>
  );
};

const CountdownTimer = ({ targetDateStr }: { targetDateStr: string }) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const targetDate = new Date(targetDateStr).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetDateStr]);

  if (!timeLeft) return null;

  return (
    <span className="inline-flex items-center gap-1 mx-1 translate-y-[1px]">
      {timeLeft.days > 0 && (
        <>
          <span className="bg-black text-white px-1.5 py-0.5 rounded text-xs font-bold tabular-nums min-w-[24px] text-center inline-block">
            {timeLeft.days.toString().padStart(2, "0")}
          </span>
          <span className="font-bold">:</span>
        </>
      )}
      <span className="bg-black text-white px-1.5 py-0.5 rounded text-xs font-bold tabular-nums min-w-[24px] text-center inline-block">
        {timeLeft.hours.toString().padStart(2, "0")}
      </span>
      <span className="font-bold">:</span>
      <span className="bg-black text-white px-1.5 py-0.5 rounded text-xs font-bold tabular-nums min-w-[24px] text-center inline-block">
        {timeLeft.minutes.toString().padStart(2, "0")}
      </span>
      <span className="font-bold">:</span>
      <span className="bg-black text-white px-1.5 py-0.5 rounded text-xs font-bold tabular-nums min-w-[24px] text-center inline-block">
        {timeLeft.seconds.toString().padStart(2, "0")}
      </span>
    </span>
  );
};

export const GlobalPromoBanner: React.FC<{ announcement?: BannerAnnouncement }> = ({ announcement }) => {
  const { hasPremiumAccess } = useApp();
  const [activeBanner, setActiveBanner] = useState<BannerAnnouncement | null>(announcement || null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // If an announcement is provided via props, we don't fetch or listen to changes (preview mode)
    if (announcement) {
      setActiveBanner(announcement);
      setIsVisible(true);
      return;
    }

    const fetchBanner = async () => {
      // Fetch announcements where type is 'header', or fallback to none if column doesn't exist
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching announcements:", error);
        return;
      }

      if (data) {
        // Find the first header banner
        const banner = data.find((ann) => ann.type === "header");
        if (banner) {
          // Check if this specific banner was dismissed
          if (localStorage.getItem(`promo_banner_dismissed_${banner.id}`) === "true") {
            setIsVisible(false);
          } else {
            setActiveBanner(banner);
            setIsVisible(true);
          }
        }
      }
    };

    fetchBanner();

    const channel = supabase
      .channel("schema-db-changes-banner")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "announcements",
        },
        () => {
          fetchBanner();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [announcement]);

  if (!isVisible || !activeBanner || hasPremiumAccess) return null;

  const renderBody = () => {
    let hasCopyCode = false;
    let discountCode = "";
    let hasTimer = false;
    let endDate = "";

    if (activeBanner.image_url && activeBanner.image_url.startsWith("{")) {
      try {
        const meta = JSON.parse(activeBanner.image_url);
        hasCopyCode = meta.hasCopyCode || false;
        discountCode = meta.discountCode || "";
        hasTimer = meta.hasTimer || false;
        endDate = meta.endDate || "";
      } catch (e) {}
    }

    return (
      <div className="flex items-center flex-wrap justify-center">
        <span dangerouslySetInnerHTML={{ __html: activeBanner.body }} />
        {hasCopyCode && discountCode && (
          <CopyButton code={discountCode} />
        )}
        {hasTimer && endDate && (
          <CountdownTimer targetDateStr={endDate} />
        )}
      </div>
    );
  };

  return (
    <div className="bg-[#eaf761] text-black px-4 py-2 flex items-center justify-center relative w-full text-sm font-medium z-50">
      <Link
        href="/pricing"
        className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2 hover:opacity-80 transition-opacity"
        onClick={(e) => {
          if (typeof window !== 'undefined' && (window as any).gtagSendEvent) {
            e.preventDefault();
            (window as any).gtagSendEvent('/pricing');
          }
        }}
      >
        <span
          className="font-semibold whitespace-nowrap"
          dangerouslySetInnerHTML={{ __html: activeBanner.title }}
        />
        <span className="hidden md:inline">-</span>
        {renderBody()}

        <ArrowRight className="w-4 h-4 ml-1 shrink-0" />
      </Link>

      <button
        onClick={() => {
          setIsVisible(false);
          localStorage.setItem(`promo_banner_dismissed_${activeBanner.id}`, "true");
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-black/10 rounded-full transition-colors"
        aria-label="Close banner"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
