"use client";

import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ReactFlow,
  Handle,
  Position,
  MarkerType,
  ReactFlowProvider,
  useReactFlow,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useTheme } from "next-themes";
import { slugifyCategory } from "@/constants/categories";
import { cn } from "@/lib/utils";

export interface TopicStat {
  topic: string;
  solved: number;
  total: number;
  percentage: number;
}

interface TopicNodeData extends Record<string, unknown> {
  label: string;
  solved: number;
  total: number;
  percentage: number;
  hasIncoming: boolean;
  hasOutgoing: boolean;
  onSelect: (topic: string) => void;
}

type TopicFlowNode = Node<TopicNodeData, "topic">;

const TopicNodeComponent = memo(({ data }: NodeProps<TopicFlowNode>) => {
  const {
    label,
    solved,
    total,
    percentage,
    hasIncoming,
    hasOutgoing,
    onSelect,
  } = data;
  const hasProgress = percentage > 0;
  const href = `/dsa/query?topic=${slugifyCategory(label)}`;

  return (
    <Link
      href={href}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(label);
      }}
      className={cn(
        "nodrag nopan group relative block w-[210px] rounded-xl px-3.5 py-2.5 text-left transition-colors duration-150 cursor-pointer select-none pointer-events-auto",
        "bg-white dark:bg-zinc-900/95 border border-zinc-200/90 dark:border-zinc-800/90",
        "hover:border-zinc-400 dark:hover:border-zinc-500",
        "shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.4)]"
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={false}
        className={cn(
          "!w-1.5 !h-1.5 !min-w-0 !min-h-0 !-top-[4px] !rounded-full !border-0 pointer-events-none",
          hasIncoming ? "!bg-zinc-400 dark:!bg-zinc-600" : "opacity-0"
        )}
      />

      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[12.5px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
          {label}
        </span>
        <span
          className={cn(
            "text-[11px] font-semibold tabular-nums shrink-0",
            hasProgress
              ? "text-primary"
              : "text-zinc-400 dark:text-zinc-500"
          )}
        >
          {percentage}%
        </span>
      </div>

      {/* Status bar */}
      <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>

      {total > 0 && (
        <div className="mt-1.5 flex items-center justify-between text-[10px] text-zinc-400 dark:text-zinc-500 font-medium tabular-nums">
          <span>
            {solved}/{total} solved
          </span>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={false}
        className={cn(
          "!w-1.5 !h-1.5 !min-w-0 !min-h-0 !-bottom-[4px] !rounded-full !border-0 pointer-events-none",
          hasOutgoing ? "!bg-zinc-400 dark:!bg-zinc-600" : "opacity-0"
        )}
      />
    </Link>
  );
});

TopicNodeComponent.displayName = "TopicNodeComponent";

const NODE_TYPES = {
  topic: TopicNodeComponent,
};

const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  // Row 0 (1 node)
  "Arrays & Hashing": { x: 0, y: 0 },
  // Row 1 (2 nodes)
  "Two Pointers": { x: -180, y: 140 },
  "Stack": { x: 180, y: 140 },
  // Row 2 (3 nodes)
  "Sliding Window": { x: -270, y: 280 },
  "Binary Search": { x: 0, y: 280 },
  "Linked List": { x: 270, y: 280 },
  // Row 3 (1 node)
  "Trees": { x: 0, y: 420 },
  // Row 4 (2 nodes)
  "Heap / Priority Queue": { x: -180, y: 560 },
  "Backtracking": { x: 180, y: 560 },
  // Row 5 (3 nodes)
  "Greedy": { x: -270, y: 700 },
  "Graphs": { x: 0, y: 700 },
  "Dynamic Programming": { x: 270, y: 700 },
};

// Symmetrical, non-crossing orthogonal tree connections
const TOPIC_CONNECTIONS: Array<[string, string]> = [
  // Row 0 -> Row 1
  ["Arrays & Hashing", "Two Pointers"],
  ["Arrays & Hashing", "Stack"],
  // Row 1 -> Row 2
  ["Two Pointers", "Sliding Window"],
  ["Two Pointers", "Binary Search"],
  ["Stack", "Binary Search"],
  ["Stack", "Linked List"],
  // Row 2 -> Row 3
  ["Sliding Window", "Trees"],
  ["Binary Search", "Trees"],
  ["Linked List", "Trees"],
  // Row 3 -> Row 4
  ["Trees", "Heap / Priority Queue"],
  ["Trees", "Backtracking"],
  // Row 4 -> Row 5
  ["Heap / Priority Queue", "Greedy"],
  ["Heap / Priority Queue", "Graphs"],
  ["Backtracking", "Graphs"],
  ["Backtracking", "Dynamic Programming"],
];

const INCOMING_SET = new Set(TOPIC_CONNECTIONS.map(([, target]) => target));
const OUTGOING_SET = new Set(TOPIC_CONNECTIONS.map(([source]) => source));

// Precompute adjacency list for downstream edges below hovered node
const CHILDREN_MAP: Record<string, string[]> = {};
for (const [source, target] of TOPIC_CONNECTIONS) {
  if (!CHILDREN_MAP[source]) CHILDREN_MAP[source] = [];
  CHILDREN_MAP[source].push(target);
}

function getDownstreamEdges(startTopic: string | null): Set<string> {
  const downstreamEdges = new Set<string>();
  if (!startTopic) return downstreamEdges;

  const visited = new Set<string>();
  const queue: string[] = [startTopic];
  while (queue.length > 0) {
    const current = queue.shift()!;
    const children = CHILDREN_MAP[current] || [];
    for (const child of children) {
      downstreamEdges.add(`${current}->${child}`);
      if (!visited.has(child)) {
        visited.add(child);
        queue.push(child);
      }
    }
  }
  return downstreamEdges;
}

interface TopicTreeFlowInnerProps {
  statsMap: Record<string, TopicStat>;
  onSelectTopic: (topic: string) => void;
}

function TopicTreeFlowInner({
  statsMap,
  onSelectTopic,
}: TopicTreeFlowInnerProps) {
  const { resolvedTheme } = useTheme();
  const { fitView } = useReactFlow();
  const isDark = resolvedTheme === "dark";
  const [hoveredTopic, setHoveredTopic] = useState<string | null>(null);

  // Nodes do NOT depend on hoveredTopic so they never re-measure or wobble on hover
  const nodes: TopicFlowNode[] = useMemo(() => {
    return Object.entries(NODE_POSITIONS).map(([topic, pos]) => {
      const stat = statsMap[topic] || {
        topic,
        solved: 0,
        total: 0,
        percentage: 0,
      };
      return {
        id: topic,
        type: "topic",
        position: pos,
        draggable: false,
        selectable: true,
        connectable: false,
        focusable: true,
        data: {
          label: topic,
          solved: stat.solved,
          total: stat.total,
          percentage: stat.percentage,
          hasIncoming: INCOMING_SET.has(topic),
          hasOutgoing: OUTGOING_SET.has(topic),
          onSelect: onSelectTopic,
        },
      };
    });
  }, [statsMap, onSelectTopic]);

  const downstreamEdges = useMemo(
    () => getDownstreamEdges(hoveredTopic),
    [hoveredTopic]
  );

  const edges: Edge[] = useMemo(() => {
    const baseStroke = isDark ? "#3f3f46" : "#cbd5e1";
    const activeStroke = isDark ? "#d4d4d8" : "#18181b";

    return TOPIC_CONNECTIONS.map(([source, target]) => {
      const edgeId = `${source}->${target}`;
      const isDownstream = downstreamEdges.has(edgeId);
      const strokeColor = isDownstream ? activeStroke : baseStroke;

      return {
        id: edgeId,
        source,
        target,
        type: "smoothstep",
        animated: isDownstream,
        pathOptions: {
          borderRadius: 12,
        },
        selectable: false,
        focusable: false,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 13,
          height: 13,
          color: strokeColor,
        },
        style: {
          stroke: strokeColor,
          strokeWidth: 1.5,
        },
      };
    });
  }, [isDark, downstreamEdges]);

  const handleInit = useCallback(() => {
    fitView({ padding: 0.05, duration: 0 });
  }, [fitView]);

  const handleNodeMouseEnter = useCallback(
    (_: React.MouseEvent, node: TopicFlowNode) => {
      setHoveredTopic(node.data.label);
    },
    []
  );

  const handleNodeMouseLeave = useCallback(() => {
    setHoveredTopic(null);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      fitView({ padding: 0.05, duration: 0 });
    };
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [fitView]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={NODE_TYPES}
      nodeOrigin={[0.5, 0]}
      onInit={handleInit}
      onNodeClick={(_, node) => onSelectTopic(node.data.label)}
      onNodeMouseEnter={handleNodeMouseEnter}
      onNodeMouseLeave={handleNodeMouseLeave}
      zoomOnScroll={false}
      zoomOnPinch={false}
      zoomOnDoubleClick={false}
      panOnDrag={false}
      panOnScroll={false}
      preventScrolling={false}
      nodesDraggable={false}
      nodesConnectable={false}
      edgesFocusable={false}
      proOptions={{ hideAttribution: true }}
      className="!bg-transparent"
    />
  );
}

export interface TopicTreeFlowProps {
  statsMap: Record<string, TopicStat>;
  onSelectTopic: (topic: string) => void;
}

export default function TopicTreeFlow({
  statsMap,
  onSelectTopic,
}: TopicTreeFlowProps) {
  return (
    <div className="w-full h-[640px] sm:h-[780px] relative overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/60">
      {/* Subtle radial dot pattern matching design language */}
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <ReactFlowProvider>
        <TopicTreeFlowInner
          statsMap={statsMap}
          onSelectTopic={onSelectTopic}
        />
      </ReactFlowProvider>
    </div>
  );
}
