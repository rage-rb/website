---
title: Impractical Ruby Optimisations
authors: [rage]
---

import ExternalLink from "@site/src/components/ExternalLink"

Wrote an article exploring some unconventional performance optimizations in Ruby.

<!-- truncate -->

It uses building an event bus for Rage as a case study to dig into:

- Profiling
- Implicit and explicit string conversions
- Unexpected performance bottlenecks using hashes
- When micro-optimizations actually matter (and when they don't)

The title says "impractical" because most of these techniques aren't worth applying in typical application code. But they're interesting to understand, and they matter when you're building framework-level code where small improvements compound.

<ExternalLink
    title="Impractical Ruby Optimisations"
    to="https://dev.to/roman_samoilov_152a8ec4ca/impractical-ruby-optimisations-2f4g"
/>
