# Server-Sent Events

Server-Sent Events provide a simple way to push real-time updates from your server to clients over HTTP. Unlike WebSockets, SSE is unidirectional (server to client only), making it perfect for live feeds, notifications, and streaming responses.

Rage supports three SSE patterns:

- **Streams** - Send multiple updates over time using enumerators
- **One-off updates** - Send a single message and close the connection
- **Unbounded streams** - Long-lived connections with broadcast support

## Streaming with Enumerators

The most common pattern is streaming data using Ruby enumerators. Rage reads from the enumerator and sends each value as an SSE message:

```ruby
class MessagesController < RageController::API
  def index
    stream = Enumerator.new do |y|
      "Hello, world!".each_char do |char|
        sleep 1
        y << char
      end
    end

    render sse: stream
  end
end
```

Once the enumerator finishes, Rage automatically closes the SSE connection.

### Streaming from External Sources

Enumerators work great with external data sources like Redis, databases, or message queues:

```ruby {7-9}
class MessagesController < RageController::API
  def index
    redis = Redis.new

    stream = Enumerator.new do |y|
      loop do
        _, message = redis.blpop("messages", timeout: 5)
        break if message == "close"
        y << message
      end
    ensure
      redis.close
    end

    render sse: stream
  end
end
```

:::tip

Yielding `nil` values is safe - Rage ignores them. This lets you implement polling loops that only send data when it's available.

:::

### Streaming Objects

When you yield objects (hashes, arrays, or other Ruby objects), Rage automatically converts them to JSON:

```ruby {7}
redis = Redis.new

stream = Enumerator.new do |y|
  loop do
    _, message = redis.blpop("events")
    break if message == "close"
    y << { event: "message", data: message, timestamp: Time.now.to_i }
  end
end

render sse: stream
```

### SSE Fields

The SSE protocol supports several fields beyond the data payload: `id`, `event`, and `retry`. Use `Rage::SSE.message` to include these fields:

```ruby {4}
file = File.new(params[:file], "r")

stream = file.each_line.with_index.lazy.map do |line, i|
  Rage::SSE.message(line, id: i, event: "line", retry: 100)
end

render sse: stream
```

This sends messages like:

```
id: 0
event: line
retry: 100
data: First line of the file

id: 1
event: line
retry: 100
data: Second line of the file
```

You can also combine SSE fields with object streaming:

```ruby {7}
redis = Redis.new

stream = Enumerator.new do |y|
  loop do
    _, message = redis.blpop("notifications")
    break if message == "close"
    y << Rage::SSE.message({ notification: message }, event: "notification")
  end
end

render sse: stream
```

### Connection Keep-Alive

Rage automatically sends periodic `: ping` comments to keep SSE connections alive. This prevents proxies and load balancers from closing idle connections.

### Graceful Shutdown

When the server restarts, Rage waits up to 15 seconds for active enumerator streams to finish. This gives your streams time to complete their work and clean up resources gracefully.

:::info

[Unbounded streams](#unbounded-streams) are interrupted immediately on restart since they have no natural end point.

:::

## One-Off Updates

For simple cases where you need to send a single message, pass any value directly to `render sse:`:

```ruby
user = User.find(params[:id])
render sse: user
```

Rage sends the response and closes the connection immediately. This is useful for endpoints that return a single result but want to use the SSE format for consistency with other streaming endpoints.

## Unbounded Streams

Unbounded streams let you create long-lived SSE connections that receive broadcasts from anywhere in your application. Instead of managing the connection yourself, you attach it to a named stream and broadcast messages to that stream.

### Setting Up a Stream

Use `Rage::SSE.stream` to create an unbounded stream:

```ruby
render sse: Rage::SSE.stream("notifications-#{params[:user_id]}")
```

This sets up a persistent SSE connection attached to the `notifications-123` stream (assuming `user_id` is 123). The connection stays open until the client disconnects or you explicitly close it.

### Broadcasting Messages

Send messages to all connections on a stream using `Rage::SSE.broadcast`:

```ruby
Rage::SSE.broadcast("notifications-#{user.id}", user.notifications.last)
```

Every client connected to `notifications-123` receives the notification. Broadcasts work from anywhere in your application, including controllers, models, and background tasks built with [Rage::Deferred](deferred.md).

You can include SSE fields in broadcasts:

```ruby {5}
notification = user.notifications.last

Rage::SSE.broadcast(
  "notifications-#{user.id}",
  Rage::SSE.message(notification, id: notification.id, event: "notification")
)
```

### Closing Streams

Close all connections on a stream from the server side:

```ruby
Rage::SSE.close_stream("notifications-#{user.id}")
```

### Composite Keys

For better organization, use arrays as stream identifiers:

```ruby
# In your controller
render sse: Rage::SSE.stream([:notifications, params[:user_id]])

# Broadcasting
Rage::SSE.broadcast([:notifications, user.id], user.notifications.last)

# Closing
Rage::SSE.close_stream([:notifications, user.id])
```

## Multi-Server Setup

For deployments with multiple servers, or to enable broadcasts from external systems like Sidekiq, use the Redis adapter to synchronize streams across servers.

### Configuration

Create a `config/pubsub.yml` file:

```yaml title="config/pubsub.yml"
development:
  adapter: redis
  url: redis://localhost:6379

production:
  adapter: redis
  url: <%= ENV["REDIS_URL"] %>
  timeout: 0.2
```

With this configuration, calls to `Rage::SSE.broadcast` and `Rage::SSE.close_stream` are synchronized across all servers. Clients connected to the same stream on different servers will receive all broadcasts to that stream.

### Buffering

There are situations where you need to broadcast to a stream before the connection is fully established. For example, a background job might start sending messages before the HTTP response begins streaming:

```ruby
# This can cause lost messages!
FetchNotifications.perform_async  # may call Rage::SSE.broadcast("notifications", ...)
render sse: Rage::SSE.stream("notifications")
```

To prevent message loss, create the stream object first. Rage buffers messages to known streams until the connection is established:

```ruby
# Create the stream first - messages will be buffered
stream = Rage::SSE.stream("notifications")
FetchNotifications.perform_async  # broadcasts are now buffered
render sse: stream  # establishes the connection and sends buffered messages
```

## Low-Level Access

For advanced use cases or gem authors who need full control over the SSE connection, use a proc:

```ruby
render sse: ->(connection) do
  connection.write("data: Hello, world!\n\n")
ensure
  connection.close
end
```

With procs, you're responsible for:

- Formatting messages according to the SSE protocol
- Managing the connection lifecycle
- Closing the connection when done

This is primarily intended for libraries that need to integrate with Rage's SSE system.
