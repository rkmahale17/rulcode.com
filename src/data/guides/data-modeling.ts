export const content = `
# Data Modeling for System Design

Data modeling is the process of defining how your application’s data is structured, stored, and related. In practice, this means deciding what entities exist, how they are identified, and how they connect to one another. 

For a general system design interview, the bar is usually focused on the big picture rather than exhaustive normalization. You are not expected to produce a complete third-normal-form schema diagram. Instead, you must design a clear, functional model that aligns directly with your system’s access patterns and performance requirements.

## The Role of Data Modeling in Interviews

During the requirements gathering phase, you will identify your **core entities**. These usually map 1:1 with tables or collections and form the backbone of your schema. Later, during the High-Level Design step, you will sketch a basic schema alongside your database component. 

You must include:
- The key fields for each entity
- Primary and Foreign Keys establishing relationships
- A note on how you would index or partition the tables to support the main query patterns

A solid data model sets up the rest of your architectural design, dictating how you scale reads and writes, how you preserve consistency, and how you handle data growth. A sloppy data model will lead to painful architectural dead-ends later in the interview.

## Database Model Options

Before designing a schema, you must select the type of database you are working with. Different database models drastically change how you structure data.

In interviews, there is a temptation to show off by choosing exotic NoSQL databases. **Resist this.** Most of the time, the right answer is a traditional relational database (SQL). It should be your default unless the system's requirements clearly dictate otherwise.

### Relational Databases (SQL)
Relational databases organize data into rigid tables with fixed schemas. They enforce relationships through foreign keys and provide strong ACID (Atomicity, Consistency, Isolation, Durability) guarantees for transactions.

Most system design problems map naturally here. A social media app has users, posts, comments, and likes. An e-commerce system has users, products, orders, and payments. 

\`\`\`text
Users table:
id (PK), username, email, created_at

Posts table:
id (PK), user_id (FK), content, created_at

Likes table:
id (PK), user_id (FK), post_id (FK), created_at
\`\`\`

SQL is unmatched at handling complex, relational queries. However, multi-table joins can become performance traps at scale. When strong consistency is an absolute requirement (like ensuring payments don't double-charge or inventory doesn't oversell), SQL's ACID guarantees are the perfect tool.

The usual critique of relational databases is scalability, but this is vastly exaggerated. Modern SQL databases scale massively through read replicas, sharding, and connection pooling. 
*Example technologies: PostgreSQL, MySQL.*

### Document Databases (NoSQL)
Document databases store data as JSON-like documents with flexible schemas. Data modeling here focuses on **nesting and embedding** related information within a single document rather than normalizing across multiple tables.

\`\`\`json
{ 
  "_id": "507f191e810c19729de860ea", 
  "username": "john_doe", 
  "posts": [ 
    { "content": "Hello, world!", "created_at": "2024-01-01T10:00:00Z" }
  ] 
}
\`\`\`

This eliminates the need for expensive joins, drastically speeding up read operations. However, updating a nested post requires loading and modifying the entire user document.

**When to consider:** Use document databases when your schema changes frequently, when you have deeply nested hierarchical data, or when read performance on a single entity aggregate is paramount. 
*Example technologies: MongoDB, Firestore.*

### Key-Value Stores
Key-value stores provide simple lookups where you fetch massive blobs of data by an exact key match. They are exceptionally fast but offer zero query flexibility (you cannot query "find all users older than 25").

**When to consider:** Primarily used for caching (sitting in front of a slower SQL database), session storage, or feature flags. 
*Example technologies: Redis, Memcached.*

### Wide-Column Databases
Wide-column databases organize data into column families where rows can have different sets of columns. They are heavily optimized for massive write workloads and time-series data.

**When to consider:** When you have enormous write volumes, telemetry data, event logging, or IoT sensor data. Time becomes a first-class citizen in your data model.
*Example technologies: Cassandra, HBase.*

### Graph Databases
Graph databases store data as nodes (entities) and edges (relationships), optimizing for deep relationship traversal (e.g., "Find friends of friends who like hiking").

**When to consider:** Almost never in a standard interview. While they sound highly sophisticated for social networks, even Facebook models its core social graph using massive distributed MySQL clusters. They add unnecessary operational complexity for most interview scenarios.
*Example technologies: Neo4j.*

## Schema Design Fundamentals

Once you have selected your database type, you must design a schema that explicitly supports your system's access patterns.

### 1. Start with Access Patterns
Everything flows from how the data will be queried. An analytics dashboard that aggregates data across time periods needs a completely different structure than a news feed that loads recent posts from followed users. Ask yourself: *What specific queries will my API endpoints need to execute?*

### 2. Entities, Keys, and Relationships
Identify your core entities. Each entity needs a **Primary Key (PK)** to uniquely identify records. Always use system-generated IDs (like UUIDs or auto-incrementing integers) rather than business data (like email addresses) as primary keys, because business data can change.

Connect entities using **Foreign Keys (FK)**. This establishes One-to-Many (1:N) or Many-to-Many (N:M) relationships. Foreign keys enforce referential integrity at the database level, preventing orphaned records.

### 3. Normalization vs Denormalization
**Normalization** means storing each piece of information in exactly one place. This prevents data anomalies. If a user changes their username, you only update it in the \`Users\` table, and all \`Posts\` dynamically join to get the fresh username.

**Denormalization** means intentionally duplicating data to speed up read queries. If you denormalize the username into the \`Posts\` table, loading a post is incredibly fast (no joins needed). However, if the user changes their username, you must now execute an expensive background job to update millions of their posts.

*Interview Tip:* Start with a clean, normalized model. Only denormalize when you explicitly identify a read-heavy performance bottleneck that requires it.

### 4. Indexing
Indexes are internal data structures (often B-Trees) that allow the database to find records in O(log N) time instead of scanning every row in O(N) time.

Your indexes must directly support your API's access patterns. If you frequently query "Get all posts by User ID ordered by creation date", you must declare a **Composite Index** on \`(user_id, created_at)\`. Explicitly calling out necessary indexes on the whiteboard is a massive positive signal to interviewers.

## Conclusion

Data modeling in an interview is about demonstrating logical engineering judgment. Pick the right database (usually PostgreSQL), outline your core entities, define strict Primary and Foreign keys, identify the critical indexes for your access patterns, and confidently discuss the trade-offs between normalization and denormalization.
`;
