# Common Patterns

This guide covers common patterns and best practices for building applications with Rage.

## Concurrent Processing

### Problem

Consider the following controller:

```ruby
class UsersController < RageController::API
  def show
    user = Net::HTTP.get(URI("http://users.service/users/#{params[:id]}"))
    bookings = Net::HTTP.get(URI("http://bookings.service/bookings?user_id=#{params[:id]}"))

    render json: { user: user, bookings: bookings }
  end
end
```

This code fires two consecutive HTTP requests. If each request takes 1 second, the total execution time will be 2 seconds.

### Solution

Rage allows you to significantly reduce execution time by firing requests concurrently using fibers:

1. Wrap each request in a separate fiber using `Fiber.schedule`
2. Pass the newly created fibers into `Fiber.await`

```ruby {3-6}
class UsersController < RageController::API
  def show
    user, bookings = Fiber.await([
      Fiber.schedule { Net::HTTP.get(URI("http://users.service/users/#{params[:id]}")) },
      Fiber.schedule { Net::HTTP.get(URI("http://bookings.service/bookings?user_id=#{params[:id]}")) }
    ])

    render json: { user: user, bookings: bookings }
  end
end
```

With this change, both requests execute concurrently. If each request takes 1 second, the total execution time is still 1 second.

:::info
Many developers think of fibers as "lightweight threads" that require fiber pools, similar to thread pools for threads.

Instead, treat fibers as regular Ruby objects. Just as we create arrays on demand without using an "array pool," you can create fibers freely and let Ruby and the garbage collector manage them.
:::

## Structured Logging

All logs in Rage consist of two parts: **keys** and **tags**. Here's a sample log entry:

```
[fecbba0735355738] timestamp=2025-09-19T11:12:56+00:00 pid=1825 level=info message=hello
```

In this entry:
- **Keys**: `timestamp`, `pid`, `level`, and `message`
- **Tags**: `fecbba0735355738`

Use the `tagged` method to add custom tags and `with_context` to add custom keys.

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

## Environment-Specific Code

Use `Rage.env` to write environment-aware code. This is particularly useful for enabling development features or test helpers that shouldn't run in production.

### Example: Test Authentication

In this example, we allow test token authentication in non-production environments:

```ruby {9-11}
class ApplicationController < RageController::API
  before_action :authenticate_user

  private

  def authenticate_user
    is_user_authenticated = verify_user_token

    unless Rage.env.production?
      is_user_authenticated ||= request.headers["Test-Token"] == ENV["TEST_TOKEN"]
    end

    head :forbidden unless is_user_authenticated
  end
end
```

`Rage.env` dynamically detects the current environment. If you start the server with `rage s -e preprod`, then `Rage.env.preprod?` will return `true`.

## Delaying Initialization

### Problem

Sometimes you need to reference application-specific constants (like models) in your initializers located in `config/initializers`. However, initializers run before the application code loads, so these constants aren't yet available.

### Solution

Use the `Rage.config.after_initialize` method to schedule code to run after the application loads.

In this example, we ensure an admin user always exists. Since `User` is an application-level constant, we use `after_initialize` to delay execution until `User` is available:

```ruby title="config/initializers/admin_user.rb"
Rage.config.after_initialize do
  User.find_or_create_by!(username: "admin", password: "admin")
end
```

### When to Use This

Use `after_initialize` when you need to:
- Reference application models or controllers in initializers
- Run setup code that depends on the full application being loaded
- Configure gems that need access to your application's constants

## File Server

### Problem

You need to serve static files to clients, such as configuration files for the frontend, custom documentation pages, or other assets.

### Solution

Enable static file serving in your Rage configuration:

```ruby
Rage.configure do
  config.public_file_server.enabled = true
end
```

Once enabled, Rage will serve files from the `public` folder. Files are served at the root path based on their location in the directory.

### Example

If you have the following file structure:

```
public/
├── config.json
└── docs/
    └── index.html
```

These files will be accessible at:
- `/config.json`
- `/docs/index.html`
