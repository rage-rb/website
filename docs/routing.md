# Routing

Routing determines how your application responds to incoming HTTP requests. In Rage, routes connect URLs to controller actions and are defined in the `config/routes.rb` file.

When a request comes in, Rage's router matches it against your defined routes and dispatches it to the appropriate controller action.

:::info

Refer to the [API Documentation](https://api.rage-rb.dev/Rage/Router/DSL/Handler) for a complete set of router methods.

:::

## Resource Routing

The `resources` helper is the quickest way to create routes for RESTful controllers. It automatically generates all five standard REST routes with a single line of code.

Add this to your routes file:

```ruby title="config/routes.rb"
Rage.routes.draw do
  resources :users
end
```

This single declaration creates all the routes you need for a typical REST resource:

| HTTP Method | URL | Controller | Action | Purpose |
|-------------|-----|------------|--------|---------|
| **GET** | `/users` | `UsersController` | `index` | List all users |
| **POST** | `/users` | `UsersController` | `create` | Create a new user |
| **GET** | `/users/:id` | `UsersController` | `show` | Show a specific user |
| **PATCH**/**PUT** | `/users/:id` | `UsersController` | `update` | Update a user |
| **DELETE** | `/users/:id` | `UsersController` | `destroy` | Delete a user |

Routes with `:id` in the URL automatically make that value available in your controller via `params[:id]`.

### Limiting Generated Routes

Sometimes you don't need all five REST actions. Use the `:only` option to generate only the routes you need:

```ruby title="config/routes.rb"
Rage.routes.draw do
  resources :users, only: [:index, :show]
end
```

This creates only two routes instead of five:

| HTTP Method | URL | Controller | Action |
|-------------|-----|------------|--------|
| **GET** | `/users` | `UsersController` | `index` |
| **GET** | `/users/:id` | `UsersController` | `show` |

Alternatively, you can use `:except` to exclude specific actions:

```ruby title="config/routes.rb"
Rage.routes.draw do
  resources :users, except: [:destroy]
end
```

This generates all routes except `destroy`, which might be useful if you want to prevent users from being deleted through the API.

### Namespaces

Namespaces help you organize routes into logical groups, which is especially useful for API versioning or admin sections. They prefix both the URL path and the controller module:

```ruby title="config/routes.rb"
Rage.routes.draw do
  namespace :v1 do
    resources :users
  end
end
```

This generates routes under the `/v1` path and expects controllers in the `V1::` module:

| HTTP Method | URL | Controller | Action |
|-------------|-----|------------|--------|
| **GET** | `/v1/users` | `V1::UsersController` | `index` |
| **POST** | `/v1/users` | `V1::UsersController` | `create` |
| **GET** | `/v1/users/:id` | `V1::UsersController` | `show` |
| **PATCH**/**PUT** | `/v1/users/:id` | `V1::UsersController` | `update` |
| **DELETE** | `/v1/users/:id` | `V1::UsersController` | `destroy` |

Your controller file would be located at `app/controllers/v1/users_controller.rb` and defined as `class V1::UsersController`.

## Custom Routing

While `resources` handles most cases, sometimes you need more control over your routes. Rage provides HTTP method helpers (`get`, `post`, `put`, `patch`, `delete`) for defining custom routes.

Here's an example controller with a custom action:

```ruby title="app/controllers/user_messages_controller.rb"
class UserMessagesController < ApplicationController
  def mark_as_read
    message = Message.find_by(id: params[:message_id], user_id: params[:user_id])
    message.mark_as_read
  end
end
```

You can map this to a custom URL like this:

```ruby title="config/routes.rb"
Rage.routes.draw do
  post "/messages/:user_id/:message_id/read", to: "user_messages#mark_as_read"
end
```

Breaking this down:
- `post` - specifies the HTTP method
- `"/messages/:user_id/:message_id/read"` - the URL pattern (`:user_id` and `:message_id` become parameters)
- `to: "user_messages#mark_as_read"` - the controller and action, separated by `#`

Note that the controller name should be underscored and without the `Controller` suffix (e.g., `user_messages` instead of `UserMessagesController`).
