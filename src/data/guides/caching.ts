export const content = `
# Caching Strategies

In system design interviews, caching is the universal answer to high read traffic. When your database becomes the bottleneck and latency spikes, introducing a cache is the logical next step.

Reading a user profile from a traditional SQL database may take 50 milliseconds due to disk I/O and network overhead. Reading that same profile from an in-memory cache takes just 1 millisecond. Memory sits much closer to the CPU, eliminating disk latency entirely.

While caches are essential for scalable systems, they introduce severe architectural challenges around data staleness, invalidation, and failure handling. This guide covers how to deploy caches, the core caching patterns, and how to survive the edge cases.

![Caching Strategies](/images/system-design/caching_strategies.jpg)

## Where to Cache

Caching can occur at multiple layers of your infrastructure.

### External Distributed Caching
An external cache is a standalone service cluster that your application communicates with over the network. You store frequently accessed data in memory so you do not have to hit the primary database.

Because it is distributed, external caches scale horizontally. Every application server shares the same unified cache layer. They support eviction policies (like LRU) and Time-To-Live (TTL) expirations to strictly control memory footprints.
*Example technologies: Redis, Memcached.*

**In interviews:** This is the default answer. If you mention caching, the interviewer assumes you mean a distributed Redis cluster sitting between your application and your database.

### Content Delivery Network (CDN)
A CDN is a geographically distributed network of servers that caches content physically close to the user. Instead of a user in India requesting an image from a server in Virginia (incurring 300ms of latency), the request hits a CDN Edge Server in Mumbai and returns in 20ms.

CDNs excel at caching static media (images, videos, CSS/JS payloads). Advanced CDNs can also cache public API responses or execute edge computing functions.
*Example technologies: Cloudflare, Fastly, AWS CloudFront.*

### In-Process (Local) Caching
Every application server has its own local RAM. You can cache data directly inside the application process (e.g., using an LRU cache library in Node.js or Java). 

This is blazing fast because it eliminates even the network hop to Redis. However, because each server has its own isolated memory, cache state is fragmented. If Server A updates a value, Server B will continue serving the stale local value. 

Use in-process caching strictly for small, immutable data (like configuration flags or country code lookups) or as an emergency optimization layer for extremely "hot" keys that are overwhelming Redis.

## Core Caching Architectures

How your application reads from and writes to the cache determines your system's performance and consistency guarantees.

### 1. Cache-Aside (Lazy Loading)
This is the most common pattern and should be your default choice.

**How it works:**
1. The application queries the cache for data.
2. If the data exists (Cache Hit), it returns immediately.
3. If the data is missing (Cache Miss), the application queries the database, saves the result into the cache, and then returns it.

**Trade-offs:** The cache only holds data that is actually requested, keeping memory utilization highly efficient. However, the first time data is requested, the user suffers a latency penalty (a "cold start").

### 2. Write-Through Caching
With write-through, the application treats the cache as the primary data store. 

**How it works:**
1. The application writes data directly to the cache.
2. The cache synchronously writes the data to the underlying database.
3. Only when both the cache and database confirm the write does the operation return success to the application.

**Trade-offs:** This guarantees strong consistency—the cache and database are always perfectly in sync. However, writes suffer a "double latency" penalty since the application must wait for two sequential network operations.

### 3. Write-Behind (Write-Back) Caching
This pattern is optimized for extreme write throughput.

**How it works:**
1. The application writes data to the cache and immediately receives a success response.
2. An asynchronous background process batches the updates and eventually flushes them to the database.

**Trade-offs:** Writes are incredibly fast. However, if the cache node crashes before the background flush occurs, data is permanently lost. This is acceptable for analytics pipelines or view counters, but catastrophic for financial transactions.

## Cache Eviction Policies

Memory is expensive and limited. When a cache fills up, it must intelligently evict old data to make room for new data.

- **LRU (Least Recently Used):** Evicts the item that has not been accessed for the longest time. This is the industry standard default. It perfectly aligns with the Pareto principle (80% of traffic hits 20% of the data).
- **LFU (Least Frequently Used):** Evicts the item with the lowest overall access count. Better for long-term trending data, but requires heavier metadata tracking.
- **TTL (Time-To-Live):** Not strictly an eviction policy, but a mandatory expiration timer. Every key is given a lifespan (e.g., 10 minutes). Once expired, the key is automatically deleted, ensuring data never goes permanently stale.

## Managing Cache Failures

Interviewers will test your understanding of distributed systems by asking what happens when your caching layer degrades.

### 1. Cache Consistency (Stale Data)
Because the cache and database are separate systems, they can easily fall out of sync. If a user updates their profile picture, the database has the new image, but the cache might still hold the old one.

**Mitigation:** 
- **Invalidation:** When the application writes to the database, it must explicitly issue a \`DELETE\` command to the cache for that key. The next read will result in a cache miss and fetch the fresh data.
- **Short TTLs:** Accept eventual consistency by setting a short TTL (e.g., 60 seconds). The data will be wrong for a maximum of 60 seconds before automatically fixing itself.

### 2. The Thundering Herd (Cache Stampede)
Imagine a viral post cached with a TTL of 60 seconds. At exactly 12:01:00, the cache expires. In that exact millisecond, 10,000 concurrent requests ask Redis for the post. Redis replies "Cache Miss" to all 10,000 requests. All 10,000 application threads instantly pivot and execute a heavy query against the SQL database, instantly crashing it.

**Mitigation:**
- **Request Coalescing (Promise Deduping):** The application layer detects that multiple threads are asking for the same missing key. It allows only *one* thread to query the database, while the other 9,999 threads are paused in memory to wait for the first thread's result.
- **Probabilistic Early Expiration:** Artificially refresh the cache *before* the TTL actually expires in the background.

### 3. Hot Keys
If a massive celebrity joins your platform, a single cache key (\`user:taylor_swift\`) might receive millions of requests per second. Because consistent hashing maps a single key to a single specific Redis node, that single node will experience 100% CPU utilization and melt down, while the other 99 Redis nodes sit idle.

**Mitigation:**
- **In-Process Caching:** The application servers detect the hot key and temporarily cache it in their local RAM for 5 seconds, entirely shielding the Redis cluster from the traffic spike.
- **Key Salting:** Duplicate the data across multiple keys (e.g., \`user:taylor_swift:1\`, \`user:taylor_swift:2\`) to force the hash ring to distribute the traffic across multiple Redis nodes.

## Conclusion

Caching is the ultimate weapon for read-heavy systems, but it is not a silver bullet. Always start by identifying your specific database bottleneck. Propose an external Cache-Aside architecture using Redis and LRU eviction. Finally, proactively discuss how you will handle cache invalidation and mitigate stampedes to prove you understand the operational realities of distributed caching.
`;
