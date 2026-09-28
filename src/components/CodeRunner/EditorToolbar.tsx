import React from "react";
import {
    Code, Book, X, RotateCcw, AlignLeft,
    Maximize, Minimize2, PanelRightClose, Bot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LanguageSelector, Language } from "./LanguageSelector";
import { SettingsPopover } from "./SettingsPopover";
import { EditorSettings } from "@/hooks/useEditorSettings";
import { Submission } from "@/types/userAlgorithmData";

interface EditorToolbarProps {
    activeEditorTab: "current" | "submission" | "scratchpad";
    setActiveEditorTab: (tab: "current" | "submission" | "scratchpad") => void;
    language: Language;
    onLanguageChange: (lang: Language) => void;
    availableLanguages?: Language[];
    isMobile: boolean;
    onToggleRightPanel?: () => void;
    onReset: () => void;
    onFormatCode: () => void;
    isLoading: boolean;
    isSubmitting: boolean;
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
    viewingSubmission: Submission | null;
    onCloseSubmission: (e?: React.MouseEvent) => void;
    isScratchpadOpen: boolean;
    setIsScratchpadOpen: (val: boolean) => void;
    settings: EditorSettings;
    updateSetting: <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) => void;
    brainstormProps?: {
        algorithmId: string;
        algorithmTitle: string;
        controls?: any;
    };
    onToggleQween?: () => void;
    isQweenOpen?: boolean;
    onCopyToLeetcode?: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
    activeEditorTab,
    setActiveEditorTab,
    language,
    onLanguageChange,
    availableLanguages,
    isMobile,
    onToggleRightPanel,
    onReset,
    onFormatCode,
    isLoading,
    isSubmitting,
    isFullscreen,
    onToggleFullscreen,
    viewingSubmission,
    onCloseSubmission,
    isScratchpadOpen,
    setIsScratchpadOpen,
    settings,
    updateSetting,
    brainstormProps,
    onToggleQween,
    isQweenOpen,
    onCopyToLeetcode
}) => {
    const LeetcodeIcon = ({ className }: { className?: string }) => (
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor">
            <path d="M16.102 17.93l-2.697 2.607c-.466.467-1.111.662-1.823.662s-1.357-.195-1.824-.662l-4.332-4.363c-.467-.467-.701-1.115-.701-1.924s.234-1.457.701-1.924l2.92-2.938c.466-.467 1.111-.662 1.824-.662s1.357.195 1.824.662l2.919 2.938c.467.467.665 1.115.665 1.924 0 .808-.198 1.457-.665 1.924l-3.23 3.197h8.847c.563 0 1.018.457 1.018 1.02s-.455 1.02-1.018 1.02H16.102zm-3.661-4.706l-2.148-2.179c-.197-.198-.588-.198-.785 0l-2.919 2.937c-.198.199-.198.59 0 .788l4.332 4.363c.197.199.588.199.785 0l2.697-2.607c.198-.198.198-.589 0-.788l-1.962-1.962v-.001h-3.957c-.563 0-1.018-.456-1.018-1.019s.455-1.02 1.018-1.02h4.957v.488zM20.916 6.136c0-.809-.234-1.457-.701-1.924L17.296 1.274C16.829.807 16.184.612 15.472.612s-1.357.195-1.824.662L8.031 6.891c-.467.467-.701 1.115-.701 1.924s.234 1.457.701 1.924l4.332 4.363c.467.467 1.111.662 1.824.662s1.357-.195 1.824-.662l5.617-5.65c.467-.467.665-1.115.665-1.924v-.001h-.001z" />
        </svg>
    );

    return (
        <div className="flex items-center justify-between px-0 border-b bg-muted/40 h-9 shrink-0 gap-2">
            <div className="flex items-center gap-0 overflow-x-auto no-scrollbar mask-linear-fade shrink-0 h-full">
                {activeEditorTab === 'current' && (
                    <div className="flex items-center h-full">
                        <LanguageSelector
                            language={language}
                            onLanguageChange={onLanguageChange}
                            disabled={isLoading || isSubmitting}
                            availableLanguages={availableLanguages}
                        />
                    </div>
                )}

                {(isScratchpadOpen || viewingSubmission) && (
                    <TabsList className="bg-transparent h-9 p-0 gap-0 w-auto justify-start rounded-none">
                        <TabsTrigger
                            value="current"
                            className="data-[state=active]:bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary h-9 px-4 rounded-none gap-2"
                        >
                            <Code className="w-4 h-4" />
                            {!isMobile && "Code"}
                        </TabsTrigger>

                        {brainstormProps && isScratchpadOpen && (
                            <TabsTrigger
                                value="scratchpad"
                                className="data-[state=active]:bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary h-9 px-4 rounded-none gap-2 items-center group"
                            >
                                <Book className="w-4 h-4" />
                                {!isMobile && "Thinkpad"}
                                <div
                                    role="button"
                                    className="opacity-60 hover:opacity-100 hover:bg-muted rounded-full p-0.5 ml-1 transition-all"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsScratchpadOpen(false);
                                        if (activeEditorTab === 'scratchpad') {
                                            setActiveEditorTab('current');
                                        }
                                    }}
                                >
                                    <X className="w-3 h-3" />
                                </div>
                            </TabsTrigger>
                        )}

                        {viewingSubmission && (
                            <TabsTrigger
                                value="submission"
                                className="data-[state=active]:bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary h-9 px-4 gap-3 rounded-none group items-center"
                            >
                                <div className="flex items-center gap-2 text-xs">
                                    <span className={`font-semibold ${viewingSubmission?.status === 'passed' ? 'text-green-600' : 'text-destructive'}`}>
                                        {viewingSubmission?.status === 'passed' ? 'Accepted' : (viewingSubmission?.status === 'error' ? 'Runtime Error' : 'Wrong Answer')}
                                    </span>
                                    {!isMobile && (
                                        <>
                                            <span className="text-muted-foreground">|</span>
                                            <span className="uppercase font-medium text-foreground">{viewingSubmission?.language}</span>
                                        </>
                                    )}
                                </div>

                                <div
                                    role="button"
                                    className="opacity-60 group-hover:opacity-100 hover:bg-muted rounded-full p-0.5 ml-1"
                                    onClick={(e) => onCloseSubmission(e)}
                                >
                                    <X className="w-3 h-3" />
                                </div>
                            </TabsTrigger>
                        )}
                    </TabsList>
                )}
            </div>

            <div className="flex items-center gap-1 shrink-0 pr-1">
                {activeEditorTab === 'current' && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={onReset}
                                    disabled={isLoading || isSubmitting}
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Reset to starter code</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={onFormatCode}
                                >
                                    <AlignLeft className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Format code</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
                
                {onToggleQween && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={isQweenOpen ? "default" : "ghost"}
                                    size="icon"
                                    className={`h-8 w-8 ${isQweenOpen ? 'bg-primary text-primary-foreground' : 'text-amber-500 hover:text-amber-600 hover:bg-amber-500/10'}`}
                                    onClick={onToggleQween}
                                >
                                    <Bot className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Ask QWEEN (AI Assistant)</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}

                {onCopyToLeetcode && activeEditorTab === 'current' && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-orange-500 hover:text-orange-600 hover:bg-orange-500/10"
                                    onClick={onCopyToLeetcode}
                                >
                                    <LeetcodeIcon className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Paste to LeetCode</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}

                <SettingsPopover settings={settings} updateSetting={updateSetting} />

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={onToggleFullscreen}
                    title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                    {isFullscreen ? (
                        <Minimize2 className="w-4 h-4" />
                    ) : (
                        <Maximize className="w-4 h-4" />
                    )}
                </Button>
            </div>
        </div>
    );
};
