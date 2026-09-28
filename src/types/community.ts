// Types for Community Solutions and Discussions features

export interface CommunityProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
}

// ─── Community Solutions ──────────────────────────────────────────────────────

export interface CommunitySolution {
  id: string;
  algorithm_id: string;
  user_id: string;
  title: string;
  explanation: string;
  /** Multi-language code map: { python: "...", javascript: "..." } */
  code: Record<string, string>;
  /** Primary display language */
  language: string;
  upvotes: number;
  created_at: string;
  updated_at: string;
  /** Joined from profiles via Supabase query */
  profiles?: CommunityProfile | null;
  /** Whether the current user has already voted (resolved client-side) */
  hasVoted?: boolean;
}

export interface NewCommunitySolution {
  algorithm_id: string;
  title: string;
  explanation: string;
  code: Record<string, string>;
  language: string;
}

// ─── Discussions ──────────────────────────────────────────────────────────────

export interface Discussion {
  id: string;
  algorithm_id: string;
  user_id: string;
  parent_id: string | null;
  depth: number;
  content: string;
  upvotes: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  profiles?: CommunityProfile | null;
  hasVoted?: boolean;
}

/** Tree node used by the recursive DiscussionThread component */
export interface DiscussionNode extends Discussion {
  replies: DiscussionNode[];
}

export interface NewDiscussion {
  algorithm_id: string;
  parent_id: string | null;
  depth: number;
  content: string;
}

// Helper: build a DiscussionNode tree from a flat list
export function buildDiscussionTree(flat: Discussion[]): DiscussionNode[] {
  const nodeMap = new Map<string, DiscussionNode>();
  flat.forEach((d) => nodeMap.set(d.id, { ...d, replies: [] }));

  const roots: DiscussionNode[] = [];
  nodeMap.forEach((node) => {
    if (node.parent_id && nodeMap.has(node.parent_id)) {
      nodeMap.get(node.parent_id)!.replies.push(node);
    } else {
      roots.push(node);
    }
  });

  // Sort children by created_at ascending at each level
  const sortChildren = (nodes: DiscussionNode[]) => {
    nodes.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    nodes.forEach((n) => sortChildren(n.replies));
  };
  sortChildren(roots);

  return roots;
}
