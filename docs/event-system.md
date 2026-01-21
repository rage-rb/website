import BenchmarkResultChart from "@site/src/components/BenchmarkResultChart";

# Event System

Most Ruby applications describe **how** things happen. Rage lets you describe **what** happened - and the system responds.

In a typical application, behavior is hidden inside method calls:

```ruby
def create_order(params)
  order = Order.create!(params)

  send_confirmation_email(order)
  update_inventory(order)
  notify_analytics(order)
  create_shipment(order)
end
```

Each new requirement adds another call. Over time, behavior becomes tangled, implicit, and hard to change.

With Rage, you can take a different approach.

## Events as First-Class Behavior

With `Rage::Events`, when something meaningful happens, you publish an event:

```ruby
Rage::Events.publish(OrderCreated.new(order:))
```

You don't decide who reacts. You don't wire dependencies. You don't modify existing code. You simply state a fact: _"An order was created"._

Other parts of the system can react to this event:

```ruby
class SendConfirmationEmail
  include Rage::Events::Subscriber
  subscribe_to OrderCreated

  def call(event)
    # send the confirmation email
  end
end
```

Later, you can add more reactions - analytics, inventory updates, auditing, integrations. None of them require touching the original code. The system grows outward, not inward.

:::info

`Rage::Events` is designed for decoupling components **within the same application process**.

For distributed systems with inter-service communication, consider dedicated messaging systems like RabbitMQ, Kafka, or AWS SNS.

:::


### Events Are Objects, Not Hashes

Events in Rage are instances, not hashes:

```ruby
OrderCreated = Data.define(:order)
```

This means:

- Events are **typed**
- Events are **inheritable**
- Events are **testable**

You can specialize behavior using inheritance:

```ruby
class PriorityOrderCreated < OrderCreated
end
```

Handlers can react to a specific event or an entire class of events. This is object-oriented design, applied to system behavior.

## How It Works

Using `Rage::Events` involves three steps:

### 1. Define an Event

An event represents a significant occurrence within your business domain. You can use virtually any Ruby class as an event, but the best practice is to use Ruby's standard `Data` class. Instances of `Data` are immutable and support explicit initialization, making them ideal for defining events:

```ruby
OrderCreated = Data.define(:order_id, :product_id)
```

### 2. Create Subscribers

A subscriber is a class that reacts to events. Include `Rage::Events::Subscriber`, declare what you subscribe to, and implement `call`:

```ruby {2,3,5}
class UpdateStock
  include Rage::Events::Subscriber
  subscribe_to OrderCreated

  def call(event)
    # `event` is an instance of `OrderCreated`
  end
end
```

### 3. Publish Events

When something happens, publish the event:

```ruby
Rage::Events.publish(OrderCreated.new(order_id: 1, product_id: 2))
```

That's it. The system handles the rest.

:::info

Event systems are designed to decouple components. Publishers don't know about subscribers, their logic, or their success/failure status. Each subscriber is an independent component responsible for its own error handling.

Therefore, `Rage::Events.publish` **does not** propagate exceptions from subscribers. If a subscriber fails, it won't prevent other subscribers from executing or cause the `publish` call to raise an exception.

:::

## Event Hierarchies: Model Your Domain

You can subscribe to any class or module in an event's inheritance chain. This lets you model complex workflows naturally - without duplicating code or creating brittle dependencies.

### The Problem

Say `ProductViewed`, `ProductLiked`, and `ProductAddedToWishlist` should all trigger `UpdateRecommendations`. You could subscribe to each one:

```ruby {3}
class UpdateRecommendations
  include Rage::Events::Subscriber
  subscribe_to ProductViewed, ProductLiked, ProductAddedToWishlist
end
```

But this can be error-prone and difficult to scale. What if you add `ProductShared`? What if multiple subscribers need the same set of events?

### The Solution: Use Inheritance

Define events with a common parent:

