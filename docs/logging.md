---
toc_max_heading_level: 2
---

# Logging

Rage provides a powerful structured logging system that makes it easy to debug your application and integrate with observability platforms. Unlike traditional text-based logs, Rage's logs are built on key-value pairs, making them searchable, filterable, and ready for analysis.

This guide covers everything from basic logging patterns to advanced integration with external monitoring tools.

## Structured Logging

All logs in Rage are structured as key-value pairs, making them easy to search, filter, and analyze. Additionally, every log entry has a list of tags associated with it. The first tag in every log entry is the current request ID.

By default, logs are formatted as plain text in development and JSON in production.

Here's a sample text log entry:

```
[fecbba0735355738] timestamp=2025-09-19T11:12:56+00:00 pid=1825 level=info message=hello
```

In this entry:
- **Keys**: `timestamp`, `pid`, `level`, and `message`
- **Tags**: `fecbba0735355738` (the request ID)

Use the `Rage::Logger#tagged` method to add custom tags and `Rage::Logger#with_context` to add custom keys.

### Best Practice: Consistent Log Messages

When logging with Rage, your code should always log the same message regardless of input. This makes logs searchable and easier to analyze.

❌ **Avoid**:

```ruby
def process_purchase(user_id:, product_id:)
  Rage.logger.info "processing purchase with user_id = #{user_id}; product_id = #{product_id}"
end
```

This creates a unique message for each combination of inputs, making it difficult to search and aggregate logs.

✅ **Use this instead**:

```ruby
def process_purchase(user_id:, product_id:)
  Rage.logger.with_context(user_id: user_id, product_id: product_id) do
    Rage.logger.info "processing purchase"
  end
end
```

Now all purchases log the same message ("processing purchase"), with the variable data stored as structured keys. This allows you to easily search for all purchase logs and filter by specific user IDs or product IDs.

## Extending Request Logs

By default, Rage logs each request with standard information like HTTP method, path, controller, action, status code, and duration. You can enrich these logs with custom data by defining the `append_info_to_payload` method in your controllers.

### Adding Custom Keys

Define `append_info_to_payload` in a specific controller to enrich only that controller's logs, or in `ApplicationController` to apply the change globally:

```ruby title="app/controllers/application_controller.rb"
class ApplicationController < RageController::API
  private

  def append_info_to_payload(payload)
    payload[:response_size] = response.body.size
  end
end
```

Now, request logs will include the additional `response_size` key:

```
[0c374wet9vquk00t] timestamp=2025-09-19T11:12:56+00:00 pid=1825 level=info method=GET path=/ controller=UsersController action=index response_size=123 status=200 duration=1.39
```

### Common Use Cases

- **Multi-tenancy**: adding a `tenant_id` or `account_id`
- **User tracking**: adding a `user_id` for authenticated requests
- **Request tracing**: adding correlation IDs from clients
- **Performance monitoring**: adding custom timing metrics

## Global Log Context

While `append_info_to_payload` extends request logs, you may want to add custom information to every log entry Rage produces. This could include trace and span IDs, the application environment, or the application's version.

You can configure Rage to add custom log tags and context globally. For example, the following code uses `config.log_tags` to tag all logs with the current environment:

```ruby {2}
Rage.configure do
  config.log_tags << Rage.env
end
```

Use `config.log_context` to add custom context to every log entry. The following example adds the `version` key to all log entries:

```ruby {2}
Rage.configure do
  config.log_context << { version: ENV["MY_APP_VERSION"] }
end
```

Both `config.log_tags` and `config.log_context` also accept callables, which allows you to add dynamic information to your logs:

```ruby {2-4}
Rage.configure do
  config.log_context << proc do
    { trace_id: MyObservabilitySDK.trace_id, span_id: MyObservabilitySDK.span_id }
  end
end
```

The callable should return a string for `config.log_tags`, a hash for `config.log_context`, or `nil`:

```ruby {3}
Rage.configure do
  config.log_context << proc do
    { trace_id: MyObservabilitySDK.trace_id } if MyObservabilitySDK.active?
  end
end
```

:::warning

If a callable passed to `config.log_tags` or `config.log_context` raises an exception, the request will fail. Make sure to handle exceptions within your callables if necessary.

:::

:::info

If you're developing a gem that configures `log_tags` or `log_context`, it's a good practice to use constants for your callables. This allows users to easily remove them if needed.

```ruby
module MyObservabilitySDK
  class LogContext
    def self.call
      # ...
    end
  end

  def self.install
    Rage.configure do
      config.log_context << LogContext
    end
  end
end
```

Later, in the user's code:

```ruby
Rage.configure do
  config.log_context.delete(MyObservabilitySDK::LogContext)
end
```

:::

## External Loggers

The standard Ruby logger is focused on text output, which is why many observability SDKs provide their own interfaces for sending structured logs to their platforms. Rage allows you to pipe its raw structured logging data directly to external observability tools without serializing it to text first.

To do that, pass a callable to the [config.logger](https://rage-rb.pages.dev/Rage/Configuration#logger=-instance_method) configuration option:

```ruby {8}
class MyExternalLogger
  def self.call(severity:, tags:, context:, message:, request_info:)
    # ...
  end
end

Rage.configure do
  config.logger = MyExternalLogger
end
```

Now, Rage will call the `MyExternalLogger#call` method for every log entry produced by the application. Refer to the [API Documentation](https://rage-rb.pages.dev/ExternalLoggerInterface) for the complete description of the arguments passed to the `#call` method.

This feature allows you to match the interface of `Rage::Logger` with the interface of an external observability tool and gives you full control over your logging data.

For example, here's how you might connect Rage's logger to Sentry:

```ruby
# Define the external logger class
class SentryLogger
  def call(severity:, tags:, context:, message:, request_info:)
    # Use logger context as structured data
    data = context

    # Add logger tags to the data
    tags.each do |tag|
      data = data.merge("tags.#{tag}" => "true")
    end

    # For request logs, add the HTTP path and customize the log message
    if request_info
      data[:path] = request_info[:env]["PATH_INFO"]
      message = "Request processed"
    end

    # Send the data to Sentry
    Sentry.logger.log(severity, message, parameters: [], **data)
  end
end

# Register the external logger
Rage.configure do
  config.logger = SentryLogger.new
end
```
