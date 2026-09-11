export const content = `
# The CAP Theorem

The CAP theorem is routinely a point of confusion for engineers, but it is fundamentally crucial to how you approach architectural design. During the non-functional requirements phase of a system design interview, understanding the trade-offs dictated by CAP will directly inform your database choices.

![CAP Theorem Triangle](/images/system-design/cap_theorem_triangle.jpg)

## What is the CAP Theorem?

At its core, the CAP theorem states that in any distributed data store, you can only mathematically guarantee **two** out of the following three properties at the same time:

1. **Consistency (C):** Every read receives the most recent write or an error. If a value is updated on Node A, an instant read from Node B will reflect that exact update. (Note: This is "Strong Consistency", which is entirely different from the "C" in database ACID properties).
2. **Availability (A):** Every request receives a non-error response, regardless of the state of individual nodes. However, there is no guarantee that the response contains the most recent write.
3. **Partition Tolerance (P):** The system continues to operate despite an arbitrary number of messages being dropped or delayed by the network between nodes.

## The Practical Reality of CAP

Here is the secret to mastering CAP in an interview: **In modern distributed systems, Partition Tolerance is not optional.** 

Networks are unreliable. Switches fail, fiber cables get cut, and firewalls misconfigure. Network partitions *will* happen. Therefore, you cannot sacrifice "P". 

This means the CAP theorem really boils down to a binary choice during a network failure: **Do you prioritize Consistency (CP) or Availability (AP)?**

Let's explore what this means. Imagine a distributed database with a primary node in the US and a replica in Europe. A network cable across the Atlantic is severed. The two nodes can no longer communicate. 

A user in Europe asks their local node for their profile data. The European node knows it is disconnected and hasn't received updates from the US in 10 minutes. What does it do?

### Option 1: Choose Consistency (CP Systems)
The European node replies with an Error. It refuses to serve the data because it cannot mathematically guarantee it has the most recent version. 
**Result:** The system is perfectly Consistent, but it is no longer Available to European users. 

### Option 2: Choose Availability (AP Systems)
The European node replies with whatever data it currently has in its local memory. 
**Result:** The system remains highly Available, but it is no longer Consistent. The user might see a stale profile picture that was deleted in the US 5 minutes ago.

## When to Choose Consistency (CP)

You must prioritize Consistency when serving stale data would cause catastrophic financial or logical errors.

- **Financial Transactions:** A bank account balance must be strictly consistent. If a system allows you to withdraw $100 from an ATM in New York and instantly withdraw the same $100 in London during a network partition, the bank loses money.
- **Inventory Systems:** E-commerce platforms booking final seats on an airplane or selling out a limited sneaker drop. Overselling inventory due to stale replica reads destroys customer trust.

**Technology Choices for CP:** Traditional RDBMS (PostgreSQL, MySQL configured for synchronous replication), Google Spanner, or NoSQL databases configured for strict quorums (MongoDB, HBase). These systems will block writes or reject reads if they cannot establish consensus.

## When to Choose Availability (AP)

The vast majority of consumer internet systems can tolerate slight inconsistencies and should prioritize Availability. 

- **Social Media:** If you update your bio, it is perfectly acceptable if a user in another country sees the old bio for an extra 30 seconds. Showing a slightly stale bio is infinitely better than showing an ugly \`500 Internal Server Error\` page.
- **Analytics & Metrics:** View counters on a viral video don't need to be perfectly consistent across the globe at every millisecond.

**Technology Choices for AP:** Systems designed for Eventual Consistency. Apache Cassandra, Couchbase, or DynamoDB (in multi-region active-active mode). These systems will happily accept writes and serve stale reads during a partition, syncing up in the background once the network recovers.

## Nuance in the Real World

Modern systems rarely make a blanket binary choice. They blend CP and AP depending on the specific microservice.

Take a ticketing app. 
- **The Seat Checkout Flow:** Must be strictly **CP**. It requires distributed locks and strong consistency to prevent double-booking.
- **The Event Discovery Feed:** Should be highly **AP**. Browsing upcoming concerts should be lightning fast and always available. If a concert sells out, it's okay if the feed shows it as "Available" for a few extra seconds before the user clicks it and hits the strictly consistent checkout flow.

## Conclusion

In an interview, do not overcomplicate the CAP theorem. Establish the trade-off immediately during requirements gathering. 

Simply state: *"Because this is a financial ledger, we must prioritize Consistency over Availability during a network partition, so I will design around a CP architecture using a strongly consistent relational database."* Or conversely, *"Since this is a social media feed, we will prioritize Availability. Stale reads are acceptable, so an AP system utilizing Eventual Consistency is the best approach for scale."*
`;
