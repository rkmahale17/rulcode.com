"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import "@excalidraw/excalidraw/index.css";
import { Download, Loader2, Save, Lock, Info } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";

import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUserAlgorithmData } from "@/hooks/useUserAlgorithmData";
import { updateWhiteboard } from "@/utils/userAlgorithmDataHelpers";
import { DSAToolbar } from "./DSAToolbar";
import { useTheme } from "next-themes";
import { useApp } from "@/contexts/AppContext";

// Dynamically import Excalidraw since it accesses `window` on load
const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw),
  { ssr: false }
);

interface WhiteboardComponentProps {
  algorithmId: string;
  algorithmTitle: string;
  restoreData?: any;
  isExpand?: boolean;
}

interface SaveButtonProps extends WhiteboardComponentProps {
  excalidrawAPI: any | null;
}

const SaveButton = ({
  algorithmId,
  algorithmTitle,
  excalidrawAPI,
}: SaveButtonProps) => {
  const [title, setTitle] = useState(algorithmTitle);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();
  const { hasPremiumAccess } = useApp();

  // Get current user
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
    });
  }, []);

  // Fetch user algorithm data
  const { data: userAlgoData } = useUserAlgorithmData({
    userId: userId || undefined,
    algorithmId,
    enabled: !!userId,
  });

  // Track whether we've already loaded the saved snapshot into the editor.
  const hasLoadedRef = useRef(false);

  // Load the latest whiteboard on mount
  useEffect(() => {
    if (hasLoadedRef.current || !userAlgoData || !excalidrawAPI) return;

    const snapshotData = userAlgoData.whiteboard_data;
    if (!snapshotData || typeof snapshotData !== "object") return;

    try {
      if (snapshotData.elements && Array.isArray(snapshotData.elements)) {
        // We only restore elements and safe appState properties
        // Deep clone elements to avoid "Cannot assign to read only property" error
        const clonedElements = JSON.parse(JSON.stringify(snapshotData.elements));
        excalidrawAPI.updateScene({
          elements: clonedElements,
          appState: snapshotData.appState ? {
            scrollX: snapshotData.appState.scrollX,
            scrollY: snapshotData.appState.scrollY,
            zoom: snapshotData.appState.zoom,
          } : undefined,
        });
      } else {
        console.warn("Found old Tldraw data or invalid format. Resetting to blank canvas.");
      }
      hasLoadedRef.current = true;
    } catch (error) {
      console.error("Error loading whiteboard data:", error);
      hasLoadedRef.current = true;
    }
  }, [userAlgoData, excalidrawAPI]);

  const handleSave = async () => {
    if (!hasPremiumAccess) {
      toast("Saving in Thinkpad is a Pro feature.", {
        icon: <Info className="w-4 h-4 text-blue-500" />
      });
      return;
    }
    if (!excalidrawAPI) return;

    setIsSaving(true);
    try {
      if (!userId) {
        toast.error("Please sign in to save");
        return;
      }

      const elements = excalidrawAPI.getSceneElements();
      const { scrollX, scrollY, zoom } = excalidrawAPI.getAppState();

      const success = await updateWhiteboard(userId, algorithmId, {
        whiteboard_data: { elements, appState: { scrollX, scrollY, zoom } },
      });

      if (!success) throw new Error("Failed to save whiteboard");

      toast.success("Whiteboard saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["user-algorithm-data", algorithmId] });
    } catch (error) {
      console.error("Error saving whiteboard:", error);
      toast.error("Failed to save whiteboard");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPNG = useCallback(async () => {
    if (!excalidrawAPI) return;

    try {
      const elements = excalidrawAPI.getSceneElements();
      if (!elements || elements.length === 0) {
        toast.error("Nothing to export");
        return;
      }

      const { exportToBlob } = await import("@excalidraw/excalidraw");
      const appState = excalidrawAPI.getAppState();

      const blob = await exportToBlob({
        elements,
        appState: {
          ...appState,
          exportWithDarkMode: false,
          exportBackground: true,
        },
        files: excalidrawAPI.getFiles(),
      });

      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${title || "whiteboard"}.png`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("Exported as PNG!");
      } else {
        toast.error("Failed to generate PNG");
      }
    } catch (error) {
      console.error("Error exporting:", error);
      toast.error("Failed to export");
    }
  }, [excalidrawAPI, title]);

  return (
    <div className="relative top-0 z-50 flex items-center gap-3 p-2 border-b border-border/50 bg-background text-foreground shadow-sm">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Whiteboard title"
        className="h-9 max-w-[250px] text-sm bg-background text-foreground border-border/60 rounded-xl shadow-sm focus-visible:ring-primary/20 focus-visible:border-primary/40 transition-all"
      />
      <div className="flex items-center h-9 rounded-xl border border-border/60 bg-muted/30 dark:bg-muted/20 overflow-hidden shadow-sm shrink-0 select-none">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center justify-center gap-1.5 h-full px-4 text-[12px] font-semibold tracking-wide transition-all duration-200 text-foreground/80 hover:text-foreground hover:bg-muted/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : !hasPremiumAccess ? (
            <Lock className="w-3.5 h-3.5 text-amber-500" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          {hasPremiumAccess ? "Save" : "Pro Save"}
        </button>
        <div className="w-px h-5 bg-border/60 shrink-0" />
        <button
          onClick={handleExportPNG}
          className="flex items-center justify-center gap-1.5 h-full px-4 text-[12px] font-semibold tracking-wide transition-all duration-200 text-foreground/80 hover:text-foreground hover:bg-muted/50 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Export PNG
        </button>
      </div>
    </div>
  );
};

export const WhiteboardComponent = ({
  algorithmId,
  algorithmTitle,
  restoreData,
  isExpand,
}: WhiteboardComponentProps) => {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any | null>(null);
  const { resolvedTheme } = useTheme();
  const { hasPremiumAccess } = useApp();

  const initialData = React.useMemo(() => {
    return {
      ...(restoreData || {}),
      elements: restoreData?.elements ? JSON.parse(JSON.stringify(restoreData.elements)) : undefined,
      appState: {
        ...(restoreData?.appState || {}),
        currentItemStrokeWidth: 1,
        activeTool: {
          type: "freedraw",
          customType: null,
          locked: false, // Keep tool unlocked by default
        },
      },
    };
  }, [restoreData]);

  // Intercept clicks on library items for non-pro users
  useEffect(() => {
    if (hasPremiumAccess) return;

    const handleCaptureClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // We look for elements that look like a library item in Excalidraw's UI
      const isLibraryItem = target.closest('[class*="library-item" i]') || 
                            target.closest('[class*="library-unit" i]') ||
                            target.closest('[data-testid*="library-item" i]') ||
                            target.closest('.excalidraw-libraryItem');
      
      if (isLibraryItem) {
        e.stopPropagation();
        e.preventDefault();
        toast("Unlock Pro to insert library templates", {
          icon: <Info className="w-4 h-4 text-blue-500" />
        });
      }
    };

    // Attach in capture phase to intercept before React or Excalidraw handles it
    document.addEventListener('click', handleCaptureClick, true);
    document.addEventListener('pointerdown', handleCaptureClick, true);
    
    return () => {
      document.removeEventListener('click', handleCaptureClick, true);
      document.removeEventListener('pointerdown', handleCaptureClick, true);
    };
  }, [hasPremiumAccess]);

  useEffect(() => {
    if (excalidrawAPI) {
      fetch("https://raw.githubusercontent.com/excalidraw/excalidraw-libraries/main/libraries/intradeus/algorithms-and-data-structures-arrays-matrices-trees.excalidrawlib")
        .then(res => res.json())
        .then(data => {
          if (data && data.libraryItems) {
            excalidrawAPI.updateLibrary({
              libraryItems: data.libraryItems,
              prompt: false,
              merge: true,
            });
          }
        })
        .catch(err => console.error("Failed to load DSA library:", err));
    }
  }, [excalidrawAPI]);

  return (
    <div className="relative w-full h-full border rounded-none overflow-hidden z-10 flex flex-col">
      <SaveButton
        algorithmId={algorithmId}
        algorithmTitle={algorithmTitle}
        excalidrawAPI={excalidrawAPI}
      />
      <div className="flex-1 w-full relative">
        <DSAToolbar excalidrawAPI={excalidrawAPI} />
        <Excalidraw 
          excalidrawAPI={(api: any) => setExcalidrawAPI(api)} 
          initialData={initialData}
          theme={resolvedTheme === "dark" ? "dark" : "light"}
        />
      </div>
    </div>
  );
};
