# Introduction

## Creating a New App

Rage includes a built-in CLI utility that makes it easy to create and set up new applications. To get started, run the following commands:

```bash
gem install rage-rb
rage new my-app
```

This installs Rage and creates a new application in the `my-app` directory with all the necessary files and folder structure.

Next, navigate to your application directory and install the required dependencies:

```bash
cd my-app
bundle install
```

Finally, start the development server:

```bash
rage s
```

Your application is now running! Open your browser and visit `http://localhost:3000` to see it in action.

### Database Configuration

If you're planning to use a database, you can preconfigure your application during creation by using the `-d` option:

```bash
rage new my-app -d postgresql
```

This sets up your application with the specified database adapter. Supported options include `mysql`, `trilogy`, `postgresql`, `sqlite3`.

## Project Structure

When you create a new Rage application, several directories are automatically generated. Here's an overview of the key folders and their purposes:

| Path | Description |
| --- | ----------- |
| `app/` | Contains your application's core code (controllers, models, etc.) |
| `config/application.rb` | Global framework configuration files |
| `config/environments/` | Environment-specific framework configuration |
| `config/initializers/` | Files that run during startup to configure gems and application code |
| `config/routes.rb` | Defines your application's HTTP routes |
| `lib/` | Reusable code that isn't application-specific, such as utilities or third-party service integrations |
| `db/` | Stores database migrations and seed files |

## Active Record Integration

When you use the `-d` option to specify a database, Rage automatically configures [Active Record](https://guides.rubyonrails.org/active_record_basics.html) as your ORM. This means you can create models, run migrations, and query your database without any additional setup.

The `rage` CLI includes several commands for working with Active Record:

```bash
# Generate a new model
rage g model User

# Run pending migrations
rage db:migrate

# Populate the database with seed data
rage db:seed
```

## Sequel Integration

Rage also supports using Sequel instead of Active Record. To use Sequel as your ORM:

1. Create your application **without** the `-d` option
2. Manually configure Sequel in an initializer file

Create a new initializer file with the following configuration:

```ruby title="config/initializers/sequel.rb"
Sequel.extension :fiber_concurrency

DB = Sequel.connect("sqlite://my-app.db")
```

This example uses SQLite, but you can replace the connection string with your preferred database.

## CLI Commands Reference

The `rage` CLI provides several helpful commands to streamline your development workflow:

| Command | Description |
| --- | ----------- |
| `rage s` | Starts the server |
| `rage c` | Opens an interactive console for your application |
| `rage routes` | Displays all defined routes |
| `rage middleware` | Shows all enabled Rack middleware |