```ruby {2-3,7,11,15}
# Create a module that defines shared behavior
module ProductInteractionEvent
end

# Define the events and include the module
ProductViewed = Data.define(:product_id) do
  include ProductInteractionEvent
end

ProductLiked = Data.define(:product_id) do
  include ProductInteractionEvent
end

ProductAddedToWishlist = Data.define(:product_id) do
  include ProductInteractionEvent
end
```

Now subscribe to the module:

```ruby {3}
class UpdateRecommendations
  include Rage::Events::Subscriber
  subscribe_to ProductInteractionEvent
end
```

Adding a new product interaction event is now trivial - just include the module, and all relevant subscribers automatically react.

### Handle Everything

You can also subscribe to a base class to handle all events uniformly:

```ruby
class ApplicationEvent < Data
end
```

Use it for your events:

```ruby {1}
ProductViewed = ApplicationEvent.define(:product_id) do
  include ProductInteractionEvent
end
```

And subscribe to the base class:

```ruby {3}
class StoreInDatabase
  include Rage::Events::Subscriber
  subscribe_to ApplicationEvent

  def call(event)
    # the event can be any event inherited from `ApplicationEvent`
  end
end
```

Ruby's inheritance chain is the foundation of `Rage::Events`. It allows you to naturally define events, share behavior, and maintain clear boundaries.

Subscribing to parent classes or modules introduces no runtime overhead - subscription lookups are cached, so you can structure your event hierarchies as complex as needed. 

## Deferred Subscribers

By default, subscribers execute synchronously when you publish an event. If a subscriber takes one second to complete, the `Rage::Events.publish` call will also take one second.

To avoid blocking, mark subscribers as deferred:

```ruby {3}
class CreateShipment
  include Rage::Events::Subscriber
  subscribe_to OrderCreated, deferred: true
end
```

Deferred subscribers are executed in the background using Rage's [background queue](deferred.md) and automatically retried if they fail.

## Error Handling

Use `rescue_from` in your subscribers to handle exceptions in a centralized way:

```ruby {5-11}
class CreateShipment
  include Rage::Events::Subscriber
  subscribe_to OrderCreated, deferred: true

  rescue_from Net::HTTPError do |exception|
    Rage.logger.with_context(exception:) do
      Rage.logger.error "Shipment API is unavailable"
    end

    raise exception
  end
end
```

:::info

Remember to re-raise your exceptions in deferred subscribers, otherwise Rage will consider the subscriber successful and won't retry it.

:::

## Context

Sometimes you need to pass additional information with an event that doesn't belong to the event itself. Use the `context` parameter when publishing:

```ruby {2}
event = OrderCreated.new(order_id: 1, product_id: 2)
Rage::Events.publish(event, context: { published_at: Time.now })
```

Subscribers can access context data through the optional `context` keyword argument:

```ruby {5-7}
class UpdateStock
  include Rage::Events::Subscriber
  subscribe_to OrderCreated

  def call(event, context:)
    puts "Event published at: #{context[:published_at]}"
  end
end
```

## Visualizing Event Flow

The biggest advantage of event-driven architecture - separation of concerns - is also one of its challenges. While publishers don't need to know about subscribers, developers do.

The `rage events` CLI makes the implicit explicit. It shows you exactly what happens when an event is published by building a tree of event-subscriber relationships.

Let's say we have the following events:


```ruby
# Base event class
class ApplicationEvent < Data
end

# Shared behavior
module ProductInteractionEvent
end

# Event class
OrderCreated = ApplicationEvent.define(:order_id, :product_id) do
  include ProductInteractionEvent
end
```

And subscribers:

```ruby
class StoreInDatabase
  include Rage::Events::Subscriber
  subscribe_to ApplicationEvent
end

class CreateShipment
  include Rage::Events::Subscriber
  subscribe_to OrderCreated
end

class UpdateRecommendations
  include Rage::Events::Subscriber
  subscribe_to ProductInteractionEvent
end
```

Run the `rage events` command in your terminal to see what subscribers will be called when the `OrderCreated` event is published:

```
$ rage events

├─ OrderCreated
│   ├─ CreateShipment
│   ├─ ProductInteractionEvent
│   │   └─ UpdateRecommendations
│   └─ ApplicationEvent
│       └─ StoreInDatabase
```

