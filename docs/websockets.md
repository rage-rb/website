import BenchmarkResultChart from '@site/src/components/BenchmarkResultChart';

# WebSockets

`Rage::Cable` is Rage's WebSocket implementation, compatible with Action Cable. It enables real-time, bidirectional communication between your server and clients over a single WebSocket connection.

## Understanding Channels and Streams

`Rage::Cable` uses two key concepts to route messages:

- **Channels** - Client-side endpoints that clients subscribe to (e.g., `ChatChannel`, `NotificationsChannel`)
- **Streams** - Server-side broadcast groups that clients know nothing about (e.g., `user_123_notifications`, `admin_data`)

The distinction is important: clients subscribe to channels, but the server decides which streams to attach them to based on business logic like authentication and authorization.

### Example: Dashboard Application

Let's say you're building a dashboard that shows real-time data. Admins should see all data, while regular users see filtered data.

Here's how channels and streams work together:

1. The client subscribes to the `DataChannel`
2. The server receives the subscription and checks the user's role:
   - If admin → attach to the `admin_data` stream
   - If regular user → attach to the `user_data` stream
3. When data updates occur, broadcast to the appropriate stream:

```ruby
Rage::Cable.broadcast("admin_data", data)
```

Rage automatically forwards the message to all clients connected to that stream.

:::info

Refer to the API Documentation for a complete reference of `Rage::Cable` methods:

