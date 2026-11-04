import React, { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Loader2, Terminal, FlaskConical, Clock, Plus, Check, CheckCircle2, XCircle, X, AlertTriangle, History, Code, ChevronUp, ChevronDown, Minimize2, Minimize, Maximize, Sparkles } from "lucide-react";
import { Algorithm } from '@/types/algorithm';
import { Button } from "@/components/ui/button";
import { FeatureGuard } from "@/components/FeatureGuard";
import { TestCaseEditor } from './TestCaseEditor';
import { Submission } from '@/types/userAlgorithmData';
import { diffStrings } from '@/utils/diffUtils';
import { TreeDiagram } from '../visualizations/TreeDiagram';
import { isTreeType, parseTreeValue } from '@/utils/treeUtils';
import { GraphDiagram } from '../visualizations/GraphDiagram';
import { isGraphType, parseGraphValue } from '@/utils/graphUtils';
import { isListType, parseListValue } from '@/utils/listUtils';
import { getStatusColor, getStatusText, formatDate, formatMemory } from './outputHelpers';

const DiffView = ({ expected, actual }: { expected: any, actual: any }) => {
  const expectedStr = (typeof expected === 'string' ? expected : JSON.stringify(expected, null, 2)) || "";
  const actualStr = (typeof actual === 'string' ? actual : JSON.stringify(actual, null, 2)) || "";
  const diff = diffStrings(expectedStr, actualStr);

  return (
    <div className="font-mono text-xs whitespace-pre-wrap leading-relaxed">
      {diff.map((part, i) => {
        if (part.added) {
          return (
            <span key={i} className="bg-green-500/20 text-green-600 dark:text-green-400 border-b border-green-500/50">
              {part.value}
            </span>
          );
        }
        if (part.removed) {
          return (
            <span key={i} className="bg-red-500/20 text-red-600 dark:text-red-400 line-through decoration-red-500/50">
              {part.value}
            </span>
          );
        }
        return <span key={i} className="text-foreground/70">{part.value}</span>;
      })}
    </div>
  );
};

const getSqlTableSchemas = (dbSetup: string) => {
  const schemas: Record<string, string[]> = {};
  if (!dbSetup) return schemas;
  
  const tables = dbSetup.split(/CREATE\s+TABLE/i).slice(1);
  
  for (const table of tables) {
      const nameMatch = table.match(/^\s*(\w+)/);
      if (!nameMatch) continue;
      const tableName = nameMatch[1];
      
      const parenStart = table.indexOf('(');
      if (parenStart === -1) continue;
      
      let parenEnd = parenStart;
      let depth = 0;
      for (let i = parenStart; i < table.length; i++) {
          if (table[i] === '(') depth++;
          else if (table[i] === ')') {
              depth--;
              if (depth === 0) {
                  parenEnd = i;
                  break;
              }
          }
      }
      
      const columnsDef = table.substring(parenStart + 1, parenEnd);
      const cols: string[] = [];
      let currentCol = '';
      let nested = 0;
      for (let i = 0; i < columnsDef.length; i++) {
          const char = columnsDef[i];
          if (char === '(') nested++;
          else if (char === ')') nested--;
          
          if (char === ',' && nested === 0) {
              cols.push(currentCol);
              currentCol = '';
          } else {
              currentCol += char;
          }
      }
      if (currentCol) cols.push(currentCol);
      
      const columns: string[] = [];
      for (const col of cols) {
          const trimmed = col.trim();
          if (!trimmed) continue;
          if (/^(PRIMARY\s+KEY|FOREIGN\s+KEY|UNIQUE|CHECK|CONSTRAINT)\b/i.test(trimmed)) continue;
          
          const parts = trimmed.split(/\s+/);
          if (parts.length >= 2) {
              columns.push(parts[0]);
          }
      }
      
      schemas[tableName] = columns;
      schemas[tableName.toLowerCase()] = columns;
  }
  return schemas;
};

const getPreferredHeaders = (fieldName: string, schemas: Record<string, string[]>) => {
    if (!schemas || !fieldName) return undefined;
    const lowerName = fieldName.toLowerCase().replace('table', '').trim();
    for (const key of Object.keys(schemas)) {
        if (key.toLowerCase() === lowerName || lowerName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerName)) {
            return schemas[key];
        }
    }
    return undefined;
};

