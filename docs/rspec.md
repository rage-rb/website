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
