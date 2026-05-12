---
title: Production Results
authors: [rage]
---

Two production Rails apps were migrated to Rage and put through 30-second spike tests. Both are I/O-bound workloads - the kind where fiber-based concurrency should help.

<!-- truncate -->

## Document Management Service

Three read-heavy endpoints from a production Rails app: file metadata lookups, folder listings with permission-aware queries, and company-wide document libraries. Each involves multiple Postgres round-trips, authorization checks, and JSON serialization of nested objects. No CPU-heavy work - just database waits and Ruby-side object hydration.

| Stack | p95 latency | Throughput | Errors |
| --- | --- | --- | --- |
| Rage | 842ms | 73 RPS | 0% |
| Rails | 5s | 63 RPS | 0% |

**6x lower tail latency** with 16% higher throughput.

## PDF Generation Service

A small standalone app that converts HTML to PDF. Two endpoints: a write-only enqueue endpoint (~98% of traffic) that inserts a Postgres row and queues a background job, and a long-poll fetch endpoint (~2%) that sleeps in 0.5-second increments while waiting for the worker to produce the file.

This is close to a best-case for fiber-based concurrency - one endpoint is bounded entirely by database latency, the other spends most of its time in `sleep` and small I/O calls.

| Stack | p95 latency | Throughput | Errors |
| --- | --- | --- | --- |
| Rage | 1.77s | 71 RPS | 0% |
| Rails | 17s | 49 RPS | 0.28% |

**10x lower tail latency**, 45% higher throughput, and no errors.

## Takeaway

The important detail is the workload shape. These were real production endpoints, not hand-picked micro-benchmarks, but they were also a very good fit for Rage: lots of waiting on I/O, very little time spent doing CPU-bound Ruby work.

That is where Rage is expected to win. Under a thread-per-request server, every in-flight request holds an entire worker thread while waiting on the database. With Rage's fiber-based model, that wait time is multiplexed - the runtime can handle other requests while one waits on I/O.
