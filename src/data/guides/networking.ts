export const content = `
# Networking Fundamentals

Networking is an unavoidable pillar of system design: almost every architecture you build will consist of multiple independent machines communicating over a network. While the field of networking is incredibly deep, you don't need to be a network engineer to pass a system design interview.

In this guide, we will distill the most critical networking concepts you need to know. We will explore the fundamentals of how networks operate, examine the crucial protocols at various layers of the stack, and discuss when to apply them in your system designs.

While networking is heavily emphasized in infrastructure and distributed systems roles, even full-stack engineers benefit immensely from understanding these core principles. Recognizing how data moves across the wire will help you make smarter architectural decisions, especially when debugging latency spikes or designing for high availability.

## The Network Layers and the OSI Model

At its foundation, networking is about enabling devices to talk to one another. To simplify this immense complexity, networks are built on a layered architecture known as the Open Systems Interconnection (OSI) model. These layers act as strict abstractions. Just as you don't need to manually instruct a hard drive how to read magnetic sectors when opening a file, you don't need to know how voltages are modulated on an ethernet cable to send an HTTP request.

![OSI Model Layers](/images/system-design/osi_model_layers_1789120126074.jpg)

The OSI model divides network communication into seven distinct layers, each serving a specific purpose:

1. **Physical Layer:** The actual hardware, cables, switches, and electrical signals that transmit raw bitstreams (1s and 0s) over a physical medium.
2. **Data Link Layer:** Handles node-to-node data transfer across a direct physical connection (like your computer to your home router). It uses MAC addresses to identify devices locally.
3. **Network Layer:** Handles routing data across multiple distinct networks. The Internet Protocol (IP) lives here, using IP addresses to route packets globally from a source to a destination.
4. **Transport Layer:** Ensures reliable, end-to-end data transfer between applications. Protocols like TCP and UDP operate here, managing packet sequencing, error recovery, and multiplexing via port numbers.
5. **Session Layer:** Establishes, maintains, and terminates communication sessions between two applications.
6. **Presentation Layer:** Translates data between the application layer and the network format. This handles data formatting, serialization (like converting objects to JSON), encryption (like TLS/SSL), and compression.
7. **Application Layer:** The highest layer, where end-user applications interact with network services. Protocols like HTTP, WebSockets, DNS, and SMTP reside here.

While understanding all seven layers shows great depth, system design interviews primarily focus on the **Network (Layer 3)**, **Transport (Layer 4)**, and **Application (Layer 7)** layers.

## Anatomy of a Web Request

To understand how these layers interact, let's look at what happens when you type a URL into your browser:

1. **DNS Resolution (Application Layer):** Your browser uses the Domain Name System (DNS) to translate the human-readable domain name into a machine-readable IP address (like \`192.168.1.1\`).
2. **TCP Handshake (Transport Layer):** The client initiates a reliable connection with the server using a three-way handshake (SYN, SYN-ACK, ACK).
3. **TLS Negotiation (Presentation Layer):** If using HTTPS, the client and server exchange cryptographic keys to establish a secure, encrypted tunnel.
4. **HTTP Request (Application Layer):** Over the established TCP connection, the browser sends an HTTP GET request asking for the webpage.
5. **Server Processing:** The server receives the request, queries its databases, and generates the HTML response.
6. **HTTP Response (Application Layer):** The server sends the HTML content back to the client.
7. **TCP Teardown (Transport Layer):** Once the data transfer is complete, the connection is gracefully closed using a four-way handshake (FIN, ACK, FIN, ACK).

As application developers, we heavily rely on the guarantees provided by these lower layers. We can send an HTTP request and trust that TCP will handle packet ordering and retransmission if data is lost. Furthermore, every hop and handshake introduces latency. Establishing a brand new TCP and TLS connection for every single request adds significant overhead, which is why modern architectures utilize **connection pooling**, **HTTP keep-alives**, and **multiplexing**.

## Transport Layer Protocols

In almost every system design interview, you will implicitly or explicitly choose between TCP and UDP. Understanding the nuances of how they work is critical.

### UDP: Fast but Unreliable
The User Datagram Protocol (UDP) is a lightweight, connectionless protocol. It is incredibly fast because it simply fires packets (datagrams) at a destination without waiting to confirm they were received. 

**Characteristics:**
- **No Handshake:** Data is sent immediately, saving round-trip latency.
- **No Delivery Guarantees:** Packets can be silently dropped by congested routers.
- **No Ordering Guarantees:** Packet 3 might arrive before Packet 1. The application must sort them out if order matters.

**When to use UDP:**
UDP is ideal when speed is paramount and occasional data loss is acceptable. Real-time multiplayer gaming, live video streaming, and VoIP calls use UDP. If a single frame of video drops, the stream skips slightly, which is vastly preferable to pausing the entire video to wait for a retransmitted packet. It's also used for rapid, lightweight queries like DNS lookups.

### TCP: Reliable but with Overhead
The Transmission Control Protocol (TCP) is the backbone of the internet. It provides a reliable, stateful connection (a "stream") between two machines.

**How TCP Guarantees Reliability:**
- **Sequence Numbers:** Every packet is assigned a sequence number. The receiver uses these numbers to reassemble packets in the exact correct order, even if they arrive out of sequence.
- **Acknowledgments (ACKs):** When the receiver gets a packet, it sends an ACK back to the sender. If the sender doesn't receive an ACK within a certain timeout period, it assumes the packet was lost and **retransmits** it.
- **Flow Control (Sliding Window):** TCP ensures the sender doesn't overwhelm the receiver by transmitting data faster than the receiver can process it. The receiver advertises a "window size" indicating how much buffer space it has left.
- **Congestion Control:** TCP algorithms detect network congestion (usually inferred through dropped packets) and automatically slow down the transmission rate to prevent the network from collapsing.

**When to use TCP:**
TCP is the default choice for almost everything: web browsing, file transfers, database queries, and API calls. Whenever data integrity is strictly required—like processing a financial transaction or sending an email—TCP is the answer.

## Application Layer Protocols

### HTTP/HTTPS: The Web's Foundation
HTTP is a stateless request-response protocol. "Stateless" means the server does not retain memory of previous requests natively, which makes scaling HTTP servers horizontally incredibly easy.

HTTP relies on standard verbs (GET, POST, PUT, DELETE) and status codes. It is highly extensible through Headers, allowing clients and servers to negotiate content types and compression formats. HTTPS is the encrypted version, utilizing TLS to secure data in transit.

### REST APIs
REST (Representational State Transfer) is the standard architectural style for building HTTP APIs. Instead of defining RPC-style actions (like \`updateUser\`), REST models the system as a collection of resources manipulated by HTTP verbs. It should be your default choice for external-facing APIs in an interview.

### GraphQL
GraphQL allows clients to request exactly the data they need in a single query, preventing the classic REST issues of "under-fetching" (requiring multiple API calls to render one page) and "over-fetching" (downloading massive payloads when only a few fields are needed). 

### gRPC
gRPC is a high-performance framework developed by Google. It operates over HTTP/2 and utilizes Protocol Buffers (Protobuf) instead of JSON. 

Protobuf compresses data into a highly efficient binary format, drastically reducing payload sizes and parsing times compared to JSON. Furthermore, gRPC enforces strict contracts between services. Use gRPC for internal, service-to-service communication within a microservices architecture where performance and low latency are critical.

### WebSockets & Server-Sent Events (SSE)
- **SSE:** A unidirectional protocol built on top of standard HTTP. It allows the server to push a continuous stream of events to the client over a single long-lived connection. Best for live stock tickers or news feeds.
- **WebSockets:** Provide a persistent, fully bidirectional communication channel over a single TCP connection. Best for chat applications and collaborative editing.

## Load Balancing Deep Dive

As your system scales beyond a single server, you must implement load balancing to distribute incoming traffic. Load balancers not only distribute load but also continuously monitor the health of your backend servers via **Health Checks**, automatically removing crashed instances from the routing pool.

### Dedicated Load Balancers
For public-facing traffic, you will use a dedicated load balancer—a specialized server sitting between the public internet and your backend.

**Layer 4 Load Balancers:**
L4 load balancers operate at the transport layer, routing traffic based purely on IP addresses and TCP ports. They do not decrypt or inspect the contents of the HTTP request. Because they are so lightweight, they are incredibly fast and can handle millions of concurrent connections. They are the preferred choice for routing persistent TCP connections, like WebSockets, or massive volumes of raw data.

**Layer 7 Load Balancers:**
L7 load balancers operate at the application layer. They decrypt the TLS encryption and inspect the actual HTTP request. This allows them to make incredibly smart routing decisions. For example, an L7 load balancer can route requests starting with \`/api/\` to a cluster of Node.js servers, route requests for \`/images/\` directly to an S3 bucket, or route requests containing a specific user cookie to a designated sticky server ("Sticky Sessions").

### Active/Passive vs Active/Active
When deploying load balancers, you must ensure the load balancer itself doesn't become a single point of failure (SPOF). 
- **Active/Passive:** Two load balancers are deployed. The primary handles all traffic. The secondary simply monitors the primary. If the primary fails, the secondary takes over its IP address instantly via a heartbeat protocol.
- **Active/Active:** Both load balancers handle traffic simultaneously, usually distributed by DNS Round Robin. If one fails, DNS stops routing to it, though DNS propagation delays can cause temporary downtime for some users.

## Resiliency and Fault Tolerance

Networks are inherently unreliable. When designing distributed systems, you must account for hardware failures, network partitions, and latency spikes.

### Timeouts and Retries with Exponential Backoff
Never let a network call hang indefinitely. Always set strict timeouts on every downstream call. When a request fails, the client should retry it. However, if a backend database is struggling, having thousands of clients immediately retry their queries simultaneously will cause a "thundering herd" effect, completely destroying the database.

To prevent this, implement **Exponential Backoff with Jitter**. The client waits progressively longer between each retry attempt (e.g., 1s, 2s, 4s, 8s). Critically, you must add a random amount of time ("jitter") to the delay so that all clients don't synchronize and hit the server at the exact same millisecond.

### Circuit Breakers
If a downstream microservice goes completely offline, continuously attempting to contact it wastes network resources, ties up connection pools, and blocks CPU threads. 

A **Circuit Breaker** acts as an electrical fuse for your code. It continuously monitors the failure rate of network calls to a specific service. 
- **Closed State:** Everything is normal. Requests flow through.
- **Open State:** If the failure rate crosses a threshold (e.g., 50% failures in 10 seconds), the circuit "trips" Open. All subsequent requests are immediately rejected locally without even attempting the network call. This prevents cascading failures and gives the downstream service time to recover.
- **Half-Open State:** After a cooldown period, the circuit allows a single test request through. If it succeeds, the circuit closes. If it fails, it trips Open again.

### Content Delivery Networks (CDNs)
Physics dictates that data cannot travel faster than the speed of light. A request from Tokyo to a server in New York will always suffer from ~200ms of latency simply due to the physical distance the fiber optic cables must traverse.

To combat this, architectures utilize CDNs. A CDN is a globally distributed network of proxy servers ("Edge Locations"). When a user requests a static asset (like an image, CSS file, or video), the request is routed to the geographically closest edge server. If the server has the asset cached, it serves it instantly with <10ms latency. If not, it fetches it from your origin server, caches it locally, and serves it. Modern CDNs can even cache dynamic API responses or execute edge computing functions close to the user.
`;
