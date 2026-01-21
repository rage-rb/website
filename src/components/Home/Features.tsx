import { Layers, FileCode, Sparkles, Box, Activity, Network } from 'lucide-react';

const features = [
  {
    icon: Box,
    title: "The Single-Process Stack",
    description: "No Redis to configure. No background workers to manage. No deployment complexity. Your web server, WebSockets, and background jobs all run efficiently in one process."
  },
  {
    icon: Network,
    title: "Event-Driven by Design",
    description: "Don't just handle requests — model your domain. A built-in event bus allows you to implement clean Domain-Driven Design out of the box.",
  },
  {
    icon: Sparkles,
    title: "Fiber-Based Concurrency",
    description: "Get Node.js levels of concurrency using standard Ruby. The Fiber Scheduler handles the non-blocking I/O while you write clean, synchronous code.",
  },
  {
    icon: Activity,
    title: "Native WebSockets",
    description: "Build chat apps, live dashboards, and collaborative tools that scale to thousands of active connections without needing a separate service.",
  },
  {
    icon: FileCode,
    title: "Auto-Generated OpenAPI Docs",
    description: "Generate OpenAPI documentation directly from your controllers. Keep your API specs always in sync with your code.",
  },
  {
    icon: Layers,
    title: "Rails-Compatible API",
    description: "Don't relearn web development. Use the router, controllers, and models you know. Migrate critical paths from Rails to Rage in minutes.",
  },
];

export default function Features() {
  return (
    <section className="py-24 bg-white dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Why Choose Rage?
          </h2>
          <p className="text-xl text-slate-600 dark:text-zinc-400 max-w-3xl mx-auto">
            A modern Ruby framework for building fast, scalable applications without sacrificing developer experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative p-8 bg-white dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700 hover:border-rage-200 dark:hover:border-rage-500 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-rage-50 to-red-50 dark:from-rage-900/30 dark:to-red-900/30 rounded-2xl opacity-0 group-hover:opacity-100 dark:group-hover:opacity-50 transition-opacity duration-300"></div>

                <div className="relative">
                  <div className="inline-flex items-center justify-center w-12 h-12 mb-5 rounded-xl bg-white dark:bg-zinc-900 border-2 border-rage-500 dark:border-rage-600 shadow-md group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-rage-500 group-hover:to-rage-600 dark:group-hover:from-rage-600 dark:group-hover:to-rage-500 group-hover:border-transparent transition-all duration-300">
                    <Icon className="w-6 h-6 text-rage-500 dark:text-rage-600 group-hover:text-white transition-colors duration-300" />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>

                  <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