* [Channel API](https://rage-rb.pages.dev/Rage/Cable/Channel)
* [Connection API](https://rage-rb.pages.dev/Rage/Cable/Connection)

:::

## Setup

`Rage::Cable` runs as a separate Rack application, giving you flexibility to run it alongside your main app or as a standalone service in a separate process.

### Mounting in `config.ru`

Add this to your `config.ru` file to mount `Rage::Cable` at a specific path:

```ruby title="config.ru"
map "/cable" do
  run Rage::Cable.application
end
```

You can also add WebSocket-specific middleware:

```ruby title="config.ru"
map "/cable" do
  use MyWebSocketRateLimiter
  run Rage::Cable.application
end
```

### Mounting in Routes

Alternatively, mount `Rage::Cable` directly in your routes file:

```ruby title="config/routes.rb"
Rage.routes.draw do
  mount Rage::Cable.application, at: "/cable"
end
```

## Connections

Connections handle authentication when a client first connects to your WebSocket server. They let you accept or reject connections based on authentication credentials.

```ruby title="app/channels/rage_cable/connection.rb" {3,6,15}
module RageCable
  class Connection < Rage::Cable::Connection
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
    end

    private

    def find_verified_user
      if verified_user = User.find_by(id: cookies.encrypted[:user_id])
        verified_user
      else
        reject_unauthorized_connection
      end
    end
  end
end
```

Here's what's happening:

1. **`identified_by :current_user`** - Defines an identifier for this connection. You can name it anything, but `current_user` or `current_account` are common choices.
2. **`connect` method** - Runs when a client connects. This is where you authenticate the connection and set the identifier.
3. **`reject_unauthorized_connection`** - Explicitly rejects the connection if authentication fails.

:::warning

Connections are **accepted by default**. You must explicitly call `reject_unauthorized_connection` to reject unauthorized clients.

:::

### Available Objects

Inside the connection class, you have access to:

- `request` - The HTTP request object
- `cookies` - Cookie store for reading cookies
- `session` - Session data
- `params` - Subscription parameters

## Channels

Channels are Ruby classes that handle specific types of real-time functionality in your application. Each channel represents a logical grouping of WebSocket functionality (like chat, notifications, or live updates).

### Subscribing to Channels

When a client subscribes to a channel, Rage calls the `subscribed` method. This is typically where you:

1. Verify authorization
2. Attach the connection to appropriate streams

```ruby title="app/channels/data_channel.rb" {3-6,8-12}
class DataChannel < Rage::Cable::Channel
  def subscribed
    if current_user.locked?
      reject
      return
    end

    if current_user.admin?
      stream_from "admin_data"
    else
      stream_from "user_data"
    end
  end
end
```

You can call `reject` to refuse a subscription, though the WebSocket connection itself remains open for other channel subscriptions.

### Broadcasting to Streams

Use `broadcast` to send messages to all clients subscribed to a stream. This includes the client that triggered the broadcast:

```ruby title="app/channels/chat_channel.rb" {4}
class ChatChannel < Rage::Cable::Channel
  def subscribed
    stream_from "notifications"
    broadcast("notifications", { message: "A new member has joined!" })
  end
end
```

You can also broadcast from anywhere in your application (controllers, background jobs, etc.) using `Rage::Cable.broadcast`:

```ruby
Rage::Cable.broadcast("notifications", { message: "A new member has joined!" })
```

### Sending to Individual Connections

Use `transmit` to send a message to only the current connection, bypassing streams entirely:

```ruby title="app/channels/chat_channel.rb" {3}
class ChatChannel < Rage::Cable::Channel
  def subscribed
    transmit({ message: "Welcome! You're now connected." })
  end
end
```

This is useful for sending personalized messages or acknowledgments to a specific client.

### Receiving Messages

Rage provides two ways to handle incoming messages from clients:

#### 1. Generic `receive` Method

The `receive` method is called whenever a client sends any message to the channel:

```ruby title="app/channels/chat_channel.rb" {2-4}
class ChatChannel < Rage::Cable::Channel
  def receive(data)
    Message.create!(content: data["content"])
  end
end
```

:::warning

The `data` parameter is always a hash with **string keys** (not symbols).

:::

#### 2. RPC-Style Method Calls

Clients can directly call any public method defined on your channel:

```ruby title="app/channels/chat_channel.rb" {2,6}
class ChatChannel < Rage::Cable::Channel
  def mark_as_read(data)
    Message.update!(data["id"], read: true)
  end

  def mark_as_unread(data)
    Message.update!(data["id"], read: false)
  end
end
```

This RPC approach makes your channels feel like remote APIs, allowing clients to invoke specific actions.

:::info

RPC-style method calls are **not available** with the Raw JSON protocol. Use the generic `receive` method instead.

:::

## Client-Side Integration

### Action Cable Protocol

With the default Action Cable protocol, use the [@rails/actioncable](https://www.npmjs.com/package/@rails/actioncable) JavaScript library:

```javascript
import { createConsumer } from "@rails/actioncable"

// Connect to the WebSocket server
const cable = createConsumer("ws://localhost:3000/cable")

// Subscribe to a channel
const channel = cable.subscriptions.create("ChatChannel", {
  connected: () => console.log("connected"),
  received: (data) => console.log("received", data),
})

// Send a message (triggers the `receive` method on the server)
channel.send({ message: "Hello!" })

// Call RPC-style methods
channel.perform("mark_as_read", { id: 123 })
channel.perform("mark_as_unread", { id: 456 })
```

Notice there are no explicit routes - clients subscribe to channels by name, and Rage routes the messages accordingly.

### Raw JSON Protocol

If you prefer not to use the `@rails/actioncable` library, Rage supports a simpler Raw JSON protocol using the native browser WebSocket API:

```javascript
// Connect directly to a channel
const socket = new WebSocket("ws://localhost:3000/cable/chat")

// Send messages as JSON
socket.send(JSON.stringify({ message: "Hello!" }))
```

With Raw JSON protocol:
- Each WebSocket connection maps to a single channel
- Clients are automatically subscribed when they connect
- No need for external dependencies

Use the `config.cable.protocol` configuration to enable the Raw JSON protocol:

```ruby
Rage.configure do
  config.cable.protocol = :raw_websocket_json
end
```

:::info

RPC-style method calls are **not supported** with the Raw JSON protocol. Use the generic `receive` method in your channel instead.

:::

## Multi-Server Setup with Redis

When running `Rage::Cable` across multiple servers, you need a way to synchronize broadcasts between them. The Redis adapter solves this problem.

### How It Works

- Uses Redis Streams for reliable message delivery
- Messages aren't lost during brief network disruptions
- Only synchronizes messages **between servers** - if Redis goes down, clients on the same server as the broadcaster still receive messages

### Configuration

Create a `config/cable.yml` file with environment-specific settings:

```yaml title="config/cable.yml"
development:
  adapter: redis
  url: redis://localhost:6379/1

production:
  adapter: redis
  url: <%= ENV["REDIS_URL"] %>
```

Rage automatically loads this configuration and uses Redis to coordinate broadcasts across your server fleet. All keys except `adapter` and `channel_prefix` are passed directly to [redis-client](https://github.com/redis-rb/redis-client?tab=readme-ov-file#configuration).

## Benchmarks

The following benchmark shows the ability of both Rage and Rails to handle 10000 concurrent WebSocket connections.

**Test Environment:**

- AWS EC2 `m5.large` instance
- Ruby 3.3
- The test is running for five minutes

**Client application:**

* Opens 10,000 connections
* Once a connection has been established, it subscribes to the `Chat` channel and starts sending messages at random intervals between 500ms and 2s
* Additionally, once all connections are established, the client starts sending a broadcast message every second

**Server application:**

* Running two worker processes
* Once a connection is accepted, the application subscribes it to the `chat_Best Room` stream
* Once a regular message comes in, the server responds with the current timestamp
* Once the broadcast message comes in, the server broadcasts the current timestamp to the `chat_Best Room` stream

<details>
<summary>Source Code</summary>

```ruby
class ChatChannel < Rage::Cable::Channel
  def subscribed
    stream_from "chat_#{params[:room]}"
  end

  def receive(data)
    transmit({ i: (Time.now.to_f * 1000).to_i })
  end

  def broadcast_me
    broadcast("chat_#{params[:room]}", { i: (Time.now.to_f * 1000).to_i })
  end
end
```
</details>

**Results:**

<div className="w-full sm:w-[49%] mb-2">
  <BenchmarkResultChart
    title="Successful connections"
    units="count"
    railsVal={6118} rageVal={10000}
    datalabels={["6,118", "10,000"]}
  />
</div>

<div className="flex flex-row justify-between flex-wrap gap-1 mb-2">
  <div className="w-full sm:w-[49%]">
    <BenchmarkResultChart
      title="p95 Message Latency"
      units="ms"
      railsVal={79000}
      rageVal={97}
      datalabels={["1m19s", "97ms"]}
      isLog={true}
    />
  </div>
  <div className="w-full sm:w-[49%]">
    <BenchmarkResultChart
      title="p95 Time to Connect"
      units="ms"
      railsVal={60000}
      rageVal={3.98}
      datalabels={["1m", "3.98ms"]}
      isLog={true}
    />
  </div>
</div>

<div className="flex flex-row justify-between flex-wrap gap-1">
  <div className="w-full sm:w-[49%]">
    <BenchmarkResultChart
      title="CPU Utilization"
      units="%"
      railsVal={100}
      rageVal={54}
      datalabels={["100%", "54%"]}
    />
  </div>
  <div className="w-full sm:w-[49%]">
    <BenchmarkResultChart
      title="Memory Usage"
      units="MB"
      railsVal={683}
      rageVal={278}
      datalabels={["683MB", "278MB"]}
    />
  </div>
</div>
