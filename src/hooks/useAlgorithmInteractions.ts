import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { updateProgress, updateSocial, updateCode, updateVisualizationProgress, updateDrawingProgress, updateSolutionProgress, updateTimeTracking } from '@/utils/userAlgorithmDataHelpers';
import { useFeatureFlag } from '@/contexts/FeatureFlagContext';
import confetti from 'canvas-confetti';
import { usePostHog } from '@posthog/react';
import { trackEvent } from '@/lib/analytics';
import { useApp } from '@/contexts/AppContext';
import { useLanguagePreference } from './useLanguagePreference';
import { Language } from '@/types/algorithm';
import { getProblemUrl } from '@/utils/url';

interface UseAlgorithmInteractionsProps {
    user: any;
    algorithmId: string | undefined;
    algorithm: any;
    userAlgoData: any;
    refetchUserData: () => void;
    filteredAlgorithms?: any[];
}

export const useAlgorithmInteractions = ({
    user,
    algorithmId,
    algorithm,
    userAlgoData,
    refetchUserData,
    filteredAlgorithms
}: UseAlgorithmInteractionsProps) => {
    const router = useRouter();
    const posthog = usePostHog();
    const { hasPremiumAccess, profile } = useApp();
    const [isCompleted, setIsCompleted] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [likes, setLikes] = useState(0);
    const [dislikes, setDislikes] = useState(0);
    const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(null);
    const [isVisualizationCompleted, setIsVisualizationCompleted] = useState(false);
    const [isDrawingCompleted, setIsDrawingCompleted] = useState(false);
    const [isSolutionCompleted, setIsSolutionCompleted] = useState(false);

    // Code Management
    const [savedCode, setSavedCode] = useState<string>("");
    const { preferredLanguage, setPreferredLanguage } = useLanguagePreference('editor');
    const isSqlProblem = algorithm?.problemType === 'sql' || algorithm?.problem_type === 'sql' || algorithm?.problem_type === 'SQL' || algorithm?.problemType === 'SQL';
    const isFrontendProblem = algorithm?.problemType === 'frontend' || algorithm?.problem_type === 'frontend';
    const selectedLanguage = isSqlProblem ? 'sql' : isFrontendProblem ? 'typescript' : preferredLanguage;
    const [codeCache, setCodeCache] = useState<Record<string, string>>({});
    const [isUserModified, setIsUserModified] = useState(false);
    const latestCodeRef = useRef(savedCode);
    const currentLanguageRef = useRef(selectedLanguage);

    // Update ref whenever savedCode changes
    useEffect(() => {
        latestCodeRef.current = savedCode;
    }, [savedCode]);

    const isNaughtyCloud = useFeatureFlag("naugty_cloud");

    // Track problem_opened once per algorithm
    const trackedAlgoRef = useRef<string | undefined>(undefined);
    useEffect(() => {
        if (!algorithmId || trackedAlgoRef.current === algorithmId) return;
        trackedAlgoRef.current = algorithmId;
        const isPremiumProblem = algorithm?.is_premium || algorithm?.is_pro || (algorithm?.metadata as any)?.is_pro;
        trackEvent(posthog, 'problem_opened', {
            algorithm_id: algorithmId,
            algorithm_title: algorithm?.title || algorithm?.name,
            difficulty: algorithm?.difficulty,
            category: algorithm?.category,
            is_premium: !!isPremiumProblem,
            list_type: algorithm?.listType,
            user_plan: profile?.subscription_tier ?? 'free',
        });

        // Also update last_viewed_at in DB asynchronously in the background
        if (user?.id && algorithmId) {
            updateTimeTracking(user.id, algorithmId, {
                last_viewed_at: new Date().toISOString()
            }).catch(err => {
                console.error("Error updating last_viewed_at in background:", err);
            });
        }
    }, [algorithmId, algorithm, posthog, profile, user]);

    const lastSyncedCodeRef = useRef<string>("");
    const hasInitializedCodeRef = useRef<Record<string, boolean>>({});

    // Sync state with userAlgoData
    useEffect(() => {
        if (userAlgoData) {
            setIsCompleted(userAlgoData.completed || false);
            setIsFavorite(userAlgoData.is_favorite || false);
            setUserVote(userAlgoData.user_vote || null);
            setIsVisualizationCompleted(userAlgoData.visualization_completed || false);
            setIsDrawingCompleted(userAlgoData.drawing_completed || false);
            setIsSolutionCompleted(userAlgoData.solution_completed || false);

            if (userAlgoData.code && typeof userAlgoData.code === 'object') {
                const cache = userAlgoData.code as Record<string, string>;
                const remoteCode = cache[selectedLanguage] || '';

                setCodeCache(cache);

                // LOAD-ONCE STRATEGY:
                // Only load code from DB if we haven't initialized it yet for this language
                // or if the current savedCode is empty and remote has some content
                const isLanguageInitialized = hasInitializedCodeRef.current[selectedLanguage];

                if (!isLanguageInitialized || (savedCode === "" && remoteCode !== "")) {
                    setSavedCode(remoteCode);
                    lastSyncedCodeRef.current = remoteCode;
                    hasInitializedCodeRef.current[selectedLanguage] = true;
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userAlgoData, selectedLanguage]);

    // Handle language switch or algorithm change
    useEffect(() => {
        currentLanguageRef.current = selectedLanguage;
        // Reset modification flag when switching languages to allow fresh load from cache/DB
        setIsUserModified(false);

        const codeForLanguage = codeCache[selectedLanguage] || '';
        setSavedCode(codeForLanguage);

        // Mark as initialized if we have code from cache
        if (codeForLanguage) {
            hasInitializedCodeRef.current[selectedLanguage] = true;
        }
    }, [selectedLanguage]); // Keeping this simple for language switch

    // Reset local state when algorithmId changes
    useEffect(() => {
        setSavedCode("");
        setCodeCache({});
        setIsUserModified(false);
        hasInitializedCodeRef.current = {}; // Reset initialization tracking
    }, [algorithmId]);

    // Auto-save Effect
    useEffect(() => {
        if (!isUserModified || !savedCode) return;

        const saveTimeout = setTimeout(async () => {
            if (!user || !algorithmId) return;

            try {
                const success = await updateCode(user.id, algorithmId, {
                    language: selectedLanguage,
                    code: savedCode,
                }, codeCache);

                if (!success) throw new Error('Failed to save code');

                if (isNaughtyCloud) {
                    toast("Cloud is feeling naughty today, but saved anyway 😈", {
                        description: "Your code is safe, don't worry!",
                    });
                }

                // ONLY reset if no further changes happened during the save
                if (latestCodeRef.current === savedCode) {
                    setIsUserModified(false);
                    lastSyncedCodeRef.current = savedCode;
                }

                // Removed redundant refetchUserData() as real-time subscription handles it
            } catch (err) {
                console.error("Error saving code:", err);
            }
        }, 2000); // Reduced to 2s for better retention

        return () => clearTimeout(saveTimeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [savedCode, user, algorithmId, selectedLanguage, isUserModified, isNaughtyCloud]);

    const handleCodeChange = useCallback((newCode: string) => {
        // Guard: If the language in this closure doesn't match the current active language, 
        // ignore the change to prevent "infecting" other language caches.
        if (selectedLanguage !== currentLanguageRef.current) return;

        // Prevent setting modified if it's the same or if we are just initializing
        if (newCode === savedCode) return;

        setSavedCode(newCode);
        setIsUserModified(true);
        setCodeCache(prev => ({
            ...prev,
            [selectedLanguage]: newCode
        }));
    }, [selectedLanguage, savedCode]);

    const toggleCompletion = useCallback(async () => {
        if (!user || !algorithmId) {
            toast.error("Please sign in to track progress");
            return;
        }

        try {
            const newStatus = !isCompleted;
            const success = await updateProgress(user.id, algorithmId, {
                completed: newStatus,
                completed_at: newStatus ? new Date().toISOString() : null,
            });

            if (!success) throw new Error('Failed to update');

            setIsCompleted(newStatus);
            toast.success(newStatus ? "Marked as completed!" : "Marked as incomplete");
            refetchUserData();
        } catch (error) {
            console.error('Error toggling completion:', error);
            toast.error("Failed to update progress");
        }
    }, [user, algorithmId, isCompleted, refetchUserData]);

    const toggleVisualizationCompletion = useCallback(async () => {
        if (!user || !algorithmId) {
            toast.error("Please sign in to track progress");
            return;
        }

        try {
            const newStatus = !isVisualizationCompleted;
            const success = await updateVisualizationProgress(user.id, algorithmId, newStatus);

            if (!success) throw new Error('Failed to update');

            setIsVisualizationCompleted(newStatus);
            toast.success(newStatus ? "Visualization marked as completed!" : "Visualization marked as incomplete");
            refetchUserData();
        } catch (error) {
            console.error('Error toggling visualization completion:', error);
            toast.error("Failed to update visualization progress");
        }
    }, [user, algorithmId, isVisualizationCompleted, refetchUserData]);

    const toggleDrawingCompletion = useCallback(async () => {
        if (!user || !algorithmId) {
            toast.error("Please sign in to track progress");
            return;
        }

        try {
            const newStatus = !isDrawingCompleted;
            const success = await updateDrawingProgress(user.id, algorithmId, newStatus);

            if (!success) throw new Error('Failed to update');

            setIsDrawingCompleted(newStatus);
            toast.success(newStatus ? "Drawing marked as completed!" : "Drawing marked as incomplete");
            refetchUserData();
        } catch (error) {
            console.error('Error toggling drawing completion:', error);
            toast.error("Failed to update drawing progress");
        }
    }, [user, algorithmId, isDrawingCompleted, refetchUserData]);

    const toggleSolutionCompletion = useCallback(async () => {
        if (!user || !algorithmId) {
            toast.error("Please sign in to track progress");
            return;
        }

        try {
            const newStatus = !isSolutionCompleted;
            const success = await updateSolutionProgress(user.id, algorithmId, newStatus);

            if (!success) throw new Error('Failed to update');

            setIsSolutionCompleted(newStatus);
            toast.success(newStatus ? "Solution marked as completed!" : "Solution marked as incomplete");
            refetchUserData();
        } catch (error) {
            console.error('Error toggling solution completion:', error);
            toast.error("Failed to update solution progress");
        }
    }, [user, algorithmId, isSolutionCompleted, refetchUserData]);

    const handleCodeSuccess = useCallback(async () => {
        // Trigger Confetti
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });

        if (user && algorithmId && !isCompleted) {
            try {
                const success = await updateProgress(user.id, algorithmId, {
                    completed: true,
                    completed_at: new Date().toISOString(),
                });

                if (success) {
                    setIsCompleted(true);
                    trackEvent(posthog, 'problem_completed', {
                        algorithm_id: algorithmId,
                        algorithm_name: algorithm?.title,
                        language: selectedLanguage,
                    });
                    toast.success("Algorithm completed! Keep it up!", {
                        description: "Marked as completed automatically."
                    });
                    refetchUserData();
                }
            } catch (error) {
                console.error("Failed to auto-complete:", error);
            }
        } else if (!user) {
            toast.success("Great job! Sign in to track your progress.");
        }
    }, [user, algorithmId, isCompleted, refetchUserData, posthog, algorithm, selectedLanguage]);

    const toggleFavorite = useCallback(async () => {
        if (!user || !algorithmId) {
            toast.error("Please sign in to favorite");
            return;
        }

        try {
            const newStatus = !isFavorite;
            const success = await updateSocial(user.id, algorithmId, {
                is_favorite: newStatus,
            });

            if (!success) throw new Error('Failed to update');
            setIsFavorite(newStatus);
            trackEvent(posthog, 'problem_favorited', {
                algorithm_id: algorithmId,
                algorithm_name: algorithm?.title,
                favorited: newStatus,
            });
            toast.success(newStatus ? "Added to favorites" : "Removed from favorites");
            refetchUserData();
        } catch (error) {
            toast.error("Failed to update favorites");
        }
    }, [user, algorithmId, isFavorite, refetchUserData, posthog, algorithm]);

    const handleVote = useCallback(async (vote: 'like' | 'dislike') => {
        if (!user) {
            toast.error("Please sign in to vote");
            return;
        }

        const previousVote = userVote;
        const previousLikes = likes;
        const previousDislikes = dislikes;

        // Optimistic Update
        if (userVote === vote) {
            setUserVote(null);
            if (vote === 'like') setLikes(l => Math.max(0, l - 1));
            else setDislikes(d => Math.max(0, d - 1));
        } else {
            setUserVote(vote);
            if (vote === 'like') {
                setLikes(l => l + 1);
                if (previousVote === 'dislike') setDislikes(d => Math.max(0, d - 1));
            } else {
                setDislikes(d => d + 1);
                if (previousVote === 'like') setLikes(l => Math.max(0, l - 1));
            }
        }

        try {
            // DB Logic copied from original component
            let likeIncrement = 0;
            let dislikeIncrement = 0;

            if (previousVote === vote) {
                if (vote === 'like') likeIncrement = -1;
                else dislikeIncrement = -1;
            } else {
                if (vote === 'like') {
                    likeIncrement = 1;
                    if (previousVote === 'dislike') dislikeIncrement = -1;
                } else {
                    dislikeIncrement = 1;
                    if (previousVote === 'like') likeIncrement = -1;
                }
            }

            if (likeIncrement !== 0 || dislikeIncrement !== 0) {
                const { data: current, error: fetchError } = await supabase
                    .from('algorithms')
                    .select('metadata')
                    .eq('id', algorithm.id)
                    .maybeSingle();

                if (current && !fetchError) {
                    const currentMeta = (current.metadata as any) || {};
                    const newLikes = Math.max(0, (currentMeta.likes || 0) + likeIncrement);
                    const newDislikes = Math.max(0, (currentMeta.dislikes || 0) + dislikeIncrement);

                    await supabase.from('algorithms').update({
                        metadata: {
                            ...currentMeta,
                            likes: newLikes,
                            dislikes: newDislikes
                        }
                    }).eq('id', algorithm.id);
                }
            }

            const newVote = (previousVote === vote) ? null : vote;
            await updateSocial(user.id, algorithmId || '', {
                user_vote: newVote
            });

        } catch (error) {
            console.error("Error updating vote:", error);
            toast.error("Failed to update vote");
            // Revert optimistic
            setUserVote(previousVote);
            setLikes(previousLikes);
            setDislikes(previousDislikes);
        }
    }, [user, algorithmId, userVote, likes, dislikes, algorithm]);

    const handleRandomProblem = useCallback(async () => {
        if (filteredAlgorithms && filteredAlgorithms.length > 0) {
            const random = filteredAlgorithms[Math.floor(Math.random() * filteredAlgorithms.length)];
            router.push(getProblemUrl(random));
            return;
        }
        const { data } = await supabase.from('algorithms').select('id, problem_type');
        if (data && data.length > 0) {
            const random = data[Math.floor(Math.random() * data.length)];
            router.push(getProblemUrl(random));
        }
    }, [router, filteredAlgorithms]);

    const handlePreviousProblem = useCallback(async () => {
        if (!algorithm || !supabase) return;

        try {
            if (filteredAlgorithms && filteredAlgorithms.length > 0) {
                const currentIndex = filteredAlgorithms.findIndex(a => a.id === algorithm.id || a.slug === algorithm.slug || a.id === algorithmId);
                if (currentIndex > 0) {
                    const prevAlgo = filteredAlgorithms[currentIndex - 1];
                    router.push(getProblemUrl(prevAlgo));
                    return;
                } else if (currentIndex === 0) {
                    toast.info("No previous problem found. You are at the start!");
                    return;
                }
            }

            if (typeof algorithm.serial_no === 'number') {
                const { data: prevAlgo } = await supabase
                    .from('algorithms')
                    .select('id, serial_no, problem_type')
                    .lt('serial_no', algorithm.serial_no)
                    .order('serial_no', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (prevAlgo) {
                    router.push(getProblemUrl(prevAlgo));
                    return;
                }
            }

            toast.info("No previous problem found. You are at the start!");
        } catch (error) {
            console.error("Error navigating previous:", error);
        }
    }, [algorithm, algorithmId, router, filteredAlgorithms]);

    const handleNextProblem = useCallback(async () => {
        if (!algorithm || !supabase) return;

        try {
            if (filteredAlgorithms && filteredAlgorithms.length > 0) {
                const currentIndex = filteredAlgorithms.findIndex(a => a.id === algorithm.id || a.slug === algorithm.slug || a.id === algorithmId);
                if (currentIndex >= 0 && currentIndex < filteredAlgorithms.length - 1) {
                    const nextAlgo = filteredAlgorithms[currentIndex + 1];
                    router.push(getProblemUrl(nextAlgo));
                    return;
                } else if (currentIndex === filteredAlgorithms.length - 1) {
                    toast.info("You have reached the end of the list!");
                    return;
                }
            }

            // New Logic: Find next by serial_no
            if (typeof algorithm.serial_no === 'number') {
                const { data: nextAlgo } = await supabase
                    .from('algorithms')
                    .select('id, serial_no, problem_type')
                    .gt('serial_no', algorithm.serial_no)
                    .order('serial_no', { ascending: true })
                    .limit(1)
                    .maybeSingle(); // Use maybeSingle() as we expect at most one, or null if none

                if (nextAlgo) {
                    router.push(getProblemUrl(nextAlgo));
                    return;
                }
            }

            // Fallback: If no serial number or no next problem found (last one?), try random
            console.log("No next problem found by serial_no, trying random...");
            toast.info("No next problem found in sequence. Trying random...");
            handleRandomProblem();

        } catch (error) {
            console.error("Error navigating next:", error);
            handleRandomProblem();
        }

    }, [algorithm, algorithmId, handleRandomProblem, router, filteredAlgorithms]);

    const handleShare = useCallback(async () => {
        try {
            const url = window.location.href;
            await navigator.clipboard.writeText(url);
            trackEvent(posthog, 'problem_shared', {
                algorithm_id: algorithmId,
                algorithm_name: algorithm?.title,
            });
            toast.success("Link copied to clipboard!");
        } catch (error) {
            toast.error("Failed to copy link");
        }
    }, [posthog, algorithmId, algorithm?.title]);

    return {
        isCompleted,
        isFavorite,
        likes,
        dislikes,
        userVote,
        savedCode,
        selectedLanguage,
        isVisualizationCompleted,
        isDrawingCompleted,
        isSolutionCompleted,
        setSelectedLanguage: (lang: string) => {
            const newLang = lang as Language;
            const prevLang = preferredLanguage;
            setPreferredLanguage(newLang);

            // Sync savedCode immediately to avoid one-render lag for CodeRunner
            const codeForLanguage = codeCache[newLang] || '';
            setSavedCode(codeForLanguage);
            setIsUserModified(false);
            currentLanguageRef.current = newLang;
            trackEvent(posthog, 'language_changed', {
                algorithm_id: algorithmId,
                from_language: prevLang,
                to_language: newLang,
            });
        },
        isUserModified,

        // Actions
        toggleCompletion,
        toggleVisualizationCompletion,
        toggleDrawingCompletion,
        toggleSolutionCompletion,
        handleCodeSuccess,
        toggleFavorite,
        handleVote,
        handleRandomProblem,
        handlePreviousProblem,
        handleNextProblem,
        handleShare,
        handleCodeChange,

        // Setters for initial data
        setLikes,
        setDislikes
    };
};
