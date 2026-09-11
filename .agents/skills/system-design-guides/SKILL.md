---
name: System Design Guides
description: Skill for adding or updating system design guides tailored for college students and beginners, using simple analogies and no simulations.
---

# System Design Guides Skill

This skill is invoked when creating or updating educational system design guides (e.g., "Introduction to System Design", "Load Balancing", "Databases") in the system-design section.

## Workflow Process

### 1. Identify and Structure
- Ensure the guide data file is created in `src/data/guides/` and exposes a `content` markdown string.
- Register the new guide in `src/data/guidesData.ts` under the `system-design` category.
- Verify that `system-design` is included in the guide groups in `src/config/sidebarNav.ts` so it appears in the sidebar navigation.

### 2. Implementation Rules & Standards

When writing the content for the system design guide, rigidly follow these rules:

1. **Target Audience (College Students):** The language must be accessible, engaging, and devoid of overly dense academic jargon. Write for a college student who knows basic programming but is new to large-scale infrastructure.
2. **Proper Analogies:** Always start complex topics with a relatable, real-world analogy. For example:
   - *Load Balancer:* A host at a restaurant directing guests to different tables so no single waiter is overwhelmed.
   - *Cache:* Keeping your most-used books on your desk instead of walking to the library.
   - *Message Queues:* A post office holding letters until the mail carrier is ready to deliver them.
3. **Core Architecture Components:** Introduce system design by focusing on essential building blocks: Load Balancers, Caching, Databases (SQL vs NoSQL), Message Queues, Blob Storage, and CDNs.
4. **Fundamental Principles & Trade-offs:** Always explain the "Why" behind a choice, not just the "What". Discuss Scalability (Vertical vs. Horizontal), Statelessness, Data Partitioning, and CAP Theorem trade-offs (e.g., Consistency vs. Availability).
5. **No Simulation Visualizations:** Do not include any interactive simulation visualizations (`viz:` links). The system design pages rely entirely on static markdown, rich text formatting, and images.
6. **Images with Zoom Modal:** Use standard markdown images `![Alt text](/path/to/image.png)`. The markdown renderer is configured to automatically display these images with an interactive click-to-zoom modal (`Dialog`) for better readability of complex architectural diagrams.
7. **Engaging Formatting:** Use GitHub-flavored alerts (`> [!NOTE]`, `> [!IMPORTANT]`, etc.), clear headings, bullet points, and tables to structure the information logically.

### 3. Verification
- Verify that `guidesData.ts` has been correctly updated with the new content.
- Ensure the markdown content renders correctly, particularly the image zoom modal.
- Verify that the language is appropriate for students and uses effective analogies.
