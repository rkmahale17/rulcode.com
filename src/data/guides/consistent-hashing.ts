export const content = `
# Consistent Hashing

Consistent hashing is a foundational algorithmic technique in distributed systems. It is the magic that allows massive clusters of databases, caches, and edge servers to scale dynamically without catastrophic downtime.

While preparing for system design interviews, you will inevitably encounter it. Let's explore exactly what problem it solves, how the math works, and how to discuss it in an interview.

![Consistent Hashing Ring](/images/system-design/consistent_hashing_ring.jpg)

## The Problem: Modulo Hashing Fails at Scale

Imagine you have a massive dataset that you want to shard across 3 database servers. The standard approach is **Modulo Hashing**. You take a key (like a User ID), hash it to get a large integer, and apply a modulo operation against the total number of servers:

\`\`\`text
database_index = hash(user_id) % 3

User 101 -> hash(101) % 3 = Server 2
User 102 -> hash(102) % 3 = Server 0
User 103 -> hash(103) % 3 = Server 1
\`\`\`

This works perfectly—until your platform goes viral and you need to add a 4th server to handle the load.

You update your algorithm to \`hash(user_id) % 4\`. Suddenly, the mathematical mappings for almost every single user change. User 101 might now map to Server 0. User 102 to Server 3. 

**This is catastrophic.** Because the mappings changed, you must physically migrate terabytes of data across the network to their new server homes. During this migration, the database cluster will grind to a halt, completely overwhelming your network bandwidth. The same disaster occurs if a server crashes and the denominator drops to \`% 2\`.

Modulo hashing is entirely inflexible. Enter Consistent Hashing.

## How Consistent Hashing Works

Consistent Hashing solves the massive redistribution problem by arranging both the data keys and the servers onto an abstract mathematical circle, known as the **Hash Ring**.

1. **The Hash Space:** Imagine a circle representing all possible outputs of a cryptographic hash function (typically from \`0\` to \`2^32 - 1\`).
2. **Placing Servers:** You hash the IP addresses (or IDs) of your 4 database servers and plot them as points on this ring.
3. **Placing Data:** To find where a piece of data belongs, you hash the User ID to get a position on the ring.
4. **Routing:** From the data's position on the ring, you simply travel **clockwise** until you encounter the first server. That server owns the data.

### Why This Solves the Problem

Let's look at what happens when the cluster topology changes:

**Adding a Server:** 
If you add a 5th server to the ring, it simply drops into a spot between two existing servers. It will take over the data routing for the small slice of the ring immediately counter-clockwise to it. **All other servers and data on the ring remain completely untouched.** Instead of migrating 100% of your data, you only migrate ~20%.

**Removing a Server:**
If Server 2 crashes, it disappears from the ring. The data that routed to Server 2 will now travel further clockwise and land on Server 3. Again, the rest of the ring is completely unaffected. 

## The Flaw: Uneven Distribution

While elegant, a basic hash ring has a critical flaw. Cryptographic hashes are random. When you hash 4 server IPs onto a massive circle, they will not be perfectly spaced out. 

Server A and Server B might land right next to each other, while Server C commands a massive, empty hemisphere of the ring. Server C will absorb 70% of the traffic and melt down, defeating the entire purpose of load balancing.

### The Solution: Virtual Nodes

To fix this, distributed systems use **Virtual Nodes**. 

Instead of placing Server A on the ring once, we apply 1,000 different hash functions to its IP address (e.g., \`hash(Server_A_1)\`, \`hash(Server_A_2)\`). Server A now appears as 1,000 distinct "virtual" points scattered randomly across the ring. 

When you do this for all servers, the virtual nodes intermingle perfectly. The statistical distribution becomes incredibly smooth, ensuring every physical server receives an identical share of the load. Furthermore, if a physical server crashes, its 1,000 virtual nodes disappear, and its workload is smoothly absorbed by all other servers on the ring, rather than crushing a single clockwise neighbor.

## Consistent Hashing in the Real World

Consistent Hashing is not an academic theory; it powers the internet.

- **Distributed Databases:** Amazon DynamoDB and Apache Cassandra use variations of consistent hashing to route partition keys to physical cluster nodes.
- **Content Delivery Networks (CDNs):** Akamai and Cloudflare use consistent hashing to determine which edge server in a datacenter should cache a specific video file.
- **Distributed Caches:** Large Redis or Memcached clusters use it to scale out caching layers without invalidating the entire cache when a node restarts.

*(Note: Some systems, like Redis Cluster, use a simplified variant called Fixed Hash Slots, mapping keys to 16,384 static slots rather than a continuous ring, but the principle of minimizing data movement remains).*

## Interview Strategy

You rarely need to code a consistent hashing algorithm in an interview. Its power lies in understanding *why* systems use it.

When an interviewer asks, "How do we scale this database from 10 to 100 nodes without downtime?", your answer should be: 
*"We will partition the data using Consistent Hashing. By utilizing a hash ring with virtual nodes, we can dynamically add capacity to the cluster. The virtual nodes ensure the new data distribution is perfectly balanced, and we only have to migrate a small fraction of the data over the network, avoiding a catastrophic full-cluster rebalancing."*
`;
