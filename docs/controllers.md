# Controllers

Controllers are the heart of your Rage application. Rage follows the **MVC** (Model-View-Controller) pattern, with a focus on the **C** (Controller) layer, which handles incoming requests and coordinates responses.

## Basic Controller Structure

In Rage, each controller typically represents a resource in your application (like users, posts, or orders). The public methods you define in a controller class are called **actions**, which handle specific operations on that resource:

```ruby title="app/controllers/users_controller.rb"
class UsersController < ApplicationController
  def create
    # create a user
  end
end
```

## Accessing Request Parameters

Rage provides a `params` hash that gives you access to all request data. It automatically parses:

- Query string parameters (e.g., `?email=user@example.com`)
- JSON request bodies
- URL-encoded form data
- URL path parameters (e.g., `/users/:id`)

Here's how to use it:

```ruby title="app/controllers/users_controller.rb" {3}
class UsersController < ApplicationController
  def create
    User.create!(email: params[:email], password: params[:password])
  end
end
```

## Rendering Responses

Use the `render` method to send responses back to the client. You can specify the response status, body, headers, and more:

```ruby title="app/controllers/users_controller.rb" {4}
class UsersController < ApplicationController
  def create
    user = User.create!(email: params[:email], password: params[:password])
    render json: { id: user.id }, status: :created
  end
end
```

:::info

Refer to the [API Documentation](https://rage-rb.pages.dev/RageController/API) for a complete set of methods available inside controllers.

:::

## Callbacks

Callbacks let you run code before or after an action executes. They're perfect for reducing duplication and implementing cross-cutting concerns like authentication and authorization.

### Using `before_action`

The most commonly used callback is `before_action`, which runs before your controller action is executed. Here's an example that eliminates repeated code:

```ruby title="app/controllers/user_statuses_controller.rb" {2-4,7,11}
class UserStatusesController < ApplicationController
  before_action do
    @user = User.find_by(params[:id])
  end

  def create
    @user.activate!
  end

  def destroy
    @user.deactivate!
  end
end
```

### Halting Request Processing

If you call `render` or `head` inside a `before_action`, Rage will stop processing and skip the controller action entirely. This is particularly useful for authentication and authorization:

```ruby title="app/controllers/user_statuses_controller.rb" {4}
class UserStatusesController < ApplicationController
  before_action do
    @user = User.find_by(params[:id])
    head :bad_request unless @user
  end

  def create
    @user.activate!
  end

  def destroy
    @user.deactivate!
  end
end
```

In this example, if the user isn't found, Rage returns a 400 Bad Request response and never calls the `create` or `destroy` actions.

## Error Handling

Rage provides `rescue_from` to catch and handle exceptions in a centralized way. This is especially useful for:

- Logging errors consistently
- Returning standardized error responses
- Handling specific exception types differently

Define error handlers in your `ApplicationController` to apply them across all controllers:

```ruby title="app/controllers/application_controller.rb"
class ApplicationController < RageController::API
  rescue_from StandardError do |error|
    render json: { error: error.message }, status: :internal_server_error
  end
end
```

When an exception occurs in any action, Rage will execute the matching `rescue_from` block instead of letting the error bubble up.

## RESTful Design

While you can name controller actions anything you want, following REST conventions leads to more maintainable and predictable APIs. The five standard RESTful actions are:

| Action | Purpose | HTTP Method |
|--------|---------|-------------|
| `index` | List all resources | GET |
| `show` | Display a single resource | GET |
| `create` | Create a new resource | POST |
| `update` | Update an existing resource | PUT/PATCH |
| `destroy` | Delete a resource | DELETE |

### When to Create a New Controller

If you find yourself adding an action with a non-standard name, it's often a sign that you should create a new controller representing a different resource.

**Instead of this:**

```ruby title="app/controllers/users_controller.rb" {1-2}
class UsersController < ApplicationController
  def stats
    user = User.find(params[:id])
    render json: { signed_up_at: user.signed_up_at, subscription_status: user.subscription_status }
  end
end
```

**Do this:**

```ruby title="app/controllers/user_stats_controller.rb" {1-2}
class UserStatsController < ApplicationController
  def show
    user = User.find(params[:id])
    render json: { signed_up_at: user.signed_up_at, subscription_status: user.subscription_status }
  end
end
```

This approach keeps your API organized and makes it easier to understand at a glance.
