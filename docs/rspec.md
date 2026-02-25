# Testing with RSpec

Rage provides built-in RSpec integration for testing your API endpoints. After requiring `rage/rspec`, you get access to familiar Rails-style testing helpers.

## Available Methods

### HTTP Request Helpers

```ruby
get(path, params: {}, headers: {})
options(path, params: {}, headers: {})
head(path, params: {}, headers: {})

post(path, params: {}, headers: {}, as: nil)
put(path, params: {}, headers: {}, as: nil)
patch(path, params: {}, headers: {}, as: nil)
delete(path, params: {}, headers: {}, as: nil)
```

### Response Matchers

- `have_http_status` - Test response status codes
- `response.parsed_body` - Access parsed response body

These helpers are available in request specs (`type: :request`) after requiring `rage/rspec`.

## Setup Guide

### Step 1: Install Dependencies

Add RSpec and Database Cleaner to your `Gemfile`:

```ruby title="Gemfile"
group :test do
  gem "rspec"
  gem "database_cleaner-active_record"
end
```

Run `bundle install` to install the gems.

:::info

This example uses ActiveRecord. If you're using a different ORM, choose the appropriate [Database Cleaner adapter](https://github.com/DatabaseCleaner/database_cleaner).

:::

### Step 2: Initialize RSpec

Run RSpec's initialization command to create configuration files:

```bash
rspec --init
```

This creates `spec/spec_helper.rb` and `.rspec` configuration files.

### Step 3: Configure Database Cleaner

Add these hooks to `spec/spec_helper.rb` inside the `RSpec.configure` block:

```ruby title="spec/spec_helper.rb"
RSpec.configure do |config|
  # Configure truncation strategy
  config.before(:suite) do
    DatabaseCleaner.strategy = :truncation
  end

  # Clean database between tests
  config.around(:each) do |example|
    DatabaseCleaner.cleaning(&example)
  end
end
```

:::warning Important

The `transaction` cleaning strategy is currently not supported. This is because it relies on Database Cleaner starting a transaction on a connection and expecting the same connection to be used to create the records and query them in the controller. However, Rage executes requests in separate Fibers, causing Active Record to use different connections for the test and the controller, thus breaking this expectation.

:::

### Step 4: Write Your First Test

Create a test file and require `rage/rspec`:

```ruby title="spec/requests/home_spec.rb"
require "rage/rspec"

RSpec.describe "Home", type: :request do
  it "returns a successful response" do
    get "/"

    expect(response).to have_http_status(:ok)
    expect(response.parsed_body).to eq("It works!")
  end
end
```

Run your tests:

```bash
rspec
```

## Testing Examples

### Basic GET Request with Headers

Test an endpoint that requires authentication:

```ruby title="spec/requests/api/v1/photos_spec.rb"
require "rage/rspec"

RSpec.describe "Photos API", type: :request do
  describe "GET /api/v1/photos" do
    it "returns all photos" do
      get "/api/v1/photos", headers: { "Authorization" => "Bearer my-test-token" }

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body.count).to eq(5)
    end
  end
end
```

### Sending JSON Data

Test creating resources with JSON payloads:

```ruby title="spec/requests/api/v1/photos_spec.rb"
require "rage/rspec"

RSpec.describe "Photos API", type: :request do
  describe "POST /api/v1/photos" do
    let(:photo_params) do
      { data: "base64_encoded_image", caption: "Beautiful sunset" }
    end

    it "creates a photo" do
      post "/api/v1/photos", params: photo_params, as: :json

      expect(response).to have_http_status(:created)
    end

    it "returns the newly created photo" do
      post "/api/v1/photos", params: photo_params, as: :json

      expect(response.parsed_body["data"]).to be_present
      expect(response.parsed_body["caption"]).to eq("Beautiful sunset")
    end
  end
end
```

### Testing Subdomain Constraints

Test routes that are constrained to specific subdomains:

```ruby title="spec/requests/api/v1/photos_spec.rb"
require "rage/rspec"

RSpec.describe "Photos API", type: :request do
  before { host! "api.example.com" }

  it "returns all photos" do
    get "/api/v1/photos"

    expect(response).to have_http_status(:ok)
    expect(response.parsed_body.count).to eq(5)
  end
end
```

## Testing Rage::Cable

Rage provides RSpec helpers for testing WebSocket channels. These helpers are similar to Rails Action Cable testing helpers with minor differences.

### Available Methods

#### Connection Helpers

