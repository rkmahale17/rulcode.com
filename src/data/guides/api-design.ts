export const content = `
# API Design

In system design interviews, defining how clients interact with your system is a critical component of establishing your system's boundaries.

API design generally follows predictable patterns. You must select a protocol, define your core resources, and specify the contracts for how data is passed and returned. While this guide won't make you an API design master, it covers all the essentials needed to excel during this segment of your interview.

Most interviewers aren't looking for absolute perfection in your API specs. They want to see that you can define a logical, scalable interface and quickly move on to the more complex architectural challenges. However, if you are interviewing for frontend or product-focused roles, or if you are a junior candidate, expect heavier scrutiny on your API design decisions.

## Choosing an API Protocol

In an interview, you will typically choose between three primary protocols:

1. **REST (Representational State Transfer):** REST uses standard HTTP methods to manipulate resources identified by URLs. For standard CRUD operations in web and mobile applications, REST maps naturally to database operations and HTTP semantics. **This should be your default choice.**
2. **GraphQL:** Unlike REST's fixed endpoints, GraphQL uses a single endpoint with a query language that lets clients specify exactly what data they need. This eliminates over-fetching (downloading unused data) and under-fetching (requiring multiple requests). Consider GraphQL if the interviewer emphasizes "flexible data fetching" or differing client needs.
3. **RPC (Remote Procedure Call):** Protocols like gRPC use binary serialization over HTTP/2 for highly efficient communication. While REST treats everything as resources, RPC is action-oriented (e.g., \`checkPermission(userId, resource)\`). Use RPC for high-performance, internal microservice communication.

If you are unsure, default to REST. It is universally understood and works perfectly for the vast majority of use cases. 

## REST in Depth

Since REST is the recommended default, let's explore how to design strong REST APIs for interviews. A truly "RESTful" API adheres to the constraints of the architecture, including statelessness, cacheability, and a uniform interface. 

*(Advanced Note: The Richardson Maturity Model grades REST APIs. Level 0 is using HTTP as a transport mechanism like RPC. Level 1 introduces resources. Level 2 introduces standard HTTP verbs and status codes—this is where most APIs sit. Level 3 introduces HATEOAS, where responses contain hypermedia links to discoverable actions. You rarely need to implement Level 3 in an interview, but mentioning it shows deep domain expertise.)*

### Resource Modeling

The foundation of REST API design is correctly identifying your resources. If you have already defined your core entities during your database design step, they will naturally map to your resources.

Consider a ticketing system. Your core entities are events, venues, tickets, and bookings. These map directly to REST endpoints:
\`\`\`text
GET /events                    # Fetch a paginated list of all events
GET /events/{id}               # Fetch a specific event
GET /venues/{id}               # Fetch a specific venue
GET /events/{id}/tickets       # Fetch available tickets for an event
POST /events/{id}/bookings     # Create a new booking for an event
GET /bookings/{id}             # Fetch a specific booking
\`\`\`

Crucially, REST resources must represent **nouns** (things), not **verbs** (actions). Avoid endpoints like \`/bookEvent\` or \`/purchaseTicket\`. Furthermore, use plural nouns consistently (\`/events\`, not \`/event\`). 

When modeling relationships, you have two approaches:
- **Nested Resources (\`/events/{id}/tickets\`):** Use this when the relationship is strict and required. The child resource (tickets) doesn't make logical sense outside the context of the parent (event).
- **Query Parameters (\`/tickets?event_id=123\`):** Use this when the relationship is an optional filter. You might want to view all tickets globally, or filter them by event.

### HTTP Methods and Idempotency

HTTP provides a standardized set of verbs that map to common operations:

- **GET:** Retrieves data without changing the server's state. 
- **POST:** Creates new resources. Calling POST multiple times creates multiple duplicate resources.
- **PUT:** Completely replaces an entire resource, or creates it if it doesn't exist. You must send the entire payload.
- **PATCH:** Partially updates specific fields of an existing resource.
- **DELETE:** Removes a resource.

The most critical concept for distributed systems here is **Idempotency**. An operation is idempotent if executing it multiple times leaves the server in the exact same state as executing it once. \`GET\`, \`PUT\`, and \`DELETE\` are intrinsically idempotent. \`POST\` is not. 

Understanding idempotency is critical because networks fail. If a client sends a \`POST /bookings\` request, and the server processes it but the network drops the response, the client doesn't know if the booking succeeded. If they blindly retry the \`POST\`, they might book the tickets twice. We will solve this later with Idempotency Keys.

### Passing Data to APIs

You have three mechanisms for passing input to a REST API:

1. **Path Parameters (\`/events/123\`):** Used to identify a specific, required resource within the hierarchical URL structure.
2. **Query Parameters (\`/events?city=NYC&sort=date\`):** Used to filter, sort, or paginate collections. They are optional modifiers appended to the URL.
3. **Request Body:** Contains complex, nested JSON payload data required to create or update a resource. 

Here is a comprehensive example combining all three:
\`\`\`text
POST /events/123/bookings?notify_user=true
{
  "tickets": [
    {"section": "VIP", "quantity": 2}
  ],
  "payment_method": "credit_card"
}
\`\`\`
The event ID is in the path because it's the target resource. \`notify_user\` is a query parameter because it modifies server behavior. The core booking details reside securely in the JSON body.

### Returning Data and Error Handling

An API response consists of an HTTP Status Code and a Response Body. Proper use of status codes tells the client exactly how to handle the response programmatically.

- **2xx Success:**
  - \`200 OK\`: Standard success.
  - \`201 Created\`: Success, and a new resource was created (typically returned by POST).
- **4xx Client Errors (The client sent a bad request):**
  - \`400 Bad Request\`: Malformed syntax or invalid payload data.
  - \`401 Unauthorized\`: Missing or invalid authentication token.
  - \`403 Forbidden\`: Authenticated, but lacking permission to access this specific resource.
  - \`404 Not Found\`: The requested resource does not exist.
  - \`429 Too Many Requests\`: Rate limit exceeded.
- **5xx Server Errors (The backend failed):**
  - \`500 Internal Server Error\`: Unhandled exception in the backend.
  - \`503 Service Unavailable\`: Server is overloaded or down for maintenance.

When returning errors, always return a consistent JSON error envelope so clients can parse errors predictably:
\`\`\`json
{
  "error": {
    "code": "INSUFFICIENT_INVENTORY",
    "message": "Only 1 VIP seat remaining."
  }
}
\`\`\`

## GraphQL Deep Dive

GraphQL consolidates data fetching into a single endpoint. The client sends a query specifying the exact fields it needs, and the server returns precisely that shape.

\`\`\`graphql
query {
  event(id: "123") {
    name
    date
    venue {
      name
      capacity
    }
  }
}
\`\`\`

**When to Use GraphQL:** Mention GraphQL when the interviewer asks how to handle diverse clients with rapidly changing data requirements, or how to avoid over-fetching on constrained mobile networks. 

**The N+1 Problem:** Be prepared to discuss GraphQL's biggest drawback: the N+1 database query problem. If you query a list of 50 events, and request the \`venue\` for each, a naive GraphQL implementation will execute 1 query to fetch the events, and then 50 separate database queries to fetch each venue. The standard solution is to implement the **DataLoader** pattern, which batches and caches database requests within a single GraphQL resolution cycle, turning 51 queries into 2.

## RPC and gRPC

RPC (Remote Procedure Call) treats network requests as local function calls. Instead of fetching a resource, you trigger a named action.

\`\`\`javascript
// REST
POST /events/123/bookings

// RPC
createBooking(eventId: "123", userId: "456", tickets: [...])
\`\`\`

The industry standard is gRPC, which utilizes Protocol Buffers (protobuf) for binary serialization and HTTP/2 for transport. You define strict, strongly-typed contracts in a \`.proto\` file.

**When to Use RPC:** gRPC is exceptionally fast. Because Protobuf serializes data into a compact binary format rather than a massive JSON text string, it drastically reduces network bandwidth and CPU parsing overhead. It is the gold standard for internal service-to-service communication within microservices architectures. However, it is rarely used for public-facing client APIs due to poor browser support.

## Common API Patterns

### Pagination
Returning millions of records in a single response will crash your system, exhaust memory, and timeout the connection. You must paginate collection endpoints.

- **Offset-based Pagination (\`?limit=10&offset=20\`):** Simple to implement, but heavily flawed at scale. In a SQL database, \`OFFSET 100000\` requires the database engine to scan 100,000 rows, load them into memory, and then discard them just to return the next 10. This causes severe O(N) performance degradation as pages increase. Furthermore, if data is inserted during pagination, items will shift, causing clients to see duplicate records across pages.
- **Cursor-based Pagination (\`?limit=10&cursor=abc123X\`):** The modern standard. The server returns a "cursor" (often an encoded timestamp or ID pointer to the last retrieved record). The next request asks for "10 items AFTER this cursor." In the database, this translates to a highly optimized index seek (\`WHERE id > cursor LIMIT 10\`), which executes in O(1) time regardless of how deep into the dataset the user scrolls.

### Idempotency Keys
To solve the double-booking problem caused by network retries on \`POST\` requests, implement Idempotency Keys. 

When a client submits a critical request (like a payment), they generate a unique UUID and send it in an \`Idempotency-Key\` HTTP header. The server saves this key in a fast key-value store (like Redis) alongside the transaction result. If the client's network drops and they retry the exact same request with the exact same key, the server intercepts it, recognizes the key, and immediately returns the cached success response without re-executing the payment logic. 

### API Versioning
APIs evolve. To avoid breaking existing mobile apps that users haven't updated, you must version your APIs. The most practical approach is **URL versioning** (\`/v1/events\` vs \`/v2/events\`). While header-based versioning (\`Accept-Version: v2\`) is technically cleaner and adheres closer to HTTP purity, URL versioning is universally understood, highly visible, and easiest to explain and debug.

## Security Considerations

While often glossed over in rapid whiteboard sessions, proactively mentioning security demonstrates senior-level production maturity.

### Authentication vs. Authorization
- **Authentication (Who are you?):** Verifying the identity of the user (e.g., verifying a password or checking a session token).
- **Authorization (What can you do?):** Verifying the authenticated user has permission to perform the requested action (e.g., ensuring User A cannot delete User B's bookings). This is often implemented via Role-Based Access Control (RBAC).

### API Keys vs JWT Tokens
- **API Keys:** Long cryptographic strings securely stored in the database. When an API key is provided, the server must query the database to validate it and fetch the associated user permissions. Perfect for server-to-server communication or third-party developer access.
- **JWT (JSON Web Tokens):** Cryptographically signed payloads that encode user identity and roles directly inside the token string itself. A JWT consists of three parts: a Header, a Payload (containing user ID and expiry data), and a Signature. Because the server can verify the signature mathematically using a secret key, JWTs are completely **stateless**. They require zero database lookups to validate, making them the superior choice for high-scale, user-facing applications.

### Rate Limiting
To prevent abuse, credential stuffing, or unintentional DDoS attacks from misconfigured clients, your API Gateway must implement rate limiting (e.g., 100 requests per minute per IP address). Rate-limited clients receive a \`429 Too Many Requests\` response. Common implementations use algorithms like the Token Bucket or Sliding Window Log in an in-memory datastore like Redis.

## Conclusion

API design in system design interviews is about demonstrating solid engineering judgment. Focus on choosing the right protocol (usually REST), modeling your resources clearly, and applying consistent patterns. Do not spend more than 5 minutes outlining your APIs—prove you understand the contracts, mention idempotency, pagination, and JWTs, and quickly move on to the architectural deep dives!
`;
