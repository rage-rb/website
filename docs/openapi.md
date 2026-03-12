import useBaseUrl from "@docusaurus/useBaseUrl"
import ThemedImage from "@theme/ThemedImage"

# OpenAPI Documentation

Rage includes built-in support for generating OpenAPI specifications automatically from your controllers. `Rage::OpenAPI` analyzes your routes and controller code to create interactive API documentation.

## Try It First

Before setting up your own project, try the [OpenAPI Playground](https://openapi-playground.rage-rb.dev) to see how `Rage::OpenAPI` works. Experiment with different tags and serializers to understand the features available.

## Setup

Mount `Rage::OpenAPI` in your application to expose an OpenAPI specification endpoint.

### Option 1: Mount in `config.ru`

```ruby
map "/publicapi" do
  run Rage::OpenAPI.application
end
```

### Option 2: Mount in Routes

```ruby
Rage.routes.draw do
  mount Rage::OpenAPI.application, at: "/publicapi"
end
```


## Basic Usage

Let's say you have these routes defined:

```ruby
Rage.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :users, only: %i[index show create]
      resources :photos, only: :index
    end

    namespace :v2 do
      resources :users, only: :show
    end
  end
end
```

Start your server with `rage s` and visit `http://localhost:3000/publicapi`. You'll see an automatically generated specification listing all your endpoints:

<ThemedImage
  className="w-11/12"
  alt="OpenAPI Example"
  sources={{
    light: useBaseUrl('/img/docs/openapi_1.webp'),
    dark: useBaseUrl('/img/docs/openapi_1_dark.webp'),
  }}
/>

## Documenting Your API

While the auto-generated specification is a good start, you'll want to add descriptions, parameters, and response schemas to make it truly useful.

### The Rage Approach

`Rage::OpenAPI` uses a simple, focused approach:

- **No complex DSL** - Instead of learning a complicated domain-specific language, you use familiar YARD-style tags
- **Documentation in code** - Tags go directly in your controllers, keeping docs close to implementation
- **Focused scope** - Covers the most common documentation needs without trying to expose every OpenAPI feature

This approach means you spend less time learning tools and more time building your API.

### How Tags Work

You document your API using comment tags above controller actions:

- **Action-level tags** (like `@description`) apply to a specific action
- **Class-level tags** (like `@deprecated`) apply to all actions in that controller and any child controllers

## Available Tags

### Summary

Add a simple comment above your action to create a one-line summary:

```ruby
class Api::V1::UsersController < ApplicationController
  # Returns the list of all active non-admin users.
  def index
  end
end
```

The summary appears in your OpenAPI specification:

<ThemedImage
  className="w-11/12"
  alt="OpenAPI Example"
  sources={{
    light: useBaseUrl('/img/docs/openapi_2.webp'),
    dark: useBaseUrl('/img/docs/openapi_2_dark.webp'),
  }}
/>

### Description

Use `@description` for longer, more detailed explanations. It supports Markdown formatting and can span multiple lines:

```ruby
class Api::V1::UsersController < ApplicationController
  # Returns the list of all active non-admin users.
  # @description This endpoint provides access to all registered
  #   users in the system. Only **non-admin users** are included
  #   in the response.
  def show
  end
end
```

### Version and Title

Use `@version` and `@title` to set metadata for your entire API specification. These tags should appear only once and set the `title` and `version` properties of the [info object](https://swagger.io/docs/specification/v3_0/basic-structure/):

```ruby
class ApplicationController < RageController::API
  # @version 1.0.0
  # @title User Management API
end
```

### Internal Notes

Leave notes for other developers that won't appear in the public specification:

```ruby
class Api::V1::UsersController < ApplicationController
  # @internal All changes to this action must be approved by a principal engineer.
  def create
  end
end
```

### Deprecation

Mark individual actions as deprecated:

```ruby
class Api::V1::UsersController < ApplicationController
  def index
  end

  # @deprecated
  def create
  end
end
```

Or mark an entire controller as deprecated (affects all actions and child controllers):

```ruby
class Api::V1::UsersController < ApplicationController
  # @deprecated

  def index
  end

  def create
  end
end
```

### Authentication

Document your authentication requirements using the `@auth` tag. It automatically tracks which endpoints require authentication based on your `before_action` callbacks:

```ruby
class ApplicationController < RageController::API
  before_action :authenticate_by_token
  # @auth authenticate_by_token

  private

  def authenticate_by_token
    # Authentication logic
  end
end
```

`Rage::OpenAPI` automatically:
- Tracks all uses of the `authenticate_by_token` callback
- Respects `skip_before_action` calls
- Applies the security scheme only to protected endpoints

By default, it uses bearer token authentication:

```yaml
type: http
scheme: bearer
```

#### Custom Security Schemes

Customize the [security scheme](https://swagger.io/docs/specification/v3_0/authentication/) by adding YAML inline:

```ruby
class ApplicationController < RageController::API
  before_action :authenticate_by_token

  # @auth authenticate_by_token
  #   type: apiKey
  #   in: header
  #   name: X-API-Key
end
```

#### Multiple Security Schemes

Support multiple authentication methods:

```ruby
class ApplicationController < RageController::API
  before_action :authenticate_by_user_token
  before_action :authenticate_by_service_token

  # @auth authenticate_by_user_token
  # @auth authenticate_by_service_token
end
```

#### Custom Scheme Names

Rename the security scheme in the specification:

```ruby
class ApplicationController < RageController::API
  before_action :authenticate_by_token

  # @auth authenticate_by_token UserAuth
end
```

#### Shared Schemes

You can also reference security schemes defined in your [shared components file](#shared-references):

```ruby
class ApplicationController < RageController::API
  # @auth #/components/securitySchemes/BasicAuth
end
```

### Responses

`Rage::OpenAPI` provides three ways to document response schemas:

#### 1. Inline Schema

For simple responses, define the schema directly in the tag:

```ruby
class Api::V1::UsersController < ApplicationController
  # @response { id: Integer, full_name: String, email: String }
  def show
  end
end
```

#### 2. Shared References

For complex or reusable schemas, use [shared references](#shared-references).

#### 3. Automatic Schema Generation

`Rage::OpenAPI` can automatically generate schemas from ActiveRecord models or [Alba](https://github.com/okuramasafumi/alba) serializers.

Given this Alba resource:

```ruby
class UserResource
  include Alba::Resource

  root_key :user
  attributes :id, :name, :email
end
```

Reference it in your controller:

```ruby
class Api::V1::UsersController < ApplicationController
  # @response UserResource
  def show
  end
end
```

This generates:

```yaml
schema:
  type: object
  properties:
    user:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        email:
          type: string
```

Most Alba features are supported, including associations, key transformations, inheritance, and typed attributes.

#### Collections

Use `Array<>` or `[]` syntax for arrays:

```ruby
class Api::V1::UsersController < ApplicationController
  # @response Array<UserResource>
  def index
  end
end
```

#### Namespace Resolution

`Rage::OpenAPI` takes namespaces into account. If you have `Api::V1::UserResource` and `Api::V2::UserResource`, referencing `UserResource` from `Api::V2::UsersController` automatically uses `Api::V2::UserResource`.

#### Multiple Status Codes

Document different responses for different status codes:

```ruby
class Api::V1::UsersController < ApplicationController
  # @response 200 UserResource
  # @response 404 { error: String }
  def show
  end
end
```

#### Global Responses

Apply responses to all actions in a controller and its children:

```ruby
class Api::V1::BaseController < ApplicationController
  # @response 404 { status: "NOT_FOUND" }
  # @response 500 { status: "ERROR", message: String }
end
```

### Request Bodies

The `@request` tag works similarly to `@response`. It accepts inline schemas, [shared references](#shared-references), or ActiveRecord models.

When using ActiveRecord models, `Rage::OpenAPI` automatically excludes internal attributes like `id`, `created_at`, `updated_at`, and `type`:

```ruby
class Api::V1::UsersController < ApplicationController
  # @request User
  def create
  end
end
```

You can also use inline schemas:

```ruby
class Api::V1::UsersController < ApplicationController
  # @request { name: String, email: String, password: String }
  def create
  end
end
```

### Query Parameters

Document query parameters using the `@param` tag:

```ruby
class Api::V1::UsersController < ApplicationController
  # @param account_id The account the records are attached to
  def index
  end
end
```

#### Optional Parameters

Add `?` after the parameter name to mark it as optional:

```ruby
class Api::V1::UsersController < ApplicationController
  # @param created_at? Filter records by creation date
  def index
  end
end
```

#### Parameter Types

Specify types using `{}` syntax:

```ruby
class Api::V1::UsersController < ApplicationController
  # @param is_active {Boolean} Filter records by active status
  # @param page {Integer} Page number for pagination
  # @param per_page? {Integer} Items per page
  def index
  end
end
```

## Shared References

For complex or reusable schemas, create a file with [shared OpenAPI component definitions](https://swagger.io/docs/specification/v3_0/components/). This file can be in YAML or JSON format and must have a root `components` key.

Create `config/openapi_components.yml`:

```yaml
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        email:
          type: string
          format: email
    Error:
      type: object
      properties:
        message:
          type: string
        code:
          type: string
```

Reference these components in your controllers using JSON Pointer syntax:

```ruby
class Api::V1::UsersController < ApplicationController
  # @response 200 #/components/schemas/User
  # @response 404 #/components/schemas/Error
  def show
  end
end
```

## Controlling Visibility

Sometimes you want to hide certain endpoints from your public API documentation. `Rage::OpenAPI` provides two ways to control visibility.

### Using `@private`

Hide individual actions:

```ruby
class Api::V1::UsersController < ApplicationController
  def show
  end

  # @private
  def create
  end
end
```

Or hide entire controllers:

```ruby
class Api::V1::UsersController < ApplicationController
  # @private

  def show
  end

  def create
  end
end
```

### Namespace Filtering

Limit the specification to a specific namespace:

```ruby
map "/publicapi" do
  run Rage::OpenAPI.application(namespace: "Api::V2")
end
```

This only includes controllers under `Api::V2::`.

### Multiple Specifications

Create different specifications for different audiences:

```ruby
map "/publicapi" do
  run Rage::OpenAPI.application(namespace: "Api::Public")
end

map "/internalapi" do
  use Rack::Auth::Basic do |user, password|
    user == "admin" && password == ENV["ADMIN_PASSWORD"]
  end
  run Rage::OpenAPI.application(namespace: "Api::Internal")
end
```

## Custom Tag Organization

By default, `Rage::OpenAPI` groups endpoints by their controller namespace. For example, `Api::V1::UsersController` actions are grouped under the `v1/Users` tag.

You can customize this grouping with a tag resolver:

```ruby
Rage.configure do
  config.openapi.tag_resolver = proc do |controller, action, default_tag|
    # Custom logic here
  end
end
```

The resolver receives three arguments:

- `controller` - The controller class
- `action` - The action name (symbol)
- `default_tag` - The original tag generated by `Rage::OpenAPI`

The resolver should return a string or array of strings representing the tag(s) for the endpoint.

### Example: Multiple Tags

```ruby
Rage.configure do
  config.openapi.tag_resolver = proc do |controller, action, default_tag|
    tags = [default_tag]

    if controller.name.include?("Admin")
      tags << "Admin"
    elsif controller.name.include?("Public")
      tags << "Public API"
    end

    tags
  end
end
```
