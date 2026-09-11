export const content = `
# Delivery Framework

A structured approach is the most effective way to organize your thoughts and highlight the crucial elements during a system design interview.

Failing to present a complete, functional system is the easiest way to jeopardize your interview. This is a frequent stumbling block for mid-level engineers, often manifesting as poor time management. The real issue usually isn't speed, but rather a lack of focus on the right priorities.

## Overall Structure

Our recommended framework outlines a sequence of steps to guide your interview process. Using this structure ensures you remain focused on what matters most to your evaluator. Furthermore, it provides a reliable safety net if you feel overwhelmed. Nervousness is normal, and having a linear path prevents you from getting derailed.

While interviewers don't explicitly grade you on having a "framework," a structured approach drastically improves your communication score and guarantees you cover all necessary bases to deliver a working architecture.

Here is the recommended process:

![Recommended system design interview structure](/images/system-design/delivery_framework_1789108746110.jpg)

### Requirements (~5 minutes)
The objective here is to fully comprehend the system you need to build. We recommend splitting this into two distinct categories.

#### 1) Functional Requirements
These are the core capabilities of the system—what the users can actually do. This should be a collaborative discussion with your interviewer. Ask targeted questions to clarify the scope and arrive at a concise, prioritized list of essential features.

For instance, if you were building a microblogging platform, your functional requirements might be:
- Users can publish text updates.
- Users can subscribe to updates from other users.
- Users can view a chronological timeline of updates from their subscriptions.

For an infrastructure component like a distributed cache:
- Services can store key-value pairs.
- Services can define expiration times for data.
- Services can retrieve data by key.

> [!IMPORTANT]
> Keep your list concise! The rest of the interview will focus on architecting a solution for these exact features. Many platforms have hundreds of capabilities, but your job is to isolate the top 3. A lengthy list of requirements will backfire by expanding the scope beyond what you can design in 45 minutes.

#### 2) Non-functional Requirements
These define the operational characteristics and constraints of the system, rather than specific user actions. 

Continuing the microblogging example, non-functional requirements might include:
- The platform must be highly available, even if it means occasional data inconsistency.
- The architecture must scale to handle over 100 million daily active users.
- The timeline generation must have a latency of less than 200 milliseconds.

Whenever possible, attach concrete metrics to these requirements. Stating "the system must be fast" is too vague. Specifying "search queries must resolve in under 500ms" gives you a measurable target that will influence your architectural decisions.

If you struggle to identify these constraints, consider this checklist to find the 3-5 most critical non-functional requirements:
- **CAP Theorem:** Does the system prioritize absolute data consistency or uninterrupted availability?
- **Environment Constraints:** Will this run on low-power devices, limited bandwidth, or high-end servers?
- **Scalability:** What are the expected traffic patterns? Are there massive spikes during specific events? What is the read-to-write ratio?
- **Latency:** Which specific operations require near-instantaneous responses?
- **Durability:** Can the business tolerate data loss? A social media site might lose a "like" without issue, but a financial ledger cannot lose a transaction.
- **Security:** What are the access control, compliance, and encryption needs?
- **Fault Tolerance:** How resilient must the system be to hardware failures or network outages?

#### 3) Capacity Estimation
Many resources recommend performing extensive back-of-the-envelope math early on. We advise against this unless the calculations directly dictate a design choice. In most cases, establishing that the system operates at a "massive, distributed scale" is sufficient. Calculating exact petabytes of storage often wastes time and only proves you can do basic arithmetic.

Tell your interviewer you'll defer specific calculations until they are needed to inform a technical decision. For instance, estimating the total number of active connections is crucial when deciding if a single server can handle WebSocket traffic or if a cluster is required.

### Core Entities (~2 minutes)
Briefly identify the primary data entities your system will manage. This establishes a shared vocabulary and lays the groundwork for your database schema. Write down a quick bulleted list.

For the microblogging example, the core entities would be:
- User
- Post
- Subscription/Follow

Avoid defining every database column at this stage. As you flesh out the architecture, you'll naturally discover additional fields and relationships.

### API or System Interface (~5 minutes)
Define the boundaries of your system by sketching out the API endpoints. This contract ensures your design will satisfy the functional requirements you established earlier.

Choose the appropriate protocol:
- **REST:** The standard choice for most HTTP-based services, utilizing standard verbs (GET, POST, PUT, DELETE) around resources.
- **GraphQL:** Ideal for complex client applications that need to query specific nested data efficiently.
- **RPC (e.g., gRPC):** Best for high-performance, internal service-to-service communication.

For our example, a REST API might look like this:
\`\`\`text
POST /v1/posts
body: { "content": string }

GET /v1/posts/{postId} -> Post

POST /v1/subscriptions
body: { "target_user_id": string }

GET /v1/timeline -> Post[]
\`\`\`

> [!WARNING]
> Never pass sensitive identity information (like the current user's ID) in the request body if it can be securely derived from an authentication token in the headers.

### [Optional] Data Flow (~5 minutes)
For asynchronous or batch-processing systems, outlining the step-by-step data pipeline can be highly beneficial before drawing the architecture. If your system is mostly synchronous CRUD operations, you can skip this.

### High Level Design (~10-15 minutes)
With the requirements and API defined, begin drafting the core architecture. Map out the components (clients, load balancers, application servers, databases) and show how requests flow through them.

Keep it simple initially! A common mistake is introducing complex message queues and caching layers before establishing a functional baseline. Design a straightforward system that fulfills the functional requirements first, and verbally note where you plan to add scalability components later.

### Deep Dives (~10 minutes)
Your initial high-level design likely won't meet the massive scalability metrics defined in your non-functional requirements. The final segment of the interview is dedicated to refining and hardening the architecture.

Use this time to:
- Introduce caching, sharding, and replication to meet scale and latency targets.
- Address edge cases and potential points of failure.
- Resolve bottlenecks identified by your interviewer.
- Discuss alternative technologies and their tradeoffs.
`;
