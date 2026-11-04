"use client";

// Global application context for state management and caching

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import type { User } from '@supabase/supabase-js';
import type { UserAlgorithmData } from '@/types/userAlgorithmData';
import type { Profile } from '@/types/profile';
import { getAllUserAlgorithmData } from '@/utils/userAlgorithmDataHelpers';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUser, setProfile, setAuthLoading } from '@/store/slices/authSlice';
import { setProgressData, updateProgressItem, removeProgressItem, fetchUserProgress, clearProgress } from '@/store/slices/userProgressSlice';
import { fetchAllAlgorithms } from '@/store/slices/algorithmsSlice';
import { awardXP } from '@/utils/xpHelpers';

interface Algorithm {
  id: string;
  slug?: string;
  name: string;
  category: string;
  difficulty: string;
  description: string;
  serial_no?: number;
  metadata?: any;
  [key: string]: any;
}

export type ProgressStatus = 'solved' | 'attempted' | 'none';

interface AppContextType {
  // Auth & Profile
  user: User | null;
  profile: Profile | null;
  isAuthLoading: boolean;
  hasPremiumAccess: boolean;

  // Algorithms
  isAlgorithmsLoading: boolean;

  // User Data
  userAlgorithmData: UserAlgorithmData[];
  isUserDataLoading: boolean;
  refreshUserData: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  activateTrial: () => Promise<void>;

  // List Context
  activeListType: string;
  setActiveListType: (type: string) => void;
  progressMap: Record<string, ProgressStatus>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const CACHE_KEY = 'rulcode_algorithms_v2_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface CacheData {
  algorithms: Algorithm[];
  timestamp: number;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const profile = useAppSelector(state => state.auth.profile);
  const isAuthLoading = useAppSelector(state => state.auth.isAuthLoading);
  const hasPremiumAccess = useAppSelector(state => state.auth.hasPremiumAccess);
  const userAlgorithmData = useAppSelector(state => state.userProgress.data);
  const isUserDataLoading = useAppSelector(state => state.userProgress.isLoading);
  const progressMap = useAppSelector(state => state.userProgress.progressMap);

  const queryClient = useQueryClient();

  // Track in-flight profile fetch to avoid redundant calls
  const profileFetchInProgress = React.useRef<string | null>(null);
  const lastFetchedUserId = useRef<string | null>(null);
  // Ref mirror of profile — avoids stale-closure in fetchProfile without
  // needing profile as a useCallback dependency (which would cause the auth
  // useEffect to re-run on every profile update).
  const profileRef = useRef(profile);
  useEffect(() => { profileRef.current = profile; }, [profile]);

  const isAlgorithmsLoading = useAppSelector(state => state.algorithms.isLoading);

  const [activeListType, setActiveListType] = useState<string>('all');

