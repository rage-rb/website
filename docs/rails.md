# Rails Integration

You can integrate Rage into existing Rails applications to boost performance while keeping your familiar Rails stack. This guide walks you through the process using a real-world example.

## Example Application

We'll use [rage-rb/rails-integration-app](https://github.com/rage-rb/rails-integration-app) - a warehouse booking system for shipping companies. The app has three stages:

1. Welcome page - select day and booking duration
2. Available slots - choose a specific time slot
3. Confirmation page

The complete integration is available in [PR #2](https://github.com/rage-rb/rails-integration-app/pull/2).

## Integration Goal

After integration, Rage will handle HTTP requests, while Rails continues to manage code loading, ActiveRecord, migrations, and other framework features. You get Rage's performance with Rails' ecosystem.

## Integration Steps

### Step 1: Install Rage

Add Rage to your `Gemfile`:

```ruby title="Gemfile"
gem "rage-rb"
```

Run `bundle install` to install the gem.

Next, require Rage in your application configuration:

```ruby title="config/application.rb"
# ... existing Rails configuration ...
end

# IMPORTANT: Require this AFTER defining your Rails application class
require "rage/rails"
```

### Step 2: Update Routes

Change your routes file to use Rage:

```ruby title="config/routes.rb" {1}
Rage.routes.draw do
  resources :bookings, only: %i(index create)
end
```

### Step 3: Update Controllers

Change your base controller to inherit from `RageController::API`:

```ruby title="app/controllers/application_controller.rb"
class ApplicationController < RageController::API
end
```

All controllers that inherit from `ApplicationController` will automatically use Rage.

### Step 4: Update Rack Configuration

Modify `config.ru` to run Rage instead of Rails:

```ruby title="config.ru" {3}
require_relative "config/environment"

run Rage.application
```

### Step 5: Update Server Start Command

Rage uses its own server command. Update your start scripts:

**Development:**
```bash
bundle exec rage s
```

**Production (Docker example):**
```dockerfile title="Dockerfile"
CMD bundle exec rage s -b 0.0.0.0
```

### Step 6: Configure Rage

Configure Rage to match your application's needs. Configuration must happen in the `Rails.configuration.after_initialize` block:

```ruby title="config/application.rb"
Rails.configuration.after_initialize do
  Rage.configure do
    # Match your Puma worker count (optional)
    config.server.workers_count = 1

    # Add required middleware
    config.middleware.use ActionDispatch::HostAuthorization

    # Environment-specific middleware
    if Rails.env.development?
      config.middleware.use ActiveRecord::Migration::CheckPending
    end
  end
end
```

:::warning

Rage has its own middleware stack and **does not** automatically copy Rails middleware. You need to explicitly configure any Rails middleware your application requires.

:::

Also, let's update the CORS middleware. Initially, the application was using `Rack::Cors`. And while Rage is fully compatible with `Rack::Cors`, for simpler cases it is recommended to use the built-in [Rage::Cors](https://rage-rb.pages.dev/Rage/Cors) middleware.

```diff
--- a/config/application.rb
+++ b/config/application.rb
@@ -35,16 +35,6 @@ module SlotBooking
     # Middleware like session, flash, cookies can be added back manually.
     # Skip views, helpers and assets when generating a new resource.
     config.api_only = true
-
-    config.middleware.insert_before 0, Rack::Cors do
-      allow do
-        origins "localhost:5173", "https://clumsy-squirrel-4315.pages.dev"
-
-        resource "*",
-          headers: :any,
-          methods: [:get, :post, :put, :patch, :delete, :options, :head]
-      end
-    end
   end
 end
 
@@ -55,6 +45,10 @@ Rails.configuration.after_initialize do
     config.server.workers_count = 1
     config.server.port = 3000
 
+    config.middleware.use Rage::Cors do
+      allow "localhost:5173", "https://clumsy-squirrel-4315.pages.dev"
+    end
+
     config.middleware.use ActionDispatch::HostAuthorization
     if Rails.env.development?
       config.middleware.use ActionDispatch::Reloader

```

That's it! You've successfully integrated Rage. Now let's look at the performance improvements.

## Performance Benchmarks

To measure the impact, we ran load tests using [this k6 script](https://github.com/rage-rb/rails-integration-app/blob/main/benchmark/k6.js) that simulates real-world traffic patterns.

**Test Environment:**
- Ruby 3.2.2
- AWS EC2 t2.medium instance
- Same application code, only the web server differs

<details>

<summary><b>Rails results</b></summary>

```
          /\      |‾‾| /‾‾/   /‾‾/   
     /\  /  \     |  |/  /   /  /    
    /  \/    \    |     (   /   ‾‾\  
   /          \   |  |\  \ |  (‾)  | 
  / __________ \  |__| \__\ \_____/ .io

  execution: local
     script: k6.js
     output: -

  scenarios: (100.00%) 1 scenario, 50 max VUs, 1m30s max duration (incl. graceful stop):
           * bookings: 25.00 iterations/s for 1m0s (maxVUs: 50, gracefulStop: 30s)


     ✓ response code was 200
     ✓ response code was 200 or 409
     ✓ CORS header is present

     checks.........................: 100.00% ✓ 1757      ✗ 0   
     data_received..................: 1.4 MB  23 kB/s
     data_sent......................: 212 kB  3.4 kB/s
     http_req_blocked...............: avg=19.03µs  min=1.45µs  med=7.81µs   max=992.64µs p(90)=11.31µs  p(95)=27.25µs 
     http_req_connecting............: avg=6.63µs   min=0s      med=0s       max=469.75µs p(90)=0s       p(95)=0s      
     http_req_duration..............: avg=949.76ms min=3.77ms  med=825.51ms max=59.78s   p(90)=1.72s    p(95)=2.4s    
       { expected_response:true }...: avg=949.76ms min=3.77ms  med=825.51ms max=59.78s   p(90)=1.72s    p(95)=2.4s    
     http_req_failed................: 0.00%   ✓ 0         ✗ 1629
     http_req_receiving.............: avg=86.57µs  min=38.1µs  med=83.14µs  max=1.02ms   p(90)=105.64µs p(95)=117.76µs
     http_req_sending...............: avg=35.78µs  min=14.57µs med=34.59µs  max=243.32µs p(90)=42.98µs  p(95)=55.25µs 
     http_req_tls_handshaking.......: avg=0s       min=0s      med=0s       max=0s       p(90)=0s       p(95)=0s      
     http_req_waiting...............: avg=949.64ms min=3.69ms  med=825.41ms max=59.78s   p(90)=1.72s    p(95)=2.4s    
     http_reqs......................: 1629    26.333117/s
     iteration_duration.............: avg=1.03s    min=4.92ms  med=918.01ms max=59.79s   p(90)=1.75s    p(95)=2.57s   
     iterations.....................: 1501    24.263971/s
     vus............................: 22      min=1       max=45
     vus_max........................: 50      min=50      max=50


running (1m01.9s), 00/50 VUs, 1501 complete and 0 interrupted iterations
bookings ✓ [======================================] 00/50 VUs  1m0s  25.00 iters/s
```

</details>

<details>

<summary><b>Rage results</b></summary>

```
          /\      |‾‾| /‾‾/   /‾‾/   
     /\  /  \     |  |/  /   /  /    
    /  \/    \    |     (   /   ‾‾\  
   /          \   |  |\  \ |  (‾)  | 
  / __________ \  |__| \__\ \_____/ .io

  execution: local
     script: k6.js
     output: -

  scenarios: (100.00%) 1 scenario, 50 max VUs, 1m30s max duration (incl. graceful stop):
           * bookings: 25.00 iterations/s for 1m0s (maxVUs: 50, gracefulStop: 30s)


     ✓ response code was 200
     ✓ response code was 200 or 409
     ✓ CORS header is present

     checks.........................: 100.00% ✓ 1868      ✗ 0   
     data_received..................: 1.6 MB  26 kB/s
     data_sent......................: 229 kB  3.8 kB/s
     http_req_blocked...............: avg=17.38µs min=673ns   med=7.95µs  max=428.2µs  p(90)=11.61µs p(95)=26.63µs
     http_req_connecting............: avg=6.2µs   min=0s      med=0s      max=329.57µs p(90)=0s      p(95)=0s     
     http_req_duration..............: avg=4.13ms  min=2.96ms  med=3.96ms  max=30.31ms  p(90)=4.77ms  p(95)=5.11ms 
       { expected_response:true }...: avg=4.13ms  min=2.96ms  med=3.96ms  max=30.31ms  p(90)=4.77ms  p(95)=5.11ms 
     http_req_failed................: 0.00%   ✓ 0         ✗ 1684
     http_req_receiving.............: avg=76.82µs min=35.88µs med=76.92µs max=197.13µs p(90)=90.17µs p(95)=96.37µs
     http_req_sending...............: avg=37.46µs min=12.88µs med=35.39µs max=120.42µs p(90)=42.3µs  p(95)=59.27µs
     http_req_tls_handshaking.......: avg=0s      min=0s      med=0s      max=0s       p(90)=0s      p(95)=0s     
     http_req_waiting...............: avg=4.01ms  min=2.82ms  med=3.85ms  max=30.04ms  p(90)=4.66ms  p(95)=4.98ms 
     http_reqs......................: 1684    28.066327/s
     iteration_duration.............: avg=4.93ms  min=3.3ms   med=4.32ms  max=31.13ms  p(90)=7.84ms  p(95)=8.53ms 
     iterations.....................: 1500    24.999697/s
     vus............................: 0       min=0       max=1 
     vus_max........................: 50      min=50      max=50


running (1m00.0s), 00/50 VUs, 1500 complete and 0 interrupted iterations
bookings ✓ [======================================] 00/50 VUs  1m0s  25.00 iters/s
```

</details>

### Results

While Rails latency degrades under load (p95 reaches 2.4s), Rage maintains consistent performance (~5ms). This means Rage handles traffic spikes gracefully using the same hardware.

## Gradual Migration with Multi-App Mode

Rage supports running alongside Rails in the same application, allowing you to:

- Migrate controller by controller
- Keep Rails views for full-stack apps while using Rage for API endpoints
- Test Rage's performance on specific endpoints before full migration

### Setup

1. Perform all the integration steps updating only the controllers you want to migrate to inherit from `RageController::API`
2. Leave other controllers inheriting from `ActionController::API` (or `ActionController::Base`)
3. Update `config.ru` to use multi-app mode:

```ruby
run Rage.multi_application
```

Rage automatically routes requests to the appropriate framework based on which controller handles the route. This gives you the flexibility to adopt Rage incrementally without risking your entire application.
