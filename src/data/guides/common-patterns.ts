export const content = `
# Common Patterns

A curated collection of essential architectural patterns frequently utilized in system design interviews.

While understanding individual components like databases and caches is crucial, mastering system design requires knowing how to combine these pieces to solve specific, recurring challenges. Recognizing these architectural patterns allows you to quickly draft robust solutions and avoid reinventing the wheel under pressure.

Senior engineers distinguish themselves by quickly identifying which pattern applies to a given problem, acknowledging its limitations, and mitigating its common failure modes.

## Real-Time Data Push

Many modern applications require immediate data updates pushed from the server to the client, bypassing traditional request-response cycles. Examples include live chat, collaborative editing, and dynamic financial dashboards.

Implementing real-time architecture requires selecting the right communication protocol. While continuous HTTP polling is easy to implement, it creates massive unnecessary overhead. Server-Sent Events (SSE) offer a lightweight solution for one-way server-to-client streaming. For full two-way communication, WebSockets are the industry standard, though they introduce significant infrastructure complexity.

Managing these persistent connections at scale often involves Pub/Sub messaging brokers to route events across a cluster of stateful WebSocket servers.

## Asynchronous Background Processing

Operations that require substantial compute time—such as video transcoding, bulk email dispatch, or complex data aggregation—should never block a user's HTTP request. 

This pattern separates the immediate user interaction from the heavy lifting. When a user triggers a heavy task, the web server quickly records the intent in a Message Queue (like RabbitMQ or Kafka) and immediately returns a success response or task ID to the user. Independently, a fleet of background worker processes consumes tasks from the queue at their own pace and updates a database upon completion.

![Long Running Tasks](/images/system-design/long_running_tasks_1789108799370.jpg)

While powerful, introducing message queues adds architectural overhead. For tasks that take only a few hundred milliseconds, standard synchronous processing is often simpler and provides better immediate error handling to the user.

## Managing Concurrency and Contention

When thousands of users attempt to modify the same record simultaneously—such as purchasing the final ticket to a concert—the system must prevent data corruption and race conditions.

Resolving contention involves careful synchronization. Solutions range from utilizing the ACID transaction guarantees and row-level locks built into relational databases, to employing Optimistic Concurrency Control (using version numbers). When scaling across multiple distributed services, you may need to implement external Distributed Locks or rely on queue-based serialization to process concurrent requests one at a time.

## Scaling Read-Heavy Workloads

Most consumer applications experience vastly more read requests than write requests (often a 100:1 ratio). As traffic surges, the database's read capacity is usually the first bottleneck.

Addressing this involves a tiered approach. First, optimize the existing database using proper indexing strategies. Next, introduce horizontal scaling by deploying Read Replicas, allowing multiple database instances to serve read queries while a primary instance handles all writes. Finally, offload traffic entirely by placing an in-memory caching layer (like Redis) and a CDN in front of the application infrastructure.

## Scaling Write-Heavy Workloads

When an application generates tens of thousands of writes per second (e.g., IoT telemetry or high-volume analytics), standard databases will quickly hit disk I/O and CPU limits.

Scaling writes requires distributing the load. Horizontal Sharding splits the database across multiple physical servers based on a shard key. Vertical Partitioning separates unrelated tables into completely different databases. Additionally, placing a high-throughput message broker in front of the database can absorb sudden traffic spikes, allowing the database to process the backlog at a sustainable rate without dropping requests.

## Processing Large Media Files

Handling massive payloads like high-definition video uploads requires specialized workflows. Routing gigabytes of data directly through standard application servers will quickly exhaust their memory and bandwidth.

The standard pattern utilizes direct-to-storage uploads via pre-signed URLs. The client application requests secure, temporary credentials from the backend server. The client then uses these credentials to upload the file directly to an object storage service (like Amazon S3), completely bypassing the application servers. The storage service can then trigger a webhook to notify the backend once the upload completes.

## Orchestrating Multi-Step Workflows

Complex business transactions—like fulfilling an e-commerce order—often require coordinating actions across multiple distinct microservices (Payment, Inventory, Shipping). 

Managing these distributed transactions requires handling partial failures and implementing retry logic. While simple systems might use choreographed event-driven messaging, complex workflows benefit from dedicated Workflow Engines or durable execution frameworks (like AWS Step Functions or Temporal). These tools track the state of the overarching transaction, orchestrate the sequence of service calls, and automatically execute rollback procedures (compensating transactions) if a step fails.
`;
