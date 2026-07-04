---
title: Rage in the Wild
authors: [rage]
---

import ExternalLink from "@site/src/components/ExternalLink"

Wrote an article exploring real-world patterns from popular Ruby open-source codebases and showing how they could be modelled using Rage.

<!-- truncate -->

The article looks at three projects - Discourse, Mastodon, and GitLab - and a pattern from each:

- **Request fan-out** (Discourse): Sequential HTTP requests become concurrent with `Fiber.schedule` and `Fiber.await`
- **Streaming** (Mastodon): A separate ~1400-line Node.js streaming server becomes a single controller action with `Rage::SSE`
- **Domain events** (GitLab): A custom event system with a separate subscription registry becomes inline subscriber declarations with `Rage::Events`

The common thread: what would normally require extra complexity, infrastructure, or indirection becomes a few lines of application code when the framework handles the machinery.

<ExternalLink
    title="Applying some Rage to Discourse, Mastodon, and GitLab"
    to="https://www.reddit.com/r/ruby/s/JQgds8SrD0"
/>
