import { content as linkedListContent } from "./guides/linked-list";
import { content as treesContent } from "./guides/trees";
import { content as trieContent } from "./guides/trie";
import { content as graphsContent } from "./guides/graphs";
import { content as arraysHashingContent } from "./guides/arrays-hashing";
import { content as twoPointersContent } from "./guides/two-pointers";
import { content as frequencyCounterContent } from "./guides/frequency-counter";
import { content as slidingWindowContent } from "./guides/sliding-window";
import { content as stackContent } from "./guides/stack";
import { content as binarySearchContent } from "./guides/binary-search";
import { content as recursionContent } from "./guides/recursion";
import { content as backtrackingContent } from "./guides/backtracking";
import { content as coreDataStructuresContent } from "./guides/core-data-structures";
import { content as mergeIntervalsContent } from "./guides/merge-intervals";
import { content as prefixSumContent } from "./guides/prefix-sum";
import { content as dynamicProgrammingContent } from "./guides/dynamic-programming";
import { content as cyclicSortContent } from "./guides/cyclic-sort";
import { content as mergeSortContent } from "./guides/merge-sort";
import { content as whatIsDatabaseContent } from "./guides/what-is-database";
import { content as typesOfDatabasesContent } from "./guides/types-of-databases";
import { content as databaseTerminologyContent } from "./guides/database-terminology";
import { content as fastSlowPointersContent } from "./guides/fast-slow-pointers";
import { content as greedyContent } from "./guides/greedy";
import { content as bfsDfsContent } from "./guides/bfs-dfs";
import { content as relationalDatabasesRdbmsContent } from "./guides/relational-databases-rdbms";
import { content as tablesRowsColumnsContent } from "./guides/tables-rows-columns";
import { content as primaryKeysForeignKeysContent } from "./guides/primary-keys-foreign-keys";
import { content as constraintsContent } from "./guides/constraints";
import { content as normalizationContent } from "./guides/normalization";
import { content as denormalizationContent } from "./guides/denormalization";
import { content as databaseRelationshipsContent } from "./guides/database-relationships";
import { content as erDiagramsContent } from "./guides/er-diagrams";
import { content as indexesFundamentalsContent } from "./guides/indexes-fundamentals";
import { content as sqlBasicsContent } from "./guides/sql-basics";
import { content as selectFilteringContent } from "./guides/select-filtering";
import { content as sortingLimitingContent } from "./guides/sorting-limiting";
import { content as aggregateFunctionsContent } from "./guides/aggregate-functions";
import { content as groupbyHavingContent } from "./guides/groupby-having";
import { content as joinsContent } from "./guides/joins";
import { content as subqueriesContent } from "./guides/subqueries";
import { content as ctesContent } from "./guides/ctes";
import { content as caseExpressionsContent } from "./guides/case-expressions";
import { content as nullHandlingContent } from "./guides/null-handling";
import { content as windowFunctionsContent } from "./guides/window-functions";
import { content as rankingFunctionsContent } from "./guides/ranking-functions";
import { content as runningTotalsMovingAggregatesContent } from "./guides/running-totals-moving-aggregates";
import { content as setOperationsContent } from "./guides/set-operations";
import { content as recursiveCtesContent } from "./guides/recursive-ctes";
import { content as viewsContent } from "./guides/views";
import { content as storedProceduresFunctionsContent } from "./guides/stored-procedures-functions";
import { content as triggersContent } from "./guides/triggers";
import { content as transactionsSqlContent } from "./guides/transactions-sql";
import { content as sqlQueryOptimizationContent } from "./guides/sql-query-optimization";
import { content as howDatabaseIndexesWorkContent } from "./guides/how-database-indexes-work";
import { content as btreeBplusTreeIndexesContent } from "./guides/btree-bplus-tree-indexes";
import { content as hashIndexesContent } from "./guides/hash-indexes";
import { content as clusteredNonClusteredIndexesContent } from "./guides/clustered-non-clustered-indexes";
import { content as queryExecutionPlansContent } from "./guides/query-execution-plans";
import { content as databaseStoragePagesContent } from "./guides/database-storage-pages";
import { content as bufferPoolCachingContent } from "./guides/buffer-pool-caching";
import { content as concurrencyLockingContent } from "./guides/concurrency-locking";
import { content as mvccContent } from "./guides/mvcc";
import { content as acidPropertiesContent } from "./guides/acid-properties";
import { content as transactionIsolationLevelsContent } from "./guides/transaction-isolation-levels";
import { content as deadlocksContent } from "./guides/deadlocks";
import { content as databaseReplicationContent } from "./guides/database-replication";
import { content as readReplicasContent } from "./guides/read-replicas";
import { content as databasePartitioningContent } from "./guides/database-partitioning";
import { content as databaseShardingContent } from "./guides/database-sharding";
import { content as capTheoremContent } from "./guides/cap-theorem";
import { content as consistencyModelsContent } from "./guides/consistency-models";
import { content as nosqlDatabasesContent } from "./guides/nosql-databases";
import { content as databaseScalingHighAvailabilityContent } from "./guides/database-scaling-high-availability";
import { content as introductionToSystemDesignContent } from "./guides/introduction-to-system-design";
import { content as deliveryFrameworkContent } from "./guides/delivery-framework";
import { content as coreConceptsContent } from "./guides/core-concepts";
import { content as keyTechnologiesContent } from "./guides/key-technologies";
import { content as commonPatternsContent } from "./guides/common-patterns";
import { content as networkingContent } from "./guides/networking";
import { content as apiDesignContent } from "./guides/api-design";
import { content as dataModelingContent } from "./guides/data-modeling";
import { content as cachingContent } from "./guides/caching";
import { content as shardingContent } from "./guides/sharding";
import { content as consistentHashingContent } from "./guides/consistent-hashing";


