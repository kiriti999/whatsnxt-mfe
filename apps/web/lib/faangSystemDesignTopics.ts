/**
 * Curated FAANG-style system design topic map for browse hub + SEO.
 * Slugs are lowercase tags that can match `SystemDesignCourse.topics[]`.
 */
export type FaangTopic = {
    id: string;
    label: string;
    blurb: string;
};

export type FaangPillar = {
    id: string;
    title: string;
    description: string;
    topics: FaangTopic[];
};

export const FAANG_SYSTEM_DESIGN_PILLARS: FaangPillar[] = [
    {
        id: "core-scale",
        title: "Core scalability & performance",
        description: "Throughput, latency, and horizontal scale patterns asked everywhere.",
        topics: [
            { id: "horizontal-scaling", label: "Horizontal vs vertical scaling", blurb: "When to scale out and shard state." },
            { id: "load-balancing", label: "Load balancing (L4/L7)", blurb: "Round-robin, least connections, consistent hashing." },
            { id: "caching", label: "Caching strategies", blurb: "Write-through, write-back, cache-aside." },
            { id: "cdn-edge", label: "CDN & edge", blurb: "Static assets, TLS termination, edge compute." },
            { id: "sharding", label: "Sharding & partitioning", blurb: "Hot keys, rebalancing, cross-shard queries." },
            { id: "replication", label: "Replication", blurb: "Leader/follower, quorum, read replicas." },
        ],
    },
    {
        id: "reliability",
        title: "Reliability & availability",
        description: "Failure modes, isolation, and graceful degradation.",
        topics: [
            { id: "cap-theorem", label: "CAP trade-offs", blurb: "What you give up under partition." },
            { id: "acid-base", label: "ACID vs BASE", blurb: "Strong vs eventual consistency models." },
            { id: "failover", label: "Failover & redundancy", blurb: "Health checks, active/passive pairs." },
            { id: "circuit-breaker", label: "Circuit breakers & bulkheads", blurb: "Protecting dependencies under load." },
            { id: "rate-limiting", label: "Rate limiting & throttling", blurb: "Token bucket, leaky bucket, user quotas." },
        ],
    },
    {
        id: "data",
        title: "Data storage & retrieval",
        description: "Choosing stores, modeling, and access paths.",
        topics: [
            { id: "sql-vs-nosql", label: "SQL vs NoSQL", blurb: "Normalization vs access patterns." },
            { id: "indexing", label: "Indexing strategies", blurb: "Composite indexes, covering indexes." },
            { id: "object-storage", label: "Object storage (S3-like)", blurb: "Presigned URLs, multipart uploads." },
            { id: "time-series", label: "Time-series & analytics", blurb: "Rollups, retention, OLAP paths." },
        ],
    },
    {
        id: "messaging",
        title: "Communication & async",
        description: "Sync APIs, events, and streaming pipelines.",
        topics: [
            { id: "rest-graphql-grpc", label: "REST vs GraphQL vs gRPC", blurb: "Trade-offs for clients and gateways." },
            { id: "websockets-sse", label: "WebSockets & SSE", blurb: "Live updates and fan-out." },
            { id: "message-queues", label: "Queues & logs", blurb: "Kafka-style ordering, consumer groups." },
            { id: "pub-sub", label: "Pub/Sub", blurb: "Fan-out, topic design, idempotency." },
            { id: "event-driven", label: "Event-driven architecture", blurb: "Outbox, sagas, projections." },
        ],
    },
    {
        id: "processing",
        title: "Processing & compute",
        description: "Batch, stream, and serverless execution models.",
        topics: [
            { id: "batch-stream", label: "Batch vs stream", blurb: "Lambda architecture, kappa." },
            { id: "mapreduce", label: "MapReduce paradigm", blurb: "Shuffle-heavy jobs and skew." },
            { id: "background-jobs", label: "Background jobs", blurb: "Schedulers, retries, DLQs." },
            { id: "serverless", label: "Serverless", blurb: "Cold start, limits, burst scaling." },
        ],
    },
    {
        id: "advanced",
        title: "Distributed systems depth",
        description: "Consensus, transactions, and clocks.",
        topics: [
            { id: "consensus", label: "Consensus (Raft/Paxos)", blurb: "Leader election, log replication." },
            { id: "distributed-transactions", label: "Distributed transactions", blurb: "2PC, sagas, outbox." },
            { id: "distributed-locking", label: "Distributed locking", blurb: "Fencing tokens, lease TTLs." },
            { id: "eventual-consistency", label: "Eventual consistency", blurb: "Read paths, versioning, CRDTs." },
        ],
    },
    {
        id: "security",
        title: "Security & privacy",
        description: "AuthN/Z, encryption, and abuse protection.",
        topics: [
            { id: "oauth-jwt", label: "OAuth & JWT", blurb: "Sessions vs tokens at scale." },
            { id: "encryption", label: "Encryption in transit/at rest", blurb: "KMS, key rotation." },
            { id: "ddos", label: "DDoS protection", blurb: "Edge scrubbing, WAF, rate limits." },
        ],
    },
    {
        id: "estimation",
        title: "Estimation & capacity",
        description: "Back-of-envelope rigor interviewers expect.",
        topics: [
            { id: "qps", label: "QPS & peak traffic", blurb: "Daily active users to RPS." },
            { id: "storage-bandwidth", label: "Storage & bandwidth", blurb: "Payload growth, replication factor." },
            { id: "memory-cache", label: "Memory / cache sizing", blurb: "Working set, eviction." },
        ],
    },
];