```ruby
connect(path, headers: {})  # Emulate a WebSocket connection
stub_connection(identifiers) # Stub connection identifiers
```

#### Channel Helpers

```ruby
subscribe(params = {})       # Subscribe to the channel
perform(action, data = {})   # Perform a channel action
```

#### Matchers

```ruby
expect(subscription).to be_confirmed
expect(subscription).to have_stream_from("stream_name")
expect(subscription).to have_stream_for(model)

expect(connection).to be_rejected
```

#### Accessors

```ruby
subscription   # The current subscription instance
transmissions  # Array of messages transmitted to the client
connection     # The current connection instance
```

### Testing Subscriptions

Test that a channel correctly subscribes and sets up streams:

```ruby title="spec/channels/chat_channel_spec.rb"
require "rage/rspec"

RSpec.describe ChatChannel, type: :channel do
  let(:user) { create(:user) }

  it "subscribes to the channel" do
    stub_connection(current_user: user)
    subscribe(room_id: 42)

    expect(subscription).to be_confirmed
    expect(subscription).to have_stream_from("chat_room_42")
  end

  it "streams for a specific model" do
    stub_connection(current_user: user)
    subscribe

    expect(subscription).to have_stream_for(user)
  end
end
```

### Testing Transmissions

Test messages sent to the client:

```ruby title="spec/channels/notifications_channel_spec.rb"
require "rage/rspec"

RSpec.describe NotificationsChannel, type: :channel do
  it "sends a welcome message on subscribe" do
    subscribe

    expect(subscription).to be_confirmed
    expect(transmissions.last).to eq({ "message" => "welcome" })
  end
end
```

### Testing Broadcasts

To test broadcasts, use RSpec's native mocking on `Rage::Cable.broadcast`:

```ruby title="spec/channels/chat_channel_spec.rb"
require "rage/rspec"

RSpec.describe ChatChannel, type: :channel do
  it "broadcasts messages to the channel" do
    subscribe

    expect(Rage::Cable).to receive(:broadcast).with("chat", { message: "hello" })
    perform :send_message, { message: "hello" }
  end
end
```

:::info

Unlike Rails, Rage does not provide the `have_broadcasted_to` matcher. Use `expect(Rage::Cable).to receive(:broadcast)` instead.

:::

### Testing Channel Actions

Test custom actions defined in your channel:

```ruby title="spec/channels/chat_channel_spec.rb"
require "rage/rspec"

RSpec.describe ChatChannel, type: :channel do
  it "broadcasts typing indicator" do
    subscribe

    expect(Rage::Cable).to receive(:broadcast).with("chat", { status: "typing" })
    perform :typing
  end

  it "uses connection identifiers in actions" do
    stub_connection(current_user: "user_123")
    subscribe(room_id: 456)

    expect(Rage::Cable).to receive(:broadcast).with("info", { room_id: 456, user: "user_123" })
    perform :info
  end
end
```

### Testing Connections

Test connection authentication and rejection:

```ruby title="spec/channels/application_cable_spec.rb"
require "rage/rspec"

RSpec.describe ApplicationCable::Connection, type: :channel do
  it "connects with valid headers" do
    connect "/cable", headers: { "Authorization" => "Bearer valid_token" }

    expect(connection).not_to be_rejected
    expect(connection.current_user).to eq("authenticated_user")
  end

  it "rejects connections without credentials" do
    connect "/cable"

    expect(connection).to be_rejected
  end
end
```

### Testing with Cookies and Session

Use `cookies` and `session` helpers to set authentication data:

```ruby title="spec/channels/application_cable_spec.rb"
require "rage/rspec"

RSpec.describe ApplicationCable::Connection, type: :channel do
  it "connects with cookies" do
    cookies["auth_token"] = "abc123"
    connect "/cable"

    expect(connection).not_to be_rejected
  end

  it "connects with encrypted cookies" do
    cookies.encrypted["user_id"] = "999"
    connect "/cable"

    expect(connection.current_user).to eq("user_999")
  end

  it "connects with session data" do
    session[:user_id] = "123"
    connect "/cable"

    expect(connection.current_user).to eq("123")
  end
end
```

### Testing with Query Parameters

Pass query parameters through the connection path:

```ruby title="spec/channels/application_cable_spec.rb"
require "rage/rspec"

RSpec.describe ApplicationCable::Connection, type: :channel do
  it "uses query parameters for identification" do
    connect "/cable?token=secret123"

    expect(connection).not_to be_rejected
    expect(connection.current_user).to eq("user_from_token")
  end
end
```
