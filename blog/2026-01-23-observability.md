---
title: Observability Features
authors: [rage]
---

Versions 1.19.0 and 1.20.0 brought a set of observability features designed to make debugging and monitoring Rage applications easier. The focus was on giving you control over your logs and visibility into what's happening inside the framework.

<!-- truncate -->

## Global Log Context

Version 1.19.0 introduced global log context through `config.log_tags` and `config.log_context`. You can now add custom information to every log entry your application produces - things like trace IDs, span IDs, environment names, or version numbers.

The configuration accepts both static values and callables for dynamic data:

```ruby
Rage.configure do
  config.log_context << proc do
    { trace_id: MyObservabilitySDK.trace_id, span_id: MyObservabilitySDK.span_id }
  end
end
```

This means your observability platform gets consistent, structured metadata across all log entries without manually adding it to each log call.

## External Loggers

Also in 1.19.0, Rage added support for piping raw structured logging data directly to external observability tools. Instead of serializing logs to text and then parsing them back, you can connect Rage's logger straight to platforms like Datadog, Sentry, or your custom solution.

The `config.logger` option now accepts a callable that receives structured data for each log entry:

```ruby
Rage.configure do
  config.logger = MyExternalLogger
end
```

This gives you full control over how logging data reaches your observability platform and eliminates unnecessary serialization overhead.

## Rage::Telemetry

Version 1.20.0 introduced a built-in telemetry system. It's based on spans - instrumentation points that wrap framework operations like controller actions, cable actions, and deferred tasks.

You create handlers to observe these spans and integrate with your monitoring tools. Track operation durations, record failures, send metrics to external platforms - whatever you need to understand your application's behavior in production. The telemetry system is designed to be passive, so buggy observability code won't break your application.

---

These three features work together to give you the tools needed to understand what's happening in production. Whether you're integrating with external platforms or building custom monitoring solutions, you now have the hooks to do it without fighting the framework.
