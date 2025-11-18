# Background Processing

`Rage::Deferred` is Rage's built-in background job queue that runs in the same process as your web server. It offloads long-running tasks from request handling, allowing you to respond to clients faster.

## How It Works

### Fiber-Based Execution

Tasks execute in fibers using Rage's fiber scheduler, making `Rage::Deferred` far more efficient than traditional thread-based background job processors.

### Write-Ahead Log (WAL)

All tasks are persisted to a write-ahead log, providing durability and reliability:

- **Crash recovery**: Tasks survive server restarts and crashes
- **Graceful shutdown**: On restart, Rage waits up to 15 seconds for in-progress tasks to complete
- **No external dependencies**: The default disk-based log works out of the box

Future versions will support Redis and SQL-based logs.

## When to Use `Rage::Deferred`

`Rage::Deferred` excels at I/O-heavy background tasks:

✅ **Great for:**
- API calls to slow or unreliable services
- Sending email notifications
- Data synchronization with external services
- Generating reports
- Streaming updates to upstream systems

❌ **Not ideal for:**
- CPU-intensive computations (use a separate background job processor)
- Scheduling large numbers (10,000+) of tasks far in the future (increases memory usage)

## Basic Usage

### Defining Tasks

Create a task by including the `Rage::Deferred::Task` module and implementing a `perform` method:

```ruby
class SayHello
  include Rage::Deferred::Task

  def perform(name:)
    sleep 5
    Rage.logger.info "Hello, #{name}!"
  end
end
```

### Enqueuing Tasks

Call `enqueue` on your task class to schedule execution:

```ruby
SayHello.enqueue(name: "World")
```

This method:
1. Serializes the task and writes it to the write-ahead log
2. Returns immediately
3. Executes the task when Rage has available capacity

Logs produced within tasks are automatically tagged with the originating request ID and task name.

If a task fails, `Rage::Deferred` automatically retries it up to 5 times, using exponential backoff between attempts.

### Delayed Execution

Schedule tasks to run in the future:

```ruby
# Run after 10 seconds
SayHello.enqueue(name: "World", delay: 10)

# Run at a specific time
SayHello.enqueue(name: "World", delay_until: Time.now + 10)
```

### Wrapping Existing Classes

Use `Rage::Deferred.wrap` to enqueue any object without including the module:

```ruby
class EmailService
  def self.send_welcome(email:)
    # Send email...
  end
end

# Synchronous execution
EmailService.send_welcome(email: "user@example.com")

# Background execution
Rage::Deferred.wrap(EmailService).send_welcome(email: "user@example.com")
```

## Backpressure Control

Under normal conditions, Rage automatically balances between handling requests and processing background tasks. However, if each request creates many deferred tasks, the queue can grow faster than it's processed. To prevent this, `Rage::Deferred` can be configured to apply backpressure when the queue exceeds a specific number of tasks.

### Enabling Backpressure

Configure Rage to block task enqueuing when the queue gets too large:

```ruby
Rage.configure do
  config.deferred.backpressure = true
end
```

With backpressure enabled:
1. `enqueue` blocks when the queue is full (up to 2 seconds by default)
2. If the queue doesn't reduce enough within 2 seconds, `Rage::Deferred::PushTimeout` is raised

```ruby
def create
  SayHello.enqueue(name: "World")
rescue Rage::Deferred::PushTimeout
  head 503
end
```

See the [configuration documentation](https://rage-rb.pages.dev/Rage/Configuration#label-Deferred+Configuration) for available options.

## Benefits of In-Process Execution

Running background tasks in the same process provides several advantages:

### Simplified Operations
- **No separate processes**: No need to manage, monitor, or scale separate background workers
- **Unified monitoring**: Background tasks are part of the request workflow
- **Zero setup**: No external database required with the disk-based WAL

### Easy Scaling
If response times increase, it means Rage is spending more time on background tasks. The solution is simple: add more servers. The same horizontal scaling that improves request handling automatically improves background task processing.

## Benchmarks

**Test Environment:**
- AWS EC2 `m5.large` instance
- Ruby 3.4.5 with YJIT enabled

### Benchmark 1: Processing 500,000 Tasks

<details>
<summary>Source Code</summary>

```ruby
# app/tasks/load_task.rb
class LoadTask
  include Rage::Deferred::Task

  @@count = 0

  def perform
    @@count += 1

    if @@count == 500_000
      Rage.logger.info "Tasks completed at #{Time.now.to_f}"
    end
  end
end

# app/controller/application_controller.rb
require "benchmark"

class ApplicationController
  def index
    time_to_enqueue = Benchmark.realtime { enqueue_tasks } * 1_000
    Rage.logger.info "Time to enqueue: #{time_to_enqueue}"
    Rage.logger.info "Enqueued tasks at #{Time.now.to_f}"
    head :ok
  end

  def enqueue_tasks
    500_000.times do
      LoadTask.enqueue
    end
  end
end
```
</details>

**Results:**
- **Time to enqueue**: 3.4 seconds
- **Time to process**: 6.25 seconds
- **Throughput**: 80,000 tasks/second

### Benchmark 2: Scheduling 10,000 Delayed Tasks

<details>
<summary>Source Code</summary>

```ruby
# app/tasks/load_task.rb
class LoadTask
  include Rage::Deferred::Task
end

# app/controller/application_controller.rb
require "benchmark"

class ApplicationController
  def index
    time_to_enqueue = Benchmark.realtime { enqueue_tasks } * 1_000
    Rage.logger.info "Time to enqueue: #{time_to_enqueue}"
    head :ok
  end

  def enqueue_tasks
    10_000.times do
      LoadTask.enqueue(delay_until: Time.now + 3600)
    end
  end
end
```
</details>

Tasks scheduled one hour in the future to measure memory and storage overhead.

**Results:**
- **Time to enqueue**: 526ms
- **RAM usage**: 67 MB
- **WAL file size**: 938 KB
