---
title: TechEmpower Benchmarks
authors: [rage]
---

import ExternalLink from "@site/src/components/ExternalLink"

TechEmpower Round 23 results are in. Rage shows solid performance improvements over other Ruby frameworks:

<!-- truncate -->

- 81-219% faster than Rails across database tests
- 31-100% faster than Sinatra in the same benchmarks

These numbers reflect what the architecture was designed for - efficient handling of I/O-bound operations through non-blocking I/O and fiber-based concurrency. Database operations are typically the bottleneck in web apps, so this is where the differences show up most clearly.

<ExternalLink
    title="Web Framework Benchmarks"
    to="https://www.techempower.com/benchmarks/#section=data-r23&test=json"
/>