const parseSqlAsciiTable = (rawText: string) => {
  if (!rawText || typeof rawText !== 'string') return null;
  const lines = rawText.trim().split('\n');
  if (lines.length < 3) return null;
  
  const separatorIndex = lines.findIndex(line => /^[-\+\| ]+$/.test(line) && line.includes('-') && !line.match(/[a-zA-Z0-9]/));
  if (separatorIndex < 1) return null;
  
  const headerLine = lines[separatorIndex - 1];
  const dataLines = lines.slice(separatorIndex + 1);
  
  const headers = headerLine.split('|').map(h => h.trim());
  const rows = dataLines
    .filter(line => line.includes('|'))
    .map(line => line.split('|').map(cell => cell.trim()));
    
  return { headers, rows };
};

const SqlTableDisplay = ({ rawText }: { rawText: string }) => {
  const tableData = parseSqlAsciiTable(rawText);
  if (!tableData) {
    return <div className="whitespace-pre-wrap font-mono text-xs">{rawText}</div>;
  }
  
  return (
    <div className="overflow-x-auto rounded border border-border mt-2 w-max max-w-full">
      <table className="text-left border-collapse text-xs">
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            {tableData.headers.map((h, i) => (
              <th key={i} className="px-3 py-2 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border font-mono">
          {tableData.rows.length === 0 ? (
            <tr><td colSpan={tableData.headers.length} className="px-3 py-4 text-center text-muted-foreground font-sans">0 rows</td></tr>
          ) : (
            tableData.rows.map((row, i) => (
              <tr key={i} className="hover:bg-muted/30">
                {row.map((cell, j) => (
                  <td key={j} className="px-3 py-2 whitespace-nowrap">{cell}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

const JsonTableDisplay = ({ data, preferredHeaders }: { data: any[], preferredHeaders?: string[] }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return <div className="text-muted-foreground text-xs p-3 font-sans text-center">0 rows</div>;
  }
  let headers = Array.from(new Set(data.flatMap(Object.keys)));
  
  if (preferredHeaders && preferredHeaders.length > 0) {
      const orderedHeaders = preferredHeaders.filter(h => headers.includes(h));
      const remainingHeaders = headers.filter(h => !preferredHeaders.includes(h));
      headers = [...orderedHeaders, ...remainingHeaders];
  }
  
  return (
    <div className="overflow-x-auto rounded border border-border mt-2 w-max max-w-full">
      <table className="text-left border-collapse text-xs">
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-2 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border font-mono">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-muted/30">
              {headers.map((h, j) => (
                <td key={j} className="px-3 py-2 whitespace-nowrap">
                  {row[h] === null || row[h] === undefined ? <span className="text-muted-foreground italic">null</span> : String(row[h])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

interface OutputPanelProps {
  output: any | null;
  loading: boolean;
  stdin: string;
  onStdinChange: (value: string) => void;
  testCases?: Array<{ input: any[]; output: any }>;
  executionTime?: number | null;
  memoryUsage?: number | null;
  algorithmMeta?: Algorithm | null;

  // LeetCode Style Props
  activeTab: "testcase" | "result" | "submissions";
  onTabChange: (tab: "testcase" | "result" | "submissions") => void;

  allTestCases: Array<{ id: number; input: any[]; expectedOutput: any; isCustom: boolean; description?: string; isSubmission?: boolean }>;
  onAddTestCase: () => void;
  onUpdateTestCase: (id: number, data: any) => void;
  onDeleteTestCase: (id: number) => void;

  // Editing State
  editingTestCaseId: number | null;
  onEditTestCase: (id: number | null) => void;
  onCancelEdit: () => void;

  inputSchema?: any[];
  controls?: any;

  // New Prop
  submissions?: Submission[];
  executedTestCases?: Array<{ id: number; input: any[]; expectedOutput: any; isCustom: boolean; description?: string; isSubmission?: boolean }>;
  onSelectSubmission?: (submission: Submission) => void;
  // State Lifting
  activeTestCaseTab?: string;
  onTestCaseTabChange?: (val: string) => void;
  onOpenRulo?: () => void;
  onToggleExpand?: () => void;
  isExpanded?: boolean;
  onMaximize?: () => void;
  isMaximized?: boolean;
  submitting?: boolean;
}

export const OutputPanel = React.memo(({
  output,
  loading,
  stdin,
  onStdinChange,
  testCases,
  executionTime,
  memoryUsage,
  algorithmMeta,
  activeTab,
  onTabChange,
  allTestCases,
  onAddTestCase,
  onUpdateTestCase,
  onDeleteTestCase,
  editingTestCaseId,
  onEditTestCase,
  onCancelEdit,
  controls,
  inputSchema,
  submissions = [],
  executedTestCases,
  onSelectSubmission,
  activeTestCaseTab: controlledActiveTestCaseTab,
  onTestCaseTabChange,
  onOpenRulo,
  onToggleExpand,
  isExpanded,
  onMaximize,
  isMaximized,
  submitting = false,
}: OutputPanelProps) => {
  const [internalActiveTestCaseTab, setInternalActiveTestCaseTab] = useState<string>("");
  const activeTestCaseTab = controlledActiveTestCaseTab ?? internalActiveTestCaseTab;
  const setActiveTestCaseTab = onTestCaseTabChange ?? setInternalActiveTestCaseTab;

  const containerRef = React.useRef<HTMLDivElement>(null);
  const [panelWidth, setPanelWidth] = useState(300);

  const sqlSchemas = React.useMemo(() => {
    const isSqlProblem = algorithmMeta?.problemType === 'sql' || algorithmMeta?.problem_type === 'sql' || algorithmMeta?.problem_type === 'SQL' || algorithmMeta?.problemType === 'SQL';
    if (!isSqlProblem) return {};
    try {
      const metadata = typeof algorithmMeta?.metadata === 'string'
        ? JSON.parse(algorithmMeta.metadata)
        : (algorithmMeta?.metadata || {});
      return getSqlTableSchemas(metadata.db_setup);
    } catch {
      return {};
    }
  }, [algorithmMeta]);

  // Ensure first test case is active by default
  React.useEffect(() => {
    if (!activeTestCaseTab && allTestCases.length > 0) {
      const firstCase = allTestCases.find(tc => !tc.isSubmission);
      if (firstCase) {
        setActiveTestCaseTab(`case-${firstCase.id}`);
      }
    }
  }, [allTestCases, activeTestCaseTab, setActiveTestCaseTab]);

  // Ensure first result is active when output changes
  const [activeResultTab, setActiveResultTab] = useState("result-0");
  React.useEffect(() => {
    if (output && output.testResults && output.testResults.length > 0) {
      setActiveResultTab("result-0");
    }
  }, [output]);


  return (
    <div className="h-full flex flex-col border-t overflow-hidden">
      {/* Top Bar / Tabs */}
      <div className="flex items-center justify-between border-b shrink-0 h-9">
        {/* Scrollable Tabs Area */}
        <div className="flex-1 flex items-center pr-1 pl-0 overflow-x-auto overflow-y-hidden scrollbar-thin mask-image-linear-gradient-to-r h-9 ">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTabChange("testcase")}
            className={`h-9 text-xs gap-2 shrink-0 rounded-none transition-all ${activeTab === "testcase" ? "text-foreground bg-muted/50 border-b-2 border-primary" : "text-muted-foreground border-b-2 border-transparent"}`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            Testcase
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTabChange("result")}
            className={`h-9 text-xs gap-2 shrink-0 rounded-none transition-all ${activeTab === "result" ? "text-foreground bg-muted/50 border-b-2 border-primary" : "text-muted-foreground border-b-2 border-transparent"}`}
            disabled={!output}
          >
            <Terminal className="w-3.5 h-3.5" />
            Test Result
          </Button>
        </div>

        {/* Fixed Right Actions */}
        <div className="flex items-center pr-1 shrink-0 bg-background/50 h-full shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)] z-10">
          {onOpenRulo && (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onOpenRulo}
                    className="h-9 w-9 text-amber-500 hover:text-amber-600 hover:bg-amber-500/10 rounded-none border-l border-border/50"
                    title="Ask Rulo"
                  >
                    <Sparkles className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ask Rulo</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {onMaximize && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMaximize}
              className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-none border-l border-border/50"
              title={isMaximized ? "Restore to panel" : "Maximize output"}
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </div>
      {/* TABS content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        {/* TESTCASE TAB */}
        {activeTab === "testcase" && (
          <div className="h-full flex flex-col min-h-0 ">
            <Tabs
              value={activeTestCaseTab}
              onValueChange={setActiveTestCaseTab}
              className="flex-1 flex flex-col min-h-0"
            >
              <div className="flex-1 min-h-0">
                <ScrollArea className="h-full" type="always">
                  <div className="flex items-start justify-between bg-background/50 shrink-0 py-1.5 px-2 min-h-[36px]">
                    {/* Scrollable Tabs List */}
                    <ScrollArea className="flex-1 w-full whitespace-nowrap">
                      <div className="flex items-center w-max p-1">
                        <TabsList className="h-9 bg-transparent p-0 flex-nowrap justify-start gap-1 border-none shadow-none">
                          {allTestCases.filter(tc => !tc.isSubmission).map((tc, index) => (
                            <TabsTrigger
                              key={tc.id}
                              value={`case-${tc.id}`}
                              className="text-xs px-2.5 h-7 rounded-full whitespace-nowrap bg-muted/30 border border-black/20 dark:border-white/30 text-black/80 dark:text-white/80 hover:text-black dark:hover:text-white data-[state=active]:bg-primary/15 data-[state=active]:border-primary/20 data-[state=active]:shadow-none data-[state=active]:text-black dark:data-[state=active]:text-white relative group shrink-0 transition-all font-medium"
                            >
                              {tc.isCustom ? `Case ${index + 1}` : `Case ${index + 1}`}
                              {/* Delete button for all cases */}
                              <div
                                className="ml-2 -mr-1.5 hover:bg-primary/20 rounded-full p-1 cursor-pointer opacity-60 hover:opacity-100 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteTestCase(tc.id);
                                }}
                              >
                                <X className="w-3.5 h-3.5" />
                              </div>
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        
                        <FeatureGuard flag="custom_test_case_addtion">
                          {controls?.add_test_case !== false && (
                            <div className="flex items-center pl-2 shrink-0">
                              <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={onAddTestCase}
                                      className="h-7 w-7 rounded-full bg-muted/30 border border-black/20 dark:border-white/30 hover:bg-muted text-foreground/70 hover:text-foreground transition-colors ml-1"
                                      disabled={loading}
                                    >
                                      <Plus className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Add Custom Test Case</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          )}
                        </FeatureGuard>
                      </div>
                      <ScrollBar orientation="horizontal" className="h-1.5" />
                    </ScrollArea>
                  </div>

                  {allTestCases.filter(tc => !tc.isSubmission).map((tc) => {
                    const isFrontendProblem = algorithmMeta?.problemType === 'frontend' || algorithmMeta?.problem_type === 'frontend';
                    return (
                    <TabsContent key={tc.id} value={`case-${tc.id}`} className="h-full m-0 p-4">
                      <div className="relative">
                        {isFrontendProblem ? (
                          <div className="space-y-4">
                            <div className="text-sm font-medium text-muted-foreground">{tc.name || tc.description || `Case ${tc.id}`}</div>
                            <div className="p-3 bg-muted/30 border rounded-md font-mono text-xs overflow-x-auto whitespace-pre">
                              {tc.testCode || tc.test_code || '// No test code available'}
                            </div>
                          </div>
                        ) : (
                          <TestCaseEditor
                            testCase={tc}
                            inputSchema={inputSchema || []}
                            onSave={(updated) => onUpdateTestCase(tc.id, updated)}
                            onCancel={() => onCancelEdit()}
                            isEditing={editingTestCaseId === tc.id}
                            onEdit={() => onEditTestCase(tc.id)}
                            canEdit={tc.isCustom}
                            controls={algorithmMeta?.controls || controls}
                          />
                        )}
                      </div>
                    </TabsContent>
                  )})}
                </ScrollArea>
              </div>
            </Tabs>
          </div>
        )}

        {/* TEST RESULT TAB */}
        {activeTab === "result" && output && (
          <div className="h-full flex flex-col min-h-0">
            {/* Result Header */}
            <div className="p-4 border-b bg-background/50 shrink-0">
              <div className={`text-lg font-semibold flex items-center gap-3 ${getStatusColor(output.status?.id, output.testResults)}`}>
                {loading ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Running Tests...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>{getStatusText(output.status?.id, output.status?.description, output.testResults)}</span>

                    {/* Debug/Info: Show In-Place Status */}
                    {(() => {
                      const meta = algorithmMeta?.metadata;
                      const isInPlace = !!((algorithmMeta as any)?.return_modified_input || (typeof meta === 'object' && meta?.return_modified_input));

                      if (isInPlace) {
                        return (
                          <span className="text-[10px] font-normal border border-blue-200 bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            In-Place
                          </span>
                        );
                      }
                      return null;
                    })()}

                    {executionTime !== null && (
                      <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {executionTime} ms
                      </span>
                    )}

                    {memoryUsage !== null && (
                      <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded-full flex items-center gap-1">
                        <Terminal className="w-3 h-3" />
                        {formatMemory(memoryUsage)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Scrollable content area */}
            <div className="flex-1 min-h-0">
              {/* Compilation/Runtime Error */}
              {(output.status?.id === 6 || (output.stderr && !output.testResults)) && (
                <div className="p-4 h-full min-h-0">
                  <div className="w-full h-full rounded-lg bg-red-50 border border-red-100 text-red-800 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400 font-mono text-sm overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-y-auto p-4 whitespace-pre-wrap">
                      {output.compile_output || output.stderr || output.message}
                    </div>
                  </div>
                </div>
              )}

              {/* Global Stdout */}
              {output.globalLogs && (
                <div className="p-4 border-b shrink-0">
                  <div className="text-xs font-semibold text-muted-foreground tracking-wider mb-2">Global Stdout</div>
                  <div className="p-3 rounded-md bg-muted/30 border font-mono text-sm whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {output.globalLogs}
                  </div>
                </div>
              )}

              {/* Test Results */}
              {output.testResults && (
                <div className="h-full flex flex-col min-h-0">
                  <Tabs value={activeResultTab} onValueChange={setActiveResultTab} className="flex-1 flex flex-col min-h-0">
                    <div className="flex border-b bg-background/50 shrink-0 sticky top-0 z-10 py-1.5 px-2 items-start w-full min-h-[36px]">
                      <ScrollArea className="flex-1 w-full whitespace-nowrap">
                        <div className="flex w-max p-1">
                          <TabsList className="h-9 bg-transparent p-0 flex-nowrap justify-start gap-1 border-none shadow-none">
                            {output.testResults.map((result: any, index: number) => (
                              <TabsTrigger
                                key={index}
                                value={`result-${index}`}
                                className={`text-xs px-2.5 h-7 rounded-full whitespace-nowrap gap-1 shadow-none transition-all font-medium bg-muted/30 border border-black/20 dark:border-white/30 text-black/80 dark:text-white/80 hover:text-black dark:hover:text-white data-[state=active]:bg-primary/15 data-[state=active]:text-black dark:data-[state=active]:text-white data-[state=active]:shadow-none data-[state=active]:border-primary/20`}
                              >
                              {result.status === 'pass' ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-500" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-500" />
                              )}
                              <span>
                                Case {index + 1}
                              </span>
                              {/* Show tooltip or small indicator if description exists */}
                              {(() => {
                                // Resolve test case from executed list if available, else allTestCases (fallback/legacy)
                                // Note: result index matches executedTestCases index
                                const tc = executedTestCases ? executedTestCases[index] : allTestCases[index];
                                return tc?.description && (
                                  <span className="ml-2 text-[10px] text-muted-foreground/70 hidden sm:inline-block truncate max-w-[100px]">
                                    {/* - {tc.description} */}
                                  </span>
                                );
                              })()}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        </div>
                        <ScrollBar orientation="horizontal" className="h-1.5" />
                      </ScrollArea>
                    </div>
                    <ScrollArea className="h-full" type="always">
                      <div className="p-4">
                        {output.testResults.map((result: any, index: number) => {
                          const isFrontendProblem = algorithmMeta?.problemType === 'frontend' || algorithmMeta?.problem_type === 'frontend';

                          if (isFrontendProblem) {
                            return (
                              <TabsContent key={index} value={`result-${index}`} className="m-0 space-y-6">
                                <div className="space-y-4">
                                  {result.testCode && (
                                    <div className="p-4 rounded-lg bg-muted/30 border font-mono text-sm text-foreground whitespace-pre-wrap break-words leading-relaxed">
                                      {result.testCode}
                                    </div>
                                  )}

                                  {result.logs && result.logs.length > 0 && (
                                    <div className="space-y-2">
                                      <div className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Stdout</div>
                                      <div className="p-3 rounded-md bg-muted/30 border font-mono text-sm whitespace-pre-wrap">
                                        {Array.isArray(result.logs) ? result.logs.join('\n') : result.logs}
                                      </div>
                                    </div>
                                  )}

                                  {result.status !== 'pass' && result.error && (
                                    <div className="space-y-2">
                                      <div className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Error Details</div>
                                      <div className="p-3 rounded-md bg-red-500/5 border border-red-500/10 font-mono text-[13px] text-red-600 dark:text-red-400 whitespace-pre-wrap break-words overflow-x-auto">
                                        {result.error}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </TabsContent>
                            );
                          }

                          return (
                            <TabsContent key={index} value={`result-${index}`} className="m-0 space-y-6">
                              {/* Input */}
                              <div className="space-y-2">
                              <div className="text-xs font-semibold text-muted-foreground  tracking-wider">Input</div>
                              <div className="p-3 rounded-md bg-muted/30 border font-mono text-sm">
                                {(() => {
                                  const tc = executedTestCases ? executedTestCases[index] : allTestCases[index];

                                  // Don't hide submission cases as per user request
                                  // const isHidden = tc?.isSubmission; 
                                  // if (isHidden) return "Hidden Test Case";

                                  // Fallback to original test case input if result input is missing
                                  const inputData = result.input !== undefined ? result.input : tc?.input;

                                  const metadata = typeof algorithmMeta?.metadata === 'string'
                                    ? JSON.parse(algorithmMeta.metadata)
                                    : (algorithmMeta?.metadata || {});
                                  const isClassMode = !!metadata.class_mode;

                                  if (isClassMode && Array.isArray(inputData)) {
                                    return (
                                      <div className="space-y-2">
                                        <div className="flex flex-col gap-1">
                                          <div className="flex gap-2 text-[11px]">
                                            <span className="text-muted-foreground font-bold select-none shrink-0 tracking-tighter">METHODS</span>
                                            <span className="text-blue-600 dark:text-blue-400 break-all">{JSON.stringify(inputData[0])}</span>
                                          </div>
                                        </div>
                                        <div className="flex flex-col gap-1 border-t pt-1">
                                          <div className="flex gap-2 text-[11px]">
                                            <span className="text-muted-foreground font-bold select-none shrink-0 tracking-tighter">ARGS</span>
                                            <span className="text-orange-600 dark:text-orange-400 break-all">{JSON.stringify(inputData[1])}</span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }

                                  if (inputSchema && inputSchema.length > 0 && Array.isArray(inputData)) {
                                    return (
                                      <div className="space-y-1">
                                        {inputSchema.map((field, i) => {
                                          const val = inputData[i];
                                          const isSqlProblem = algorithmMeta?.problemType === 'sql' || algorithmMeta?.problem_type === 'sql' || algorithmMeta?.problem_type === 'SQL' || algorithmMeta?.problemType === 'SQL';
                                          
                                          let sqlTableData: any[] | null = null;
                                          if (isSqlProblem) {
                                            if (Array.isArray(val)) {
                                              sqlTableData = val;
                                            } else if (val && typeof val === 'object') {
                                              const vals = Object.values(val);
                                              if (vals.length > 0 && Array.isArray(vals[0])) {
                                                sqlTableData = vals[0] as any[];
                                              }
                                            }
                                          }
                                          
                                          return (
                                            <div key={i} className="flex flex-col gap-1 mb-2">
                                              {sqlTableData ? (
                                                <>
                                                  <div className="flex gap-2">
                                                    <span className="text-muted-foreground select-none font-semibold">{field.name}:</span>
                                                  </div>
                                                  <JsonTableDisplay data={sqlTableData} preferredHeaders={getPreferredHeaders(field.name, sqlSchemas)} />
                                                </>
                                              ) : (
                                              <div className="flex gap-2">
                                                <span className="text-muted-foreground select-none">{field.name}:</span>
                                                <span>{(() => {
                                                  if (isTreeType(field.type)) {
                                                    const treeArr = parseTreeValue(val);
                                                    if (treeArr) return JSON.stringify(treeArr);
                                                  }
                                                  if (isListType(field.type)) {
                                                    const listArr = parseListValue(val);
                                                    if (listArr) return JSON.stringify(listArr);
                                                  }
                                                  return typeof val === 'string' ? val : JSON.stringify(val);
                                                })()}</span>
                                              </div>
                                            )}
                                            {(algorithmMeta?.controls?.visualizations?.tree?.enabled ?? algorithmMeta?.controls?.show_tree_visualization) && algorithmMeta?.controls?.visualizations?.tree?.results_input !== false && isTreeType(field.type) && (
                                              <div className="mt-1">
                                                <TreeDiagram
                                                  data={inputData[i]}
                                                  height={120}
                                                  multiple={algorithmMeta?.controls?.visualizations?.tree?.multiple}
                                                />
                                              </div>
                                            )}
                                            {(isGraphType(field.type) || (algorithmMeta?.controls?.visualizations?.graph?.enabled ?? algorithmMeta?.controls?.show_graph_visualization)) && algorithmMeta?.controls?.visualizations?.graph?.results_input !== false && (
                                              <div className="mt-1">
                                                <GraphDiagram data={inputData[i]} height={120} />
                                              </div>
                                            )}
                                          </div>
                                          );
                                        })}
                                      </div>
                                    );
                                  }
                                  return JSON.stringify(inputData, null, 2);
                                })()}
                              </div>
                            </div>

                            {/* Stdout (if any) */}
                            {result.logs && result.logs.length > 0 && (
                              <div className="space-y-2">
                                <div className="text-xs font-medium text-muted-foreground">Stdout</div>
                                <div className="p-3 rounded-md bg-muted/30 border font-mono text-sm whitespace-pre-wrap">
                                  {Array.isArray(result.logs) ? result.logs.join('\n') : result.logs}
                                </div>
                              </div>
                            )}

                            {/* Output */}
                            <div className="space-y-2">
                              <div className="text-xs font-semibold text-muted-foreground  tracking-wider">Output</div>
                              <div className="p-3 rounded-md bg-muted/30 border font-mono text-sm">
                                {(() => {
                                  const tc = executedTestCases ? executedTestCases[index] : allTestCases[index];
                                  const actual = result.actual;

                                  const metadata = typeof algorithmMeta?.metadata === 'string'
                                    ? JSON.parse(algorithmMeta.metadata)
                                    : (algorithmMeta?.metadata || {});
                                  const isClassMode = !!metadata.class_mode;

                                  if (isClassMode && Array.isArray(actual)) {
                                    return (
                                      <div className="space-y-1 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                        {actual.map((val, i) => (
                                          <div key={i} className="flex gap-2 text-[11px] leading-tight">
                                            <span className="text-muted-foreground w-4 shrink-0 text-right">{i}:</span>
                                            <span className="text-foreground break-all">{val === null ? "null" : JSON.stringify(val)}</span>
                                          </div>
                                        ))}
                                      </div>
                                    );
                                  }

                                  const isSqlProblem = algorithmMeta?.problemType === 'sql' || algorithmMeta?.problem_type === 'sql' || algorithmMeta?.problem_type === 'SQL' || algorithmMeta?.problemType === 'SQL';
                                  if (isSqlProblem) {
                                    if (typeof actual === 'string') {
                                      return <SqlTableDisplay rawText={actual} />;
                                    } else if (Array.isArray(actual)) {
                                      return <JsonTableDisplay data={actual} />;
                                    }
                                  }

                                  const treeArr = actual !== undefined ? parseTreeValue(actual) : null;
                                  const listArr = actual !== undefined ? parseListValue(actual) : null;
                                  const content = actual === undefined ? "void / undefined" : JSON.stringify(treeArr || listArr || actual, null, 2);
                                  return (
                                    <div className="space-y-3">
                                      <div>{content}</div>
                                      {(algorithmMeta?.controls?.visualizations?.tree?.enabled ?? algorithmMeta?.controls?.show_tree_visualization) && algorithmMeta?.controls?.visualizations?.tree?.results_output !== false && actual !== undefined && actual !== null && (
                                        <TreeDiagram
                                          data={actual}
                                          height={120}
                                          multiple={algorithmMeta?.controls?.visualizations?.tree?.multiple}
                                        />
                                      )}
                                      {(isGraphType(inputSchema?.[0]?.type) || (algorithmMeta?.controls?.visualizations?.graph?.enabled ?? algorithmMeta?.controls?.show_graph_visualization)) && algorithmMeta?.controls?.visualizations?.graph?.results_output !== false && actual !== undefined && actual !== null && (
                                        <GraphDiagram data={actual} height={120} />
                                      )}
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>

                            {/* Expected */}
                            {result.expected !== undefined && (
                              <div className="space-y-2">
                                <div className="text-xs font-semibold text-muted-foreground  tracking-wider">Expected Output</div>
                                <div className="p-3 rounded-md bg-muted/30 border font-mono text-sm">
                                  {(() => {
                                    const metadata = typeof algorithmMeta?.metadata === 'string'
                                      ? JSON.parse(algorithmMeta.metadata)
                                      : (algorithmMeta?.metadata || {});
                                    const isClassMode = !!metadata.class_mode;

                                    if (isClassMode && Array.isArray(result.expected)) {
                                      return (
                                        <div className="space-y-1 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                          {result.expected.map((val: any, i: number) => (
                                            <div key={i} className="flex gap-2 text-[11px] leading-tight">
                                              <span className="text-muted-foreground w-4 shrink-0 text-right">{i}:</span>
                                              <span className="text-foreground break-all">{val === null ? "null" : JSON.stringify(val)}</span>
                                            </div>
                                          ))}
                                        </div>
                                      );
                                    }

                                    const isSqlProblem = algorithmMeta?.problemType === 'sql' || algorithmMeta?.problem_type === 'sql' || algorithmMeta?.problem_type === 'SQL' || algorithmMeta?.problemType === 'SQL';
                                    
                                    if (isSqlProblem) {
                                      let parsedExpected = result.expected;
                                      if (typeof result.expected === 'string') {
                                        try {
                                          const parsed = JSON.parse(result.expected);
                                          if (Array.isArray(parsed)) {
                                            parsedExpected = parsed;
                                          }
                                        } catch (e) {
                                          // Not a JSON array string
                                        }
                                      }
                                      
                                      if (Array.isArray(parsedExpected)) {
                                        let actualHeaders: string[] = [];
                                        if (Array.isArray(result.actual) && result.actual.length > 0) {
                                          actualHeaders = Object.keys(result.actual[0]);
                                        }
                                        return <JsonTableDisplay data={parsedExpected} preferredHeaders={actualHeaders} />;
                                      } else if (typeof result.expected === 'string') {
                                        return <SqlTableDisplay rawText={result.expected} />;
                                      }
                                    }

                                    const listArr = result.expected !== undefined ? parseListValue(result.expected) : null;
                                    const content = JSON.stringify(parseTreeValue(result.expected) || listArr || result.expected, null, 2);
                                    return (
                                      <div className="space-y-3">
                                        <div>{content}</div>
                                        {(algorithmMeta?.controls?.visualizations?.tree?.enabled ?? algorithmMeta?.controls?.show_tree_visualization) && algorithmMeta?.controls?.visualizations?.tree?.results_output !== false && (
                                          <TreeDiagram
                                            data={result.expected}
                                            height={120}
                                            multiple={algorithmMeta?.controls?.visualizations?.tree?.multiple}
                                          />
                                        )}
                                        {(isGraphType(inputSchema?.[0]?.type) || (algorithmMeta?.controls?.visualizations?.graph?.enabled ?? algorithmMeta?.controls?.show_graph_visualization)) && algorithmMeta?.controls?.visualizations?.graph?.results_output !== false && (
                                          <GraphDiagram data={result.expected} height={120} />
                                        )}
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>
                            )}

                            {/* Diff (for failed cases) */}
                            {result.status !== 'pass' && result.expected !== undefined && (
                              <div className="space-y-2">
                                <div className="text-xs font-medium text-destructive flex items-center gap-2">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>Comparison (Expected vs Actual)</span>
                                </div>
                                <div className="p-3 rounded-md bg-muted/10 border border-destructive/20 overflow-hidden">
                                  <DiffView expected={result.expected} actual={result.actual} />
                                  <div className="mt-3 flex gap-4 text-[10px] text-muted-foreground border-t pt-2 border-muted">
                                    <div className="flex items-center gap-1">
                                      <div className="w-2 h-2 bg-red-500/20 border border-red-500/50"></div>
                                      <span>Expected but missing</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <div className="w-2 h-2 bg-green-500/20 border border-green-500/50"></div>
                                      <span>Found but not expected</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Error Message */}
                            {result.error && (
                              <div className="space-y-2">
                                <div className="text-xs font-medium text-destructive">Error</div>
                                <div className="p-3 rounded-md bg-red-50 border border-red-100 font-mono text-sm text-red-800 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400 whitespace-pre-wrap">
                                  {result.error}
                                </div>
                              </div>
                            )}
                          </TabsContent>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </Tabs>
                </div>
              )}
            </div>
          </div>
        )}



        {/* Empty State / Loading for Result Tab */}
        {activeTab === "result" && !output && !loading && !submitting && (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <div className="text-sm">Run the code to see results</div>
          </div>
        )}

        {(loading || submitting) && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex flex-col items-center justify-center z-10">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Terminal className="w-5 h-5 text-primary animate-pulse" />
              </div>
            </div>
            <div className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">
              {submitting ? "Submitting Solution..." : "Running Code..."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

OutputPanel.displayName = 'OutputPanel';
