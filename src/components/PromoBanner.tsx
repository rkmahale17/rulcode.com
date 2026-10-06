"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, ArrowRight } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

export const PromoBanner: React.FC = () => {
  const { hasPremiumAccess } = useApp();
  const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (localStorage.getItem('promo_banner_dismissed_july_2026') === 'true') {
      setIsVisible(false);
      return;
    }

    // End of July 2026 (July 31, 2026 23:59:59 local time)
    const targetDate = new Date('2026-07-31T23:59:59').getTime();

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
  }, []);

  if (!isVisible || !timeLeft || hasPremiumAccess) return null;

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
        <span className="font-semibold">Flash Sale</span>
        <span className="hidden md:inline">-</span>
        <span>10% off everything with code <span className="font-bold">FLASH10</span>.</span>
        
        <div className="flex items-center gap-1 ml-1 md:ml-2">
          <span className="text-muted-foreground mr-1">Ends in</span>
          {timeLeft.days > 0 && (
            <>
              <div className="bg-black text-white px-1.5 py-0.5 rounded text-xs font-bold tabular-nums min-w-[24px] text-center">
                {timeLeft.days.toString().padStart(2, '0')}
              </div>
              <span>:</span>
            </>
          )}
          <div className="bg-black text-white px-1.5 py-0.5 rounded text-xs font-bold tabular-nums min-w-[24px] text-center">
            {timeLeft.hours.toString().padStart(2, '0')}
          </div>
          <span>:</span>
          <div className="bg-black text-white px-1.5 py-0.5 rounded text-xs font-bold tabular-nums min-w-[24px] text-center">
            {timeLeft.minutes.toString().padStart(2, '0')}
          </div>
          <span>:</span>
          <div className="bg-black text-white px-1.5 py-0.5 rounded text-xs font-bold tabular-nums min-w-[24px] text-center">
            {timeLeft.seconds.toString().padStart(2, '0')}
          </div>
        </div>
        <ArrowRight className="w-4 h-4 ml-1" />
      </Link>
      
      <button 
        onClick={() => {
          setIsVisible(false);
          localStorage.setItem('promo_banner_dismissed_july_2026', 'true');
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-black/10 rounded-full transition-colors"
        aria-label="Close banner"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