  const normalizeListType = (type: string): string => {
    const lower = type.toLowerCase();
    if (lower === 'blind') return 'blind75';
    if (lower === 'rulcode150') return 'blind150';
    if (lower === 'corealgo') return 'core';
    return type;
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rulcode_active_list_type');
      if (saved) {
        const normalized = normalizeListType(saved);
        setActiveListType(normalized);
        if (normalized !== saved) {
          localStorage.setItem('rulcode_active_list_type', normalized);
        }
      }
    }
  }, []);

  const updateActiveListType = (type: string) => {
    const normalized = normalizeListType(type);
    setActiveListType(normalized);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rulcode_active_list_type', normalized);
    }
  };

  const lastFetchedProfileId = useRef<string | null>(null);

  const fetchProfile = useCallback(async (userId: string, force: boolean = false) => {
    if (!userId) return;

    // Skip if already fetching or if already have this profile (unless forced)
    if (profileFetchInProgress.current === userId) return;
    if (!force && profileRef.current && profileRef.current.id === userId && lastFetchedProfileId.current === userId) {
      return;
    }

    try {
      profileFetchInProgress.current = userId;
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url, username, subscription_status, subscription_tier, subscription_duration, subscription_plan_id, trial_end_date, current_period_end, cancel_at_period_end, role, customer_portal_url')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      dispatch(setProfile(data as any as Profile));
      lastFetchedProfileId.current = userId;
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      profileFetchInProgress.current = null;
    }
  // profile intentionally omitted — we use profileRef to avoid stale closure
  // while preventing the auth useEffect from re-running on every profile update.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  // hasPremiumAccess and progressMap are now computed in Redux slices

  const activateTrial = async () => {
    if (!user || !profile) return;
    if (profile.trial_end_date) {
      // toast.error("You have already used your trial."); // Assuming toast is available
      console.error("You have already used your trial.");
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'trialing',
        trial_end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
      })
      .eq('id', user.id);

    if (error) {
      // toast.error("Failed to activate trial"); // Assuming toast is available
      console.error("Failed to activate trial", error);
    } else {
      // toast.success("Trial activated! Enjoy 10 days of Premium."); // Assuming toast is available
      console.log("Trial activated! Enjoy 10 days of Premium.");
      await fetchProfile(user.id, true); // Force refresh
    }
  };

  // Fetch algorithms from database - Logic moved to useAlgorithms hook
  const fetchAlgorithms = useCallback(async () => {
    dispatch(fetchAllAlgorithms());
  }, [dispatch]);

  // Fetch user algorithm data
  const fetchUserData = useCallback(async () => {
    if (!user) {
      if (lastFetchedUserId.current !== null) {
        dispatch(clearProgress());
        lastFetchedUserId.current = null;
      }
      return;
    }

    // Prevent duplicate fetches if same user
    if (lastFetchedUserId.current === user.id) {
      return;
    }

    try {
      lastFetchedUserId.current = user.id;
      // Dispatch async thunk instead of manual fetch
      dispatch(fetchUserProgress(user.id));
    } catch (error) {
      console.error('Error fetching user data:', error);
      lastFetchedUserId.current = null; // Allow retry on error
    }
  }, [user, dispatch]);

  // Initialize auth
  useEffect(() => {
    if (!supabase) {
      console.warn('Supabase not available, skipping authentication');
      dispatch(setAuthLoading(false));
      return;
    }

    let mounted = true;

    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) {
        const currentUser = session?.user ?? null;
        dispatch(setUser(currentUser));
        if (currentUser) {
          // Await profile fetch before marking auth as finished loading
          await fetchProfile(currentUser.id);
          awardXP(currentUser.id, 'daily_login').catch(console.error);
        }
        dispatch(setAuthLoading(false));
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      const currentUser = session?.user ?? null;
      dispatch(setUser(currentUser));

      // Clear all React Query caches on any auth change (Sign in, Sign out, etc)
      // to ensure no data from previous user remains in memory
      queryClient.clear();

      if (currentUser) {
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
          fetchProfile(currentUser.id);
        }
      } else {
        dispatch(setProfile(null));
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, dispatch]);

  // Fetch algorithms on mount
  useEffect(() => {
    fetchAlgorithms();
  }, [fetchAlgorithms]);

  // Fetch user data when user changes
  useEffect(() => {
    fetchUserData();
  }, [user, fetchUserData]);

  // Subscribe to user_algorithm_data changes
  useEffect(() => {
    if (!user || !supabase) return;

    const channel = supabase
      .channel('user_algorithm_data_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_algorithm_data',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          // Optimistically/Reactively update user data without a full re-fetch
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            dispatch(updateProgressItem(payload.new as UserAlgorithmData));
          } else if (payload.eventType === 'DELETE') {
            dispatch(removeProgressItem(payload.old.algorithm_id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const value: AppContextType = {
    user,
    profile,
    isAuthLoading,
    hasPremiumAccess,
    isAlgorithmsLoading,
    userAlgorithmData,
    isUserDataLoading,
    refreshUserData: fetchUserData,
    refreshProfile: useCallback(() => user ? fetchProfile(user.id, true) : Promise.resolve(), [user, fetchProfile]),
    activateTrial,
    activeListType,
    setActiveListType: updateActiveListType,
    progressMap,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