export interface RelatedQuestion {
  id: string;
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface GuideItem {
  slug: string;
  title: string;
  description: string;
  category: string;
  content: string; // Markdown content
  questions: RelatedQuestion[];
  visualizations?: string[]; // mapped to visualizationMapping.tsx
  videoUrl?: string;
  heroImage?: string;
  author?: {
    name: string;
    role: string;
    avatarUrl?: string;
    linkedin?: string;
  };
}

export interface GuideCategory {
  id: string;
  title: string;
  guides: GuideItem[];
}

export const guidesData: GuideCategory[] = [
  {
    id: "time-complexity",
    title: "Time Complexity",
    guides: [
      {
        slug: "time-complexity",
        title: "Time Complexity Cheat Sheet",
        description: "A quick reference guide for common operation complexities and Big O rules.",
        category: "time-complexity",
        heroImage: "time-compxity-hero",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: `
# Time Complexity Cheat Sheet

## Overview

Here is an overview of Time and Space complexity, followed by the reference table of standard operations across data structures and algorithms.

### Common Data Structure Operations

| Data Structure | Access / Lookup | Search | Insertion | Deletion |
| :--- | :--- | :--- | :--- | :--- |
| **Array / Vector** | O(1) | O(n) | O(n) (O(1) at end) | O(n) (O(1) at end) |
| **Singly Linked List** | O(n) | O(n) | O(1) (with pointer) | O(1) (with pointer) |
| **Doubly Linked List** | O(n) | O(n) | O(1) | O(1) |
| **Stack (LIFO)** | O(1) (top only) | O(n) | O(1) (push) | O(1) (pop) |
| **Queue (FIFO)** | O(1) (front only) | O(n) | O(1) (enqueue) | O(1) (dequeue) |
| **Hash Table** | O(1) (average) | O(1) (average) | O(1) (average) | O(1) (average) |
| **Binary Search Tree** | O(log n) (avg) / O(n) (worst) | O(log n) (avg) / O(n) (worst) | O(log n) (avg) / O(n) (worst) | O(log n) (avg) / O(n) (worst) |
| **Red-Black Tree / AVL** | O(log n) | O(log n) | O(log n) | O(log n) |

### Common Algorithmic Operations

| Operation / Algorithm | Complexity | Why / Notes |
| :--- | :--- | :--- |
| **Binary Search** | O(log n) | Halves the search space at each iteration. |
| **Heap Push / Pop** | O(log n) | Up-heaping or down-heaping requires traversing heap height. |
| **Sorting (Merge/Quick/Heap)** | O(n log n) | Optimal comparison-based sorting complexity. |
| **Graph DFS / BFS** | O(V + E) | Visits every vertex V and checks every edge E. |
| **Tree Traversal (DFS/BFS)** | O(n) | Visits every node in the tree exactly once. |
| **Matrix Traversal** | O(R × C) | Visits every cell in a grid of dimensions R by C. |

## O(1) - Constant Time

## O(log n) - Logarithmic Time

## O(n) - Linear Time

## O(n log n) - Linearithmic Time

## O(n^2) - Quadratic Time
`,
        questions: [
          { id: "binary-search", name: "Binary Search", difficulty: "Easy" }
        ]
      }
    ]
  },
  {
    id: "space-complexity",
    title: "Space Complexity",
    guides: [
      {
        slug: "space-complexity",
        title: "Space Complexity Cheat Sheet",
        description: "A quick reference guide for common operation space complexities, auxiliary memory, and recursion stack rules.",
        category: "space-complexity",
        heroImage: "space-compxity-hero",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        visualizations: ["binary-search", "reverse-linked-list", "monotonic-stack", "knapsack-01"],
        content: `
# Space Complexity Cheat Sheet

## Overview

Here is an overview of Space Complexity, followed by the reference table of standard space usage across data structures and algorithms.

### Common Data Structure Space Complexity

| Data Structure | Space Complexity | Why / Notes |
| :--- | :--- | :--- |
| **Array / Vector** | O(n) | Storing $N$ elements in contiguous memory. |
| **Singly Linked List** | O(n) | Storing $N$ elements, each node requiring a next pointer. |
| **Doubly Linked List** | O(n) | Storing $N$ elements, each node requiring previous and next pointers. |
| **Stack (LIFO)** | O(n) | Space grows with the maximum number of items pushed onto the stack. |
| **Queue (FIFO)** | O(n) | Space grows with the maximum size of queue at any point. |
| **Hash Table** | O(n) | Requires memory proportional to the number of key-value pairs stored. |
| **Binary Search Tree** | O(n) | Storing $N$ nodes in memory. |
| **Red-Black Tree / AVL** | O(n) | Storing $N$ nodes in memory with balanced tree guarantees. |

### Common Algorithmic Space Complexity

| Operation / Algorithm | Space Complexity | Why / Notes |
| :--- | :--- | :--- |
| **Binary Search** | O(1) | Iterative version requires constant auxiliary space. Recursive version requires O(log n) call stack space. |
| **Merge Sort** | O(n) | Requires auxiliary arrays of size $N$ to merge sub-arrays. |
| **Quick Sort** | O(log n) | Requires O(log n) auxiliary stack space for partition recursion (average). |
| **Graph DFS** | O(V) | Stack memory needed for recursion or iterative stack path in worst case. |
| **Graph BFS** | O(V) | Queue memory needed to hold vertices at the maximum layer width. |
| **Recursion Call Stack** | O(depth) | Memory is proportional to the maximum depth of call stack. |
`,
        questions: [
          { id: "binary-search", name: "Binary Search", difficulty: "Easy" }
        ]
      }
    ]
  },
  {
    id: "fundamentals",
    title: "Fundamentals",
    guides: [
      {
        slug: "core-data-structures",
        title: "Core Data Structures",
        description: "High-level summary of Array, HashMap, Stack, Queue, Heap and when to use them.",
        category: "fundamentals",
        heroImage: "fundamentals-overview",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        visualizations: ["reverse-linked-list", "bfs-level-order", "monotonic-stack", "binary-search", "kth-largest-element-in-a-stream"],
        content: coreDataStructuresContent,
        questions: [
          { id: "two-sum", name: "Two Sum", difficulty: "Easy" },
          { id: "valid-parentheses", name: "Valid Parentheses", difficulty: "Easy" }
        ]
      },
      {
        slug: "linked-list",
        title: "Linked List Guide",
        description: "Master pointers, reversing, and cycle detection in singly and doubly linked lists.",
        category: "fundamentals",
        heroImage: "fundamentals-linked-list",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        visualizations: ["reverse-linked-list", "detect-cycle-in-a-linked-list", "middle-node", "merge-two-sorted-lists"],
        content: linkedListContent,
        questions: [
          { id: "reverse-linked-list", name: "Reverse Linked List", difficulty: "Easy" },
          { id: "detect-cycle-in-a-linked-list", name: "Linked List Cycle", difficulty: "Easy" },
          { id: "merge-two-sorted-lists", name: "Merge Two Sorted Lists", difficulty: "Easy" }
        ]
      },
      {
        slug: "trees",
        title: "Binary Trees & BSTs",
        description: "DFS Traversals, BFS level orders, and Binary Search Tree properties.",
        category: "fundamentals",
        heroImage: "fundamentals-bst",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        visualizations: ["dfs-inorder", "bfs-level-order", "lowest-common-ancestor-of-bst", "bst-insert", "invert-binary-tree"],
        content: treesContent,
        questions: [
          { id: "invert-binary-tree", name: "Invert Binary Tree", difficulty: "Easy" },
          { id: "maximum-depth-of-binary-tree", name: "Maximum Depth of Binary Tree", difficulty: "Easy" },
          { id: "lowest-common-ancestor-of-a-binary-search-tree", name: "Lowest Common Ancestor of a BST", difficulty: "Easy" }
        ]
      },
      {
        slug: "trie",
        title: "Trie (Prefix Tree)",
        description: "Master string prefix queries and autocomplete dictionary structures.",
        category: "fundamentals",
        heroImage: "fundamentals--trie",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        visualizations: ["trie"],
        content: trieContent,
        questions: [
          { id: "implement-trie-prefix-tree", name: "Implement Trie", difficulty: "Medium" },
          { id: "design-add-and-search-words-data-structure", name: "Add and Search Word", difficulty: "Medium" }
        ]
      },
      {
        slug: "graphs",
        title: "Graphs Algorithms",
        description: "Topological sort, cycle detection, DFS/BFS grids, and shortest path basics.",
        category: "fundamentals",
        heroImage: "fundamentals-graph-algorith",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        visualizations: ["graph-dfs", "graph-bfs", "topological-sort", "dijkstras", "number-of-islands"],
        content: graphsContent,
        questions: [
          { id: "number-of-islands", name: "Number of Islands", difficulty: "Medium" },
          { id: "clone-graph", name: "Clone Graph", difficulty: "Medium" },
          { id: "course-schedule", name: "Course Schedule", difficulty: "Medium" }
        ]
      }
    ]
  },
  {
    id: "arrays-hashing",
    title: "Arrays & Hashing",
    guides: [
      {
        slug: "arrays-hashing",
        title: "Arrays & Hashing",
        description: "Learn frequency counting, prefix sums, and element mapping tactics.",
        category: "arrays-hashing",
        heroImage: "core-pattern-arrays",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        visualizations: ["prefix-sum", "top-k-frequent-elements", "rotate-array", "maximum-subarray"],
        content: arraysHashingContent,
        questions: [
          { id: "two-sum", name: "Two Sum", difficulty: "Easy" },
          { id: "valid-anagram", name: "Valid Anagram", difficulty: "Easy" },
          { id: "group-anagrams", name: "Group Anagrams", difficulty: "Medium" },
          { id: "longest-consecutive-sequence", name: "Longest Consecutive Sequence", difficulty: "Medium" }
        ]
      }
    ]
  },
  {
    id: "two-pointers",
    title: "Two Pointers",
    guides: [
      {
        slug: "two-pointers",
        title: "Two Pointers",
        description: "Master opposing pointers, fast-slow pointers, and sorted partition tactics.",
        category: "two-pointers",
        heroImage: "core-pattern-two-pointer",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        visualizations: ["two-pointers", "dutch-national-flag", "container-with-most-water", "trapping-rain-water"],
        content: twoPointersContent,
        questions: [
          { id: "valid-palindrome", name: "Valid Palindrome", difficulty: "Easy" },
          { id: "two-sum-ii-input-array-is-sorted", name: "Two Sum II", difficulty: "Medium" },
          { id: "3sum", name: "3Sum", difficulty: "Medium" },
          { id: "container-with-most-water", name: "Container With Most Water", difficulty: "Medium" }
        ]
      }
    ]
  },
  {
    id: "frequency-counter",
    title: "Frequency Counter",
    guides: [
      {
        slug: "frequency-counter",
        title: "Frequency Counter",
        description: "Master character inventories, count matching, and element frequency caching.",
        category: "frequency-counter",
        heroImage: "core-pattern-frequency-counter",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        visualizations: ["valid-anagram", "top-k-frequent-elements"],
        content: frequencyCounterContent,
        questions: [
          { id: "valid-anagram", name: "Valid Anagram", difficulty: "Easy" },
          { id: "group-anagrams", name: "Group Anagrams", difficulty: "Medium" },
          { id: "top-k-frequent-elements", name: "Top K Frequent Elements", difficulty: "Medium" }
        ]
      }
    ]
  },
  {
    id: "prefix-sum",
    title: "Prefix Sum",
    guides: [
      {
        slug: "prefix-sum",
        title: "Prefix Sum",
        description: "Master the magic diary pattern for instant range queries and subarray sums.",
        category: "prefix-sum",
        heroImage: "prefix-sum",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        visualizations: ["prefix-sum"],
        content: prefixSumContent,
        questions: [
          { id: "product-of-array-except-self", name: "Product of Array Except Self", difficulty: "Medium" },
          { id: "maximum-subarray", name: "Maximum Subarray", difficulty: "Medium" }
        ]
      }
    ]
  },
  {
    id: "sliding-window",
    title: "Sliding Window",
    guides: [
      {
        slug: "sliding-window",
        title: "Sliding Window",
        description: "Master fixed and variable-sized windows to optimize subarray/substring searches.",
        category: "sliding-window",
        heroImage: "core-pattern-slidng-window",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        visualizations: ["sliding-window", "sliding-window-maximum"],
        content: slidingWindowContent,
        questions: [
          { id: "longest-substring-without-repeating-characters", name: "Longest Substring Without Repeating Characters", difficulty: "Medium" },
          { id: "longest-repeating-character-replacement", name: "Longest Repeating Character Replacement", difficulty: "Medium" },
          { id: "minimum-window-substring", name: "Minimum Window Substring", difficulty: "Hard" }
        ]
      }
    ]
  },
  {
    id: "stack",
    title: "Stack",
    guides: [
      {
        slug: "stack",
        title: "Stack & Monotonic Stack",
        description: "LIFO concepts, bracket pairing, and next-greater-element monotonic templates.",
        category: "stack",
        heroImage: "core-pattern-stack-deep",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        visualizations: ["valid-parentheses", "monotonic-stack"],
        content: stackContent,
        questions: [
          { id: "valid-parentheses", name: "Valid Parentheses", difficulty: "Easy" },
          { id: "min-stack", name: "Min Stack", difficulty: "Medium" },
          { id: "daily-temperatures", name: "Daily Temperatures", difficulty: "Medium" },
          { id: "largest-rectangle-in-histogram", name: "Largest Rectangle in Histogram", difficulty: "Hard" }
        ]
      }
    ]
  },
  {
    id: "binary-search",
    title: "Binary Search",
    guides: [
      {
        slug: "binary-search",
        title: "Binary Search",
        description: "Learn standard templates, range search, and binary search on solution space.",
        category: "binary-search",
        heroImage: "core-pattern-bineary",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        visualizations: ["binary-search"],
        content: binarySearchContent,
        questions: [
          { id: "binary-search", name: "Binary Search", difficulty: "Easy" },
          { id: "search-a-2d-matrix", name: "Search a 2D Matrix", difficulty: "Medium" },
          { id: "find-minimum-in-rotated-sorted-array", name: "Find Min in Rotated Sorted Array", difficulty: "Medium" }
        ]
      }
    ]
  },
  {
    id: "cyclic-sort",
    title: "Cyclic Sort",
    guides: [
      {
        slug: "cyclic-sort",
        title: "Cyclic Sort",
        description: "Master finding missing and duplicate numbers in O(n) time and O(1) space.",
        category: "cyclic-sort",
        heroImage: "core-pattern-cyclic-sort-hero",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        visualizations: ["missing-number"],
        content: cyclicSortContent,
        questions: [
          { id: "missing-number", name: "Missing Number", difficulty: "Easy" },
          { id: "find-the-duplicate-number", name: "Find the Duplicate Number", difficulty: "Medium" }
        ]
      }
    ]
  },
  {
    id: "merge-sort",
    title: "Merge Sort",
    guides: [
      {
        slug: "merge-sort",
        title: "Merge Sort",
        description: "Master Divide and Conquer with O(n log n) sorting and merging techniques.",
        category: "merge-sort",
        heroImage: "core-pattern-merge-sort-hero",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        visualizations: ["merge-two-sorted-lists"],
        content: mergeSortContent,
        questions: [
          { id: "sort-an-array", name: "Sort an Array", difficulty: "Medium" },
          { id: "merge-two-sorted-lists", name: "Merge Two Sorted Lists", difficulty: "Easy" }
        ]
      }
    ]
  },
  {
    id: "recursion",
    title: "Recursion",
    guides: [
      {
        slug: "recursion",
        title: "Recursion",
        description: "Learn the fundamentals of recursion, base cases, and call stack management.",
        category: "recursion",
        heroImage: "recursion-hero",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        visualizations: ["climbing-stairs", "reverse-linked-list"],
        content: recursionContent,
        questions: [
          { id: "climbing-stairs", name: "Climbing Stairs", difficulty: "Easy" },
          { id: "fibonacci-number", name: "Fibonacci Number", difficulty: "Easy" }
        ]
      }
    ]
  },
  {
    id: "backtracking",
    title: "Backtracking",
    guides: [
      {
        slug: "backtracking",
        title: "Backtracking",
        description: "Master exhaustive search, state reversal, and pruning techniques.",
        category: "backtracking",
        heroImage: "backtraking-hero",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        visualizations: ["subsets", "permutations", "combination-sum"],
        content: backtrackingContent,
        questions: [
          { id: "combination-sum", name: "Combination Sum", difficulty: "Medium" },
          { id: "word-search", name: "Word Search", difficulty: "Medium" }
        ]
      }
    ]
  },
  {
    id: "merge-intervals",
    title: "Merge Intervals",
    guides: [
      {
        slug: "merge-intervals",
        title: "Merge Intervals",
        description: "Master overlapping times, schedules, and continuous ranges.",
        category: "merge-intervals",
        heroImage: "merge-intervals-hero",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        visualizations: ["merge-intervals", "interval-scheduling"],
        content: mergeIntervalsContent,
        questions: [
          { id: "merge-intervals", name: "Merge Intervals", difficulty: "Medium" },
          { id: "insert-interval", name: "Insert Interval", difficulty: "Medium" },
          { id: "non-overlapping-intervals", name: "Non-overlapping Intervals", difficulty: "Medium" }
        ]
      }
    ]
  },
  {
    id: "dynamic-programming",
    title: "Dynamic Programming",
    guides: [
      {
        slug: "dynamic-programming",
        title: "Dynamic Programming",
        description: "Learn the art of remembering past solutions to avoid doing extra work.",
        category: "dynamic-programming",
        heroImage: "dp-hero",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        visualizations: ["coin-change", "knapsack-01", "climbing-stairs"],
        content: dynamicProgrammingContent,
        questions: [
          { id: "climbing-stairs", name: "Climbing Stairs", difficulty: "Easy" },
          { id: "coin-change", name: "Coin Change", difficulty: "Medium" },
          { id: "house-robber", name: "House Robber", difficulty: "Medium" }
        ]
      }
    ]
  },
  {
    id: "fast-and-slow-pointers",
    title: "Fast and Slow Pointers",
    guides: [
      {
        slug: "fast-and-slow-pointers",
        title: "Fast and Slow Pointers",
        description: "Master cycle detection and finding the middle of sequences using the Tortoise and Hare.",
        category: "fast-and-slow-pointers",
        heroImage: "core-pattern-greedy",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        visualizations: ["detect-cycle-in-a-linked-list", "middle-node"],
        content: fastSlowPointersContent,
        questions: [
          { id: "detect-cycle-in-a-linked-list", name: "Linked List Cycle", difficulty: "Easy" },
          { id: "middle-node", name: "Middle of the Linked List", difficulty: "Easy" }
        ]
      }
    ]
  },
  {
    id: "greedy",
    title: "Greedy Approach",
    guides: [
      {
        slug: "greedy",
        title: "Greedy Approach",
        description: "Learn to make the optimal local choice to solve problems efficiently.",
        category: "greedy",
        heroImage: "core-pattern-greedy",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        visualizations: ["assign-cookies"],
        content: greedyContent,
        questions: [
          { id: "assign-cookies", name: "Assign Cookies", difficulty: "Easy" },
          { id: "jump-game", name: "Jump Game", difficulty: "Medium" }
        ]
      }
    ]
  },
  {
    id: "bfs-dfs",
    title: "BFS and DFS",
    guides: [
      {
        slug: "bfs-dfs",
        title: "BFS and DFS",
        description: "Master exploring networks, trees, and grids with Depth First and Breadth First Search.",
        category: "bfs-dfs",
        heroImage: "fundamentals-bst",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        visualizations: ["number-of-islands"],
        content: bfsDfsContent,
        questions: [
          { id: "number-of-islands", name: "Number of Islands", difficulty: "Medium" },
          { id: "rotting-oranges", name: "Rotting Oranges", difficulty: "Medium" }
        ]
      }
    ]
  },
  {
    id: "database",
    title: "Database",
    guides: [
      {
        slug: "what-is-database",
        title: "What is Database?",
        description: "An easy-to-understand introduction to databases, files vs databases, and real-world examples.",
        category: "database",
        heroImage: "database-hero-what-is",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: whatIsDatabaseContent,
        questions: []
      },
      {
        slug: "types-of-databases",
        title: "Types of Databases",
        description: "Learn the differences between Relational (SQL) and Non-Relational (NoSQL) databases.",
        category: "database",
        heroImage: "databse-core-types",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: typesOfDatabasesContent,
        questions: []
      },
      {
        slug: "database-terminology",
        title: "Database Terminology",
        description: "Master essential database terms like Schema, Table, Row, Column, and Primary Key.",
        category: "database",
        heroImage: "database-core-terminology",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: databaseTerminologyContent,
        questions: []
      },
      {
        slug: "relational-databases-rdbms",
        title: "Relational Databases & RDBMS",
        description: "An easy-to-understand introduction to RDBMS, tabular layouts, and database schemas.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: relationalDatabasesRdbmsContent,
        questions: []
      },
      {
        slug: "tables-rows-columns",
        title: "Tables, Rows & Columns",
        description: "Learn how data is organized in rows and columns inside a database table.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: tablesRowsColumnsContent,
        questions: []
      },
      {
        slug: "primary-keys-foreign-keys",
        title: "Primary Keys & Foreign Keys",
        description: "Understand how primary keys uniquely identify rows and foreign keys connect tables.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: primaryKeysForeignKeysContent,
        questions: []
      },
      {
        slug: "constraints",
        title: "Constraints",
        description: "Learn about rules like NOT NULL, UNIQUE, and CHECK constraints that keep data clean.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: constraintsContent,
        questions: []
      },
      {
        slug: "normalization",
        title: "Normalization",
        description: "Organize database tables to reduce redundancy and prevent update errors.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: normalizationContent,
        questions: []
      },
      {
        slug: "denormalization",
        title: "Denormalization",
        description: "Learn when and why to duplicate data to speed up database reads.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: denormalizationContent,
        questions: []
      },
      {
        slug: "database-relationships",
        title: "Database Relationships",
        description: "Explore 1:1, 1:N, and N:M table relationships and junction tables.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: databaseRelationshipsContent,
        questions: []
      },
      {
        slug: "er-diagrams",
        title: "ER Diagrams",
        description: "Create visual blueprints for your database schemas using Entities, Attributes, and Relations.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: erDiagramsContent,
        questions: []
      },
      {
        slug: "indexes-fundamentals",
        title: "Indexes — Fundamentals",
        description: "Speed up query searches using B-Tree index structures and analyze query plans.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: indexesFundamentalsContent,
        questions: []
      },
      {
        slug: "sql-basics",
        title: "SQL Basics",
        description: "Master the structure of SQL commands, including DDL (schema) and DML (data) sub-languages.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: sqlBasicsContent,
        questions: []
      },
      {
        slug: "select-filtering",
        title: "SELECT & Filtering",
        description: "Query and filter database rows using WHERE clauses and logical operators.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: selectFilteringContent,
        questions: [
          { id: "trips-and-users", name: "Trips and Users", difficulty: "Hard" }
        ]
      },
      {
        slug: "sorting-limiting",
        title: "Sorting & Limiting Results",
        description: "Sort rows using ORDER BY and paginate lists using LIMIT and OFFSET.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: sortingLimitingContent,
        questions: [
          { id: "second-highest-salary", name: "Second Highest Paid Employee", difficulty: "Easy" }
        ]
      },
      {
        slug: "aggregate-functions",
        title: "Aggregate Functions",
        description: "Summarize data rows using math helpers like COUNT, SUM, AVG, MIN, and MAX.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: aggregateFunctionsContent,
        questions: [
          { id: "game-play-analysis-i", name: "Game Play Analysis I", difficulty: "Easy" }
        ]
      },
      {
        slug: "groupby-having",
        title: "GROUP BY & HAVING",
        description: "Group records into summary categories and filter them using HAVING clauses.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: groupbyHavingContent,
        questions: [
          { id: "duplicate-emails", name: "Duplicate Emails", difficulty: "Easy" },
          { id: "managers-with-at-least-5-direct-reports", name: "Managers with at Least Five Direct Reports", difficulty: "Medium" }
        ]
      },
      {
        slug: "joins",
        title: "JOINs",
        description: "Merge data from multiple tables using INNER, LEFT, RIGHT, and FULL JOINs.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: joinsContent,
        questions: [
          { id: "combine-two-tables", name: "Combine Two Tables", difficulty: "Easy" },
          { id: "employees-earning-more-than-their-managers", name: "Employees Earning More Than Their Managers", difficulty: "Easy" },
          { id: "employee-bonus", name: "Employee Bonus", difficulty: "Medium" }
        ]
      },
      {
        slug: "subqueries",
        title: "Subqueries",
        description: "Write nested queries inside other SQL statements to solve multi-step problems.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: subqueriesContent,
        questions: [
          { id: "nth-highest-salary", name: "Nth Highest Salary", difficulty: "Medium" },
          { id: "second-highest-salary", name: "Second Highest Paid Employee", difficulty: "Easy" },
          { id: "delete-duplicate-emails", name: "Delete Duplicate Emails", difficulty: "Easy" }
        ]
      },
      {
        slug: "ctes",
        title: "Common Table Expressions (CTEs)",
        description: "Simplify complex queries using WITH blocks and temporary named query results.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: ctesContent,
        questions: [
          { id: "nth-highest-salary", name: "Nth Highest Salary", difficulty: "Medium" }
        ]
      },
      {
        slug: "case-expressions",
        title: "CASE Expressions",
        description: "Add if-then-else logical statements inside your SQL SELECT statements.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: caseExpressionsContent,
        questions: [
          { id: "trips-and-users", name: "Trips and Users", difficulty: "Hard" }
        ]
      },
      {
        slug: "null-handling",
        title: "NULL Handling",
        description: "Learn how to query, filter, and handle missing (NULL) values using COALESCE.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: nullHandlingContent,
        questions: [
          { id: "customers-who-never-order", name: "Customers Who Never Order", difficulty: "Easy" },
          { id: "employee-bonus", name: "Employee Bonus", difficulty: "Medium" }
        ]
      },
      {
        slug: "window-functions",
        title: "Window Functions",
        description: "Perform running math and aggregate calculations across rows without collapsing them.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: windowFunctionsContent,
        questions: [
          { id: "department-top-three-salaries", name: "Department Top Three Salaries", difficulty: "Easy" },
          { id: "consecutive-numbers", name: "Consecutive Numbers", difficulty: "Medium" }
        ]
      },
      {
        slug: "ranking-functions",
        title: "Ranking Functions",
        description: "Rank rows inside partitions using ROW_NUMBER, RANK, and DENSE_RANK.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: rankingFunctionsContent,
        questions: [
          { id: "rank-scores", name: "Rank Scores", difficulty: "Medium" },
          { id: "department-top-three-salaries", name: "Department Top Three Salaries", difficulty: "Easy" }
        ]
      },
      {
        slug: "running-totals-moving-aggregates",
        title: "Running Totals & Moving Aggregates",
        description: "Calculate cumulative running sums and moving averages using window frame controls.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: runningTotalsMovingAggregatesContent,
        questions: [
          { id: "game-play-analysis-iv", name: "Game Play Analysis IV", difficulty: "Medium" }
        ]
      },
      {
        slug: "set-operations",
        title: "Set Operations — UNION, INTERSECT & EXCEPT",
        description: "Stack query results vertically using UNION, INTERSECT, and EXCEPT.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: setOperationsContent,
        questions: []
      },
      {
        slug: "recursive-ctes",
        title: "Recursive CTEs",
        description: "Write loops in SQL to traverse organizational structures and count values dynamically.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: recursiveCtesContent,
        questions: [
          { id: "consecutive-numbers", name: "Consecutive Numbers", difficulty: "Medium" }
        ]
      },
      {
        slug: "views",
        title: "Views",
        description: "Create secure, simplified virtual tables that save complex queries.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: viewsContent,
        questions: [
          { id: "department-highest-salary", name: "Department Highest Salary", difficulty: "Easy" }
        ]
      },
      {
        slug: "stored-procedures-functions",
        title: "Stored Procedures & Functions",
        description: "Automate complex workflows and execute PL/SQL calculations inside the database.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: storedProceduresFunctionsContent,
        questions: [
          { id: "nth-highest-salary", name: "Nth Highest Salary", difficulty: "Medium" }
        ]
      },
      {
        slug: "triggers",
        title: "Triggers",
        description: "Create automated action listeners that execute on table updates, inserts, or deletes.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: triggersContent,
        questions: []
      },
      {
        slug: "transactions-sql",
        title: "Transactions in SQL",
        description: "Enforce ACID safety to ensure queries commit fully or rollback on failure.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: transactionsSqlContent,
        questions: []
      },
      {
        slug: "sql-query-optimization",
        title: "SQL Query Optimization",
        description: "Tune queries, analyze query execution plans, and speed up databases.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: sqlQueryOptimizationContent,
        questions: []
      },
      {
        slug: "how-database-indexes-work",
        title: "How Database Indexes Work",
        description: "Explore the core fundamentals of index lookups, pointers, and table heap structures.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: howDatabaseIndexesWorkContent,
        questions: []
      },
      {
        slug: "btree-bplus-tree-indexes",
        title: "B-Tree & B+ Tree Indexes",
        description: "Understand the balanced tree data structures powering standard database indexes.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: btreeBplusTreeIndexesContent,
        questions: []
      },
      {
        slug: "hash-indexes",
        title: "Hash Indexes",
        description: "Scale exact-match query lookups to O(1) complexity using hash tables.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: hashIndexesContent,
        questions: []
      },
      {
        slug: "clustered-non-clustered-indexes",
        title: "Clustered vs Non-Clustered Indexes",
        description: "Compare index types that define disk layout against secondary maps.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: clusteredNonClusteredIndexesContent,
        questions: []
      },
      {
        slug: "query-execution-plans",
        title: "Query Execution Plans",
        description: "Read GPS route planning maps compiled by the query optimizer using EXPLAIN.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: queryExecutionPlansContent,
        questions: []
      },
      {
        slug: "database-storage-pages",
        title: "Database Storage & Pages",
        description: "Deep dive into 8KB physical storage pages, headers, slots, and data tuples.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: databaseStoragePagesContent,
        questions: []
      },
      {
        slug: "buffer-pool-caching",
        title: "Buffer Pool & Caching",
        description: "Cache active database pages in memory and evict clean pages using LRU.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: bufferPoolCachingContent,
        questions: []
      },
      {
        slug: "concurrency-locking",
        title: "Concurrency & Locking",
        description: "Manage reader/writer locks (S/X) and transaction boundaries safety.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: concurrencyLockingContent,
        questions: []
      },
      {
        slug: "mvcc",
        title: "MVCC",
        description: "Implement Multi-Version Concurrency Control to enable lock-free reads.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: mvccContent,
        questions: []
      },
      {
        slug: "acid-properties",
        title: "ACID Properties",
        description: "Enforce Atomicity, Consistency, Isolation, and Durability transactions safety.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: acidPropertiesContent,
        questions: []
      },
      {
        slug: "transaction-isolation-levels",
        title: "Transaction Isolation Levels",
        description: "Balance concurrency speeds against dirty, non-repeatable, and phantom reads.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: transactionIsolationLevelsContent,
        questions: []
      },
      {
        slug: "deadlocks",
        title: "Deadlocks",
        description: "Detect and resolve dependency cycles where transactions block each other.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: deadlocksContent,
        questions: []
      },
      {
        slug: "database-replication",
        title: "Database Replication",
        description: "Distribute copy logs to replica nodes synchronously or asynchronously.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: databaseReplicationContent,
        questions: []
      },
      {
        slug: "read-replicas",
        title: "Read Replicas",
        description: "Scale read-heavy database query loads using load-balanced copy servers.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: readReplicasContent,
        questions: []
      },
      {
        slug: "database-partitioning",
        title: "Database Partitioning",
        description: "Split massive tables horizontally or vertically to enable partition pruning.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: databasePartitioningContent,
        questions: []
      },
      {
        slug: "database-sharding",
        title: "Database Sharding",
        description: "Distribute database shards horizontally across independent physical servers.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: databaseShardingContent,
        questions: []
      },
      {
        slug: "cap-theorem",
        title: "CAP Theorem",
        description: "Analyze the trade-offs between Consistency, Availability, and Partition Tolerance.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: capTheoremContent,
        questions: []
      },
      {
        slug: "consistency-models",
        title: "Consistency Models",
        description: "Explore Strong, Eventual, and Causal data synchronization rules in distributed nodes.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: consistencyModelsContent,
        questions: []
      },
      {
        slug: "nosql-databases",
        title: "NoSQL Databases",
        description: "Map Key-Value, Document, Column-Family, and Graph non-relational database models.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: nosqlDatabasesContent,
        questions: []
      },
      {
        slug: "database-scaling-high-availability",
        title: "Database Scaling & High Availability",
        description: "Design high availability systems using automatic failovers, RTO, and RPO.",
        category: "database",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: databaseScalingHighAvailabilityContent,
        questions: []
      }
    ]
  },
  {
    id: "system-design",
    title: "System Design",
    guides: [
      {
        slug: "introduction-to-system-design",
        title: "Introduction to System Design",
        description: "Learn the essentials needed to pass a system design interview, types of interviews, and how to prepare.",
        category: "system-design",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: introductionToSystemDesignContent,
        questions: []
      },
      {
        slug: "delivery-framework",
        title: "Delivery Framework",
        description: "The best way to structure your system design interviews to structure your thoughts and focus on the most important aspects.",
        category: "system-design",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: deliveryFrameworkContent,
        questions: []
      },
      {
        slug: "core-concepts",
        title: "Core Concepts",
        description: "Learn the most important concepts you'll need for system design interviews, put together by FAANG managers and staff engineers.",
        category: "system-design",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: coreConceptsContent,
        questions: []
      },
      {
        slug: "key-technologies",
        title: "Key Technologies",
        description: "Learn about distributed locks, caches, and CDNs.",
        category: "system-design",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: keyTechnologiesContent,
        questions: []
      },
      {
        slug: "common-patterns",
        title: "Common Patterns",
        description: "The most common system design interview patterns, built by FAANG managers and staff engineers.",
        category: "system-design",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: commonPatternsContent,
        questions: []
      },
      {
        slug: "networking",
        title: "Networking",
        description: "Fundamentals of networking for system design, including protocols, load balancing, and handling latency.",
        category: "system-design",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: networkingContent,
        questions: []
      },
      {
        slug: "api-design",
        title: "API Design",
        description: "Learn how to design scalable, predictable APIs for system design interviews.",
        category: "system-design",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: apiDesignContent,
        questions: []
      },
      {
        slug: "data-modeling",
        title: "Data Modeling",
        description: "Learn how to structure, store, and relate data for scale.",
        category: "system-design",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: dataModelingContent,
        questions: []
      },
      {
        slug: "caching",
        title: "Caching",
        description: "Understand caching patterns, eviction, and when to deploy caches in a distributed system.",
        category: "system-design",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: cachingContent,
        questions: []
      },
      {
        slug: "sharding",
        title: "Sharding",
        description: "Learn how horizontal partitioning scales databases past their physical limits.",
        category: "system-design",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: shardingContent,
        questions: []
      },
      {
        slug: "consistent-hashing",
        title: "Consistent Hashing",
        description: "Discover the algorithm that enables seamless scaling in distributed clusters.",
        category: "system-design",
        author: {
          name: "Rahul Mahale",
          role: "Senior SLB Engineer",
          linkedin: "https://linkedin.com/in/rkmahale"
        },
        content: consistentHashingContent,
        questions: []
      }
    ]
  }
];

