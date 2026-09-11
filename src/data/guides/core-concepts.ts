export const content = `
# Core Concepts

Familiarize yourself with the essential principles required to tackle system design challenges, compiled from the expertise of senior engineering leaders.

Core concepts represent the foundational building blocks of distributed architecture. Unlike specific vendor products (like AWS SQS) or niche use cases, these underlying principles apply to almost every large-scale system you will encounter.

Think of these concepts as your engineering toolkit. Before you can design a global content delivery platform, you must grasp how caching strategies, database partitioning, and network protocols operate.

## Networking Essentials

While networking is a vast field, interviews typically focus on how distributed services communicate and how they handle latency and failures.

Choosing the right communication protocol is your first major decision. HTTP over TCP is the default for most web services due to its reliability and ubiquity. 

When dealing with real-time requirements, you'll need to consider WebSockets or Server-Sent Events (SSE). SSE is a one-way street: the client opens a connection, and the server continuously streams updates (useful for live sports scores). WebSockets allow two-way, bidirectional messaging (essential for chat applications). SSE is generally easier to scale using standard HTTP load balancers, whereas WebSockets require dedicated infrastructure to manage persistent, stateful connections.

For internal microservice communication where efficiency is paramount, gRPC is a strong choice. It uses binary serialization over HTTP/2, drastically reducing payload size and parsing time compared to JSON.

You should also understand Load Balancing. Layer 7 balancers inspect application data (like HTTP headers) to make routing decisions, allowing you to direct API traffic to different servers than static web traffic. Layer 4 balancers operate lower in the network stack, forwarding TCP/UDP packets blindly and rapidly, which is often necessary for managing WebSocket connections.

## API Design

You will frequently need to outline the API contracts for your system. Interviewers aren't looking for exhaustive, perfect documentation; they want to see logical resource structures that support your functional requirements.

REST is the safest default. It maps operations to standard HTTP methods acting on specific resources (e.g., \`GET /users/123\`). 

> [!NOTE]
> Don't get bogged down in API specifics. Outline the primary 3-4 endpoints necessary for your core features and move on to the system architecture.

## Data Modeling

Your choice of data model profoundly impacts the system's performance, flexibility, and complexity.

The primary debate is usually between Relational (SQL) and NoSQL databases. Relational databases excel when data is highly structured with clear dependencies, and when strict consistency (ACID compliance) is required. They allow for complex joins and ensure data integrity. NoSQL databases prioritize horizontal scalability and flexible schemas, making them ideal for massive datasets where read/write throughput is more critical than complex querying.

When using relational databases, you must balance normalization and denormalization. Normalization eliminates data redundancy by separating data into multiple tables, which requires computationally expensive JOIN operations during reads. Denormalization intentionally duplicates data across tables to speed up read queries, at the cost of making write operations more complex, since updates must be applied in multiple places.

## Database Indexing

Indexes are critical for optimizing database query performance. Without an index, the database must scan every single row to find a match. An index functions like a book's glossary, allowing the database to instantly locate the desired records.

The most widespread indexing structure is the B-tree, which efficiently handles both exact matches and range queries (e.g., finding all records created between two dates). Hash indexes offer extremely fast exact-match lookups but cannot handle range queries. Specialized search requirements might necessitate full-text indexes (like Elasticsearch) or geospatial indexes for location-based proximity searches.

When designing your schema, specify which fields will be indexed based on your anticipated read queries.

## Caching

Caching is a universal strategy for mitigating database load and reducing response times. By storing frequently requested data in an in-memory data store (like Redis), you can bypass slow disk-based database queries.

![Caching Architecture](/images/system-design/caching_architecture_1789108758480.jpg)

While a database query might take 30ms, retrieving the same data from a cache takes roughly 1ms. At a massive scale, this difference is transformative.

The standard approach is the cache-aside pattern: the application checks the cache first. If the data is missing (a cache miss), the application queries the database, writes the result into the cache with a Time-To-Live (TTL) expiration, and returns the data to the client.

## Sharding

When a dataset outgrows the storage or throughput capacity of a single database server, you must partition the data across multiple machines—a process known as sharding.

![Sharding Architecture](/images/system-design/sharding_architecture_1789108774837.jpg)

Selecting the right shard key is crucial. The shard key determines which server holds a specific piece of data. If you shard a social network by \`user_id\`, all data belonging to a specific user resides on one server, making user-specific queries blazing fast. However, aggregating data across all users (like calculating global trending topics) becomes highly inefficient, as it requires querying every shard and merging the results.

## Consistent Hashing

Traditional hashing for distributing data across servers (\`hash(key) % N\`) breaks down when you need to add or remove servers, as it requires reshuffling almost all the data. 

![Consistent Hashing](/images/system-design/consistent_hashing_1789108788037.jpg)

Consistent hashing solves this by mapping both the data keys and the servers onto a circular "ring." A key is assigned to the first server it encounters moving clockwise around the ring. This ingenious mathematical approach ensures that when a server is added or removed, only a small fraction of the data needs to be migrated, making elastic scaling manageable.

## CAP Theorem

The CAP theorem outlines the fundamental tradeoffs in distributed data systems. It states that a system can only guarantee two of three traits: Consistency (all clients see the same data simultaneously), Availability (every request receives a response, even if the data is stale), and Partition Tolerance (the system functions despite network failures between nodes).

Because network partitions will inevitably happen, you must choose between Consistency and Availability. Prioritizing consistency means rejecting requests if nodes cannot communicate, prioritizing correctness over uptime. Priorizing availability means serving the request using local data, even if it might be out of sync with other nodes. For most consumer applications, high availability (resulting in eventual consistency) is the preferred choice, whereas financial systems typically demand strict consistency.

## Numbers to Know

While upfront calculations are often a waste of time, knowing standard operational capacities is crucial when making architectural decisions, such as knowing when to introduce a cache or shard a database.

| Component | Operational Characteristics | When to Scale |
| :--- | :--- | :--- |
| **Caching** | ~1ms latency<br/>High throughput (100k+ ops/sec)<br/>Limited by RAM | Cache miss rate spikes<br/>Database read latency increases |
| **Databases** | Disk-based storage<br/>Moderate throughput (10k-50k ops/sec) | Write operations exceed server limits<br/>Storage capacity is exhausted |
| **App Servers** | High concurrency<br/>Compute-bound | High CPU utilization<br/>Memory exhaustion |
| **Message Queues** | Massive throughput<br/>Asynchronous processing | Consumer lag increases significantly |
`;
