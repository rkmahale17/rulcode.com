export const content = `
# Key Technologies

## Distributed Locks

![Distributed Lock](/images/system-design/distributed_lock.jpg)

Distributed locks are essential mechanisms for ensuring that multiple independent processes do not simultaneously access or modify a shared resource. Typically implemented using fast, in-memory systems like Redis or ZooKeeper, they leverage atomic operations to guarantee exclusivity.

For instance, you might use a Redis key like \`order_processing_99\` as a lock. A process attempts to set this key; if successful, it has acquired the lock. If another worker tries to set the same key, the operation fails, indicating the resource is busy. Once the first worker finishes, it deletes the key, releasing the lock.

Crucially, distributed locks should always include a Time-To-Live (TTL) expiration. This prevents a complete system deadlock if the worker holding the lock crashes or loses network connectivity before it can explicitly release the lock.

Common scenarios for distributed locks include:
- **E-Commerce Inventory:** Temporarily reserving an item while a user completes the checkout flow to prevent overselling limited stock.
- **Driver Dispatch:** Ensuring a single ride-sharing driver isn't simultaneously matched with multiple different passengers by concurrent server processes.
- **Scheduled Background Jobs:** Preventing multiple servers in a cluster from executing the exact same daily reporting task at the same time.
- **High-Frequency Bidding:** Securing exclusive access to an auction item's database record during the final, chaotic seconds of bidding.

### Critical Considerations for Distributed Locks
- **Implementation Strategies:** Simple single-node locks are vulnerable to hardware failure. Robust implementations, such as the Redlock algorithm for Redis, utilize consensus across multiple independent instances to ensure reliability.
- **TTL Configuration:** Choosing the right expiration time is a balancing act between preventing deadlocks and ensuring long-running tasks aren't interrupted prematurely.
- **Deadlock Prevention:** Complex systems where processes acquire multiple locks simultaneously can lead to circular dependencies (deadlocks). Careful design is required to acquire locks in a consistent, deterministic order.

## Distributed Cache

A distributed cache is an in-memory data store spread across multiple servers, designed to drastically reduce data retrieval latency and offload traffic from primary databases. 

Common use cases include:
- **Storing Pre-computed Analytics:** Complex aggregations that take seconds to calculate can be run periodically and stored in the cache. Subsequent user requests retrieve the pre-calculated result instantly.
- **Session Management:** Storing active user session data in a fast cache rather than querying a relational database on every single HTTP request.
- **Accelerating Heavy Read Queries:** Storing the results of complex, multi-table database joins that are frequently requested but rarely updated.

### Critical Considerations for Distributed Caches
- **Eviction Policies:** When the cache reaches its memory limit, it must discard old data. Common algorithms include Least Recently Used (LRU) and Least Frequently Used (LFU).
- **Invalidation:** Stale data is the biggest challenge in caching. You must design mechanisms to delete or update cache entries whenever the source truth in the database changes.
- **Write Strategies:** Depending on your durability needs, you can Write-Through (updating the cache and database simultaneously), Write-Around (writing directly to the DB and invalidating the cache), or Write-Back (writing to the cache immediately and syncing to the DB asynchronously).

Redis and Memcached remain the industry standards for distributed caching. While Memcached focuses purely on simple string key-value storage, Redis offers advanced data structures like sorted sets, lists, and geospatial indexes.

## Content Delivery Networks (CDN)

![CDN Architecture](/images/system-design/cdn_edge_caching.jpg)

A Content Delivery Network (CDN) is a globally distributed network of proxy servers designed to serve content to users from locations geographically closest to them. This drastically reduces the physical distance data must travel, minimizing latency.

While traditionally used for heavy static assets like images, video streams, and compiled JavaScript bundles, modern CDNs are highly versatile. They operate by intercepting user requests; if the local edge server has a cached copy of the asset, it serves it immediately. If not, it requests the asset from the central origin server, caches it locally, and then serves it.

### Critical Considerations for CDNs
- **Dynamic Content Caching:** CDNs can now cache API responses and dynamic HTML pages, drastically reducing the load on your application servers.
- **Security Features:** CDNs act as the first line of defense, offering built-in DDoS mitigation and Web Application Firewalls (WAF).
- **Cache Expiration:** Managing CDN state relies heavily on HTTP headers (like \`Cache-Control\`) and programmatic invalidation APIs to ensure users don't receive outdated assets.
`;
