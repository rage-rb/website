# API Reference

Complete technical documentation for all Rage framework classes and modules.

---

## Core Components

### [Controller](https://rage-rb.pages.dev/RageController/API)
Base controller functionality for handling HTTP requests and responses.

### [Router](https://rage-rb.pages.dev/Rage/Router/DSL/Handler)
Define and manage application routes.

### [Configuration](https://rage-rb.pages.dev/Rage/Configuration)
Configure your Rage application settings and environment.

---

## HTTP Handling

### [Request](https://rage-rb.pages.dev/Rage/Request)
Access and manipulate incoming HTTP request data.

### [Response](https://rage-rb.pages.dev/Rage/Response)
Build and send HTTP responses to clients.

### [Cookies](https://rage-rb.pages.dev/Rage/Cookies)
Read and write HTTP cookies.

### [Session](https://rage-rb.pages.dev/Rage/Session)
Manage user session data across requests.

### [UploadedFile](https://rage-rb.pages.dev/Rage/UploadedFile)
Handle file uploads from multipart form data.

---

## Middleware

### [CORS Middleware](https://rage-rb.pages.dev/Rage/Cors)
Enable Cross-Origin Resource Sharing for your API.

### [RequestID Middleware](https://rage-rb.pages.dev/Rage/RequestId)
Mark requests with unique identifiers for logging and debugging.

---

## Async & Concurrency

### [Fiber](https://rage-rb.pages.dev/Fiber)
Work with Ruby fibers for lightweight concurrency.

### [Deferred](https://rage-rb.pages.dev/Rage/Deferred)
Handle deferred execution and asynchronous operations.

---

## WebSockets

### [Channel](https://rage-rb.pages.dev/Rage/Cable/Channel)
Create WebSocket channels for real-time communication.

### [Connection](https://rage-rb.pages.dev/Rage/Cable/Connection)
Manage WebSocket connection lifecycle and authentication.

---

## Utilities

### [Logger](https://rage-rb.pages.dev/Rage/Logger)
Log application messages with configurable levels and formats.
