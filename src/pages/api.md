---
toc_max_heading_level: 2
---

# API Reference

Complete technical documentation for all Rage framework classes and modules.

---

## Core Components

### [Controller](https://api.rage-rb.dev/RageController/API)
Base controller functionality for handling HTTP requests and responses.

### [Router](https://api.rage-rb.dev/Rage/Router/DSL/Handler)
Define and manage application routes.

### [Configuration](https://api.rage-rb.dev/Rage/Configuration)
Configure your Rage application settings and environment.

---

## HTTP Handling

### [Request](https://api.rage-rb.dev/Rage/Request)
Access and manipulate incoming HTTP request data.

### [Response](https://api.rage-rb.dev/Rage/Response)
Build and send HTTP responses to clients.

### [Cookies](https://api.rage-rb.dev/Rage/Cookies)
Read and write HTTP cookies.

### [Session](https://api.rage-rb.dev/Rage/Session)
Manage user session data across requests.

### [UploadedFile](https://api.rage-rb.dev/Rage/UploadedFile)
Handle file uploads from multipart form data.

---

## Middleware

### [CORS Middleware](https://api.rage-rb.dev/Rage/Cors)
Enable Cross-Origin Resource Sharing for your API.

### [RequestID Middleware](https://api.rage-rb.dev/Rage/RequestId)
Mark requests with unique identifiers for logging and debugging.

---

## Async & Concurrency

### [Fiber](https://api.rage-rb.dev/Fiber)
Work with Ruby fibers for lightweight concurrency.

### [Deferred](https://api.rage-rb.dev/Rage/Deferred)
Handle deferred execution and asynchronous operations.

---

## Events

### [Events](https://api.rage-rb.dev/Rage/Events)
Build event-driven applications with the Rage event system.

### [Subscriber](https://api.rage-rb.dev/Rage/Events/Subscriber/ClassMethods)
Subscribe to and handle application events.

---

## WebSockets

### [Channel](https://api.rage-rb.dev/Rage/Cable/Channel)
Create WebSocket channels for real-time communication.

### [Connection](https://api.rage-rb.dev/Rage/Cable/Connection)
Manage WebSocket connection lifecycle and authentication.

---

## Utilities

### [Logger](https://api.rage-rb.dev/Rage/Logger)
Log application messages with configurable levels and formats.
