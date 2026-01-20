# Telemetry

Rage provides a built-in telemetry system that lets you observe and measure what's happening inside your application. Use it to integrate with monitoring platforms, track performance metrics, debug production issues, or build custom observability solutions.

This guide covers how to instrument your application using Rage's telemetry API and integrate with external observability tools.

## Understanding Spans

Rage's telemetry is built around **spans** - instrumentation points that wrap specific framework operations like controller actions, cable actions, deferred tasks, and fiber scheduling.

Each span has a name following the `component.entity.action` pattern (for example, `controller.action.process`). You create handlers to observe these spans and integrate with your observability tools of choice.

## Creating Handlers

You can observe spans by creating handlers that inherit from `Rage::Telemetry::Handler`. Here's a handler that notifies an external observability platform whenever a controller action takes more than 2 seconds:

```ruby title="app/telemetry/controller_duration_handler.rb"
class ControllerDurationHandler < Rage::Telemetry::Handler
  handle "controller.action.process", with: :monitor_duration

  def self.monitor_duration(name:)
    start = Time.now.to_i
    yield

    if Time.now.to_i - start > 2
      MyObservabilitySDK.notify("Operation #{name} took more than 2 seconds")
    end
  end
end
```

Breaking this down:

1. Create a class that inherits from `Rage::Telemetry::Handler`
2. Call `handle` with the span name (`controller.action.process`) and the method that will handle it (`monitor_duration`)
3. Define the handler method, which receives the operation name as a keyword argument
4. Start timing and pass control to the observed operation via `yield`
5. After the operation completes, check the duration and send a notification if needed

### How Yield Works

Each handler method controls when to pass control to the observed operation via `yield`. This design allows natural instrumentation patterns:

- **Before operation**: Code before `yield` runs before the observed operation
- **After operation**: Code after `yield` runs after the observed operation completes

:::warning

Your handlers should always call `yield`.

Telemetry handlers are passive observers that shouldn't change application behavior. If your handler doesn't call `yield`, Rage will automatically call it for you, ensuring unstable or buggy observability code cannot break your application.

:::

## Registering Handlers

Register your handlers using the [config.telemetry](https://84418cbb.rage-rb.pages.dev/Rage/Configuration/Telemetry) configuration option:

```ruby title="config/application.rb"
Rage.configure do
  config.telemetry.use ControllerDurationHandler
end
```

If your handler needs initialization, you can also register instances:

```ruby title="app/telemetry/controller_duration_handler.rb" {4-6,8}
class ControllerDurationHandler < Rage::Telemetry::Handler
  handle "controller.action.process", with: :monitor_duration

  def initialize(threshold:)
    @threshold = threshold
  end

  def monitor_duration(name:)
    start = Time.now.to_i
    yield

    if Time.now.to_i - start > @threshold
      MyObservabilitySDK.notify("Operation #{name} took more than #{@threshold} seconds")
    end
  end
end
```

Register the initialized handler:

```ruby title="config/application.rb"
Rage.configure do
  config.telemetry.use ControllerDurationHandler.new(threshold: 2)
end
```

## Handler Arguments

Handlers receive relevant context for each span through keyword arguments. Rage automatically detects which parameters your handler accepts and only passes those.

You can enhance handlers by requesting additional context. Here's how to include the request URL in notifications:

```ruby title="app/telemetry/controller_duration_handler.rb" {4,9}
class ControllerDurationHandler < Rage::Telemetry::Handler
  handle "controller.action.process", with: :monitor_duration

  def self.monitor_duration(name:, request:)
    start = Time.now.to_i
    yield

    if Time.now.to_i - start > 2
      MyObservabilitySDK.notify("Operation #{name} (URL: #{request.url}) took more than 2 seconds")
    end
  end
end
```

By adding `request:` to the method signature, the handler now receives the request object, which is one of the parameters the `controller.action.process` span provides.

:::info

Refer to the [API Documentation](https://84418cbb.rage-rb.pages.dev/Rage/Telemetry/Spans) for a complete list of available spans and their parameters.

:::

## Handling Errors

When an observed operation fails with an exception, `yield` returns a [SpanResult](https://84418cbb.rage-rb.pages.dev/Rage/Telemetry/SpanResult) object containing the error. This lets you track failures:

```ruby title="app/telemetry/exception_handler.rb" {5-6}
class ExceptionHandler < Rage::Telemetry::Handler
  handle "controller.action.process", with: :record_exceptions

  def self.record_exceptions
    result = yield
    MyObservabilitySDK.increment_errors if result.error?
  end
end
```

The `SpanResult#error?` method returns `true` if an exception occurred, allowing you to track failed operations without interfering with normal exception handling.

## Span Matching

Handlers can observe multiple spans by listing them explicitly:

```ruby title="app/telemetry/cable_handler.rb" {2}
class CableHandler < Rage::Telemetry::Handler
  handle "cable.connection.process", "cable.action.process", with: :monitor_duration

  def self.monitor_duration
    start = Time.now.to_i
    yield

    duration = Time.now.to_i - start
    MyObservabilitySDK.record_duration(duration)
  end
end
```

### Using Wildcards

You can also use wildcards to match multiple spans with a single pattern:

```ruby title="app/telemetry/cable_handler.rb" {2}
class CableHandler < Rage::Telemetry::Handler
  handle "cable.*", with: :monitor_duration

  def self.monitor_duration
    start = Time.now.to_i
    yield

    duration = Time.now.to_i - start
    MyObservabilitySDK.record_duration(duration)
  end
end
```

:::warning

When using wildcards, be aware that future framework versions may introduce new spans matching your pattern. If you need precise control over which spans to observe, prefer listing them explicitly.

:::

## Integration Example

Here's a complete example of integrating Rage's telemetry with a hypothetical metrics service to track operation durations:

```ruby title="app/telemetry/metrics_handler.rb"
class MetricsHandler < Rage::Telemetry::Handler
  handle "controller.*", "cable.*", with: :track_duration

  def self.track_duration(name:)
    start = Process.clock_gettime(Process::CLOCK_MONOTONIC)
    result = yield
    duration = Process.clock_gettime(Process::CLOCK_MONOTONIC) - start

    # Send metrics to your observability platform
    MetricsService.record(
      metric: "#{name}.duration",
      value: duration,
      tags: { success: !result.error? }
    )
  end
end
```

Register the handler:

```ruby title="config/application.rb"
Rage.configure do
  config.telemetry.use MetricsHandler
end
```
