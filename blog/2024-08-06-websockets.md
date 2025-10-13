---
title: WebSocket Support
authors: [rage]
---

Version 1.8.0 adds WebSocket support through an Action Cable-compatible API. If you're familiar with Action Cable, the interface will feel immediately familiar - same channels, same broadcasting patterns.

<!-- truncate -->

The difference is in the implementation. By leveraging Rage's fiber-based concurrency model and non-blocking I/O, we're seeing significantly better performance compared to the standard Action Cable setup. Same developer experience, but faster and more efficient under load.
