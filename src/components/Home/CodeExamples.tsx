import { useState } from 'react';
import { Code2, Copy, Check } from 'lucide-react';
import { Highlight, themes } from 'prism-react-renderer';

const examples = [
  {
    id: "routing",
    title: "Rails-compatible Routing",
    description: "Familiar syntax for defining routes and controllers",
    code: `# config/routes.rb
Rage.routes.draw do
  resources :articles, only: [:index, :create]
end

# app/controllers/articles_controller.rb
class ArticlesController < RageController::API
  def index
    articles = Article.all
    render json: articles
  end

  def create
    article = Article.create!(title: params[:title], content: params[:content])
    render json: article, status: :created
  end
end`,
  },
  {
    id: "fiber",
    title: "Concurrent Request Handling",
    description: "Process multiple operations in parallel with Fiber.await",
    code: `class DashboardController < RageController::API
  def index
    user, bookings = Fiber.await([
      Fiber.schedule { Net::HTTP.get(URI("http://users.service/users/#{params[:id]}")) },
      Fiber.schedule { Net::HTTP.get(URI("http://bookings.service/#{params[:id]}/bookings")) }
    ])

    render json: { user:, bookings: }
  end
end`,
  },
  {
    id: "websocket",
    title: "WebSocket Support",
    description: "Built-in WebSocket handling for real-time features",
    code: `class ChatChannel < Rage::Cable::Channel
  def subscribed
    stream_from "chat_\#{params[:room_id]}"
  end

  def receive(data)
    message = Message.create!(content: data["message"])

    broadcast(
      "chat_\#{params[:room_id]}",
      message: message.content
    )
  end
end`,
  },
  {
    id: "api",
    title: "Automatic API Documentation",
    description: "OpenAPI specs generated from your code",
    code: `class UsersController < RageController::API
  # Returns the list of all users.
  # @response Array<User>
  def index
    @users = User.all
    render json: @users
  end

  # Creates a new user record.
  # @param email
  # @param password
  # @response 201
  def create
    @user = User.create(email: params[:email], password: params[:password])
    render status: :created
  end
end`,
  },
];

export default function CodeExamples() {
  const [activeTab, setActiveTab] = useState(examples[0].id);
  const [copied, setCopied] = useState(false);

  const activeExample = examples.find(ex => ex.id === activeTab) || examples[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeExample.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-24 bg-white dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-full text-sm font-semibold mb-6">
            <Code2 className="w-4 h-4" />
            Code Examples
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            See Rage in Action
          </h2>
          <p className="text-xl text-slate-600 dark:text-zinc-400 max-w-3xl mx-auto">
            Write clean, maintainable code with familiar Rails patterns and powerful new capabilities.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 dark:border-zinc-700 pb-4">
            {examples.map((example) => (
              <button
                key={example.id}
                onClick={() => setActiveTab(example.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === example.id
                    ? 'bg-rage-500 dark:bg-rage-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                }`}
              >
                {example.title}
              </button>
            ))}
          </div>

          <div className="bg-slate-900 dark:bg-zinc-950 rounded-2xl shadow-2xl overflow-hidden border border-slate-800 dark:border-zinc-900">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700 dark:bg-zinc-800 dark:border-zinc-700">
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">
                    {activeExample.title}
                  </h3>
                  <p className="text-slate-400 text-xs">
                    {activeExample.description}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white rounded-lg transition-colors text-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>

            <div className="overflow-x-auto">
              <pre className="text-sm leading-relaxed rounded-none p-3 bg-[#1e1e1e]">
                <Highlight
                    theme={themes.vsDark}
                    code={activeExample.code}
                    language="ruby"
                >
                    {({ className, style, tokens, getLineProps, getTokenProps }) => (
                    <pre style={style}>
                        {tokens.map((line, i) => (
                        <div key={i} {...getLineProps({ line })}>
                            {line.map((token, key) => (
                            <span key={key} {...getTokenProps({ token })} />
                            ))}
                        </div>
                        ))}
                    </pre>
                    )}
                </Highlight>
              </pre>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-gradient-to-br from-slate-50 to-white dark:from-zinc-800 dark:to-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-700">
              <div className="text-3xl font-bold text-rage-500 dark:text-rage-600 mb-2">100%</div>
              <div className="text-sm text-slate-600 dark:text-zinc-400">Rails Compatibility</div>
            </div>
            <div className="p-6 bg-gradient-to-br from-slate-50 to-white dark:from-zinc-800 dark:to-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-700">
              <div className="text-3xl font-bold text-rage-500 dark:text-rage-600 mb-2">100%</div>
              <div className="text-sm text-slate-600 dark:text-zinc-400">Rails Productivity</div>
            </div>
            <div className="p-6 bg-gradient-to-br from-slate-50 to-white dark:from-zinc-800 dark:to-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-700">
              <div className="text-3xl font-bold text-rage-500 dark:text-rage-600 mb-2">0ms</div>
              <div className="text-sm text-slate-600 dark:text-zinc-400">I/O Blocking Time</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
