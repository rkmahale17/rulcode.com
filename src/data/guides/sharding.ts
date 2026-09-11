export const content = `
# Database Sharding

As your application grows, you will inevitably hit the physical limitations of a single database server. You can vertically scale by adding more CPU and RAM, but eventually, you max out the largest available cloud instances. When a single database can no longer handle the storage volume or the read/write throughput, you have only one option: split your data across multiple machines.

This process is called **sharding**. While it is an absolute necessity at planetary scale, it introduces severe architectural complexity.

![Database Sharding Architecture](/images/system-design/database_sharding.jpg)

## Partitioning vs. Sharding

Engineers often use these terms interchangeably, but they have distinct technical meanings.

- **Partitioning:** Splitting a massive table into smaller logical pieces *inside a single database instance*. For example, partitioning an \`Orders\` table by month. The data never leaves the machine, but queries can scan smaller indexes.
- **Sharding (Horizontal Partitioning):** Splitting data across *multiple independent database machines*. Each shard is a standalone database with its own CPU, memory, and disk. Together, the shards make up the complete logical dataset.

## Choosing a Shard Key

When you shard, you must choose a **Shard Key**—the specific column used to determine which machine a row belongs to. 

A bad shard key leads to catastrophic failure: uneven data distribution, "hot spots" where one shard melts down while others sit idle, and queries that must scatter-gather across every machine. 

A good shard key must have:
1. **High Cardinality:** The key must have millions of unique values. Sharding by a boolean \`is_premium\` field limits you to exactly two shards. Sharding by \`user_id\` allows infinite scaling.
2. **Even Distribution:** Data must spread evenly. Sharding by \`country\` is a disaster if 90% of your users live in the US—the US shard will crash.
3. **Query Alignment:** The key must align with your primary access patterns. If you shard by \`user_id\`, a query to fetch "User A's profile and recent posts" hits exactly one shard.

## Sharding Strategies

Once you have a key, how do you mathematically route the data?

### 1. Range-Based Sharding
Data is divided by contiguous ranges. For example, User IDs 1–10,000 go to Shard A, 10,001–20,000 to Shard B.
- **Pros:** Excellent for range queries (e.g., fetching a sequence of IDs).
- **Cons:** Highly susceptible to hot spots. If you shard by \`created_at\` timestamp, all new incoming writes will hammer the single "newest" shard, while historical shards sit idle.

### 2. Hash-Based Sharding (The Default)
You pass the Shard Key through a cryptographic hash function, and use a modulo operator to determine the shard: \`hash(user_id) % number_of_shards\`.
- **Pros:** Guarantees perfectly even distribution of data, preventing hot spots.
- **Cons:** Adding or removing a shard changes the modulo denominator, forcing almost every single row in the entire database to migrate to a new machine. (This is solved by Consistent Hashing).

### 3. Directory-Based Sharding
A centralized lookup table dictates where data lives. To find User 42, the application queries a routing service which replies, "User 42 is on Shard C".
- **Pros:** Ultimate flexibility. You can manually migrate heavy users to dedicated infrastructure.
- **Cons:** The directory service becomes a massive Single Point of Failure (SPOF) and adds latency to every single database query.

## The Pain of Sharding

Sharding solves scaling, but introduces three notorious problems:

### 1. The Celebrity Hot Spot
Even with perfect hash distribution, a shard can become overloaded if a specific key goes viral. If you shard by \`user_id\`, Taylor Swift's shard will handle 10,000x more traffic than a normal shard. Hash-based distribution doesn't help because the traffic is concentrated on a single key, not a single shard. You must mitigate this by caching the hot key or creating a dedicated VIP shard.

### 2. Cross-Shard Queries (Scatter-Gather)
If you shard by \`user_id\`, fetching a specific user's timeline is blazing fast. But what if you need to calculate "The Top 10 Trending Posts Globally"? You must send the query to all 64 shards, wait for 64 responses over the network, merge the data in application memory, sort it, and return the top 10. This is incredibly slow and expensive. You must rely heavily on denormalization or asynchronous background jobs to pre-calculate global aggregates.

### 3. Distributed Transactions
In a monolithic SQL database, you wrap multiple operations in an ACID transaction. If an error occurs, the database rolls back cleanly. In a sharded system, deducting money from User A (Shard 1) and adding it to User B (Shard 2) cannot happen in a single local transaction.

You are forced to implement complex distributed transaction protocols like **Two-Phase Commit (2PC)** or the **Saga Pattern**, settling for eventual consistency. The best strategy is to choose a shard key that ensures dependent data lives on the same shard, avoiding distributed transactions entirely.

## Conclusion

Sharding is a last resort. Do not propose sharding in an interview until you have exhausted vertical scaling, read replicas, and caching. When forced to shard, propose Hash-Based Sharding on a high-cardinality key (like \`user_id\`), and immediately address how you will handle cross-shard queries and hot spots to prove your senior architectural competence.
`;