## When Should You Use Events?

Events are not for everything.

Use them when:

- **Behavior spans multiple concerns** - sending emails, updating analytics, creating shipments, notifying third parties
- **Side effects evolve over time** - you want to add features without rewiring logic
- **You want extensibility** - new reactions shouldn't require modifying existing code
- **The system should explain itself** - "what happens when X occurs?" should have a clear answer

Don't use them for:

- Simple, single-purpose operations
- Core business logic with a single responsibility
- Cases where direct method calls are clearer

If you've ever been afraid to touch a method because you didn't know what it would break - events are for you.

## Benchmarks

The following benchmark measures the overhead an event publishing system introduces. The chart shows how much slower it is to trigger two subscribers by publishing an event versus calling them directly.

<details>
<summary>Rage</summary>

```ruby
# Define an event
TestEvent = Data.define

# Define subscribers
class TestSubscriber1
  include Rage::Events::Subscriber
  subscribe_to TestEvent

  def call(_)
  end
end

class TestSubscriber2
  include Rage::Events::Subscriber
  subscribe_to TestEvent

  def call(_)
  end
end

# Run the benchmark
require "benchmark/ips"
RubyVM::YJIT.enable

Benchmark.ips do |x|
  x.report("publish event") do
    Rage.events.publish(TestEvent.new)
  end

  x.report("call manually") do
    event = TestEvent.new

    TestSubscriber1.new.call(event)
    TestSubscriber2.new.call(event)
  end

  x.compare!
end
```
</details>

<details>
<summary>Wisper</summary>

```ruby
# Define notifiers
class TestNotifier1
  def self.process_test_event(_) = new.process_test_event(_)

  def process_test_event(_)
  end
end

class TestNotifier2
  def self.process_test_event(_) = new.process_test_event(_)

  def process_test_event(_)
  end
end

# Define an event
TestEvent = Data.define

# Define the publisher
class TestPublisher
  include Wisper::Publisher

  def call(event)
    broadcast(:process_test_event, event)
  end
end

# Create subscriptions
publisher = TestPublisher.new
publisher.subscribe(TestNotifier1)
publisher.subscribe(TestNotifier2)

# Run the benchmark
require "benchmark/ips"
RubyVM::YJIT.enable

Benchmark.ips do |x|
  x.report("publish event") do
    publisher.call(TestEvent.new)
  end

  x.report("call manually") do
    event = TestEvent.new

    TestNotifier1.process_test_event(event)
    TestNotifier2.process_test_event(event)
  end

  x.compare!
end
```
</details>

<details>
<summary>dry-events</summary>

```ruby
require "dry/events/publisher"

# Define listeners
class TestListener1
  def self.on_process_event(_) = new.on_process_event(_)

  def on_process_event(_)
  end
end

class TestListener2
  def self.on_process_event(_) = new.on_process_event(_)

  def on_process_event(_)
  end
end

# Define the publisher
class Publisher
  include Dry::Events::Publisher[:test_publisher]

  register_event("process.event")
end

# Create subscriptions
publisher = Publisher.new
publisher.subscribe(TestListener1)
publisher.subscribe(TestListener2)

# Run the benchmark
require "benchmark/ips"
RubyVM::YJIT.enable

Benchmark.ips do |x|
  x.report("publish event") do
    publisher.publish("process.event", {})
  end

  x.report("call manually") do
    event = {}

    TestListener1.on_process_event(event)
    TestListener2.on_process_event(event)
  end

  x.compare!
end
```
</details>

<div className="w-full sm:w-[69%]">
  <BenchmarkResultChart
    title="Publishing Overhead"
    units="slower"
    xAxis={["Direct call", "Rage::Events", "dry-events 1.1.0", "Wisper 3.0.0"]}
    values={[1, 0.5181, 0.2053, 0.1160]}
    datalabels={["1x", "1.93x", "4.87x", "8.62x"]}
    rotateLabels={true}
  />
</div>
